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
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function SiteSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("SiteSettings");

  const [banners, setBanners] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
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
        formData.append("active", "true");

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
    if (!confirm(t("deleteConfirmation"))) return;
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
    return <div className="p-8 text-center text-gray-500">{t("loading")}</div>;
  }

  const renderTable = (
    titleKey: string,
    type: "banner" | "color" | "size",
    data: any[],
    keys: string[]
  ) => (
    <Card className="mb-8">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{t(titleKey)}</CardTitle>
        <Button
          onClick={() => {
            setModalType(type);
            setForm({});
            setShowModal(true);
          }}>
          <Plus className="w-4 h-4 mr-2" /> {t("add")}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {keys.map((key) => (
                <TableHead key={key}>{t(`tableHeaders.${key}`)}</TableHead>
              ))}
              <TableHead>{t("tableHeaders.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {keys.map((key) => (
                  <TableCell key={key}>{String(item[key])}</TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModalType(type);
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

  const bannerKeys = ["id", "mnTitle", "enTitle", "url", "active"];
  const colorKeys = ["id", "name", "hex"];
  const sizeKeys = ["id", "name"];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">{t("pageTitle")}</h1>
      {renderTable("bannersTitle", "banner", banners, bannerKeys)}
      {renderTable("colorsTitle", "color", colors, colorKeys)}
      {renderTable("sizesTitle", "size", sizes, sizeKeys)}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id
                ? t("modal.editTitle", { type: t(modalType as any) })
                : t("modal.createTitle", { type: t(modalType as any) })}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {modalType === "banner" && (
              <>
                <Input
                  name="mnTitle"
                  placeholder={t("modal.placeholders.mnTitle")}
                  value={form.mnTitle || ""}
                  onChange={(e) =>
                    setForm({ ...form, mnTitle: e.target.value })
                  }
                  required
                />
                <Input
                  name="enTitle"
                  placeholder={t("modal.placeholders.enTitle")}
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
                  required={!form.id}
                />
                <Input
                  name="url"
                  placeholder={t("modal.placeholders.url")}
                  value={form.url || ""}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </>
            )}
            {modalType === "color" && (
              <>
                <Input
                  name="name"
                  placeholder={t("modal.placeholders.colorName")}
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  name="hex"
                  type="color"
                  placeholder={t("modal.placeholders.hex")}
                  value={form.hex || ""}
                  onChange={(e) => setForm({ ...form, hex: e.target.value })}
                  required
                />
              </>
            )}
            {modalType === "size" && (
              <Input
                name="name"
                placeholder={t("modal.placeholders.sizeName")}
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            )}
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
    </div>
  );
}
