"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation"; // 1. Import usePathname

const AvatarUser = () => {
  const router = useRouter();
  const pathname = usePathname(); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLogin();
    window.addEventListener("login", checkLogin);
    return () => window.removeEventListener("login", checkLogin);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("login"));
      setIsLoggedIn(true);
      setOpen(false);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    window.dispatchEvent(new Event("login"));
    router.push("/");
  };

  const handleAccount = () => {
    router.push("/profile");
  };

  const handleRegister = () => {
    setOpen(false);
    router.push("/register");
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open === false) {
      setUsername("");
      setPassword("");
    }
  };

  if (pathname === "/register") {
    return null;
  }

  return (
    <div>
      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer w-10 h-10">
              <AvatarFallback>
                <UserIcon className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleAccount}>
              My Account
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline">Login</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogTitle className="text-center text-2xl font-bold">
              Login
            </DialogTitle>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <Label style={{ marginBottom: "8px" }}>Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <Label style={{ marginBottom: "8px" }}>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <span
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={handleRegister}
                >
                  Register
                </span>
              </p>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AvatarUser;