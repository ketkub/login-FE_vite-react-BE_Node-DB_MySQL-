"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Import Component ที่แยกไป
import { Sidebar } from "@/components/Admin/Sidebar";
import { DashboardView } from "@/components/Admin/DashboardView";
import { ProductsView } from "@/components/Admin/ProductsView";
import { OrdersView } from "@/components/Admin/OrdersView";

// 1. ย้าย decodeToken กลับมาไว้ที่นี่
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

type ActiveTab = "dashboard" | "products" | "view-orders";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 2. Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/for-admin/login-admin");
      return;
    }

    const user = decodeToken(token); // ใช้งานฟังก์ชันที่อยู่ไฟล์เดียวกัน
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }, [router]);

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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm p-4 md:p-6 border-b dark:border-slate-700 shrink-0">
          <h2 className="text-xl md:text-2xl font-bold dark:text-white">
            {activeTab === "dashboard" && "📊 Dashboard"}
            {activeTab === "products" && "🛍️ สินค้า"}
            {activeTab === "view-orders" && "📦 ดูคำสั่งซื้อ"}
          </h2>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* สลับเนื้อหา */}
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "products" && <ProductsView />}
          {activeTab === "view-orders" && <OrdersView />}
        </main>
      </div>
    </div>
  );
}