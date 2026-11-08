import { GraduationCap, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">
                  Academic Planning System
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  FIK UNKLAB
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Program Studi Informatika · Kurikulum 151 SKS
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-none">
                    Mahasiswa
                  </p>
                  <p className="text-[11px] text-slate-500 leading-none mt-1 max-w-[160px] truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors cursor-pointer"
                title="Keluar dari akun"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
