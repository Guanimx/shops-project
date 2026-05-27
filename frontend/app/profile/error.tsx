"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="profile-page profile-page-full">
      <div className="empty-state">
        <h1>โหลดข้อมูลไม่สำเร็จ</h1>
        <p>ไม่สามารถดึงข้อมูลโปรไฟล์ได้ในตอนนี้</p>
        <button className="blue-action" type="button" onClick={reset}>
          ลองใหม่
        </button>
      </div>
    </main>
  );
}
