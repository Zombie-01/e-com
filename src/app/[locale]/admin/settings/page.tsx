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
import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function SiteSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [banners, setBanners] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<
    "banner" | "color" | "size" | null
  >(null);
  const [form, setForm] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "ADMIN")
    ) {
      redirect("/auth/signin");
    }

    if (session?.user?.role === "ADMIN") {
      fetchSettings();
    }
  }, [session, status]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [bannersRes, colorsRes, sizesRes] = await Promise.all([
        fetch("/api/admin/banners"),
        fetch("/api/admin/colors"),
        fetch("/api/admin/sizes"),
      ]);

      setBanners(await bannersRes.json());
      setColors(await colorsRes.json());
      setSizes(await sizesRes.json());
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let res;
      if (modalType === "banner") {
        const formData = new FormData();
        if (form.file) formData.append("file", form.file);
        if (form.id) formData.append("id", form.id);
        formData.append("mnTitle", form.mnTitle || "");
        formData.append("enTitle", form.enTitle || "");
        formData.append("url", form.url || "");
        formData.append("active", "true"); // Or handle checkbox later

        res = await fetch(`/api/admin/banners`, {
          method: form.id ? "PUT" : "POST",
          body: formData,
        });
      } else {
        res = await fetch(`/api/admin/${modalType}s`, {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (res.ok) {
        setShowModal(false);
        setForm({});
        fetchSettings();
        router.refresh();
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      const res = await fetch(`/api/admin/${type}s?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchSettings();
        router.refresh();
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  const renderTable = (title: string, type: string, data: any[]) => (
    <Card className="mb-8">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{title}</CardTitle>
        <Button
          onClick={() => {
            setModalType(type as any);
            setForm({});
            setShowModal(true);
          }}>
          <Plus className="w-4 h-4 mr-2" /> Add {type}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(data[0] || {}).map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {Object.values(item).map((val: any, i: number) => (
                  <TableCell key={i}>{val}</TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModalType(type as any);
                        setForm(item);
                        setShowModal(true);
                      }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(type, item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Site Settings</h1>
      {renderTable("Banners", "banner", banners)}
      {renderTable("Colors", "color", colors)}
      {renderTable("Sizes", "size", sizes)}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit" : "Create"} {modalType}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {modalType === "banner" && (
              <>
                <Input
                  name="mnTitle"
                  placeholder="Mongolian Title"
                  value={form.mnTitle || ""}
                  onChange={(e) =>
                    setForm({ ...form, mnTitle: e.target.value })
                  }
                  required
                />
                <Input
                  name="enTitle"
                  placeholder="English Title"
                  value={form.enTitle || ""}
                  onChange={(e) =>
                    setForm({ ...form, enTitle: e.target.value })
                  }
                  required
                />
                <Input
                  name="file"
                  type="file"
                  onChange={(e) =>
                    setForm({ ...form, file: e.target.files?.[0] })
                  }
                  required={!form.id} // Required only when creating
                />

                <Input
                  name="url"
                  placeholder="Link URL"
                  value={form.url || ""}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </>
            )}
            {modalType === "color" && (
              <>
                <Input
                  name="name"
                  placeholder="Color Name"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  name="hex"
                  type="color"
                  placeholder="Hex (#FFFFFF)"
                  value={form.hex || ""}
                  onChange={(e) => setForm({ ...form, hex: e.target.value })}
                  required
                />
              </>
            )}
            {modalType === "size" && (
              <Input
                name="name"
                placeholder="Size Name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            )}
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? form.id
                    ? "Updating..."
                    : "Creating..."
                  : form.id
                  ? "Update"
                  : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
