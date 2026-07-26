export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="読み込み中"
      className={`h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent motion-reduce:animate-none ${className}`}
    />
  );
}
