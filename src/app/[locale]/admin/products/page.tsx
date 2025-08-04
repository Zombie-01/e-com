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

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
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
    sku: "",
    brandId: "",
    categoryId: "",
    tagIds: [] as string[],
    variants: [{ colorId: "", sizeId: "", stock: 0, image: "" }],
  });
  // Holds File objects for variant images (same length as variants array)
  const [variantImages, setVariantImages] = useState<(File | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Redirect if not admin
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
  useEffect(() => {
    setVariantImages(form.variants.map(() => null));
  }, [form.variants.length]);

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

  const handleVariantImageChange = (index: number, file: File | null) => {
    const updatedImages = [...variantImages];
    updatedImages[index] = file;
    setVariantImages(updatedImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();

      // Append main fields
      formData.append("mnName", form.mnName);
      formData.append("enName", form.enName);
      formData.append("mnDesc", form.mnDesc);
      formData.append("enDesc", form.enDesc);
      formData.append("price", form.price.toString());
      formData.append("sku", form.sku);
      formData.append("brandId", form.brandId);
      formData.append("categoryId", form.categoryId);

      // Append tags array as JSON string
      formData.append("tagIds", JSON.stringify(form.tagIds));

      // Prepare variants without image field (files will be uploaded separately)
      const variantsWithoutImage = form.variants.map(({ image, ...v }) => v);
      formData.append("variants", JSON.stringify(variantsWithoutImage));

      // Append variant images with keys like variantImage_0, variantImage_1, ...
      variantImages.forEach((file, idx) => {
        if (file) {
          formData.append(`variantImage_${idx}`, file);
        }
      });

      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: formData, // Content-Type will be set automatically to multipart/form-data
      });

      if (res.ok) {
        setShowModal(false);
        setForm({
          mnName: "",
          enName: "",
          mnDesc: "",
          enDesc: "",
          price: "",
          sku: "",
          brandId: "",
          categoryId: "",
          tagIds: [],
          variants: [{ colorId: "", sizeId: "", stock: 0, image: "" }],
        });
        setVariantImages([]);
        fetchInitialData();
        router.refresh();
      } else {
        console.error("Failed to create product:", await res.text());
      }
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchInitialData();
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
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
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="enName"
                value={form.enName}
                onChange={handleFormChange}
                placeholder="English Name"
                required
              />
              <Input
                name="mnName"
                value={form.mnName}
                onChange={handleFormChange}
                placeholder="Mongolian Name"
                required
              />
              <Input
                name="sku"
                value={form.sku}
                onChange={handleFormChange}
                placeholder="SKU"
                required
              />
       

              <Input
                name="price"
                type="number"
                value={form.price}
                onChange={handleFormChange}
                placeholder="Price"
                required
              />
              <select
                name="brandId"
                value={form.brandId}
                onChange={handleFormChange}
                className="border p-2 rounded"
                required>
                <option value="">Select Brand</option>
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
                <option value="">Select Category</option>
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
                placeholder="English Description"
                className="border p-2 col-span-2"
                required
              />
              <textarea
                name="mnDesc"
                value={form.mnDesc}
                onChange={handleFormChange}
                placeholder="Mongolian Description"
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
                        // Add tag id
                        setForm((prev) => ({
                          ...prev,
                          tagIds: [...prev.tagIds, tag.id],
                        }));
                      } else {
                        // Remove tag id
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
              Variants
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
                      <option value="">Color</option>
                      {colors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.enName}
                        </option>
                      ))}
                    </select>
                    <select
                      value={variant.sizeId}
                      onChange={(e) =>
                        handleVariantChange(idx, "sizeId", e.target.value)
                      }
                      className="border p-2">
                      <option value="">Size</option>
                      {sizes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.enName}
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
                      placeholder="Stock"
                      min={0}
                    />
                    {/* File input for variant image */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        handleVariantImageChange(idx, file);
                      }}
                      className="border p-2"
                    />
                    {/* Image preview */}
                    {variantImages[idx] && (
                      <img
                        src={URL.createObjectURL(variantImages[idx]!)}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      variants: [
                        ...form.variants,
                        { colorId: "", sizeId: "", stock: 0, image: "" },
                      ],
                    })
                  }>
                  Add Variant
                </Button>
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
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
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
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
                      <TableCell>${product.price}</TableCell>
                      <TableCell>
                        <Badge>{stock}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stock > 0 ? "default" : "secondary"}>
                          {stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit">
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
    </div>
  );
}
