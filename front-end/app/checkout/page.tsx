"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { Loader2, CreditCard, Banknote, Package, ArrowRight } from "lucide-react";

// Component สำหรับแสดงเมื่อสั่งซื้อสำเร็จ
const OrderSuccess = ({ orderId, onBackHome }: { orderId?: string; onBackHome: () => void }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-screen dark:bg-gray-900">
        <Package className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 dark:text-white">ขอบคุณสำหรับการสั่งซื้อ!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">เราได้รับคำสั่งซื้อของคุณแล้ว</p>
        {orderId && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                เลขที่ Order: <span className="font-semibold">{orderId}</span>
            </p>
        )}
        <p className="text-gray-600 dark:text-gray-400 mb-6">กำลังดำเนินการจัดส่งให้คุณ</p>
        <div className="flex gap-3">
            <Button onClick={onBackHome}>
                กลับไปหน้าแรก
                <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/history-order")}>
                ดูประวัติการสั่งซื้อ
            </Button>
        </div>
    </div>
);

const CheckoutPage = () => {
    const router = useRouter();
    // State สำหรับตะกร้า
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);

    // State สำหรับฟอร์ม
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod', 'credit_card', 'bank_transfer'

    // State สำหรับการโหลดและข้อผิดพลาด
    const [isLoading, setIsLoading] = useState(true); // เริ่มที่ true เพื่อโหลดตะกร้า
    const [isPlacingOrder, setIsPlacingOrder] = useState(false); // สำหรับตอนกดสั่งซื้อ
    const [error, setError] = useState<string | null>(null);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | undefined>(undefined);

    // Zustand store
    const setCartCount = useCartStore((state) => state.setCartCount);
    const triggerRefetch = useCartStore((state) => state.triggerRefetch);

    // --- 1. ดึงข้อมูลตะกร้า ---
    const fetchCart = async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
            setCartItems([]);
            setTotalPrice(0);
            setCartCount(0);
            setIsLoading(false);
            setError("กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/cart", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("ไม่สามารถดึงข้อมูลตะกร้าได้");
            }

            const data = await res.json();
            const items = data.cart?.items || [];
            setCartItems(items);

            const sum = items.reduce(
                (sum: number, item: any) => sum + item.quantity * Number(item.Product.price),
                0
            );
            setTotalPrice(sum);
            setCartCount(items.length);

            if (items.length === 0) {
                setError("ตะกร้าของคุณว่างเปล่า");
            }
        } catch (err: any) {
            console.error("Failed to fetch cart:", err);
            setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            setCartItems([]);
            setTotalPrice(0);
            setCartCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    // ดึงข้อมูลตะกร้าเมื่อ component โหลด
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchCart();
    }, [router]);

    // --- 2. จัดการการเปลี่ยนแปลงในฟอร์ม ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // --- 3. ส่งคำสั่งซื้อ ---
    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPlacingOrder(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่");
            setIsPlacingOrder(false);
            return;
        }

        // สร้าง payload ที่จะส่ง
        const orderDetails = {
            ...formData, // name, address, phone
            paymentMethod,
            items: cartItems.map((item) => ({
                productId: item.Product.id, // สมมติว่า API ต้องการ productId
                quantity: item.quantity,
                price: Number(item.Product.price),
            })),
            totalPrice: totalPrice,
        };

        try {
            const res = await fetch("http://localhost:5000/api/cart/checkout", { // สมมติ endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderDetails),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "ไม่สามารถส่งคำสั่งซื้อได้");
            }

            // ถ้าสำเร็จ
            const responseData = await res.json();
            setOrderId(responseData.id?.toString());
            setOrderSuccess(true);
            triggerRefetch(); // บอกให้ส่วนอื่นๆ (เช่น Navbar) โหลดข้อมูลใหม่ (ตะกร้าจะว่าง)
        } catch (err: any) {
            console.error("Failed to place order:", err);
            setError(err.message);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // --- 4. Render ---

    // แสดงสถานะการโหลด
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
        );
    }

    // แสดงหน้าขอบคุณเมื่อสั่งซื้อสำเร็จ
    if (orderSuccess) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <OrderSuccess 
                    orderId={orderId}
                    onBackHome={() => router.push("/")}
                />
            </div>
        );
    }

    // แสดงข้อผิดพลาดหลัก (เช่น ตะกร้าว่าง หรือ โหลดไม่สำเร็จ)
    if (error && cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center p-4">
                <p className="text-xl text-red-500 mb-4">{error}</p>
                {error !== "ตะกร้าของคุณว่างเปล่า" && (
                    <Button onClick={fetchCart}>ลองอีกครั้ง</Button>
                )}
                <Button variant="outline" onClick={() => window.location.href = '/shop-products'}>
                    ซื้อสินค้าต่อที่หน้าสินค้า
                </Button>
            </div>
        );
    }

    // แสดงหน้า Checkout หลัก
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6 dark:text-white">ชำระเงิน</h1>

                <form
                    onSubmit={handlePlaceOrder}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
                >
                {/* คอลัมน์ซ้าย: ข้อมูลจัดส่งและชำระเงิน */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ข้อมูลการจัดส่ง */}
                    <Card className="dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="dark:text-white">ข้อมูลการจัดส่ง</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="dark:text-white">ชื่อ-นามสกุล</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="dark:text-white">ที่อยู่</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="dark:text-white">เบอร์โทรศัพท์</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* วิธีชำระเงิน */}
                    <Card className="dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="dark:text-white">วิธีชำระเงิน</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <SelectValue placeholder="เลือกวิธีชำระเงิน" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800">
                                    <SelectItem value="cod">
                                        <div className="flex items-center space-x-2">
                                            <Banknote className="h-4 w-4" />
                                            <span>เก็บเงินปลายทาง (COD)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="credit_card">
                                        <div className="flex items-center space-x-2">
                                            <CreditCard className="h-4 w-4" />
                                            <span>บัตรเครดิต (เร็วๆ นี้)</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>

                {/* คอลัมน์ขวา: สรุปคำสั่งซื้อ */}
                <div className="lg:col-span-1 sticky top-8">
                    <Card className="dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="dark:text-white">สรุปคำสั่งซื้อ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium dark:text-white">{item.Product.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            จำนวน: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-medium dark:text-white">
                                        {(item.quantity * Number(item.Product.price)).toLocaleString("en-US")} ฿
                                    </p>
                                </div>
                            ))}
                            <Separator className="dark:bg-gray-700" />
                            <div className="flex justify-between font-bold text-lg dark:text-white">
                                <p>ยอดรวมทั้งหมด:</p>
                                <p className="text-blue-600 dark:text-blue-400">{totalPrice.toLocaleString("en-US")} ฿</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch space-y-2">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isPlacingOrder || cartItems.length === 0}
                                className="dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                {isPlacingOrder ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "ยืนยันคำสั่งซื้อ"
                                )}
                            </Button>
                            {error && !isPlacingOrder && (
                                <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </form>
            </div>
        </div>
    );
};

export default CheckoutPage;

