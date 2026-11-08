import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export default function Alert({
  type = "info",
  title,
  message,
  onClose,
  className = "",
  children,
}) {
  const configs = {
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-800",
      icon: AlertCircle,
      iconColor: "text-rose-600",
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-800",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Info,
      iconColor: "text-blue-600",
    },
  };

  const current = configs[type] || configs.info;
  const IconComponent = current.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${current.bg} ${className}`}>
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        {message && <p className="leading-relaxed">{message}</p>}
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
