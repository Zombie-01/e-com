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
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const t = useTranslations("AdminProductsPage");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [expandVariants, setExpandVariants] = useState(false);
  const [form, setForm] = useState({
    mnName: "",
    enName: "",
    mnDesc: "",
    enDesc: "",
    price: "",
    costPrice: "", // Added costPrice
    sku: "",
    brandId: "",
    categoryId: "",
    tagIds: [] as string[],
    variants: [
      { colorId: "", sizeId: "", stock: 0, image: [] /* image is now array */ },
    ],
  });
  // Holds arrays of File objects for each variant
  const [variantImages, setVariantImages] = useState<(File[] | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Redirect if not admin
  const handleEdit = (product: any) => {
    setShowModal(true);
    setEditingProduct(product);
    setForm({
      mnName: product.mnName,
      enName: product.enName,
      mnDesc: product.mnDesc,
      enDesc: product.enDesc,
      price: product.price,
      costPrice: product.costPrice || "", // Added costPrice
      sku: product.sku,
      brandId: product.brandId,
      categoryId: product.categoryId,
      tagIds: product.tags.map((tag: any) => tag.id),
      variants: product.variants.map((v: any) => ({
        colorId: v.colorId,
        sizeId: v.sizeId,
        stock: v.stock,
        image: Array.isArray(v.image) ? v.image : v.image ? [v.image] : [],
      })),
    });
    setVariantImages(product.variants.map(() => null));
  };

  const handlePreview = (product: any) => {
    setPreviewProduct(product);
  };

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "ADMIN")
    ) {
      redirect("/auth/signin");
    }
    if (session?.user?.role === "ADMIN") {
      fetchInitialData();
    }
  }, [session, status]);

  // Reset variantImages length whenever variants array changes

  const fetchInitialData = async () => {
    try {
      const [
        productsRes,
        brandsRes,
        categoriesRes,
        tagsRes,
        colorsRes,
        sizesRes,
      ] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/brands"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/tags"),
        fetch("/api/admin/colors"),
        fetch("/api/admin/sizes"),
      ]);
      const [
        productsData,
        brandsData,
        categoriesData,
        tagsData,
        colorsData,
        sizesData,
      ] = await Promise.all([
        productsRes.json(),
        brandsRes.json(),
        categoriesRes.json(),
        tagsRes.json(),
        colorsRes.json(),
        sizesRes.json(),
      ]);
      setProducts(productsData);
      setBrands(brandsData);
      setCategories(categoriesData);
      setTags(tagsData);
      setColors(colorsData);
      setSizes(sizesData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index: number, key: string, value: any) => {
    const updated = [...form.variants];
    updated[index] = { ...updated[index], [key]: value };
    setForm((prev) => ({ ...prev, variants: updated }));
  };

  // Allow multiple images per variant
  const handleVariantImageChange = (
    variantIdx: number,
    files: FileList | null
  ) => {
    const updatedImages = [...variantImages];
    updatedImages[variantIdx] = files ? Array.from(files) : [];
    setVariantImages(updatedImages);
  };

  // Remove a specific image from a variant
  const handleRemoveVariantImage = (variantIdx: number, imgIdx: number) => {
    const updatedImages = [...variantImages];
    if (updatedImages[variantIdx]) {
      updatedImages[variantIdx] = updatedImages[variantIdx]!.filter(
        (_, i) => i !== imgIdx
      );
      setVariantImages(updatedImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("mnName", form.mnName);
      formData.append("enName", form.enName);
      formData.append("mnDesc", form.mnDesc);
      formData.append("enDesc", form.enDesc);
      formData.append("price", form.price.toString());
      formData.append("costPrice", form.costPrice.toString()); // Added costPrice
      formData.append("sku", form.sku);
      formData.append("brandId", form.brandId);
      formData.append("categoryId", form.categoryId);
      formData.append("tagIds", JSON.stringify(form.tagIds));

      // Remove image field from variants for backend
      const variantsWithoutImage = form.variants.map(({ image, ...v }) => v);
      formData.append("variants", JSON.stringify(variantsWithoutImage));
      // Append all images for each variant
      variantImages.forEach((files, idx) => {
        if (files && files.length > 0) {
          files.forEach((file, imgIdx) => {
            formData.append(`variantImage_${idx}_${imgIdx}`, file);
          });
        }
      });

      const res = await fetch(
        editingProduct
          ? `/api/admin/products?id=${editingProduct.id}`
          : "/api/admin/products",
        {
          method: editingProduct ? "PUT" : "POST",
          body: formData,
        }
      );

      if (res.ok) {
        setShowModal(false);
        setEditingProduct(null);
        setForm({
          mnName: "",
          enName: "",
          mnDesc: "",
          enDesc: "",
          price: "",
          costPrice: "", // Reset costPrice
          sku: "",
          brandId: "",
          categoryId: "",
          tagIds: [],
          variants: [{ colorId: "", sizeId: "", stock: 0, image: [] }],
        });
        setVariantImages([]);
        fetchInitialData();
        router.refresh();
      } else {
        console.error("Failed to submit product:", await res.text());
      }
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        router.refresh();
        fetchInitialData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete product.");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Unexpected error while deleting product.");
    }
  };

  const filteredProducts = products.filter((p) =>
    [p.enName, p.mnName, p.sku].some((field: string) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (status === "loading" || loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> {t("addProduct")}
        </Button>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-h-[70vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct
                ? t("dialog.editProductTitle")
                : t("dialog.createProductTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="enName"
                value={form.enName}
                onChange={handleFormChange}
                placeholder={t("dialog.englishName")}
                required
              />
              <Input
                name="mnName"
                value={form.mnName}
                onChange={handleFormChange}
                placeholder={t("dialog.mongolianName")}
                required
              />
              <Input
                name="sku"
                value={form.sku}
                onChange={handleFormChange}
                placeholder={t("dialog.sku")}
                required
              />
              <Input
                name="price"
                type="number"
                value={form.price}
                onChange={handleFormChange}
                placeholder={t("dialog.price")}
                required
              />
              <Input
                name="costPrice"
                type="number"
                value={form.costPrice}
                onChange={handleFormChange}
                placeholder={t("dialog.costPrice") || "Cost Price"}
                required
              />
              <select
                name="brandId"
                value={form.brandId}
                onChange={handleFormChange}
                className="border p-2 rounded"
                required>
                <option value="">{t("dialog.selectBrand")}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.enName}
                  </option>
                ))}
              </select>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleFormChange}
                className="border p-2 rounded"
                required>
                <option value="">{t("dialog.selectCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.enName}
                  </option>
                ))}
              </select>
              <textarea
                name="enDesc"
                value={form.enDesc}
                onChange={handleFormChange}
                placeholder={t("dialog.englishDescription")}
                className="border p-2 col-span-2"
                required
              />
              <textarea
                name="mnDesc"
                value={form.mnDesc}
                onChange={handleFormChange}
                placeholder={t("dialog.mongolianDescription")}
                className="border p-2 col-span-2"
                required
              />
            </div>

            <div className="border p-2 rounded max-h-40 overflow-y-auto">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="inline-flex items-center mr-4 mb-2">
                  <input
                    type="checkbox"
                    value={tag.id}
                    checked={form.tagIds.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm((prev) => ({
                          ...prev,
                          tagIds: [...prev.tagIds, tag.id],
                        }));
                      } else {
                        setForm((prev) => ({
                          ...prev,
                          tagIds: prev.tagIds.filter((id) => id !== tag.id),
                        }));
                      }
                    }}
                    className="mr-2"
                  />
                  {tag.enName}
                </label>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setExpandVariants(!expandVariants)}>
              {expandVariants ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}{" "}
              {t("dialog.variants")}
            </Button>

            {expandVariants && (
              <div className="space-y-4">
                {form.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-2 gap-2 border p-3 rounded">
                    <select
                      value={variant.colorId}
                      onChange={(e) =>
                        handleVariantChange(idx, "colorId", e.target.value)
                      }
                      className="border p-2"
                      required>
                      <option value="">{t("dialog.color")}</option>
                      {colors.map((c) => (
                        <option
                          key={c.id}
                          value={c.id}
                          style={{ background: c.hex }}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={variant.sizeId}
                      onChange={(e) =>
                        handleVariantChange(idx, "sizeId", e.target.value)
                      }
                      className="border p-2">
                      <option value="">{t("dialog.size")}</option>
                      {sizes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(
                          idx,
                          "stock",
                          parseInt(e.target.value)
                        )
                      }
                      placeholder={t("dialog.stock")}
                      min={0}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        handleVariantImageChange(idx, e.target.files);
                      }}
                      className="border p-2"
                    />
                    {/* Preview and remove images */}
                    {variantImages[idx] &&
                      variantImages[idx]!.map((file, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="inline-block mr-2 relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute top-0 right-0"
                            onClick={() =>
                              handleRemoveVariantImage(idx, imgIdx)
                            }
                            title="Remove image">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      variants: [
                        ...form.variants,
                        { colorId: "", sizeId: "", stock: 0, image: [] },
                      ],
                    })
                  }
                  variant="outline"
                  className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" /> {/* PLUS icon */}
                  {t("dialog.addVariant")}
                </Button>
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "..."
                  : editingProduct
                  ? t("dialog.updateButton")
                  : t("dialog.createButton")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("title")} ({products.length})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.product")}</TableHead>
                  <TableHead>{t("table.sku")}</TableHead>
                  <TableHead>{t("table.brand")}</TableHead>
                  <TableHead>{t("table.category")}</TableHead>
                  <TableHead>{t("table.price")}</TableHead>
                  <TableHead>{t("table.stock")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stock =
                    product.variants?.reduce(
                      (sum: number, v: any) => sum + v.stock,
                      0
                    ) || 0;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>{product.enName}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.brand?.enName}</TableCell>
                      <TableCell>{product.category?.enName}</TableCell>
                      <TableCell>₮{product.price}</TableCell>
                      <TableCell>
                        <Badge>{stock}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stock > 0 ? "default" : "secondary"}>
                          {stock > 0
                            ? t("stockStatus.inStock")
                            : t("stockStatus.outOfStock")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t("dialog.viewButton")}
                            onClick={() => handlePreview(product)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit"
                            onClick={() => handleEdit(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            title="Delete"
                            onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={!!previewProduct}
        onOpenChange={() => setPreviewProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("preview.title")}</DialogTitle>
          </DialogHeader>
          {previewProduct && (
            <div className="space-y-4">
              <p>
                <strong>{t("preview.name")}:</strong> {previewProduct.enName}
              </p>
              <p>
                <strong>{t("preview.sku")}:</strong> {previewProduct.sku}
              </p>
              <p>
                <strong>{t("preview.description")}:</strong>{" "}
                {previewProduct.enDesc}
              </p>
              <p>
                <strong>{t("preview.price")}:</strong> ₮{previewProduct.price}
              </p>
              <p>
                <strong>{t("dialog.costPrice") || "Cost Price"}:</strong> ₮
                {previewProduct.costPrice}
              </p>
              <p>
                <strong>{t("preview.tags")}:</strong>{" "}
                {previewProduct.tags.map((t: any) => t.enName).join(", ")}
              </p>
              <p>
                <strong>{t("preview.variants")}:</strong>
              </p>
              <ul className="list-disc list-inside">
                {previewProduct.variants.map((v: any, i: number) => (
                  <li key={i}>
                    Color: {colors.find((c) => c.id === v.colorId)?.enName} |
                    Size: {sizes.find((s) => s.id === v.sizeId)?.enName || "-"}{" "}
                    | Stock: {v.stock}
                    {v.image &&
                      Array.isArray(v.image) &&
                      v.image.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {v.image.map((imgUrl: string, imgIdx: number) => (
                            <img
                              key={imgIdx}
                              src={imgUrl}
                              alt="Variant"
                              className="w-16 h-16 rounded object-cover"
                            />
                          ))}
                        </div>
                      )}
                    {/* If image is string (legacy), show single image */}
                    {v.image && typeof v.image === "string" && (
                      <div className="mt-1">
                        <img
                          src={v.image}
                          alt="Variant"
                          className="w-16 h-16 rounded object-cover"
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
