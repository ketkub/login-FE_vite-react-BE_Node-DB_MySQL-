"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; 
import { User as UserIcon, LogOut, LogIn } from "lucide-react"; 
import { useRouter, usePathname } from "next/navigation";
import { ProfileDialog } from "@/components/Dialogs/ProfileDialog";

const AvatarUser = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLogin();
    window.addEventListener("login", checkLogin);
    return () => window.removeEventListener("login", checkLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("login"));
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/login");
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
            <ProfileDialog>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()} 
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
        <Button variant="outline" onClick={handleLogin}>
          Login
        </Button>
      )}
    </div>
  );
};

export default AvatarUser;