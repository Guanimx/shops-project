import { Pencil } from "lucide-react";
import type { ChangeEvent, RefObject } from "react";
import Avatar from "./Avatar";

export default function ProfileHero({
  displayName,
  initials,
  image,
  role,
  fileInputRef,
  onImageChange,
}: {
  displayName: string;
  initials: string;
  image?: string;
  role: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <header className="profile-hero">
      <div className="profile-avatar-wrap">
        <Avatar initials={initials} image={image} large />
        <button className="edit-avatar" type="button" aria-label="แก้ไขรูปโปรไฟล์" onClick={() => fileInputRef.current?.click()}>
          <Pencil aria-hidden="true" />
        </button>
        <input
          ref={fileInputRef}
          className="avatar-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onImageChange}
        />
      </div>
      <h1>{displayName}</h1>
      <span className="role-pill">{role || "User"}</span>
    </header>
  );
}
