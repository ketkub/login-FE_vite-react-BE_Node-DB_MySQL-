"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });

    if (res.ok) {
      alert("Password reset link sent to your email")
      setEmail("");
      setUsername("");
    } else {
      alert("Failed to send reset link");
      setEmail("");
      setUsername("");
    }
  };

  return (
    <div className="flex justify-center items-start pt-20 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="p-10 rounded-2xl w-full max-w-md space-y-6 shadow-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-lg"
      >
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <div>
          <Label style={{ marginBottom: '8px' }}>Username</Label>
          <Input
            type="username"
            placeholder="Enter your email"
            className="dark:bg-black dark:text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

         <div>
          <Label style={{ marginBottom: '8px' }}>Email</Label>
          <Input
            type="email"
            placeholder="Enter your email"
            className="dark:bg-black dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full mt-2 cursor-pointer dark:bg-black dark:text-white hover:dark:bg-white hover:dark:text-black hover:text-black hover:bg-white">
          Submit
        </Button>
      </form>
    </div>
  );
}
