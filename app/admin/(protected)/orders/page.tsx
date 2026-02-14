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
import { ChevronLeft, ChevronRight } from "lucide-react";

enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user?.role !== "ADMIN")
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
        `/api/admin/orders?page=${pageNumber}&perPage=${perPage}`,
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
      newSet.has(orderId) ? newSet.delete(orderId) : newSet.add(orderId);
      return newSet;
    });
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "Pending";
      case OrderStatus.PROCESSING:
        return "Processing";
      case OrderStatus.SHIPPED:
        return "Shipped";
      case OrderStatus.DELIVERED:
        return "Delivered";
      case OrderStatus.CANCELLED:
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case OrderStatus.PROCESSING:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.SHIPPED:
        return "bg-indigo-100 text-indigo-800";
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status");
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders</h1>
      <p className="text-gray-600 mb-6">Manage all customer orders below.</p>

      {orders.length === 0 ? (
        <div className="text-center text-gray-600">No orders found.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer border hover:shadow-md transition"
              onClick={() => toggleExpand(order.id)}
              title="Click to expand">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Order ID: {order.id}</span>

                  <select
                    className={`px-2 py-1 text-xs rounded cursor-pointer ${getStatusBadgeColor(
                      order.status,
                    )}`}
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        e.target.value as OrderStatus,
                      )
                    }>
                    {Object.values(OrderStatus).map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <div>
                  <strong>User Email:</strong> {order.user?.email || "N/A"}
                </div>
                <div>
                  <strong>User Name:</strong> {order.user?.name || "N/A"}
                </div>
                <div>
                  <strong>Phone:</strong>{" "}
                  {order.user?.addresses?.[0]?.phone || "N/A"}
                </div>
                <div>
                  <strong>Total:</strong> ₮{order.total.toLocaleString()}
                </div>
                <div>
                  <strong>Created At:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </div>

                {expandedOrderIds.has(order.id) && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    {/* Delivery Details */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Delivery Details
                      </h3>

                      <div>
                        <strong>Option:</strong>{" "}
                        {order.delivery?.mnName ||
                          order.delivery?.enName ||
                          "N/A"}
                      </div>

                      <div>
                        <strong>Price:</strong> $
                        {order.delivery?.price?.toLocaleString() || "0.00"}
                      </div>

                      <div>
                        <strong>ETA:</strong> {order.delivery?.etaDays || "N/A"}{" "}
                        days
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Customer Details
                      </h3>
                      <div>
                        <strong>Address:</strong>{" "}
                        {order.user?.addresses?.[0]?.fullName || "N/A"}
                      </div>
                      <div>
                        <strong>Email:</strong> {order.user?.email || "N/A"}
                      </div>
                      <div>
                        <strong>Phone:</strong>{" "}
                        {order.user?.addresses?.[0]?.phone || "N/A"}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Order Items
                      </h3>

                      <ul className="space-y-3">
                        {order.items.map((item: any) => (
                          <li
                            key={item.id}
                            className="flex items-center space-x-4 border p-2 rounded">
                            <img
                              src={item.productVariant?.image}
                              alt={
                                item.productVariant?.product?.enName ||
                                "Product"
                              }
                              className="w-16 h-16 object-cover rounded"
                            />

                            <div>
                              <div className="font-medium">
                                {item.productVariant?.product?.enName}
                              </div>

                              <div className="text-sm text-gray-600">
                                Quantity: {item.quantity} × $
                                {item.unitPrice?.toLocaleString() || "0.00"}
                              </div>

                              <div className="text-sm text-gray-600">
                                Subtotal: $
                                {(
                                  item.quantity * item.unitPrice
                                ).toLocaleString()}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-8 space-x-4">
        <Button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}>
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        <Button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}>
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
