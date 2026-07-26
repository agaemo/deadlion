"use client";

import { useEffect, type MouseEvent, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  size?: "md" | "lg";
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-surface p-6 shadow-lg ${size === "lg" ? "max-w-2xl" : "max-w-lg"}`}>
        {children}
      </div>
    </div>
  );
}
