"use client";

interface AlertModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
}

export default function AlertModal({ open, title, message, confirmLabel = "ตกลง", onClose }: AlertModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="alert-modal" role="dialog" aria-modal="true" aria-labelledby="alert-modal-title">
        <div className="alert-modal-icon" aria-hidden="true">
          <CheckIcon />
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
