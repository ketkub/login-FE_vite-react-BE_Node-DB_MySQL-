"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from "lucide-react";

interface OrderItem {
  id: number;
  quantity: number;
  priceAtPurchase: number;
  Product: {
    id: number;
    name: string;
    image: string;
    brand: string;
    price: number;
  };
}

interface Order {
  id: number;
  totalPrice: number;
  status: "paid" | "shipped" | "completed" | "cancelled";
  createdAt: string;
  items: OrderItem[];
}

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "paid":
      return <Package className="w-5 h-5 text-blue-500" />;
    case "shipped":
      return <Truck className="w-5 h-5 text-orange-500" />;
    case "completed":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "cancelled":
      return <Clock className="w-5 h-5 text-red-500" />;
    default:
      return <Clock className="w-5 h-5" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "paid":
      return "รอการจัดส่ง";
    case "shipped":
      return "กำลังจัดส่ง";
    case "completed":
      return "สำเร็จ";
    case "cancelled":
      return "ยกเลิก";
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-orange-100 text-orange-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function HistoryOrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const user = decodeToken(token);
        if (!user) {
          router.push("/login");
          return;
        }

        const response = await fetch(`http://localhost:5000/api/orders/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // backend returns an array of orders; support both array and { orders: [...] }
          const ordersData = Array.isArray(data) ? data : data.orders || [];
          setOrders(ordersData);
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setError("ไม่สามารถดึงข้อมูลการสั่งซื้อได้");
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold dark:text-white">ประวัติการสั่งซื้อ</h1>
            <p className="text-gray-600 dark:text-gray-400">คุณมีการสั่งซื้อทั้งหมด {orders.length} รายการ</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="text-center py-12 dark:bg-gray-800">
            <CardContent>
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                ไม่มีประวัติการสั่งซื้อ
              </h2>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                คุณยังไม่มีการสั่งซื้อสินค้าใด ๆ
              </p>
              <Button onClick={() => router.push("/shop-products")}>
                ไปซื้อสินค้า
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="dark:bg-gray-800 hover:shadow-lg transition-shadow">
                {/* Order Header */}
                <CardHeader className="border-b dark:border-gray-700 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg dark:text-white">
                        Order #{order.id}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {/* Order Items */}
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 pb-3 border-b dark:border-gray-700 last:border-b-0"
                      >
                        {/* Product Image */}
                        <div className="shrink-0">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {item.Product?.image ? (
                              <img
                                src={`http://localhost:5000${item.Product.image}`}
                                alt={item.Product?.name || "product"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold dark:text-white truncate">
                            {item.Product?.name || "สินค้าถูกลบ"}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.Product?.brand || "-"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            จำนวน: {item.quantity} ชิ้น
                          </p>
                        </div>

                        {/* Price */}
                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-lg dark:text-white">
                            ฿{((item.priceAtPurchase || item.Product?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ฿{(item.priceAtPurchase || item.Product?.price || 0).toFixed(2)} / ชิ้น
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        รวมทั้งสิ้น
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ฿{order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
