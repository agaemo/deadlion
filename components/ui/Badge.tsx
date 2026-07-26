import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-neutral-100 text-subtext",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/15 text-error",
  info: "bg-info/15 text-info",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
