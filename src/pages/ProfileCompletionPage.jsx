import { useState, useMemo } from "react";
import {
  User,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Alert from "../components/common/Alert";
import { saveStudentProfile } from "../services/studentService";

// Nilai tetap informasi akademik Fakultas Ilmu Komputer Universitas Klabat
const FIXED_FACULTY = "Fakultas Ilmu Komputer";
const FIXED_PROGRAM = "Informatika";
const FIXED_CURRICULUM = "2024";

const SEMESTER_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 1);

const STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "leave", label: "Cuti Akademik" },
  { value: "probation", label: "Percobaan" },
];

export default function ProfileCompletionPage({
  user,
  studentProfile = null,
  onProfileCompleted,
  onLogout,
  isEditMode = false,
  onCancel,
}) {
  // State formulir (tidak diisi dengan data dummy)
  const [fullName, setFullName] = useState(studentProfile?.fullName || "");
  const [studentNumber, setStudentNumber] = useState(studentProfile?.studentNumber || "");
  const [currentSemester, setCurrentSemester] = useState(
    studentProfile?.currentSemester ? String(studentProfile.currentSemester) : "1"
  );
  const [gpa, setGpa] = useState(
    typeof studentProfile?.gpa === "number" ? String(studentProfile.gpa) : ""
  );
  const [completedCredits, setCompletedCredits] = useState(
    typeof studentProfile?.completedCredits === "number"
      ? String(studentProfile.completedCredits)
      : ""
  );
  const [status, setStatus] = useState(studentProfile?.status || "active");

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Hitung progres kelengkapan profil (9 bidang utama)
  const progress = useMemo(() => {
    const checks = [
      Boolean(fullName.trim()),
      Boolean(studentNumber.trim()),
      Boolean(user?.email),
      Boolean(FIXED_FACULTY),
      Boolean(FIXED_PROGRAM),
      Boolean(FIXED_CURRICULUM),
      Boolean(currentSemester && Number(currentSemester) >= 1),
      Boolean(gpa !== "" && !isNaN(Number(gpa)) && Number(gpa) >= 0 && Number(gpa) <= 4.0),
      Boolean(completedCredits !== "" && !isNaN(Number(completedCredits)) && Number(completedCredits) >= 0),
    ];
    const filled = checks.filter(Boolean).length;
    const percent = Math.round((filled / checks.length) * 100);
    return { filled, total: checks.length, percent };
  }, [fullName, studentNumber, user?.email, currentSemester, gpa, completedCredits]);

  // Handler pengiriman form
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validasi lokal sebelum kirim
    if (!fullName.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }
    if (!studentNumber.trim()) {
      setErrorMessage("NIM wajib diisi.");
      return;
    }

    const numGpa = parseFloat(gpa);
    if (gpa === "" || isNaN(numGpa) || numGpa < 0 || numGpa > 4.0) {
      setErrorMessage("IPK harus berupa angka dalam rentang 0.00 sampai 4.00.");
      return;
    }

    const numCredits = parseInt(completedCredits, 10);
    if (completedCredits === "" || isNaN(numCredits) || numCredits < 0) {
      setErrorMessage("Total SKS harus berupa angka 0 atau lebih.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        studentNumber: studentNumber.trim().toUpperCase(),
        email: user?.email || "",
        faculty: FIXED_FACULTY,
        studyProgram: FIXED_PROGRAM,
        curriculum: FIXED_CURRICULUM,
        currentSemester: Number(currentSemester),
        gpa: numGpa,
        completedCredits: numCredits,
        status,
        institution: "Universitas Klabat",
      };

      const result = await saveStudentProfile(user.uid, payload);
      if (result.success) {
        setSuccessMessage(
          isEditMode
            ? "Profil mahasiswa berhasil diperbarui!"
            : "Profil mahasiswa berhasil dilengkapi! Mengalihkan ke dashboard..."
        );
        setTimeout(() => {
          if (onProfileCompleted) {
            onProfileCompleted(result.profile);
          }
        }, 800);
      } else {
        setErrorMessage(result.error || "Gagal menyimpan data profil.");
      }
    } catch (err) {
      console.error("[ProfileCompletionPage] Submit error:", err);
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header & Navigasi */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                Academic Planning System
              </h1>
              <p className="text-[11px] font-semibold text-blue-600">
                Fakultas Ilmu Komputer · Universitas Klabat
              </p>
            </div>
          </div>

          <div>
            {isEditMode ? (
              onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali ke Dashboard
                </button>
              )
            ) : (
              onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-white border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </button>
              )
            )}
          </div>
        </div>

        {/* Banner Selamat Datang & Deskripsi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900">
                {isEditMode ? "Perbarui Profil Mahasiswa" : "Melengkapi Profil Mahasiswa"}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isEditMode
                  ? "Perbarui informasi akademik Anda. Data ini digunakan untuk kalkulasi SKS maksimal, rekomendasi mata kuliah, dan asisten akademik."
                  : "Selamat datang! Mohon lengkapi profil akademik Anda dengan data yang sebenarnya sebagai dasar personalisasi dan simulasi rencana studi (KRS)."}
              </p>
            </div>
          </div>

          {/* Indikator Progres Kelengkapan Profil */}
          <div className="mt-5 pt-5 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Status Kelengkapan Formulir
              </span>
              <span
                className={`font-bold ${
                  progress.percent === 100 ? "text-emerald-600" : "text-blue-700"
                }`}
              >
                {progress.percent}% ({progress.filled} dari {progress.total} bidang)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress.percent === 100 ? "bg-emerald-500" : "bg-blue-600"
                }`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Notifikasi Error & Success */}
        {errorMessage && (
          <Alert
            type="error"
            title="Validasi Gagal"
            message={errorMessage}
            onClose={() => setErrorMessage("")}
          />
        )}
        {successMessage && (
          <Alert
            type="success"
            title="Berhasil"
            message={successMessage}
          />
        )}

        {/* Form Formulir Profil */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bagian A: Identitas Mahasiswa */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-800">
                A. Identitas Mahasiswa
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  required
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nama lengkap resmi sesuai data administrasi Unklab.
                </p>
              </div>

              {/* NIM */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  NIM (Nomor Induk Mahasiswa) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="Contoh: 105021910001"
                  required
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  NIM harus unik dan belum digunakan mahasiswa lain.
                </p>
              </div>

              {/* Email Akun (Read-only) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Akun Terdaftar
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-500 font-mono cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Terhubung langsung dengan sesi otentikasi Firebase Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Bagian B: Informasi Akademik */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-800">
                B. Informasi Akademik
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fakultas (Terisi Otomatis & Tidak Dapat Diedit) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fakultas
                </label>
                <input
                  type="text"
                  value={FIXED_FACULTY}
                  readOnly
                  disabled
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-600 font-medium cursor-not-allowed select-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Fakultas terdaftar resmi (terisi otomatis).
                </p>
              </div>

              {/* Program Studi (Terisi Otomatis & Tidak Dapat Diedit) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Program Studi
                </label>
                <input
                  type="text"
                  value={FIXED_PROGRAM}
                  readOnly
                  disabled
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-600 font-medium cursor-not-allowed select-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Program studi terdaftar resmi (terisi otomatis).
                </p>
              </div>

              {/* Tahun Kurikulum (Terisi Otomatis & Tidak Dapat Diedit) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tahun Kurikulum
                </label>
                <input
                  type="text"
                  value={FIXED_CURRICULUM}
                  readOnly
                  disabled
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-600 font-medium cursor-not-allowed select-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Kurikulum resmi Informatika Unklab (terisi otomatis).
                </p>
              </div>

              {/* Semester Saat Ini (Tetap Dapat Dipilih Mahasiswa) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Semester Saat Ini <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentSemester}
                  onChange={(e) => setCurrentSemester(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium cursor-pointer"
                >
                  {SEMESTER_OPTIONS.map((s) => (
                    <option key={s} value={String(s)}>
                      Semester {s}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pilih semester akademik yang sedang Anda tempuh saat ini.
                </p>
              </div>
            </div>
          </div>

          {/* Bagian C: Informasi Perkuliahan */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-800">
                C. Informasi Perkuliahan
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* IPK Saat Ini */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  IPK Saat Ini <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="4.00"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="Contoh: 3.50"
                  required
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Skala 0.00–4.00. IPK &ge; 3.35 berhak 23 SKS.
                </p>
              </div>

              {/* Total SKS yang Telah Diselesaikan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total SKS Selesai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="160"
                  value={completedCredits}
                  onChange={(e) => setCompletedCredits(e.target.value)}
                  placeholder="Contoh: 0"
                  required
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Jumlah SKS lulus. Mahasiswa baru dapat mengisi 0.
                </p>
              </div>

              {/* Status Akademik */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status Akademik <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Status keaktifan mahasiswa di semester berjalan.
                </p>
              </div>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {isEditMode && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Firestore...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditMode ? "Simpan Perubahan Profil" : "Simpan Profil & Lanjutkan"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
