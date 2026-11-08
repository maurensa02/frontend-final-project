import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const { user, loading: authLoading, login, register, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Handler Form Auth ──────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading Sesi Awal ──────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium text-sm">Memuat sesi mahasiswa...</p>
        </div>
      </div>
    );
  }

  // ── Dashboard (Mahasiswa Sudah Login) ─────────────────────────────────────

  if (user) {
    return <DashboardPage user={user} onLogout={logout} />;
  }

  // ── Halaman Auth (Login / Register) ───────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">

        {/* Logo & Judul */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            AI-Based Academic Planning
          </h1>
          <p className="text-xs text-blue-600 font-semibold mt-1">
            FIK · Universitas Klabat
          </p>
          <p className="text-slate-500 text-sm mt-3">
            {isRegister
              ? "Buat akun mahasiswa baru"
              : "Masuk ke akun Anda"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Mahasiswa
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@unklab.ac.id"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-xs leading-relaxed break-words">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
          >
            {submitting
              ? "Mohon tunggu..."
              : isRegister
                ? "Daftar Akun"
                : "Masuk"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {isRegister
            ? "Sudah punya akun?"
            : "Belum punya akun?"}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="ml-2 text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            {isRegister ? "Masuk" : "Daftar"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default App;
