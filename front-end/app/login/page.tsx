"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("login"))
      router.push("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex justify-center items-start pt-20 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="p-10 rounded-2xl w-full max-w-md space-y-6 shadow-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-lg"
      >
        <h1 className="text-2xl font-bold text-center from-red to-white">Login</h1>

        <div>
          <Label style={{ marginBottom: '8px' }}>Username</Label>
          <Input
            type="username"
            placeholder="Enter your username" 
            className="dark:bg-black dark:text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <Label style={{ marginBottom: '8px' }}>Password</Label>
          <Input
            type="password"
            placeholder="Enter your password" 
            className="dark:bg-black dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full mt-2 cursor-pointer dark:bg-black dark:text-white hover:dark:bg-white hover:dark:text-black hover:text-black hover:bg-white">
          Login
        </Button>
        <p className="text-center text-sm text-black dark:text-white mt-4">
          Forgot password?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => router.push("/forgot-password")}
          >
            Click
          </span>
        </p>

        <p className="text-center text-sm text-black dark:text-white mt-4">
          Don't have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => router.push("/register")}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}
