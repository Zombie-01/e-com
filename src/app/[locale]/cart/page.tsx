"use client";

import { useTranslations } from "next-intl";
import { useCartStore } from "@/src/lib/store";
import CartItem from "@/src/components/CartItem";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InvoiceModal } from "@/src/components/InvoiceModal";
import CompanyInvoiceModal, {
  CompanyInvoiceData,
} from "@/src/components/CompanyInvoiceModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

export default function CartPage() {
  const t = useTranslations("cart");
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<null | {
    invoice_id: string;
    qr_image: string;
    qPay_shortUrl: string;
    token: string;
  }>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"invoice-type" | "info" | "review" | null>(null);
  const [companyInvoiceOpen, setCompanyInvoiceOpen] = useState(false);
  const [invoiceType, setInvoiceType] = useState<"personal" | "company" | null>(
    null
  );
  const [companyData, setCompanyData] = useState<CompanyInvoiceData | null>(
    null
  );
  const [invoiceReceiverCode, setInvoiceReceiverCode] = useState("");
  const [ebarimtReg, setEbarimtReg] = useState("");
  const [useBonus, setUseBonus] = useState(false);

  const subtotal = getTotalPrice();
  const shipping = 6000;
  const userBonus = session?.user?.bonus ?? 0;
  const totalBeforeBonus = subtotal + shipping;
  const totalAfterBonus =
    useBonus && userBonus > 0
      ? Math.max(totalBeforeBonus - userBonus, 0)
      : totalBeforeBonus;

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/addresses")
        .then((res) => res.json())
        .then((data) => setAddresses(data))
        .catch((err) => console.error("Failed to fetch addresses:", err));
    }
  }, [session]);

  // Called when modal detects payment success
  async function handlePaymentSuccess() {
    if (!session?.user) return;

    try {
      // Call orders API with transactionId === invoice.invoice_id (or transaction.id)
      const orderRes = await fetch("/api/user/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          userId: session.user.id,
          transactionId: invoice?.invoice_id || "0",
          total: totalAfterBonus,
          invoiceType,
          companyData,
        }),
      });

      if (!orderRes.ok) throw new Error("Order creation failed");

      clearCart();
      // Reset checkout state
      setCheckoutStep(null);
      setInvoiceType(null);
      setCompanyData(null);
      setInvoiceReceiverCode("");
      setUseBonus(false);
      alert("Order placed successfully!");
      window.location.href = "/profile";
    } catch (error) {
      console.error(error);
      alert("Failed to create order after payment.");
    }
  }

  async function handleCheckout() {
    if (!session?.user) {
      alert("Please log in to checkout.");
      return;
    }

    if (addresses.length === 0) {
      alert("Please add a delivery address in your profile first.");
      router.push("/profile");
      return;
    }

    // Start checkout flow: step 1 - select invoice type
    setCheckoutStep("invoice-type");
  }

  function handleInvoiceTypeSelected(type: "personal" | "company") {
    setInvoiceType(type);
    if (type === "company") {
      setCheckoutStep("info");
      setCompanyInvoiceOpen(true);
    } else {
      setCheckoutStep("info");
    }
  }

  function handleInfoComplete() {
    // For personal invoice, invoiceReceiverCode can be optional
    // For company invoice, companyData must be set
    if (invoiceType === "company" && !companyData) {
      alert("Please fill in company information");
      return;
    }
    if (invoiceType === "personal" && !invoiceReceiverCode) {
      alert("Please enter your register/ID number");
      return;
    }
    
    setCheckoutStep("review");
  }

  async function proceedToPayment() {
    // Validate info is complete before proceeding
    if (invoiceType === "company" && !companyData) {
      alert("Please fill in company information first");
      return;
    }
    if (invoiceType === "personal" && !invoiceReceiverCode) {
      alert("Please enter your register/ID number");
      return;
    }

    if (invoiceType === "company") {
      try {
        // Call company invoice API
        const res = await fetch("/api/user/companyinvoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: companyData.companyName,
            companyRegister: companyData.companyRegister,
            phoneNumber: companyData.phoneNumber,
            email: companyData.email,
            amount: totalAfterBonus,
            invoiceNumber: `${Date.now()}`,
            items,
            addressId: addresses[0]?.id || null,
          }),
        });

        if (!res.ok) throw new Error("Failed to create company invoice");

        const invoiceData = await res.json();

        setInvoice({
          invoice_id: invoiceData.invoice_id,
          qr_image: invoiceData.qr_image,
          qPay_shortUrl: invoiceData.qPay_shortUrl,
          token: invoiceData.token,
        });
        setModalOpen(true);
        return;
      } catch (error) {
        console.error(error);
        alert("Failed to create company invoice.");
        return;
      }
    }

    try {
      const res = await fetch("/api/user/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAfterBonus,
          invoiceNumber: `${Date.now()}`,
          invoiceReceiverCode: invoiceReceiverCode || "1",
          ebarimtReg,
          items,
          invoiceType,
          companyData,
        }),
      });

      if (!res.ok) throw new Error("Transaction creation failed.");

      const invoiceData = await res.json();

      setInvoice(invoiceData);
      setModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Failed to create transaction.");
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-600 mb-8">{t("empty")}</p>
          <Link href="/products">
            <Button size="lg">{t("continue")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t("title")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item.variantId} item={item} />
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg h-fit">
            <h3 className="text-xl font-semibold mb-4">{t("summary")}</h3>

            {/* Bonus field and checkbox */}
            <div className="mb-4 space-y-2">
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={useBonus}
                  onChange={(e) => setUseBonus(e.target.checked)}
                  disabled={userBonus <= 0}
                  className="mr-2"
                />
                Use bonus
              </label>
              <div className="text-sm text-gray-600 mt-1">
                Your bonus: ₮{userBonus.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>{t("subtotal")}</span>
                <span>₮{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("shipping")}</span>
                <span>{shipping}₮</span>
              </div>
              {useBonus && userBonus > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Bonus</span>
                  <span>-₮{userBonus.toLocaleString()}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>{t("total")}</span>
                <span>₮{totalAfterBonus.toLocaleString()}</span>
              </div>
            </div>

            <Button onClick={handleCheckout} className="w-full mb-3" size="lg">
              {t("checkout")}
            </Button>

            <Button variant="outline" className="w-full" onClick={clearCart}>
              {t("clear")}
            </Button>
          </div>
        </div>
      </div>

      {/* Step 1: Invoice Type Selection Dialog */}
      <Dialog
        open={checkoutStep === "invoice-type"}
        onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Invoice Type</DialogTitle>
          </DialogHeader>
          <p className="mb-4">Would you like a personal or company invoice?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                handleInvoiceTypeSelected("personal");
              }}>
              Personal Invoice
            </Button>
            <Button
              onClick={() => {
                handleInvoiceTypeSelected("company");
              }}>
              Company Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step 2: Personal Invoice Info Dialog */}
      <Dialog
        open={checkoutStep === "info" && invoiceType === "personal"}
        onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personal Invoice Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("register")}
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={invoiceReceiverCode}
                onChange={(e) => setInvoiceReceiverCode(e.target.value)}
                placeholder="Enter your register/ID number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-barimtiin Register (optional)
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={ebarimtReg}
                onChange={(e) => setEbarimtReg(e.target.value)}
                placeholder="E-barimtiin Register"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCheckoutStep("invoice-type");
                setInvoiceType(null);
              }}>
              Back
            </Button>
            <Button onClick={handleInfoComplete}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Invoice Modal for Step 2 */}
      <CompanyInvoiceModal
        isOpen={companyInvoiceOpen}
        onClose={() => {
          setCompanyInvoiceOpen(false);
          setCheckoutStep("invoice-type");
          setInvoiceType(null);
        }}
        onSubmit={(data) => {
          setCompanyData(data);
          setCompanyInvoiceOpen(false);
          handleInfoComplete();
        }}
      />

      {/* Step 3: Review and Payment Dialog */}
      <Dialog
        open={checkoutStep === "review"}
        onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Invoice Type</p>
              <p className="text-sm text-gray-600">
                {invoiceType === "personal" ? "Personal Invoice" : "Company Invoice"}
              </p>
            </div>

            {invoiceType === "personal" && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Register Number</p>
                <p className="text-sm text-gray-600">{invoiceReceiverCode}</p>
              </div>
            )}

            {invoiceType === "company" && companyData && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Company Information</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {companyData.companyName}</p>
                  <p><strong>Register:</strong> {companyData.companyRegister}</p>
                  <p><strong>Phone:</strong> {companyData.phoneNumber}</p>
                  <p><strong>Email:</strong> {companyData.email}</p>
                </div>
              </div>
            )}

            <hr />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₮{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>₮{(6000).toLocaleString()}</span>
              </div>
              {useBonus && userBonus > 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span>Bonus</span>
                  <span>-₮{userBonus.toLocaleString()}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₮{totalAfterBonus.toLocaleString()}</span>
              </div>
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useBonus}
                onChange={(e) => setUseBonus(e.target.checked)}
                disabled={userBonus <= 0}
                className="mr-2"
              />
              <span className="text-sm">Use bonus (₮{userBonus.toLocaleString()})</span>
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCheckoutStep("info");
              }}>
              Back
            </Button>
            <Button onClick={proceedToPayment}>
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Invoice Modal */}
        invoice={invoice as any}
        isOpen={modalOpen}
        token={invoice?.token}
        onClose={() => {
          setModalOpen(false);
          setInvoice(null);
        }}
        onEnd={() => {
          handlePaymentSuccess();
        }}
        amount={totalAfterBonus.toFixed(0)}
      />
    </>
  );
}
