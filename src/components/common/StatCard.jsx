export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  accent = "blue",
}) {
  const accentStyles = {
    blue: {
      iconBg: "bg-blue-100 text-blue-700",
      border: "hover:border-blue-300",
    },
    emerald: {
      iconBg: "bg-emerald-100 text-emerald-700",
      border: "hover:border-emerald-300",
    },
    purple: {
      iconBg: "bg-purple-100 text-purple-700",
      border: "hover:border-purple-300",
    },
    amber: {
      iconBg: "bg-amber-100 text-amber-700",
      border: "hover:border-amber-300",
    },
  };

  const style = accentStyles[accent] || accentStyles.blue;

  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs transition-all ${style.border}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
        {badgeText && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-1">
          {subtext}
        </p>
      )}
    </div>
  );
}
