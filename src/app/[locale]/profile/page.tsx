"use client";

import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  User,
  Package,
  CreditCard,
  MapPin,
  Edit3,
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Phone,
  Mail,
  Camera,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/src/i18n/navigation";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  const [orders, setOrders] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const router = useRouter();
  const [profile, setProfile] = useState<any>({
    name: "",
    email: "",
    image: "",
    addresses: [],
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);

  const { status, data } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && data) {
      // Fetch user profile
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => setProfile(data));

      // Fetch user orders
      const fetchOrders = async () => {
        try {
          const res = await fetch("/api/user/orders");
          if (res.ok) {
            const orders = await res.json();
            setOrders(orders);
          } else {
            console.error("Failed to fetch orders");
          }
        } catch (err) {
          console.error("Error fetching orders", err);
        }
      };

      fetchOrders();
    }
  }, [status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "COMPLETED":
        return <CheckCircle className="w-3 h-3" />;
      case "SHIPPED":
        return <Truck className="w-3 h-3" />;
      case "PROCESSING":
      case "PENDING":
        return <Clock className="w-3 h-3" />;
      case "CANCELLED":
      case "FAILED":
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg">
              <AvatarImage src={profile?.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-lg font-semibold">
                {profile?.name
                  ?.split(" ")
                  .map((n: any) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {profile?.name}
              </h1>
              <p className="text-slate-600 flex items-center mt-1">
                <Mail className="w-4 h-4 mr-2" />
                {profile?.email}
              </p>
            </div>
          </div>
          <Separator className="mt-6" />
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white border border-slate-200 shadow-sm">
            <TabsTrigger
              value="profile"
              className="flex items-center space-x-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center space-x-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center space-x-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="flex items-center space-x-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Manage your personal information and preferences
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditingProfile ? "secondary" : "outline"}
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center space-x-2">
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditingProfile ? "Cancel" : "Edit"}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 ring-4 ring-slate-100 shadow-lg">
                      <AvatarImage src={profile?.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-2xl font-semibold">
                        {profile?.name
                          ?.split(" ")
                          .map((n: any) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isEditingProfile && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-slate-900 hover:bg-slate-800">
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-slate-700">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={profile?.name || ""}
                          disabled={!isEditingProfile}
                          className={
                            !isEditingProfile
                              ? "bg-slate-50 border-slate-200"
                              : ""
                          }
                          onChange={(e) =>
                            setProfile({ ...profile, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-slate-700">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email}
                          disabled={!isEditingProfile}
                          className={
                            !isEditingProfile
                              ? "bg-slate-50 border-slate-200"
                              : ""
                          }
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-slate-900 hover:bg-slate-800"
                      onClick={() => setIsEditingProfile(false)}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Order History
                </CardTitle>
                <CardDescription>
                  Track your orders and view purchase history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={`${getStatusColor(
                                order.status
                              )} flex items-center space-x-1 px-3 py-1`}>
                              {getStatusIcon(order.status)}
                              <span className="font-medium">
                                {order.status.toLowerCase()}
                              </span>
                            </Badge>
                            <span className="text-sm text-slate-600">
                              Order #{order.id}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              ${order.total.toFixed(2)}
                            </p>
                            <p className="text-sm text-slate-600">
                              {order.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm">
                              <span className="text-slate-700">
                                {item.productVariant.product.enName} ×{" "}
                                {item.quantity}
                              </span>
                              <span className="text-slate-600">
                                ${item.unitPrice.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <span className="text-sm text-slate-600">
                            via {order.delivery.enName}
                          </span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2">
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Order Details</DialogTitle>
                                <DialogDescription>
                                  Order #{order.id}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <Badge
                                    className={getStatusColor(order.status)}>
                                    {order.status.toLowerCase()}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total:</span>
                                  <span className="font-semibold">
                                    ${order.total.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Delivery:</span>
                                  <span>{order.delivery.enName}</span>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      Saved Addresses
                    </CardTitle>
                    <CardDescription>
                      Manage your delivery addresses
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isAddingAddress}
                    onOpenChange={setIsAddingAddress}>
                    <DialogTrigger asChild>
                      <Button className="bg-slate-900 hover:bg-slate-800 flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Address</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                        <DialogDescription>
                          Enter your delivery address details
                        </DialogDescription>
                      </DialogHeader>
                      <AddressForm
                        onClose={() => setIsAddingAddress(false)}
                        onSave={async (address) => {
                          const res = await fetch("/api/user/address", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify(address),
                          });
                          const added = await res.json();
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.addresses.map((address: any) => (
                    <div
                      key={address.id}
                      className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">
                            {address.fullName}
                          </h4>
                          <div className="space-y-1 text-sm text-slate-600 mt-2">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-3 h-3" />
                              <span>{address.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog
                            open={editingAddress === address.id}
                            onOpenChange={(open) =>
                              setEditingAddress(open ? address.id : null)
                            }>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Address</DialogTitle>
                                <DialogDescription>
                                  Update your delivery address
                                </DialogDescription>
                              </DialogHeader>
                              <AddressForm
                                address={address}
                                onClose={() => setEditingAddress(null)}
                                onSave={async (newAddress) => {
                                  if (address?.id) {
                                    await fetch(
                                      `/api/user/address/${address.id}`,
                                      {
                                        method: "PUT",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(newAddress),
                                      }
                                    );
                                  } else {
                                    const res = await fetch(
                                      "/api/user/address",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(newAddress),
                                      }
                                    );
                                    const added = await res.json();
                                    newAddress.id = added.id;
                                  }

                                  setProfile((prev: any) => ({
                                    ...prev,
                                    addresses: address?.id
                                      ? prev.addresses.map((a: any) =>
                                          a.id === address.id
                                            ? { ...a, ...newAddress }
                                            : a
                                        )
                                      : [...prev.addresses, newAddress],
                                  }));
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const res = await fetch(
                                `/api/user/address/${address.id}`,
                                {
                                  method: "DELETE",
                                }
                              );
                              if (res.ok) {
                                setProfile((prev: any) => ({
                                  ...prev,
                                  addresses: prev.addresses.filter(
                                    (a: any) => a.id !== address.id
                                  ),
                                }));
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Address Form Component
function AddressForm({
  address,
  onClose,
  onSave,
}: {
  address?: any;
  onClose: () => void;
  onSave: (address: any) => void;
}) {
  const [formData, setFormData] = useState({
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    address: address?.id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
          Save Address
        </Button>
      </div>
    </form>
  );
}
