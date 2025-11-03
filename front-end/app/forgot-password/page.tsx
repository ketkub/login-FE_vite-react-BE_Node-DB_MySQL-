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
      alert("Password reset link sent to your email");
    } else {
      alert("Failed to send reset link");
    }
  };

  return (
    <div className="flex justify-center items-start pt-20 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="p-8 w-full max-w-md space-y-4 dark:bg-slate-800 shadow-md border-0 rounded-lg"
      >
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <div>
          <Label style={{ marginBottom: '8px' }}>Username</Label>
          <Input
            type="username"
            placeholder="Enter your email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

         <div>
          <Label style={{ marginBottom: '8px' }}>Email</Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full mt-2 cursor-pointer">
          Submit
        </Button>
      </form>
    </div>
  );
}
