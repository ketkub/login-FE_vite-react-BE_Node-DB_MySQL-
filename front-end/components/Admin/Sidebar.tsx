"use client";

import { LogOut, LayoutDashboard, ShoppingCart, Package, Menu, X } from "lucide-react";

type ActiveTab = "dashboard" | "products" | "view-orders";

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    onLogout: () => void;
}

export function Sidebar({
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    onLogout,
}: SidebarProps) {
    return (
        <div
            className={`${sidebarOpen ? "w-64" : "w-20"
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "dashboard"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-slate-800 text-gray-300"
                        }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className={!sidebarOpen ? "hidden" : ""}>Dashboard</span>
                </button>

                <button
                    onClick={() => setActiveTab("products")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "products"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-slate-800 text-gray-300"
                        }`}
                >
                    <Package className="w-5 h-5" />
                    <span className={!sidebarOpen ? "hidden" : ""}>สินค้า</span>
                </button>

                <button
                    onClick={() => setActiveTab("view-orders")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "view-orders"
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
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 text-gray-300 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className={!sidebarOpen ? "hidden" : ""}>ออกจากระบบ</span>
                </button>
            </div>
        </div>
    );
}