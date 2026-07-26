export function LabelChip({
  name,
  onRemove,
}: {
  name: string;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-accent-strong">
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${name}ラベルを削除`}
          className="ml-0.5 leading-none text-accent-strong/70 hover:text-accent-strong"
        >
          ×
        </button>
      )}
    </span>
  );
}
