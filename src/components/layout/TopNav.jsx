import { Menu, LogOut, User, Bell } from "lucide-react";

export default function TopNav({
  user,
  onOpenMobileSidebar,
  onLogout,
  title = "AI-Based Academic Planning System",
}) {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Button & App Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Fakultas Ilmu Komputer · Universitas Klabat
            </p>
          </div>
        </div>

        {/* Right: User Identity & Actions */}
        <div className="flex items-center gap-3">
          {/* User Info Pill */}
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-none">
                  Mahasiswa
                </p>
                <p className="text-[11px] text-slate-500 leading-none mt-1 max-w-[180px] truncate font-mono">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors cursor-pointer"
              title="Keluar dari akun"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
