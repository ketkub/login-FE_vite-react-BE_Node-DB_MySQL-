"use client";

import { useEffect, useState } from "react";
// 💡 [แก้ไข] 1. Import AvatarImage
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut } from "lucide-react"; // LogIn ไม่ได้ถูกใช้
import { useRouter, usePathname } from "next/navigation";
import { ProfileDialog } from "@/components/Dialogs/ProfileDialog";

// 💡 [เพิ่ม] 2. เพิ่มฟังก์ชัน decodeToken (ควรย้ายไป utils)
const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    if (payload.exp && payload.exp < now) {
      localStorage.removeItem("token");
      return null;
    }
    return payload; // คืนค่า { userId, ... }
  } catch {
    return null;
  }
};

const AvatarUser = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLogin();
    // เพิ่ม Event Listener เพื่อให้ UI อัปเดตเมื่อมีการล็อกอิน/ล็อกเอาต์
    window.addEventListener("login", checkLogin);
    return () => window.removeEventListener("login", checkLogin);
  }, []);

  // 💡 [แก้ไข] 3. เพิ่มการ DEBUG ใน useEffect นี้
  useEffect(() => {
    if (!isLoggedIn) {
      setUserAvatar(null); // เคลียร์ Avatar เมื่อ Logout
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const user = decodeToken(token);
    if (!user?.userId) {
      console.error("DEBUG: Token decode failed or no userId");
      return;
    }

    console.log(`DEBUG: Fetching profile for userId: ${user.userId}`); // 👈 DEBUG

    fetch(`http://localhost:5000/api/profile/${user.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        // 👈 DEBUG: เช็คสถานะ response ก่อน
        if (!res.ok) {
          console.error(`DEBUG: Fetch failed with status: ${res.status}`);
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("DEBUG: Profile data from server:", data); // 👈 DEBUG: ดูข้อมูลที่ได้

        if (data?.userDetails?.avatar) {
          const avatarUrl = `http://localhost:5000${data.userDetails.avatar}`;
          console.log("DEBUG: Setting avatar URL to:", avatarUrl); // 👈 DEBUG
          setUserAvatar(avatarUrl);
        } else {
          console.log("DEBUG: No avatar path found in data.userDetails.avatar"); // 👈 DEBUG
          setUserAvatar(null); // ไม่มี Avatar
        }
      })
      .catch((err) => {
        // 👈 DEBUG: เพิ่มการจับ error ที่นี่
        console.error("DEBUG: Failed to fetch profile for avatar:", err);
        setUserAvatar(null);
      });
  }, [isLoggedIn]); // ทำงานทุกครั้งที่สถานะการล็อกอินเปลี่ยน

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("login")); // ยิง event "login" (เพื่ออัปเดต state)
    router.push("/");
  };

  if (pathname === "/register") {
    return null;
  }

  // 💡 [แก้ไข] 4. แก้ไขโครงสร้าง JSX (ส่วนนี้ของคุณถูกต้องอยู่แล้ว)
  return (
    <div>
      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer w-10 h-10">
              {userAvatar ? (
                <AvatarImage src={userAvatar} alt="User Avatar" />
              ) : (
                <AvatarFallback>
                  <UserIcon className="w-5 h-5" />
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <ProfileDialog
              onProfileUpdate={(updatedAvatarUrl) => {
                setUserAvatar(updatedAvatarUrl);
              }}
            >
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()} // ป้องกันไม่ให้เมนูปิดเมื่อคลิก
              >
                My Account
              </DropdownMenuItem>
            </ProfileDialog>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" onClick={() => router.push("/login")}>
          Login
        </Button>
      )}
    </div>
  );
};

export default AvatarUser;