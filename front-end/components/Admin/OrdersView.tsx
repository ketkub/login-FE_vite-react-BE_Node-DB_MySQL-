"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- สร้างตัวจัดรูปแบบไว้ด้านนอก ---
const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US');

// 1. ย้ายฟังก์ชัน utils มาไว้ข้างใน
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

export function OrdersView() {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        setLoadingOrders(true);
        setOrderError(null);
        const token = localStorage.getItem("token");
        if (!token) {
            setOrderError("Session not found. Please log in again.");
            setLoadingOrders(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/admin/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setAllOrders(Array.isArray(data) ? data : data.orders || []);
            } else {
                const errData = await response.json().catch(() => null);
                const msg = errData?.message || `Failed with status: ${response.status}`;
                setOrderError(msg);
                setAllOrders([]);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setOrderError(String(error));
        } finally {
            setLoadingOrders(false);
        }
    };

    return (
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
                ) : orderError ? (
                    <div className="text-center py-6 text-red-600 dark:text-red-400">
                        <p>เกิดข้อผิดพลาด: {orderError}</p>
                        <Button onClick={fetchAllOrders} className="mt-3">
                            ลองอีกครั้ง
                        </Button>
                    </div>
                ) : allOrders.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                        ไม่มีคำสั่งซื้อ
                    </p>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">

                        {allOrders
                            .slice()
                            .sort((a, b) => a.id - b.id)
                            .map((order) => (
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
                                                {numberFormatter.format(order.items?.length || 0)} รายการ
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">ราคารวม</p>
                                            <p className="font-semibold dark:text-white">
                                                ฿{currencyFormatter.format(order.totalPrice)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">สถานะ</p>
                                            <p className="font-semibold dark:text-white capitalize">{order.status}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}