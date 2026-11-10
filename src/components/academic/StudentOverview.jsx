import {
  User,
  GraduationCap,
  Calendar,
  BookOpen,
  Clock,
  Info,
  Pencil,
} from "lucide-react";

export default function StudentOverview({
  studentProfile = null,
  userEmail = null,
  onEditProfile,
}) {
  const hasProfile = studentProfile !== null;

  if (!hasProfile) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Placeholder */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <User className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-base font-bold text-slate-900">
                  {userEmail || "Mahasiswa"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Profil akademik belum dilengkapi
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Info className="w-3.5 h-3.5" />
                  Profil Belum Tersedia
                </span>
                {onEditProfile && (
                  <button
                    type="button"
                    onClick={onEditProfile}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                  >
                    Lengkapi Profil
                  </button>
                )}
              </div>
            </div>

            {/* Informasi yang tidak tersedia */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "NIM", value: null, icon: BookOpen },
                { label: "Program Studi", value: "Informatika", icon: GraduationCap },
                { label: "Semester Aktif", value: null, icon: Calendar },
                { label: "Kurikulum", value: "2024", icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    {value !== null ? value : (
                      <span className="text-slate-400 italic font-normal">Belum tersedia</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar Mahasiswa */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs text-2xl font-bold">
          {studentProfile.fullName
            ? studentProfile.fullName.charAt(0).toUpperCase()
            : <User className="w-8 h-8" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-base font-bold text-slate-900">
                {studentProfile.fullName || "Data Belum Tersedia"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                NIM: {studentProfile.studentNumber || "Belum tersedia"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                studentProfile.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                {studentProfile.status === "active" ? "Aktif" : studentProfile.status || "Tidak Diketahui"}
              </span>
              {onEditProfile && (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  Ubah Profil
                </button>
              )}
            </div>
          </div>

          {/* Detail Profil Mahasiswa */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Program Studi",
                value: studentProfile.studyProgram || "Informatika",
                icon: GraduationCap,
              },
              {
                label: "Fakultas",
                value: studentProfile.faculty || "FIK",
                icon: BookOpen,
              },
              {
                label: "Semester Aktif",
                value: studentProfile.currentSemester
                  ? `Semester ${studentProfile.currentSemester}`
                  : null,
                icon: Calendar,
              },
              {
                label: "Kurikulum",
                value: studentProfile.curriculum || "2024",
                icon: Clock,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {value !== null && value !== undefined ? value : (
                    <span className="text-slate-400 italic font-normal">Belum tersedia</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
