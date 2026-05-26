"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsername("emilys");
    setPassword("emilyspass");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("อีเมลผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    if (!password.trim()) {
      setError("อีเมลผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
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
        setError(data.message || "อีเมลผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
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
      <div className="screen-label">Login{error ? "/fail" : ""}</div>
      <section className="auth-shell" aria-label="Login">
        <aside className="auth-brand">
          <div className="brand-copy">
            <div className="brand-ring" />
            <h1>Shops</h1>
            <p>สัมผัสความสดใหม่ของสินค้าออร์แกนิก ส่งตรงถึงหน้าบ้านคุณ</p>
          </div>

          <img className="basket-image" src="/vegetable-basket.png" alt="ตะกร้าผักสด" />

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
                <UserIcon />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="กรุณากรอกชื่อผู้ใช้"
                  autoComplete="username"
                />
              </div>
            </label>

            <label>
              <span>รหัสผ่าน</span>
              <div className="field-wrap">
                <LockIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  autoComplete="current-password"
                />
                <button type="button" className="field-icon-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m2 2 20 20" />
      <path d="M6.7 6.7C3.8 8.4 2 12 2 12s3.5 6 10 6c1.6 0 3-.3 4.2-.8" />
      <path d="M10.7 5.1C11.1 5 11.5 5 12 5c6.5 0 10 7 10 7a13.4 13.4 0 0 1-3 3.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
