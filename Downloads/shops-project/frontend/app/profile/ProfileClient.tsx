"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import AlertModal from "../components/AlertModal";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  image: string;
  role: string;
}

interface ProfileFormState {
  name: string;
  email: string;
  role: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function ProfileClient({ user }: { user: User | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

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
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  }

  function updateField(field: keyof ProfileFormState, value: string) {
    setSavedMessage("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleCancel() {
    setForm(initialForm);
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSavedMessage("");
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setSavedMessage("");

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSelectedImage(null);
      setImagePreview("");
      e.currentTarget.value = "";
      setSavedMessage("รูปโปรไฟล์ต้องเป็นไฟล์ JPG, PNG หรือ WEBP");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSelectedImage(null);
      setImagePreview("");
      e.currentTarget.value = "";
      setSavedMessage("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 2MB");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavedMessage("");

    if (form.password || form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        setSavedMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
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
        setSavedMessage(data.message || "บันทึกข้อมูลไม่สำเร็จ");
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
      setSuccessOpen(true);
      router.refresh();
    } catch {
      setSavedMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setSaving(false);
    }
  }

  if (!currentUser) {
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
        <aside className="sidebar">
          <Link href="/" className="side-logo">Shops</Link>
          <nav className="side-nav" aria-label="Profile navigation">
            <button className="side-link active" type="button">
              <UserIcon />
              โปรไฟล์ผู้ใช้
            </button>
            <button className="side-link" type="button">
              <GearIcon />
              ตั้งค่า
            </button>
          </nav>

          <div className="side-account">
            <Avatar initials={initials} image={imagePreview || currentUser.image} />
            <div>
              <strong>{displayName}</strong>
            </div>
          </div>

          <button className="logout-link" type="button" onClick={handleLogout} disabled={loggingOut}>
            <LogoutIcon />
            {loggingOut ? "กำลังออก..." : "ออกจากระบบ"}
          </button>
        </aside>

        <section className="profile-content">
          <header className="profile-hero">
            <div className="profile-avatar-wrap">
              <Avatar initials={initials} image={imagePreview || currentUser.image} large />
              <button className="edit-avatar" type="button" aria-label="แก้ไขรูปโปรไฟล์" onClick={() => fileInputRef.current?.click()}>
                <PencilIcon />
              </button>
              <input
                ref={fileInputRef}
                className="avatar-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />
            </div>
            <h1>{displayName}</h1>
            <span className="role-pill">{form.role || "User"}</span>
          </header>

          <form className="profile-form profile-form-full" onSubmit={handleSubmit}>
            <h2>โปรไฟล์ผู้ใช้</h2>
            <ProfileField label="ชื่อ-นามสกุล" value={form.name} onChange={(value) => updateField("name", value)} />
            <ProfileField label="อีเมล" value={form.email} onChange={(value) => updateField("email", value)} />
            <ProfileField label="บทบาท" value={form.role} onChange={(value) => updateField("role", value)} disabled />
            <ProfileField label="เบอร์โทร" value={form.phone} onChange={(value) => updateField("phone", value)} />

            <h3>บัญชีผู้ใช้</h3>
            <ProfileField label="ชื่อผู้ใช้" value={form.username} onChange={(value) => updateField("username", value)} />
            <PasswordField
              label="รหัสผ่าน"
              value={form.password}
              visible={showPassword}
              onChange={(value) => updateField("password", value)}
              onToggle={() => setShowPassword((value) => !value)}
              placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
            />
            <PasswordField
              label="ยืนยันรหัสผ่าน"
              value={form.confirmPassword}
              visible={showPassword}
              onChange={(value) => updateField("confirmPassword", value)}
              onToggle={() => setShowPassword((value) => !value)}
              placeholder="กรอกเมื่อเปลี่ยนรหัสผ่าน"
            />

            {savedMessage && <p className="profile-message">{savedMessage}</p>}

            <div className="form-actions">
              <button type="button" className="ghost-action" onClick={handleCancel} disabled={saving}>ยกเลิก</button>
              <button type="submit" className="blue-action" disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}</button>
            </div>
          </form>
        </section>
      </section>
      <AlertModal
        open={successOpen}
        title="บันทึกสำเร็จ"
        message="ข้อมูลโปรไฟล์ถูกอัปเดตเรียบร้อยแล้ว"
        onClose={() => setSuccessOpen(false)}
      />
    </main>
  );
}

function Avatar({ initials, image, large = false }: { initials: string; image?: string; large?: boolean }) {
  return (
    <div className={large ? "avatar avatar-large" : "avatar"}>
      {image ? <img src={image} alt="" /> : <span>{initials || "U"}</span>}
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
    </label>
  );
}

function PasswordField({
  label,
  value,
  visible,
  onChange,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      <div className="password-field">
        <LockIcon />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button type="button" onClick={onToggle} aria-label="แสดงหรือซ่อนรหัสผ่าน">
          <EyeIcon />
        </button>
      </div>
    </label>
  );
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></svg>;
}

function LockIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}

function GearIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .6V20a2 2 0 0 1-4 0v-.08a1.8 1.8 0 0 0-1-.6 1.8 1.8 0 0 0-1.98.36l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-.6-1H4a2 2 0 0 1 0-4h.08a1.8 1.8 0 0 0 .6-1 1.8 1.8 0 0 0-.36-1.98l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1-.6V4a2 2 0 0 1 4 0v.08a1.8 1.8 0 0 0 1 .6 1.8 1.8 0 0 0 1.98-.36l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.8 1.8 0 0 0 19.4 9c.22.33.42.66.6 1H20a2 2 0 0 1 0 4h-.08c-.18.34-.38.68-.52 1Z" /></svg>;
}

function LogoutIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 3v18" /></svg>;
}

function PencilIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4" /><path d="M4 20l4.5-1 10-10a2.8 2.8 0 0 0-4-4l-10 10L4 20Z" /></svg>;
}

function EyeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
}
