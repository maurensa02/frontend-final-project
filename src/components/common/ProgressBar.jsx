export default function ProgressBar({
  value = 0,
  max = 151,
  label = "Progres Kelulusan",
  unit = "SKS",
  showDetail = true,
}) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const formattedPercent = percentage.toFixed(1);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-800">{label}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            {formattedPercent}%
          </span>
        </div>
        {showDetail && (
          <span className="text-xs font-medium text-slate-500">
            <strong className="text-slate-800">{value}</strong> dari {max} {unit}
          </span>
        )}
      </div>

      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
        <span>0 {unit}</span>
        <span>Sisa: {Math.max(0, max - value)} {unit}</span>
        <span>{max} {unit} (Target Lulus)</span>
      </div>
    </div>
  );
}
