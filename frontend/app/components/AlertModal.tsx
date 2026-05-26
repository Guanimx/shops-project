"use client";

interface AlertModalProps {
  open: boolean;
  title: string;
  message: string;
  variant?: "success" | "error";
  confirmLabel?: string;
  onClose: () => void;
}

export default function AlertModal({ open, title, message, variant = "success", confirmLabel = "ตกลง", onClose }: AlertModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className={`alert-modal alert-modal-${variant}`} role="dialog" aria-modal="true" aria-labelledby="alert-modal-title">
        <div className="alert-modal-icon" aria-hidden="true">
          {variant === "error" ? <ErrorIcon /> : <CheckIcon />}
        </div>
        <h2 id="alert-modal-title">{title}</h2>
        <p>{message}</p>
        <button type="button" className="blue-action" onClick={onClose}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
}

function ErrorIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="10" /></svg>;
}
