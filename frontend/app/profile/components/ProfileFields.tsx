import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import type { HTMLAttributes } from "react";

export function ProfileField({
  label,
  value,
  onChange,
  autoComplete,
  inputMode,
  maxLength,
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="profile-field">
      <span>{label}{required && <b className="required-mark">*</b>}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        disabled={disabled}
      />
    </label>
  );
}

export function PasswordField({
  label,
  value,
  visible,
  onChange,
  onToggle,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      <div className="password-field">
        <LockKeyhole aria-hidden="true" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button type="button" onClick={onToggle} aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
          {visible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
        </button>
      </div>
    </label>
  );
}
