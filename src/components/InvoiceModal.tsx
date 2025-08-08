"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface Invoice {
  invoice_id: string;
  qr_text: string;
  qr_image: string; // base64 PNG
  qPay_shortUrl: string;
  amount?: number;
}

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  isLesson?: boolean;
  token: string | null | undefined;
  amount: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
  isLesson,
  amount,
  token,
}) => {
  const [isPaid, setIsPaid] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  // Poll for payment status
  useEffect(() => {
    if (!invoice || !isOpen) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/user/check-invoice?invoice_id=${invoice.invoice_id}&token=${token}`
        );
        const data = await res.json();
        if (data.status === "CLOSED") {
          onClose();
          clearInterval(interval);
          setIsPaid(true);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [invoice, isOpen]);

  // Enroll when paid
  useEffect(() => {
    if (!isPaid || enrolled) return;

    const enrollUser = async () => {
      try {
      } catch (err) {
        console.error("Бүртгэхэд алдаа:", err);
      }
    };

    enrollUser();
  }, [isPaid, enrolled, isLesson]);

  const checkInvoice = async () => {
    if (!invoice) return;
    try {
      const res = await fetch(
        `/api/user/check-invoice?invoice_id=${invoice.invoice_id}&token=${token}`
      );
      const data = await res.json();
      if (data.status === "CLOSED") {
        onClose();
        setIsPaid(true);
      } else {
        alert("Төлбөр хийгдээгүй байна.");
      }
    } catch (error) {
      console.error("Төлбөр шалгахад алдаа:", error);
      alert("Алдаа гарлаа. Дахин оролдоно уу.");
    }
  };

  if (!isOpen || !invoice) return null;

  if (isPaid && enrolled) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Төлбөр амжилттай!
            </h2>
            <p className="text-gray-700 mb-6">
              Таны төлбөр баталгаажсан. Та сургалтад амжилттай бүртгэгдлээ.
            </p>
            <Button
              onClick={() => {
                setIsPaid(false);
                setEnrolled(false);
                onClose();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Хаах
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-xs w-full p-4 shadow-lg text-center">
          <h2 className="text-lg font-semibold mb-2">QPAY-р төлөх</h2>

          {amount && (
            <div className="text-red-600 font-semibold text-xl mb-3">
              {amount.toLocaleString()}₮
            </div>
          )}

          <img
            src={`data:image/png;base64,${invoice.qr_image}`}
            alt="QR код"
            className="mx-auto w-48 h-48 object-contain mb-4"
          />

          <a
            href={invoice.qPay_shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline break-all mb-4 inline-block">
            Банкны АПП кодыг ашиглах
          </a>

          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={checkInvoice}
              className="bg-[#F16529] text-white px-4 py-2 rounded hover:bg-[#d44e14]">
              Төлбөр шалгах
            </Button>
            <Button
              onClick={onClose}
              className="border border-[#F16529] text-[#F16529] px-4 py-2 rounded hover:bg-[#f1652920]">
              Хаах
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
