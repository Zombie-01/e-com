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

export default function AdminTagsPage() {
  const { data: session, status } = useSession();
  const t = useTranslations("AdminTags");
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ mnName: "", enName: "", id: "" });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "ADMIN")
    ) {
      redirect("/auth/signin");
    }

    if (session?.user?.role === "ADMIN") {
      fetchTags();
    }
  }, [session, status]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tags`);
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = tags?.filter(
    (tag: any) =>
      tag.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.mnName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/tags", {
        method: form?.id !== "" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ mnName: "", enName: "", id: "" });
        fetchTags();
        router.refresh();
      }
    } catch (err) {
      console.error("Error creating/updating tag:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirmation"))) return;

    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTags();
        router.refresh();
      } else {
        console.error("Failed to delete tag");
      }
    } catch (err) {
      console.error("Error deleting tag:", err);
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
            setForm({ mnName: "", enName: "", id: "" });
            setShowModal(true);
          }}>
          <Plus className="h-4 w-4" />
          <span>{t("addTagButton")}</span>
        </Button>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id
                ? t("modal.title", { type: "edit" })
                : t("modal.title", { type: "add" })}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="enName"
              placeholder={t("modal.enNamePlaceholder")}
              value={form.enName}
              onChange={handleFormChange}
              required
            />
            <Input
              name="mnName"
              placeholder={t("modal.mnNamePlaceholder")}
              value={form.mnName}
              onChange={handleFormChange}
              required
            />
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
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {t("cardTitle", { count: tags?.length || 0 })}
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
                <TableHead>{t("tableHeaders.enName")}</TableHead>
                <TableHead>{t("tableHeaders.mnName")}</TableHead>
                <TableHead>{t("tableHeaders.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags?.map((tag: any) => (
                <TableRow key={tag.id}>
                  <TableCell>{tag.enName}</TableCell>
                  <TableCell>{tag.mnName}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          setForm({
                            enName: tag?.enName,
                            mnName: tag.mnName,
                            id: tag?.id,
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
                        onClick={() => handleDelete(tag.id)}>
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
