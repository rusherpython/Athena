export default function ProgressBar({ value, max = 100, showLabel = true, height = 6, color = 'red' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    red: 'linear-gradient(90deg, var(--athena-accent, #dc2626), var(--athena-accent-light, #f87171))',
    green: 'linear-gradient(90deg, #16a34a, #22c55e)',
    blue: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
    amber: 'linear-gradient(90deg, #d97706, #f59e0b)',
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-full bg-white/10" style={{ height }}>
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ background: colors[color] || colors.red, width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-right text-xs text-slate-400">{Math.round(pct)}%</p>
      )}
    </div>
  );
}
