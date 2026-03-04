const ALLOWED_GRADIENTS = new Set([
  "from-blue-600 to-indigo-900",
  "from-orange-400 to-red-600",
  "from-emerald-400 to-teal-700",
  "from-purple-500 to-indigo-800",
  "from-rose-400 to-pink-600",
  "from-yellow-400 to-orange-500",
  "from-blue-300 to-blue-600",
  "from-indigo-600 to-purple-900",
  "from-sky-300 to-blue-500",
  "from-slate-800 to-black",
  "from-pink-400 to-rose-600",
  "from-teal-500 to-emerald-800",
  "from-orange-300 to-orange-600",
  "from-blue-800 to-slate-900",
  "from-emerald-500 to-green-800",
]);

const ALLOWED_COLORS = new Set([
  "bg-[#002B99]",
  "bg-orange-500",
  "bg-emerald-500",
  "bg-purple-600",
  "bg-rose-500",
  "bg-yellow-500",
  "bg-blue-400",
  "bg-indigo-700",
  "bg-sky-500",
  "bg-slate-900",
  "bg-pink-500",
  "bg-teal-600",
  "bg-orange-400",
  "bg-blue-900",
  "bg-emerald-600",
]);

const DEFAULT_GRADIENT = "from-slate-800 to-black";
const DEFAULT_COLOR = "bg-slate-800";

function normalizeToken(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

export function resolveNftGradient(gradient: string | null | undefined) {
  const normalized = normalizeToken(gradient);
  return ALLOWED_GRADIENTS.has(normalized) ? normalized : DEFAULT_GRADIENT;
}

export function resolveNftColor(color: string | null | undefined) {
  const normalized = normalizeToken(color);
  return ALLOWED_COLORS.has(normalized) ? normalized : DEFAULT_COLOR;
}
