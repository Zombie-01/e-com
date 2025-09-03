"use client";

import { useTranslations } from "next-intl";
import { useCartStore } from "@/src/lib/store";
import CartItem from "@/src/components/CartItem";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { InvoiceModal } from "@/src/components/InvoiceModal"; // Adjust path

export default function CartPage() {
  const t = useTranslations("cart");
  const { items, getTotalPrice, clearCart } = useCartStore();

  const { data: session } = useSession();

  const [invoice, setInvoice] = useState<null | {
    invoice_id: string;
    qr_image: string;
    qPay_shortUrl: string;
    token: string;
  }>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [invoiceReceiverCode, setInvoiceReceiverCode] = useState("");
  const [ebarimtReg, setEbarimtReg] = useState("");
  // Bonus state
  const [useBonus, setUseBonus] = useState(false);

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
          transactionId: "0",
          total: getTotalPrice(),
        }),
      });

      if (!orderRes.ok) throw new Error("Order creation failed");

      clearCart();
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

    try {
      // 1. Create transaction and get invoice info
      const res = await fetch("/api/user/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: getTotalPrice(),
          invoiceNumber: `${Date.now()}`,
          invoiceReceiverCode: invoiceReceiverCode || "1",
          ebarimtReg,
          items,
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

  // Calculate prices
  const subtotal = getTotalPrice();
  const shipping = subtotal < 100000 ? 6000 : 0;
  const userBonus = session?.user?.bonus ?? 0;
  const totalBeforeBonus = subtotal + shipping;
  const totalAfterBonus = useBonus && userBonus > 0 ? Math.max(totalBeforeBonus - userBonus, 0) : totalBeforeBonus;

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

            {/* New inputs for invoiceReceiverCode and ebarimtReg */}
            <div className="mb-4 space-y-2">
              <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">
                {t("register")}
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={invoiceReceiverCode}
                onChange={(e) => setInvoiceReceiverCode(e.target.value)}
                placeholder={t("register")}
              />
            </div>

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

      <InvoiceModal
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
        // Add other props if needed
      />
    </>
  );
}
