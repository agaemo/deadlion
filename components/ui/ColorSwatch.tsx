const PRESET_COLORS = [
  "#C0392B",
  "#E5484D",
  "#B8860B",
  "#2E7D5B",
  "#3B6EA5",
  "#7A1D17",
  "#5B6570",
];

export function ColorSwatch({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (color: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-label="色を未設定にする"
        aria-pressed={!value}
        className={`h-6 w-6 rounded-full border-2 border-dashed border-border ${!value ? "ring-2 ring-accent" : ""}`}
      />
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={`色を${color}にする`}
          aria-pressed={value === color}
          style={{ backgroundColor: color }}
          className={`h-6 w-6 rounded-full border border-border ${value === color ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}
        />
      ))}
    </div>
  );
}
