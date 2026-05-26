"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px", display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: "420px", width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", textAlign: "center" }}>
        <h1 style={{ fontSize: "22px", marginBottom: "8px" }}>โหลดข้อมูลไม่สำเร็จ</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>ไม่สามารถดึงข้อมูลโปรไฟล์ได้ในตอนนี้</p>
        <button className="btn-primary" onClick={reset}>ลองใหม่</button>
      </div>
    </div>
  );
}
