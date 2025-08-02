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
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
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
    tagIds: [],
    variants: [{ colorId: "", sizeId: "", stock: 0, image: "" }],
  });
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
      fetchInitialData();
    }
  }, [session, status]);

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

  const handleFormChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index: any, key: any, value: any) => {
    const updated = [...form.variants];
    updated[index][key] = value;
    setForm({ ...form, variants: updated });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchInitialData();
        router.refresh();
      }
    } catch (err) {
      console.error("Error creating product:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchInitialData();
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const filteredProducts = products.filter((p: any) =>
    [p.enName, p.mnName, p.sku].some((field) =>
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
                className="border p-2 rounded">
                <option value="">Select Brand</option>
                {brands.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.enName}
                  </option>
                ))}
              </select>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleFormChange}
                className="border p-2 rounded">
                <option value="">Select Category</option>
                {categories.map((c: any) => (
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
                      className="border p-2">
                      <option value="">Color</option>
                      {colors.map((c: any) => (
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
                      {sizes.map((s: any) => (
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
                    />
                    <Input
                      value={variant.image}
                      onChange={(e) =>
                        handleVariantChange(idx, "image", e.target.value)
                      }
                      placeholder="Image URL"
                    />
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

      {/* Table */}
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
                {filteredProducts.map((product: any) => {
                  const stock =
                    product.variants?.reduce(
                      (sum: any, v: any) => sum + v.stock,
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
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
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
