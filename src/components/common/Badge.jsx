export default function Badge({
  children,
  variant = "blue",
  size = "md",
  className = "",
}) {
  const variantStyles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-medium",
    lg: "px-3 py-1.5 text-sm font-medium",
  };

  const baseStyle = "inline-flex items-center gap-1 rounded-full border transition-colors";
  const selectedVariant = variantStyles[variant] || variantStyles.blue;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span className={`${baseStyle} ${selectedVariant} ${selectedSize} ${className}`}>
      {children}
    </span>
  );
}
