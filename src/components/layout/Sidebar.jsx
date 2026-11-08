import {
  LayoutDashboard,
  User,
  BookCheck,
  CalendarCheck,
  LogOut,
  X,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function Sidebar({
  activeNav = "dashboard",
  onSelectNav,
  onLogout,
  isOpen = false,
  onClose,
}) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Ringkasan akademik & progres",
    },
    {
      id: "profile",
      label: "Profil Mahasiswa",
      icon: User,
      description: "Data diri & status studi",
    },
    {
      id: "history",
      label: "Riwayat Akademik",
      icon: BookCheck,
      description: "Mata kuliah yang diselesaikan",
    },
    {
      id: "planner",
      label: "Rencana Studi (KRS)",
      icon: CalendarCheck,
      description: "Simulasi & perencanaan KRS",
    },
  ];

  function handleNavClick(navId) {
    if (onSelectNav) {
      onSelectNav(navId);
    }
    if (onClose) {
      onClose();
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand & Institusi */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Academic Planning
            </h1>
            <p className="text-[11px] font-semibold text-blue-600">
              FIK Universitas Klabat
            </p>
          </div>
        </div>

        {/* Tombol Tutup Mobile */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Program Studi Badge Info */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Program Studi</span>
          <span className="font-bold text-slate-800">Informatika</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[11px]">
          <span className="text-slate-400">Kurikulum</span>
          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            2024 (151 SKS)
          </span>
        </div>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="truncate leading-none">{item.label}</div>
                <div
                  className={`text-[10px] mt-1 truncate leading-none ${
                    isActive ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Keluar (Logout)</span>
        </button>

        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-400 text-center">
          Universitas Klabat · 2024
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block w-64 h-screen fixed left-0 top-0 border-r border-slate-200/80 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Body */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
