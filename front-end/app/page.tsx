"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCartStore } from "@/store/cartStore"; // 👈 1. Import store กลาง

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  brand: string;
}

interface ApiResponse {
  totalItems: { products: Product[] };
  totalPages: number;
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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);

  // --- ⭐️ 2. เปลี่ยนจาก incrementCart เป็น triggerRefetch ⭐️ ---
  const triggerRefetch = useCartStore((state) => state.triggerRefetch);

  const handleAddToCart = async (product: Product) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      const user = decodeToken(token);
      if (!user) {
        alert("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // --- ⭐️ 3. เรียก triggerRefetch() แทน ⭐️ ---
        // นี่จะไปสั่งให้ CartDialog (ถ้าเปิดอยู่) และ Navbar (ผ่าน fetchCart)
        // อัปเดตตัวเอง
        triggerRefetch();
        alert("Product added to cart!"); // (เพิ่มการแจ้งเตือน)
      } else {
        const errorData = await response.json();
        console.error("Failed to add to cart (server error):", errorData);
        alert(`Failed to add to cart: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Add to cart failed (network error):", error);
      alert("An error occurred while adding to the cart.");
    }
  };

  useEffect(() => {
    fetch(`http://localhost:5000/api/products?page=${page}&limit=5`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        setProducts(data.totalItems.products);
        setTotalPages(data.totalPages);
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, [page]);

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            สินค้า
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group border rounded-4xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 grid gap-8"
            >
              <div className="relative h-64 w-full overflow-hidden rounded-4xl bg-slate-100 dark:bg-black ">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
                <Badge className="absolute top-3 right-3 bg-white dark:bg-gray-900 text-slate-900 dark:text-white shadow-md">
                  {product.brand}
                </Badge>
              </div>

              <CardContent className="p-6 h-36 flex flex-col justify-between rounded-tr-xs w-80 mx-auto">
                <h2 className="text-md font-bold dark:text-white line-clamp-2 font-sans text-center w-65 border-black border-2 text-black dark:bg-violet-900 mx-auto h-12 flex items-center justify-center rounded-2xl px-2 ">
                  {product.name}
                </h2>
                <p className="text-2xl font-bold text-emerald-600 dark:text-white text-center mt-1">
                  {Number(product.price).toLocaleString("th-TH")} ฿
                </p>
              </CardContent>

              <CardFooter className="p-6 pt-0 flex justify-center">
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-gray-900 dark:hover:bg-gray-800 text-white rounded-lg shadow-md transition-colors group/btn mx-a "
                >
                  <ShoppingCart className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                  เพิ่มไปที่ตะกร้า
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    aria-disabled={page === 1}
                    tabIndex={page === 1 ? -1 : undefined}
                    className={
                      page === 1
                        ? "pointer-events-none opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setPage(i + 1)}
                      isActive={page === i + 1}
                      className={`cursor-pointer rounded-md px-4 py-2 transition-colors ${page === i + 1
                          ? "bg-slate-900 text-white dark:bg-gray-800 dark:text-white"
                          : "text-slate-700 dark:text-gray-300"
                        }`}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    aria-disabled={page === totalPages}
                    tabIndex={page === totalPages ? -1 : undefined}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>


  );
}
