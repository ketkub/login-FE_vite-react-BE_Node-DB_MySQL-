"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// 1. ย้ายฟังก์ชัน utils มาไว้ข้างใน Component หรือนอก Component แต่ในไฟล์เดียวกัน
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

interface Order {
  id: number;
  userid: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: any[];
}

export function DashboardView() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setStatsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setStatsLoading(false);
      return;
    }

    try {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium dark:text-gray-400">
              คำสั่งซื้อทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold dark:text-white">
              {/* --- เปลี่ยนแปลง --- */}
              {statsLoading ? "-" : stats.totalOrders.toLocaleString("en-US")}
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
              {/* --- เปลี่ยนแปลง --- */}
              {statsLoading
                ? "-"
                : Number(stats.totalRevenue).toLocaleString("th-TH", {
                    style: "currency",
                    currency: "THB",
                  })}
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
            <p className="text-3xl font-bold dark:text-white">
              {/* --- เปลี่ยนแปลง --- */}
              {statsLoading ? "-" : stats.totalProducts.toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">คำสั่งซื้อล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
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
                    <p className="font-semibold dark:text-white">
                      {/* --- เปลี่ยนแปลง --- */}
                      {Number(order.totalPrice).toLocaleString("th-TH", {
                        style: "currency",
                        currency: "THB",
                      })}
                    </p>
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
  );
}