"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const INVALID_LOGIN_MESSAGE = "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError(INVALID_LOGIN_MESSAGE);
      return;
    }

    if (!password.trim()) {
      setError(INVALID_LOGIN_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || INVALID_LOGIN_MESSAGE);
      } else {
        router.push("/profile");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Login">
        <aside className="auth-brand">
          <div className="brand-copy">
            <div className="brand-ring" />
            <h1>Shops</h1>
            <p>สัมผัสความสดใหม่ของสินค้าออร์แกนิก ส่งตรงถึงหน้าบ้านคุณ</p>
          </div>

          <Image className="basket-image" src="/vegetable-basket.png" alt="ตะกร้าผักสด" width={430} height={260} priority />

          <div className="brand-footer">
            <div className="avatar-stack" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>เข้าร่วมกับครอบครัวผู้ใช้งานมากกว่า 10,000 คน</p>
          </div>
        </aside>

        <section className="login-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <div>
              <h2>เข้าสู่ระบบ</h2>
              <p>กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบ</p>
            </div>

            {error && (
              <div className="form-alert" role="alert">
                <span>!</span>
                {error}
              </div>
            )}

            <label>
              <span>ชื่อผู้ใช้</span>
              <div className="field-wrap">
                <UserRound aria-hidden="true" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="กรุณากรอกชื่อผู้ใช้"
                  autoComplete="off"
                />
              </div>
            </label>

            <label>
              <span>รหัสผ่าน</span>
              <div className="field-wrap">
                <LockKeyhole aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  autoComplete="off"
                />
                <button type="button" className="field-icon-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                  {showPassword ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                </button>
              </div>
            </label>

            <button type="submit" className="primary-action" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
