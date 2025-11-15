"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function LoginAdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Check if user is admin
        if (data.role !== "admin") {
          setError("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
          setLoading(false);
          return;
        }
        
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("login"));
        router.push("/for-admin/admin-page");
      } else {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-20 min-h-screen bg-liner-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <form
        onSubmit={handleSubmit}
        className="p-10 rounded-2xl w-full max-w-md space-y-6 shadow-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-lg dark:bg-gray-800/50"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold">Admin Login</h1>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          เข้าสู่ระบบจัดการแอดมิน
        </p>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <Label className="dark:text-white">Username</Label>
          <Input
            type="text"
            placeholder="ป้อนชื่อผู้ใช้" 
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <Label className="dark:text-white">Password</Label>
          <Input
            type="password"
            placeholder="ป้อนรหัสผ่าน" 
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full mt-4 cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-700 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          ต้องการเข้าหน้าธรรมชาติ?{" "}
          <span
            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-semibold"
            onClick={() => router.push("/login")}
          >
            Login ทั่วไป
          </span>
        </p>
      </form>
    </div>
  );
}
