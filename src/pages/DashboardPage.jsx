/**
 * DashboardPage.jsx
 * Halaman utama dashboard mahasiswa.
 *
 * Bertanggung jawab untuk:
 * - Memuat profil mahasiswa dari Firestore saat mount
 * - Memuat riwayat mata kuliah dari Firestore
 * - Menghitung statistik akademik menggunakan creditCalculator
 * - Merender tata letak dengan Sidebar + TopNav + konten per tab
 *
 * Ketentuan:
 * - Tidak menyimpan data mahasiswa palsu
 * - Tidak menampilkan nilai pribadi dari kurikulum
 * - Tidak mengintegrasikan Gemini API (Tahap berikutnya)
 */

import { useState, useEffect, useCallback } from "react";
import {
  BookCheck,
  CalendarCheck,
  AlertTriangle,
  User,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Pencil,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import TopNav from "../components/layout/TopNav";
import StudentOverview from "../components/academic/StudentOverview";
import AcademicSummary from "../components/academic/AcademicSummary";
import CourseHistoryManager from "../components/academic/CourseHistoryManager";
import StudyPlanPlanner from "../components/academic/StudyPlanPlanner";
import AcademicIssuesHub from "../components/academic/AcademicIssuesHub";
import Alert from "../components/common/Alert";
import ProfileCompletionPage from "./ProfileCompletionPage";

import {
  getStudentProfile,
  createStudentProfile,
  getCourseHistory,
  addCourseHistoryRecord,
  deleteCourseHistoryRecord,
  getIssueReports,
  addIssueReport,
  isProfileComplete,
} from "../services/studentService";

import {
  calculateCompletedCredits,
  calculateRemainingCredits,
  getMaximumCredits,
  getStudentGPA,
} from "../utils/creditCalculator";

// ─── Kartu Aksi Cepat (Dashboard View) ───────────────────────────────────────

function QuickActionCard({ icon: Icon, title, description, onClick, color = "blue" }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors cursor-pointer ${colorMap[color]}`}
    >
      <div className="shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
    </button>
  );
}

// ─── Komponen Utama DashboardPage ─────────────────────────────────────────────

export default function DashboardPage({ user, onLogout }) {
  // Navigasi
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Data mahasiswa dari Firestore
  const [studentProfile, setStudentProfile] = useState(null);
  const [courseHistory, setCourseHistory] = useState([]);
  const [issueReports, setIssueReports] = useState([]);

  // Status loading & error
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  // State KRS (Study Planner)
  const [selectedCourses, setSelectedCourses] = useState([]);

  // ── Muat Data dari Firestore ─────────────────────────────────────────────

  const loadProfile = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingProfile(true);
    try {
      let profile = await getStudentProfile(user.uid);
      // Jika belum ada profil, buat dokumen kosong sehingga mahasiswa bisa melengkapinya
      if (!profile) {
        await createStudentProfile(user.uid, {});
        profile = await getStudentProfile(user.uid);
      }
      setStudentProfile(profile);
    } catch (err) {
      console.error("[DashboardPage] loadProfile error:", err);
      setGlobalError("Gagal memuat profil. Periksa koneksi internet Anda.");
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user?.uid]);

  const loadCourseHistory = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingHistory(true);
    try {
      const history = await getCourseHistory(user.uid);
      setCourseHistory(history);
    } catch (err) {
      console.error("[DashboardPage] loadCourseHistory error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user?.uid]);

  const loadIssueReports = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingIssues(true);
    try {
      const reports = await getIssueReports(user.uid);
      setIssueReports(reports);
    } catch (err) {
      console.error("[DashboardPage] loadIssueReports error:", err);
    } finally {
      setIsLoadingIssues(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadProfile();
      loadCourseHistory();
      loadIssueReports();
    }
  }, [user?.uid, loadProfile, loadCourseHistory, loadIssueReports]);

  // ── Kalkulasi Akademik ───────────────────────────────────────────────────

  const gpa = getStudentGPA(studentProfile);
  const maxAllowedCredits = getMaximumCredits(gpa);
  const { completedCredits, verifiedCourseCodes, hasUnverifiedRecords } =
    calculateCompletedCredits(courseHistory, studentProfile);
  const remainingCredits = calculateRemainingCredits(completedCredits);

  // ── Handler Riwayat Mata Kuliah ──────────────────────────────────────────

  async function handleAddCourse(record) {
    if (!user?.uid) return;
    const newId = await addCourseHistoryRecord(user.uid, record);
    if (newId) {
      // Tambahkan ke state lokal dengan ID dokumen Firestore
      setCourseHistory((prev) => [...prev, { ...record, id: newId }]);
    } else {
      setGlobalError("Gagal menyimpan riwayat mata kuliah. Coba lagi.");
    }
  }

  async function handleRemoveCourse(idOrCode) {
    if (!user?.uid) return;
    // Cari entri berdasarkan id dokumen Firestore
    const entry = courseHistory.find(
      (c) => c.id === idOrCode || c.courseCode === idOrCode
    );
    if (!entry?.id) return;

    const success = await deleteCourseHistoryRecord(user.uid, entry.id);
    if (success) {
      setCourseHistory((prev) => prev.filter((c) => c.id !== entry.id));
    } else {
      setGlobalError("Gagal menghapus riwayat mata kuliah. Coba lagi.");
    }
  }

  // ── Handler KRS / Study Planner ──────────────────────────────────────────

  function handleSelectCourse(course) {
    setSelectedCourses((prev) =>
      prev.some((c) => c.code === course.code) ? prev : [...prev, course]
    );
  }

  function handleDeselectCourse(courseCode) {
    setSelectedCourses((prev) => prev.filter((c) => c.code !== courseCode));
  }

  // ── Handler Laporan Masalah Akademik ─────────────────────────────────────

  async function handleSubmitIssue(reportData) {
    if (!user?.uid) return;
    setIsSubmittingIssue(true);
    try {
      const newId = await addIssueReport(user.uid, reportData);
      if (newId) {
        setIssueReports((prev) => [{ ...reportData, id: newId, status: "submitted" }, ...prev]);
      } else {
        throw new Error("Gagal menyimpan laporan.");
      }
    } finally {
      setIsSubmittingIssue(false);
    }
  }

  // ── Render Konten Berdasarkan Tab Aktif ──────────────────────────────────

  function renderContent() {
    switch (activeNav) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Profil Ringkas */}
            <StudentOverview
              studentProfile={studentProfile}
              userEmail={user?.email}
              onEditProfile={() => setIsEditingProfile(true)}
            />

            {/* Statistik Akademik */}
            <AcademicSummary
              studentData={studentProfile || {}}
              completedCredits={completedCredits}
              maxAllowedCredits={maxAllowedCredits}
              remainingCredits={remainingCredits}
            />

            {/* Peringatan Data Belum Terverifikasi */}
            {hasUnverifiedRecords && (
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  Terdapat riwayat mata kuliah dengan informasi kelulusan yang belum terverifikasi.
                  SKS dari entri tersebut tidak dihitung hingga data dikonfirmasi.
                </p>
              </div>
            )}

            {/* Aksi Cepat */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">Aksi Cepat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <QuickActionCard
                  icon={BookCheck}
                  title="Riwayat Akademik"
                  description="Catat mata kuliah yang telah diselesaikan."
                  color="blue"
                  onClick={() => setActiveNav("history")}
                />
                <QuickActionCard
                  icon={CalendarCheck}
                  title="Rencana Studi (KRS)"
                  description="Simulasikan pengisian KRS semester ini."
                  color="purple"
                  onClick={() => setActiveNav("planner")}
                />
                <QuickActionCard
                  icon={AlertTriangle}
                  title="Laporkan Masalah"
                  description="Presensi, KRS, atau nilai belum muncul."
                  color="emerald"
                  onClick={() => setActiveNav("issues")}
                />
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Profil Mahasiswa
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Ubah Data Profil
                </button>
              </div>
              <StudentOverview
                studentProfile={studentProfile}
                userEmail={user?.email}
                onEditProfile={() => setIsEditingProfile(true)}
              />
              <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-semibold">Personalisasi Layanan Akademik:</p>
                  <p className="mt-1 text-blue-700 leading-relaxed">
                    Data profil digunakan sebagai dasar personalisasi batas SKS (IPK &ge; 3.35 berhak 23 SKS),
                    simulasi KRS semester, dan rekomendasi studi akademik. Klik tombol &quot;Ubah Data Profil&quot; untuk memperbarui informasi Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Detail akun login */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Informasi Akun</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Email</span>
                  <span className="text-xs font-semibold text-slate-800 font-mono">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Program Studi</span>
                  <span className="text-xs font-semibold text-slate-800">{studentProfile?.studyProgram || "Informatika"}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Kurikulum</span>
                  <span className="text-xs font-semibold text-slate-800">{studentProfile?.curriculum || "2024"} (151 SKS)</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-xs text-slate-500">Institusi</span>
                  <span className="text-xs font-semibold text-slate-800">Universitas Klabat</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "history":
        return (
          <CourseHistoryManager
            courseHistory={courseHistory}
            onAddCourse={handleAddCourse}
            onRemoveCourse={handleRemoveCourse}
          />
        );

      case "planner":
        return (
          <StudyPlanPlanner
            selectedCourses={selectedCourses}
            onSelectCourse={handleSelectCourse}
            onDeselectCourse={handleDeselectCourse}
            studentData={studentProfile || {}}
            courseHistory={courseHistory}
            verifiedPassedCodes={verifiedCourseCodes}
          />
        );

      case "issues":
        return (
          <AcademicIssuesHub
            issueReports={issueReports}
            onSubmitIssue={handleSubmitIssue}
            isSubmitting={isSubmittingIssue}
          />
        );

      default:
        return null;
    }
  }

  // ── Pengecekan Kelengkapan Profil Mahasiswa ──────────────────────────────
  const profileComplete = isProfileComplete(studentProfile);

  // Jika data profil sedang dimuat pertama kali
  if (isLoadingProfile && !studentProfile) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium text-sm">Memeriksa status profil mahasiswa...</p>
        </div>
      </div>
    );
  }

  // Jika profil belum lengkap: arahkan langsung ke halaman Melengkapi Profil Mahasiswa
  if (!isLoadingProfile && !profileComplete) {
    return (
      <ProfileCompletionPage
        user={user}
        studentProfile={studentProfile}
        onProfileCompleted={(updated) => {
          setStudentProfile(updated);
        }}
        onLogout={onLogout}
      />
    );
  }

  // Jika mahasiswa memilih mengubah profil dari menu/kartu profil
  if (isEditingProfile) {
    return (
      <ProfileCompletionPage
        user={user}
        studentProfile={studentProfile}
        isEditMode={true}
        onProfileCompleted={(updated) => {
          setStudentProfile(updated);
          setIsEditingProfile(false);
        }}
        onCancel={() => setIsEditingProfile(false)}
        onLogout={onLogout}
      />
    );
  }

  // ── Loading Skeleton ─────────────────────────────────────────────────────

  const isLoadingData = isLoadingProfile || isLoadingHistory || isLoadingIssues;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(nav) => {
          setActiveNav(nav);
          setIsMobileSidebarOpen(false);
        }}
        onLogout={onLogout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Konten Utama (offset oleh sidebar desktop) */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <TopNav
          user={user}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onLogout={onLogout}
        />

        {/* Area Konten */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto w-full">
          {/* Judul Halaman */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {activeNav === "dashboard" && "Dashboard"}
                {activeNav === "profile" && "Profil Mahasiswa"}
                {activeNav === "history" && "Riwayat Akademik"}
                {activeNav === "planner" && "Rencana Studi (KRS)"}
                {activeNav === "issues" && "Masalah Akademik"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeNav === "dashboard" && "Ringkasan kemajuan studi Anda"}
                {activeNav === "profile" && "Informasi akademik dan identitas mahasiswa"}
                {activeNav === "history" && "Daftar mata kuliah yang telah diselesaikan"}
                {activeNav === "planner" && "Simulasi pengisian Kartu Rencana Studi (KRS)"}
                {activeNav === "issues" && "Panduan dan pelaporan masalah akademik"}
              </p>
            </div>

            {/* Tombol Refresh Data */}
            <button
              type="button"
              onClick={() => {
                loadProfile();
                loadCourseHistory();
                loadIssueReports();
              }}
              title="Muat ulang data"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Notifikasi Error Global */}
          {globalError && (
            <div className="mb-5">
              <Alert
                type="error"
                title="Terjadi Kesalahan"
                message={globalError}
                onClose={() => setGlobalError("")}
              />
            </div>
          )}

          {/* Skeleton Loading saat data pertama kali dimuat */}
          {isLoadingData && activeNav === "dashboard" ? (
            <div className="space-y-5 animate-pulse">
              <div className="h-28 bg-white rounded-2xl border border-slate-200" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
                ))}
              </div>
              <div className="h-6 bg-white rounded-xl border border-slate-200" />
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
