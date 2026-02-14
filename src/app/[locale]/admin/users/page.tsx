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
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const t = useTranslations("AdminUsers");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    role: "USER",
  });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user?.role !== "ADMIN")
    ) {
      redirect("/auth/signin");
      return;
    }

    if (session?.user?.role === "ADMIN") {
      fetchUsers(page, searchTerm);
    }
  }, [session, status, page, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const fetchUsers = async (pageNumber: number, search: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?page=${pageNumber}&perPage=${perPage}&search=${encodeURIComponent(
          search,
        )}`,
      );
      if (res.ok) {
        const { data, pagination } = await res.json();
        setUsers(data);
        setTotalPages(pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ id: "", name: "", email: "", role: "USER" });
        fetchUsers(page, searchTerm);
        router.refresh();
      }
    } catch (err) {
      console.error("Error creating/updating user:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirmation"))) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (users.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchUsers(page, searchTerm);
        }
        router.refresh();
      } else {
        console.error("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleRowClick = async (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?userId=${user.id}`);
      if (res.ok) {
        const { data } = await res.json();
        setUserOrders(data);
      } else {
        setUserOrders([]);
      }
    } catch (err) {
      setUserOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8 text-center text-gray-500">{t("loading")}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t("pageTitle")}
          </h1>
          <p className="text-gray-600">{t("pageDescription")}</p>
        </div>
        <Button
          className="flex items-center space-x-2"
          onClick={() => {
            setForm({ id: "", name: "", email: "", role: "USER" });
            setShowModal(true);
          }}>
          <Plus className="h-4 w-4" />
          <span>{t("addUserButton")}</span>
        </Button>
      </div>

      {/* User info & orders modal */}
      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open);
          if (!open) {
            setSelectedUser(null);
            setUserOrders([]);
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser
                ? t("modal.userOrdersTitle", { name: selectedUser.name })
                : form.id
                  ? t("modal.title", { type: "edit" })
                  : t("modal.title", { type: "add" })}
            </DialogTitle>
          </DialogHeader>
          {selectedUser ? (
            <div>
              <div className="mb-4">
                <div>
                  <b>{t("tableHeaders.name")}:</b> {selectedUser.name}
                </div>
                <div>
                  <b>{t("tableHeaders.email")}:</b> {selectedUser.email}
                </div>
                <div>
                  <b>{t("tableHeaders.role")}:</b> {selectedUser.role}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">
                  {t("modal.ordersListTitle")}
                </h4>
                {ordersLoading ? (
                  <div>{t("loading")}</div>
                ) : userOrders.length === 0 ? (
                  <div>{t("modal.noOrders")}</div>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {userOrders.map((order: any) => (
                      <li
                        key={order.id}
                        className="border rounded p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => setSelectedOrder(order)}>
                        <div>
                          <b>ID:</b> {order.id}
                        </div>
                        <div>
                          <b>{t("modal.orderStatus")}:</b> {order.status}
                        </div>
                        <div>
                          <b>{t("modal.orderTotal")}:</b> {order.total}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                placeholder={t("modal.namePlaceholder")}
                value={form.name}
                onChange={handleFormChange}
                required
              />
              <Input
                name="email"
                type="email"
                placeholder={t("modal.emailPlaceholder")}
                value={form.email}
                onChange={handleFormChange}
                required
              />
              <label className="block text-sm font-medium text-gray-700">
                {t("modal.roleLabel")}
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleFormChange}
                className="w-full rounded border border-gray-300 p-2">
                <option value="USER">{t("modal.userRole")}</option>
                <option value="ADMIN">{t("modal.adminRole")}</option>
              </select>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? form.id
                      ? t("modal.buttons.updating")
                      : t("modal.buttons.creating")
                    : form.id
                      ? t("modal.buttons.update")
                      : t("modal.buttons.create")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Order details modal */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("modal.orderDetailTitle") || "Order Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-2">
              <div>
                <b>ID:</b> {selectedOrder.id}
              </div>
              <div>
                <b>{t("modal.orderStatus")}:</b> {selectedOrder.status}
              </div>
              <div>
                <b>{t("modal.orderTotal")}:</b> {selectedOrder.total}
              </div>
              <div>
                <b>{t("modal.orderCreatedAt") || "Created At"}:</b>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </div>
              <div>
                <b>{t("modal.delivery")}:</b> {selectedOrder.delivery?.mnName} (
                {selectedOrder.delivery?.price}₮)
              </div>
              <div>
                <b>{t("modal.address")}:</b>{" "}
                {selectedOrder.user?.addresses?.[0]?.fullName} |{" "}
                {selectedOrder.user?.addresses?.[0]?.phone}
              </div>
              <div>
                <b>{t("modal.items") || "Items"}:</b>
                <ul className="ml-4 list-disc">
                  {selectedOrder.items.map((item: any) => (
                    <li key={item.id}>
                      {item.productVariant?.product?.mnName} - {item.quantity} x{" "}
                      {item.unitPrice}₮
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {t("cardTitle", {
                userCount: users.length,
                page,
                totalPages,
              })}
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("tableHeaders.name")}</TableHead>
                <TableHead>{t("tableHeaders.email")}</TableHead>
                <TableHead>{t("tableHeaders.role")}</TableHead>
                <TableHead>{t("tableHeaders.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(user)}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                          });
                          setSelectedUser(null);
                          setShowModal(true);
                        }}
                        variant="ghost"
                        size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(user.id);
                        }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-center mt-4 space-x-4">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}>
              {t("previousButton")}
            </Button>
            <Button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}>
              {t("nextButton")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
