"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(
    new Set()
  );

  // Initialize useTranslation hook
  const t = useTranslations("orders");
  const locale = useLocale();

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "ADMIN")
    ) {
      redirect("/auth/signin");
      return;
    }

    if (session?.user?.role === "ADMIN") {
      fetchOrders(page);
    }
  }, [session, status, page]);

  const fetchOrders = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/orders?page=${pageNumber}&perPage=${perPage}`
      );
      if (res.ok) {
        const { data, pagination } = await res.json();
        setOrders(data);
        setTotalPages(pagination.totalPages);
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (status === "loading" || loading) {
    return <div className="p-8 text-center text-gray-500">{t("loading")}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t("orders")}</h1>
        <p className="text-gray-600">{t("manageOrdersDescription")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("allOrders", { page: page, totalPages: totalPages })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.orderId")}</TableHead>
                <TableHead>{t("table.userEmail")}</TableHead>
                <TableHead>{t("table.userName")}</TableHead>
                <TableHead>{t("table.phone")}</TableHead>
                <TableHead>{t("table.total")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.createdAt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    {t("noOrdersFound")}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <tbody key={order.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleExpand(order.id)}
                      title={t("clickToExpand")}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.user?.email || "N/A"}</TableCell>
                      <TableCell>{order.user?.name || "N/A"}</TableCell>
                      <TableCell>
                        {order.user?.addresses?.[0]?.phone || "N/A"}
                      </TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    {expandedOrderIds.has(order.id) && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={7} className="p-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-bold text-lg mb-2">
                                {t("deliveryDetails")}
                              </h3>
                              <div className="mb-2">
                                <strong>{t("option")}:</strong>{" "}
                                {locale === "mn"
                                  ? order.delivery?.mnName || "N/A"
                                  : order.delivery?.enName || "N/A"}
                              </div>
                              <div className="mb-2">
                                <strong>{t("price")}:</strong> $
                                {order.delivery?.price?.toFixed(2) || "0.00"}
                              </div>
                              <div className="mb-2">
                                <strong>{t("eta")}:</strong>{" "}
                                {t("etaDays", {
                                  days: order.delivery?.etaDays || "N/A",
                                })}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-bold text-lg mb-2">
                                {t("customerDetails")}
                              </h3>
                              <div className="mb-2">
                                <strong>{t("address")}:</strong>{" "}
                                {order.user?.addresses?.[0]?.fullName || "N/A"}
                              </div>
                              <div className="mb-2">
                                <strong>{t("email")}:</strong>{" "}
                                {order.user?.email || "N/A"}
                              </div>
                              <div className="mb-2">
                                <strong>{t("phone")}:</strong>{" "}
                                {order.user?.addresses?.[0]?.phone || "N/A"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h3 className="font-bold text-lg mb-2">
                              {t("orderItems")}
                            </h3>
                            <ul className="space-y-4">
                              {order.items.map((item: any) => (
                                <li
                                  key={item.id}
                                  className="flex items-center space-x-4 border p-2 rounded-md">
                                  <img
                                    src={item.productVariant?.image}
                                    alt={
                                      item.productVariant?.product?.enName ||
                                      "Product image"
                                    }
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {locale === "mn"
                                        ? item.productVariant?.product
                                            ?.mnName || "N/A"
                                        : item.productVariant?.product
                                            ?.enName || "N/A"}
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                      {t("quantity")}: {item.quantity} × $
                                      {item.unitPrice?.toFixed(2) || "0.00"}
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                      {t("subtotal")}: $
                                      {(item.quantity * item.unitPrice).toFixed(
                                        2
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex justify-center mt-4 space-x-4">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" /> {t("previous")}
            </Button>
            <Button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}>
              {t("next")} <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
