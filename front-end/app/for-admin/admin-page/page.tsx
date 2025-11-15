"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Package, LogOut, LayoutDashboard, ShoppingCart, Menu, X, Edit3, Trash2 } from "lucide-react";

const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    if (payload.exp && payload.exp < now) {
      localStorage.removeItem("token");
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  InStock: string;
  image: string;
}

interface Order {
  id: number;
  userid: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: any[];
}

type ActiveTab = "dashboard" | "products" | "view-orders";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Product form state
  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    InStock: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [addingProduct, setAddingProduct] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  // modal flag (reuse showProductForm) - form will render in modal now

  // Orders state
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0 });

  // Check admin role on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/for-admin/login-admin");
      return;
    }

    const user = decodeToken(token);
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }, [router]);

  // Fetch dashboard stats
  useEffect(() => {
    if (isAdmin && activeTab === "dashboard") {
      fetchStats();
    }
  }, [isAdmin, activeTab]);

  // Fetch products when viewing products tab
  useEffect(() => {
    if (isAdmin && activeTab === "products") {
      fetchProducts();
    }
  }, [isAdmin, activeTab]);

  // Fetch all orders
  useEffect(() => {
    if (isAdmin && activeTab === "view-orders") {
      fetchAllOrders();
    }
  }, [isAdmin, activeTab]);

  const fetchStats = async () => {
    setStatsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setStatsLoading(false);
      return;
    }

    try {
      // Fetch orders (admin)
      let orders: any[] = [];
      try {
        const ordersRes = await fetch("http://localhost:5000/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersData = await ordersRes.json().catch(() => null);
        orders = Array.isArray(ordersData) ? ordersData : ordersData?.orders || [];
      } catch (err) {
        console.error("Failed to fetch admin orders:", err);
      }

      // Fetch products (public)
      let productsList: any[] = [];
      try {
        const prodRes = await fetch("http://localhost:5000/api/products");
        const prodData = await prodRes.json().catch(() => null);
        if (prodRes.ok) {
          productsList = Array.isArray(prodData)
            ? prodData
            : prodData?.products
            ? prodData.products
            : prodData?.totalItems?.products
            ? prodData.totalItems.products
            : prodData?.items
            ? prodData.items
            : [];
        }
      } catch (err) {
        console.error("Failed to fetch products for stats:", err);
      }

      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
      setAllOrders(orders);
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: productsList.length,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    setLoadingOrders(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAllOrders(Array.isArray(data) ? data : data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);
    try {
      const res = await fetch("http://localhost:5000/api/products");
      console.log("fetchProducts status:", res.status);
      const data = await res.json().catch(() => null);
      console.log("fetchProducts data:", data);
      if (res.ok) {
        const items = Array.isArray(data)
          ? data
          : data?.products
          ? data.products
          : data?.totalItems?.products
          ? data.totalItems.products
          : data?.items
          ? data.items
          : [];
        setProducts(items);
      } else {
        const msg = (data && data.message) || `Server returned ${res.status}`;
        setProductError(msg);
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProductError(String(err));
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setProductForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingProduct(true);

    if (!imageFile) {
      alert("❌ กรุณาเลือกรูปภาพ");
      setAddingProduct(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please login again.");
      setAddingProduct(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price);
      formData.append("category", productForm.category);
      formData.append("brand", productForm.brand);
      formData.append("InStock", productForm.InStock);
      formData.append("image", imageFile);

      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert("✅ สินค้าถูกเพิ่มสำเร็จ");
        setProductForm({
          name: "",
          description: "",
          price: "",
          category: "",
          brand: "",
          InStock: "",
          image: "",
        });
        setImageFile(null);
        setImagePreview("");
      } else {
        const error = await res.json();
        alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
      }
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    } finally {
      setAddingProduct(false);
    }
  };

    const handleDeleteProduct = async (id: number) => {
      if (!confirm("ยืนยันการลบสินค้านี้?")) return;
      const token = localStorage.getItem("token");
      if (!token) return alert("Session expired");
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          alert("✅ ลบสินค้าเรียบร้อย");
          fetchProducts();
        } else {
          const err = await res.json();
          alert(`❌ ${err.message || 'ลบไม่สำเร็จ'}`);
        }
      } catch (err: any) {
        alert(`❌ ${err.message}`);
      }
    };

    const handleEditInit = (product: any) => {
      setEditingProductId(product.id);
      setProductForm({
        name: product.name || "",
        description: product.description || "",
        price: String(product.price ?? "0"),
        category: product.category || "",
        brand: product.brand || "",
        InStock: String(product.InStock ?? 0),
        image: product.image || "",
      });
      setImagePreview(product.image?.startsWith('http') ? product.image : product.image ? `http://localhost:5000${product.image}` : "");
      setImageFile(null);
      setShowProductForm(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      setAddingProduct(true);
      const token = localStorage.getItem("token");
      if (!token) return alert("Session expired");

      try {
        if (editingProductId) {
          const body = {
            name: productForm.name,
            description: productForm.description,
            price: parseFloat(productForm.price || '0'),
            category: productForm.category,
            brand: productForm.brand,
            InStock: parseInt(productForm.InStock || '0', 10),
          };
          const res = await fetch(`http://localhost:5000/api/products/${editingProductId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            alert("✅ อัปเดตสินค้าสำเร็จ");
            setEditingProductId(null);
            setProductForm({ name: "", description: "", price: "", category: "", brand: "", InStock: "", image: "" });
            setImagePreview("");
            setShowProductForm(false);
            fetchProducts();
          } else {
            const err = await res.json();
            alert(`❌ ${err.message || 'อัปเดตไม่สำเร็จ'}`);
          }
        } else {
          if (!imageFile) {
            alert("❌ กรุณาเลือกรูปภาพ");
            setAddingProduct(false);
            return;
          }
          const formData = new FormData();
          formData.append("name", productForm.name);
          formData.append("description", productForm.description);
          formData.append("price", productForm.price);
          formData.append("category", productForm.category);
          formData.append("brand", productForm.brand);
          formData.append("InStock", productForm.InStock);
          formData.append("image", imageFile);

          const res = await fetch("http://localhost:5000/api/products", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (res.ok) {
            alert("✅ สินค้าถูกเพิ่มสำเร็จ");
            setProductForm({ name: "", description: "", price: "", category: "", brand: "", InStock: "", image: "" });
            setImageFile(null);
            setImagePreview("");
            setShowProductForm(false);
            fetchProducts();
          } else {
            const err = await res.json();
            alert(`❌ ${err.message || 'เพิ่มไม่สำเร็จ'}`);
          }
        }
      } catch (err: any) {
        alert(`❌ ${err.message}`);
      } finally {
        setAddingProduct(false);
      }
    };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 dark:bg-slate-950 text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-xl ${!sidebarOpen && "hidden"}`}>Admin</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-slate-800 rounded"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800 text-gray-300"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className={!sidebarOpen ? "hidden" : ""}>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "products"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800 text-gray-300"
            }`}
          >
            <Package className="w-5 h-5" />
            <span className={!sidebarOpen ? "hidden" : ""}>สินค้า</span>
          </button>

          <button
            onClick={() => setActiveTab("view-orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "view-orders"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800 text-gray-300"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className={!sidebarOpen ? "hidden" : ""}>คำสั่งซื้อ</span>
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 text-gray-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className={!sidebarOpen ? "hidden" : ""}>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm p-6 border-b dark:border-slate-700">
          <h2 className="text-2xl font-bold dark:text-white">
              {activeTab === "dashboard" && "📊 Dashboard"}
              {activeTab === "products" && "🛍️ สินค้า"}
              {activeTab === "view-orders" && "📦 ดูคำสั่งซื้อ"}
            </h2>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <Card className="dark:bg-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium dark:text-gray-400">
                      คำสั่งซื้อทั้งหมด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold dark:text-white">
                      {statsLoading ? "-" : allOrders.length}
                    </p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium dark:text-gray-400">
                      รายรับทั้งหมด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold dark:text-white">
                      {statsLoading ? "-" : `฿${stats.totalRevenue.toFixed(2)}`}
                    </p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium dark:text-gray-400">
                      สินค้าทั้งหมด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold dark:text-white">{statsLoading ? "-" : stats.totalProducts}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card className="dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">คำสั่งซื้อล่าสุด</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : allOrders.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">ไม่มีคำสั่งซื้อ</p>
                  ) : (
                    <div className="space-y-3">
                      {allOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold dark:text-white">Order #{order.id}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString("th-TH")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold dark:text-white">฿{order.totalPrice.toFixed(2)}</p>
                            <Badge className={getStatusBadgeClass(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="grid grid-cols-1 gap-6">
              {/* Products List (full width) */}
              <Card className="dark:bg-slate-800">
                <CardHeader className="flex items-center justify-between">
                    <CardTitle className="dark:text-white text-xl">รายการสินค้า</CardTitle>
                    <div>
                    <Button onClick={() => { setEditingProductId(null); setProductForm({ name: "", description: "", price: "", category: "", brand: "", InStock: "", image: "" }); setImagePreview(""); setImageFile(null); setShowProductForm(true); }} className="bg-blue-600 hover:bg-blue-700">เพิ่มสินค้า</Button>
                    </div>
                  </CardHeader>
                <CardContent>
                  {loadingProducts ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  ) : productError ? (
                    <div className="text-center py-6">
                      <p className="text-red-600 dark:text-red-400">เกิดข้อผิดพลาดในการดึงข้อมูล: {productError}</p>
                      <div className="mt-3">
                        <Button onClick={fetchProducts} className="mx-auto">ลองอีกครั้ง</Button>
                      </div>
                    </div>
                  ) : products.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">ไม่มีสินค้า</p>
                  ) : (
                    <div className="space-y-4">
                      {products.map((p) => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <img
                              src={p.image?.startsWith("http") ? p.image : p.image ? `http://localhost:5000${p.image}` : "/placeholder.png"}
                              alt={p.name}
                              className="w-16 h-16 object-cover rounded-md border dark:border-slate-600"
                            />
                            <div>
                              <p className="font-semibold dark:text-white">{p.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">฿{Number(p.price).toFixed(2)}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">สต็อก: {p.InStock ?? 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEditInit(p)} className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-white">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 rounded bg-red-600 hover:bg-red-500 text-white">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add/Edit Form */}
              {/* Modal for Add/Edit Product */}
              {showProductForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50" onClick={() => { setShowProductForm(false); setEditingProductId(null); }} />
                  <div className="relative w-full max-w-3xl mx-4">
                    <Card className="dark:bg-slate-800">
                      <CardHeader>
                        <CardTitle className="dark:text-white text-lg">{editingProductId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="dark:text-white font-semibold">ชื่อสินค้า *</Label>
                              <Input id="name" value={productForm.name} onChange={handleProductInputChange} placeholder="เช่น iPhone 15 Pro" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="brand" className="dark:text-white font-semibold">แบรนด์ *</Label>
                              <Input id="brand" value={productForm.brand} onChange={handleProductInputChange} placeholder="เช่น Apple" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description" className="dark:text-white font-semibold">รายละเอียด *</Label>
                            <textarea id="description" value={productForm.description} onChange={handleProductInputChange} placeholder="อธิบายคุณสมบัติและข้อมูลของสินค้า..." className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500" rows={4} required />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="price" className="dark:text-white font-semibold">ราคา (฿) *</Label>
                              <Input id="price" type="number" step="0.01" min="0" value={productForm.price} onChange={handleProductInputChange} placeholder="0.00" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category" className="dark:text-white font-semibold">หมวดหมู่ *</Label>
                              <Input id="category" value={productForm.category} onChange={handleProductInputChange} placeholder="เช่น Electronics" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="InStock" className="dark:text-white font-semibold">จำนวนในสต็อก *</Label>
                              <Input id="InStock" type="number" min="0" value={productForm.InStock} onChange={handleProductInputChange} placeholder="0" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="image" className="dark:text-white font-semibold">รูปภาพสินค้า {editingProductId ? "(อัปเดตรูปภาพไม่รองรับในการแก้ไข)" : "*"}</Label>
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition">
                              <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                              <label htmlFor="image" className="cursor-pointer">
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{imageFile ? imageFile.name : (imagePreview ? 'รูปภาพที่เลือก' : 'คลิกหรือลากรูปภาพมาวางที่นี่')}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">(JPEG, PNG, WebP)</p>
                                </div>
                              </label>
                            </div>
                          </div>

                          <Button type="submit" disabled={addingProduct} className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 py-2 font-semibold">
                            {addingProduct ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                กำลังบันทึก...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                {editingProductId ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสินค้า'}
                              </>
                            )}
                          </Button>
                          <div className="flex gap-2">
                            <Button type="button" onClick={() => { setShowProductForm(false); setEditingProductId(null); setProductForm({ name: "", description: "", price: "", category: "", brand: "", InStock: "", image: "" }); setImagePreview(""); }} className="w-full bg-gray-500 hover:bg-gray-600 text-white">ยกเลิก</Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View Orders Tab */}
          {activeTab === "view-orders" && (
            <Card className="dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  คำสั่งซื้อของลูกค้า ({allOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : allOrders.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    ไม่มีคำสั่งซื้อ
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {allOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border dark:border-slate-700 rounded-lg p-4 dark:bg-slate-700/50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold dark:text-white">
                              Order #{order.id}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ลูกค้า ID: {order.userid} | {new Date(order.createdAt).toLocaleString("th-TH")}
                            </p>
                          </div>
                          <Badge className={getStatusBadgeClass(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">จำนวนสินค้า</p>
                            <p className="font-semibold dark:text-white">
                              {order.items?.length || 0} รายการ
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">ราคารวม</p>
                            <p className="font-semibold dark:text-white">
                              ฿{order.totalPrice.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">สถานะ</p>
                            <p className="font-semibold dark:text-white">{order.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    paid: "รอการจัดส่ง",
    shipped: "กำลังจัดส่ง",
    completed: "สำเร็จ",
    cancelled: "ยกเลิก",
  };
  return statusMap[status] || status;
}

function getStatusBadgeClass(status: string): string {
  const classMap: { [key: string]: string } = {
    paid: "bg-blue-100 text-blue-800",
    shipped: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return classMap[status] || "bg-gray-100 text-gray-800";
}
