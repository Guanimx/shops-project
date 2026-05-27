import Link from "next/link";
import { LogOut, Settings, UserRound, X } from "lucide-react";
import Avatar from "./Avatar";

export default function ProfileSidebar({
  open,
  displayName,
  initials,
  image,
  loggingOut,
  onClose,
  onLogout,
}: {
  open: boolean;
  displayName: string;
  initials: string;
  image?: string;
  loggingOut: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <aside className={open ? "sidebar sidebar-open" : "sidebar"} aria-label="Profile menu">
      <div className="side-header">
        <Link href="/" className="side-logo" onClick={onClose}>Shops</Link>
        <button className="sidebar-close" type="button" aria-label="ปิดเมนู" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </div>
      <nav className="side-nav" aria-label="Profile navigation">
        <button className="side-link active" type="button" onClick={onClose}>
          <UserRound aria-hidden="true" />
          โปรไฟล์ผู้ใช้
        </button>
        <button className="side-link" type="button" onClick={onClose}>
          <Settings aria-hidden="true" />
          ตั้งค่า
        </button>
      </nav>

      <div className="side-account">
        <Avatar initials={initials} image={image} />
        <div>
          <strong>{displayName}</strong>
        </div>
      </div>

      <button className="logout-link" type="button" onClick={onLogout} disabled={loggingOut}>
        <LogOut aria-hidden="true" />
        {loggingOut ? "กำลังออก..." : "ออกจากระบบ"}
      </button>
    </aside>
  );
}
