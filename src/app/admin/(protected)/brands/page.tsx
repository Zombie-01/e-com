"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

import { Plus, Search, Edit, Trash2 } from "lucide-react";

export default function AdminBrandsPage() {
  const { data: session, status } = useSession();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ mnName: "", enName: "", id: "" });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user?.role !== "ADMIN")
    ) {
      redirect("/admin/auth/signin");
    }

    if (session?.user?.role === "ADMIN") {
      fetchBrands();
    }
  }, [session, status]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/brands`);
      if (res.ok) {
        const data = await res.json();
        setBrands(data);
      }
    } catch (err) {
      console.error("Error fetching brands:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter(
    (brand) =>
      brand.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.mnName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/brands", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ mnName: "", enName: "", id: "" });
        fetchBrands();
        router.refresh();
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Устгахдаа итгэлтэй байна")) return;

    try {
      const res = await fetch("/api/admin/brands", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchBrands();
        router.refresh();
      } else {
        const data = await res.json();
        console.error("Устгахад алдаа гарлаа", data.message);
        alert(data.message || "Устгахад алдаа гарлаа");
      }
    } catch (err) {
      console.error("Сервер талийн алдаа", err);
      alert("Сервер талийн алдаа");
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8 text-center text-gray-500">{"Уншиж байна"}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Гарчиг</h1>
          <p className="text-gray-600">Текст</p>
        </div>
        <Button
          className="flex items-center space-x-2"
          onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          <span>Бренд нэмэх</span>
        </Button>
      </div>

      {/* Add/Edit Brand Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Бренд засах" : "addBrandModalTitle"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="enName"
              placeholder="englishNamePlaceholder"
              value={form.enName}
              onChange={handleFormChange}
              required
            />
            <Input
              name="mnName"
              placeholder="mongolianNamePlaceholder"
              value={form.mnName}
              onChange={handleFormChange}
              required
            />
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? form.id
                    ? "updating"
                    : "creating"
                  : form.id
                    ? "updateBrand"
                    : "createBrand"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>allBrands, ({brands.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="searchPlaceholder"
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
                <TableHead>englishNamePlaceholder</TableHead>
                <TableHead>mongolianNamePlaceholder"</TableHead>
                <TableHead>actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.enName}</TableCell>
                  <TableCell>{brand.mnName}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          setForm({
                            enName: brand.enName,
                            mnName: brand.mnName,
                            id: brand.id,
                          });
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
                        onClick={() => handleDelete(brand.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
