import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtext focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
        {...props}
      />
    );
  },
);

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtext focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
      {...props}
    />
  );
}
