"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Upload,
  UserCircle,
  X,
  Save,
  UserPenIcon,
} from "lucide-react";
import { IconGenderBigender } from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils"
import { Textarea } from "../ui/textarea";

interface UserDetails {
  firstname: string;
  lastname: string;
  gender: string;
  avatar: string;
  address: string;
  phone: string;
  birthDate: string;
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

const BLANK_FORM: UserDetails = {
  firstname: "",
  lastname: "",
  gender: "",
  avatar: "",
  address: "",
  phone: "",
  birthDate: "",
};

// ฟังก์ชันช่วยแปลงวันที่
const formatDateForInput = (dateString: string | undefined | null): string => {
  if (!dateString) return "";
  try {
    // แปลงเป็น YYYY-MM-DD
    return new Date(dateString).toISOString().split("T")[0];
  } catch {
    return ""; // ถ้า format ผิดพลาด
  }
};

// 💡 [เพิ่ม] 1. สร้าง interface สำหรับ props
interface ProfileDialogProps {
  children: React.ReactNode;
  onProfileUpdate?: (avatarUrl: string | null) => void; // 👈 (สำคัญ)
}

// 💡 [แก้ไข] 2. เปลี่ยนการรับ props ให้ใช้ interface ใหม่
export function ProfileDialog({ children, onProfileUpdate }: ProfileDialogProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [profile, setProfile] = useState<UserDetails | null>(null);
  const [formData, setFormData] = useState<UserDetails>(BLANK_FORM);
  const [editMode, setEditMode] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = decodeToken(token);
      setUserId(user?.userId ?? null);
    }
    setTokenLoaded(true);
  }, []);

  useEffect(() => {
    if (!userId || !isDialogOpen) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setProfile(null);
    setFormData(BLANK_FORM);
    setEditMode(true);
    setAvatarPreview(null);
    setAvatarFile(null);

    fetch(`http://localhost:5000/api/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.userDetails) {
          setHasProfile(true);
          const finalDetails = {
            ...data.userDetails,
            birthDate: formatDateForInput(data.userDetails.birthDate),
          };


          setProfile(finalDetails);
          setFormData(finalDetails);
          setEditMode(false);

          // 💡 [เพิ่ม] 3. เรียก onProfileUpdate ทันทีเมื่อโหลดโปรไฟล์เสร็จ
          const currentAvatarUrl = finalDetails.avatar
            ? `http://localhost:5000${finalDetails.avatar}`
            : null;
          onProfileUpdate?.(currentAvatarUrl);
        }

        else {
          {
            setHasProfile(false);
          }
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
      });
    // 💡 [แก้ไข] 4. เพิ่ม onProfileUpdate ใน dependency array
  }, [userId, isDialogOpen, onProfileUpdate]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!userId) return;
    console.log("Sending request with userId:", userId);

    const form = new FormData();
    form.append("firstname", formData.firstname);
    form.append("lastname", formData.lastname);
    form.append("gender", formData.gender);
    form.append("address", formData.address);
    form.append("phone", formData.phone);
    form.append("birthDate", formData.birthDate);

    if (avatarFile) {
      form.append("avatar", avatarFile);
    } else {
      form.append("avatar", formData.avatar);
    }

    try {
      // ✅ ใช้เส้นทางที่คุณกำหนดเอง
      const url = hasProfile
        ? `http://localhost:5000/api/picprofile/${userId}` // update
        : `http://localhost:5000/api/picprofile`;          // create

      const method = hasProfile ? "PUT" : "POST";

      if (!hasProfile) {
        form.append("userid", userId);
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        setHasProfile(true);

        const finalDetails = {
          ...data.userDetails,
          birthDate: formatDateForInput(data.userDetails.birthDate),
        };

        setProfile(finalDetails);
        setFormData(finalDetails);
        setAvatarPreview(null);
        setAvatarFile(null);
        setEditMode(false);
        setIsDialogOpen(false);

        const updatedAvatarUrl = finalDetails.avatar
          ? `http://localhost:5000${finalDetails.avatar}`
          : null;

        onProfileUpdate?.(updatedAvatarUrl);

      } else {
        alert(data.message || "Error updating profile");
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setFormData({ ...formData, avatar: "" });

    // 💡 [เพิ่ม] 3. เรียก onProfileUpdate เมื่อลบ Avatar
    onProfileUpdate?.(null);
  };

  if (!tokenLoaded || !userId) {
    return <>{children}</>;
  }

  const avatarUrl = avatarPreview
    ? avatarPreview
    : profile?.avatar
      ? `http://localhost:5000${profile.avatar}`
      : null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        {/* ... (เนื้อหา Dialog ทั้งหมดเหมือนเดิม) ... */}
        <DialogHeader className="space-y-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-linear-to-br flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile?.firstname?.[0]?.toUpperCase() || "U"
                )}
              </div>
              {editMode && (
                <>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {avatarUrl && (
                    <button
                      onClick={removeAvatar}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </>
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {editMode ? "Edit Profile" : "My Profile"}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {editMode
                  ? "Update your personal information"
                  : "View your profile details"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {editMode ? (
          <div className="grid gap-6 py-6">
            <div className="space-y-4"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="firstname"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                <Input
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={(e) =>
                    setFormData({ ...formData, firstname: e.target.value })
                  }
                  placeholder="Enter your first name"
                  
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastname"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Last Name
                </Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={(e) =>
                    setFormData({ ...formData, lastname: e.target.value })
                  }
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <IconGenderBigender stroke={2} className="w-4 h-4"/>
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: string) => {
                    setFormData({ ...formData, gender: value })
                  }}
                  name="gender"
                >
                  <SelectTrigger className="w-full">
            
                    <SelectValue placeholder="— เลือกเพศ —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ชาย">ชาย</SelectItem>
                    <SelectItem value="หญิง">หญิง</SelectItem>
                    <SelectItem value="ไม่ระบุเพศ">ไม่ระบุเพศ</SelectItem> 
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="birthDate"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Birth Date
                </Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter your phone number"

              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Address
              </Label>
              <Textarea 
                id="address"
                name="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter your address"
              />
            </div>
          </div>
        ) : (
          <div className="py-6">
            <div className="grid gap-6">
              <div className="bg-linear-to-r rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4 dark:border-purple-500 dark:border-2 dark:rounded-ee-full p-4 m-2 border-black border-2 rounded-4xl">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 dark:border-purple-500 border-2 border-black">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 rounded-4xl border-2 w-30 text-center dark:bg-purple-950 dark:text-white bg-black text-white">
                      Full Name
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {profile?.firstname} {profile?.lastname}
                    </p>
                  </div>
                </div>
                {profile?.gender && (
                  <div className="flex items-start gap-4 dark:border-purple-500 dark:border-2 dark:rounded-ee-full p-4 m-2 border-black border-2 rounded-4xl">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 dark:border-purple-500 border-2 border-black">
                      <UserCircle className="w-6 h-6 " />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1 rounded-4xl border-2 w-30 text-center dark:bg-purple-950 dark:text-white bg-black text-white">
                        Gender
                      </p>
                      <p className="text-lg font-semibold text-black dark:text-white">
                        {profile?.gender}
                      </p>
                    </div>
                  </div>
                )}
                {profile?.birthDate && (
                  <div className="flex items-start gap-4 dark:border-purple-500 dark:border-2 dark:rounded-ee-full p-4 m-2 border-black border-2 rounded-4xl">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 dark:border-purple-500 border-2 border-black">
                      <Calendar className="w-6 h-6 " />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1 rounded-4xl border-2 w-30 text-center dark:bg-purple-950 dark:text-white bg-black text-white">
                        Birth Date
                      </p>
                      <p className="text-lg font-semibold text-black dark:text-white">
                        {profile?.birthDate}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4 dark:border-purple-500 dark:border-2 dark:rounded-ee-full p-4 m-2 border-black border-2 rounded-4xl">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 dark:border-purple-500 border-2 border-black">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 rounded-4xl border-2 w-30 text-center dark:bg-purple-950 dark:text-white bg-black text-white">
                      Phone Number
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {profile?.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 dark:border-purple-500 dark:border-2 dark:rounded-ee-full p-4 m-2 border-black border-2 rounded-4xl">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 dark:border-purple-500 border-2 border-black">
                    <MapPin className="w-6 h-6 " />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 rounded-4xl border-2 w-30 text-center dark:bg-purple-950 dark:text-white bg-black text-white">
                      Address
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {profile?.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-3 pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1 h-11">
              <X className="w-4 h-4 mr-2 text-start" />
              Cancel
            </Button>
          </DialogClose>
          {editMode ? (
            <Button
              onClick={handleSave}
              className="flex-1 h-11 bg-linear-to-r"
            >
              <Save className="w-4 h-4 mr-2 text-start" />
              Save Changes
            </Button>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              className="flex-1 h-11 bg-linear-to-r"
            >
              <UserPenIcon className="w-4 h-4 mr-2 text-start" />
              Edit Profile
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}