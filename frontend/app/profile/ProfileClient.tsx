"use client";

import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import AlertModal from "../components/AlertModal";
import ProfileHero from "./components/ProfileHero";
import ProfileSidebar from "./components/ProfileSidebar";
import { PasswordField, ProfileField } from "./components/ProfileFields";
import type { ProfileFormState, User } from "./types";

interface AlertState {
  open: boolean;
  title: string;
  message: string;
  variant: "success" | "error";
}

export default function ProfileClient({ user }: { user: User | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [redirectingToLogin, setRedirectingToLogin] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    title: "",
    message: "",
    variant: "success",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const redirectToLogin = useCallback(() => {
    setRedirectingToLogin(true);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const verifySession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!res.ok) {
        redirectToLogin();
      }
    } catch {
      redirectToLogin();
    }
  }, [redirectToLogin]);

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        void verifySession();
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void verifySession();
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [verifySession]);

  useEffect(() => {
    document.body.classList.toggle("sidebar-drawer-open", sidebarOpen);

    return () => {
      document.body.classList.remove("sidebar-drawer-open");
    };
  }, [sidebarOpen]);

  const initialForm = useMemo<ProfileFormState>(() => {
    if (!currentUser) {
      return {
        name: "",
        email: "",
        role: "",
        phone: "",
        username: "",
        password: "",
        confirmPassword: "",
      };
    }

    return {
      name: `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email,
      email: currentUser.email || "",
      role: currentUser.role || "",
      phone: currentUser.phone || "",
      username: currentUser.username || currentUser.email || "",
      password: "",
      confirmPassword: "",
    };
  }, [currentUser]);

  const [form, setForm] = useState<ProfileFormState>(initialForm);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setSidebarOpen(false);
      redirectToLogin();
    }
  }

  function updateField(field: keyof ProfileFormState, value: string) {
    const nextValue = field === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((current) => ({ ...current, [field]: nextValue }));
  }

  function showError(message: string) {
    setAlert({
      open: true,
      title: "กรุณาตรวจสอบข้อมูล",
      message,
      variant: "error",
    });
  }

  function closeAlert() {
    setAlert((current) => ({ ...current, open: false }));
  }

  function handleCancel() {
    setForm(initialForm);
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSelectedImage(null);
      setImagePreview("");
      e.currentTarget.value = "";
      showError("รูปโปรไฟล์ต้องเป็นไฟล์ JPG, PNG หรือ WEBP");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSelectedImage(null);
      setImagePreview("");
      e.currentTarget.value = "";
      showError("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 2MB");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      showError("กรุณากรอกชื่อ-นามสกุล");
      return;
    }

    if (!form.email.trim()) {
      showError("กรุณากรอกอีเมล");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      showError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    if (!form.username.trim()) {
      showError("กรุณากรอกชื่อผู้ใช้");
      return;
    }

    if (form.password || form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        showError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
        return;
      }

      if (form.password.trim().length < 4) {
        showError("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร");
        return;
      }
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("email", form.email.trim());
    payload.append("phone", form.phone.trim());
    payload.append("username", form.username.trim());

    if (form.password.trim()) {
      payload.append("password", form.password.trim());
    }

    if (selectedImage) {
      payload.append("image", selectedImage);
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.message || "บันทึกข้อมูลไม่สำเร็จ");
        return;
      }

      setCurrentUser(data.user);
      setForm({
        name: `${data.user.firstName} ${data.user.lastName}`.trim() || data.user.email,
        email: data.user.email || "",
        role: data.user.role || "",
        phone: data.user.phone || "",
        username: data.user.username || data.user.email || "",
        password: "",
        confirmPassword: "",
      });
      setSelectedImage(null);
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setAlert({
        open: true,
        title: "บันทึกสำเร็จ",
        message: "ข้อมูลโปรไฟล์ถูกอัปเดตเรียบร้อยแล้ว",
        variant: "success",
      });
      router.refresh();
    } catch {
      showError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setSaving(false);
    }
  }

  if (!currentUser || redirectingToLogin) {
    if (redirectingToLogin) {
      return null;
    }

    return (
      <main className="profile-page">
        <div className="empty-state">
          <h1>ไม่พบข้อมูลผู้ใช้</h1>
          <p>ยังไม่มีข้อมูลโปรไฟล์สำหรับบัญชีนี้</p>
          <button className="blue-action" onClick={() => router.push("/login")}>กลับไปเข้าสู่ระบบ</button>
        </div>
      </main>
    );
  }

  const displayName = form.name.trim() || form.email;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="profile-page profile-page-full">
      <section className="profile-shell profile-shell-full">
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setSidebarOpen(false)}
          hidden={!sidebarOpen}
        />

        <ProfileSidebar
          open={sidebarOpen}
          displayName={displayName}
          initials={initials}
          image={imagePreview || currentUser.image}
          loggingOut={loggingOut}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <section className="profile-content">
          <button
            className="mobile-sidebar-toggle"
            type="button"
            aria-expanded={sidebarOpen}
            aria-label="เปิดเมนู"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu aria-hidden="true" />
            <span>เมนู</span>
          </button>

          <ProfileHero
            displayName={displayName}
            initials={initials}
            image={imagePreview || currentUser.image}
            role={form.role}
            fileInputRef={fileInputRef}
            onImageChange={handleImageChange}
          />

          <form className="profile-form profile-form-full" onSubmit={handleSubmit} autoComplete="off" noValidate>
            <h2>โปรไฟล์ผู้ใช้</h2>
            <ProfileField label="ชื่อ-นามสกุล" value={form.name} onChange={(value) => updateField("name", value)} autoComplete="off" required />
            <ProfileField label="อีเมล" value={form.email} onChange={(value) => updateField("email", value)} autoComplete="off" required />
            <ProfileField label="บทบาท" value={form.role} onChange={(value) => updateField("role", value)} autoComplete="off" />
            <ProfileField label="เบอร์โทรศัพท์" value={form.phone} onChange={(value) => updateField("phone", value)} autoComplete="off" maxLength={10} inputMode="numeric" />

            <h3>บัญชีผู้ใช้</h3>
            <ProfileField label="ชื่อผู้ใช้" value={form.username} onChange={(value) => updateField("username", value)} autoComplete="off" required />
            <PasswordField
              label="รหัสผ่าน"
              value={form.password}
              visible={showPassword}
              onChange={(value) => updateField("password", value)}
              onToggle={() => setShowPassword((value) => !value)}
              placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
              autoComplete="new-password"
            />
            <PasswordField
              label="ยืนยันรหัสผ่าน"
              value={form.confirmPassword}
              visible={showPassword}
              onChange={(value) => updateField("confirmPassword", value)}
              onToggle={() => setShowPassword((value) => !value)}
              placeholder="กรอกเมื่อเปลี่ยนรหัสผ่าน"
              autoComplete="new-password"
            />

            <div className="form-actions">
              <button type="button" className="ghost-action" onClick={handleCancel} disabled={saving}>ยกเลิก</button>
              <button type="submit" className="blue-action" disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}</button>
            </div>
          </form>
        </section>
      </section>
      <AlertModal
        open={alert.open}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
        onClose={closeAlert}
      />
    </main>
  );
}
