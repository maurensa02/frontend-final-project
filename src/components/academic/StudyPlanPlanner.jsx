import { useState, useMemo } from "react";
import {
  CalendarCheck,
  Search,
  Trash2,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Badge from "../common/Badge";
import Alert from "../common/Alert";
import { COURSES } from "../../data/curriculumData";
import { checkPrerequisites } from "../../utils/prerequisiteValidator";
import {
  calculateCompletedCredits,
  getMaximumCredits,
} from "../../utils/creditCalculator";
import { validateStudyPlan } from "../../services/studyPlanService";

// Definisi 13 tab kategori katalog resmi sesuai urutan kurikulum
const CATEGORY_TABS = [
  { id: "all", label: "Semua" },
  { id: "sem1", label: "Semester 1" },
  { id: "sem2", label: "Semester 2" },
  { id: "sem3", label: "Semester 3" },
  { id: "sem4", label: "Semester 4" },
  { id: "sem5", label: "Semester 5" },
  { id: "sem6", label: "Semester 6" },
  { id: "sem7", label: "Semester 7" },
  { id: "sem8", label: "Semester 8" },
  { id: "sem0", label: "Semester 0" },
  { id: "elective", label: "Elective" },
  { id: "mbkm", label: "MBKM / Studi Independen" },
  { id: "english", label: "Advanced English" },
];

/**
 * Filter kategori katalog berdasarkan spesifikasi kurikulum:
 * - Semua: Seluruh 90 mata kuliah
 * - Semester 1 - 8: recommendedSemester sesuai tab
 * - Semester 0: recommendedSemester === 0
 * - Elective: type === "Elective"
 * - MBKM / Studi Independen: Kode diawali "IFKM"
 * - Advanced English: Semester 9 dan type === "General"
 */
function isCourseMatchingTab(course, tabId) {
  switch (tabId) {
    case "sem1":
      return course.recommendedSemester === 1;
    case "sem2":
      return course.recommendedSemester === 2;
    case "sem3":
      return course.recommendedSemester === 3;
    case "sem4":
      return course.recommendedSemester === 4;
    case "sem5":
      return course.recommendedSemester === 5;
    case "sem6":
      return course.recommendedSemester === 6;
    case "sem7":
      return course.recommendedSemester === 7;
    case "sem8":
      return course.recommendedSemester === 8;
    case "sem0":
      return course.recommendedSemester === 0;
    case "elective":
      return course.type === "Elective";
    case "mbkm":
      return typeof course.code === "string" && course.code.startsWith("IFKM");
    case "english":
      return course.recommendedSemester === 9 && course.type === "General";
    case "unverified":
      return (
        course.verificationStatus === "needs_verification" || course.type === null
      );
    case "all":
    default:
      return true;
  }
}

/**
 * Menentukan status kelayakan pengambilan mata kuliah:
 * A. Memenuhi Syarat: Prasyarat terbukti lulus & belum pernah lulus -> Tombol Ambil aktif
 * B. Prasyarat Belum Terpenuhi: Ada kode prasyarat yang belum diselesaikan -> Tombol Ambil dinonaktifkan
 * C. Perlu Konfirmasi: Prasyarat ada di riwayat namun status kelulusan belum dapat dipastikan -> Tombol Ambil dinonaktifkan
 * D. Sudah Lulus: Mata kuliah sudah pernah lulus -> Tidak diizinkan ambil ulang
 * E. Perlu Verifikasi Kurikulum: verificationStatus === "needs_verification" atau type === null -> Peringatan tanpa membatalkan kelayakan otomatis
 */
function getCourseEligibility(course, verifiedPassedSet, unconfirmedCodes) {
  const code = String(course.code).trim().toUpperCase();
  const isPassed = verifiedPassedSet.has(code);

  const needsVerification =
    course.verificationStatus === "needs_verification" || course.type === null;

  // Evaluasi prasyarat resmi menggunakan checkPrerequisites
  const prereqCheck = checkPrerequisites(
    course,
    Array.from(verifiedPassedSet),
    unconfirmedCodes
  );

  if (isPassed) {
    return {
      status: "passed",
      badgeText: "Sudah Lulus",
      badgeVariant: "gray",
      buttonText: "Sudah Lulus",
      canSelect: false,
      reason: "Mata kuliah sudah tercatat lulus dalam riwayat akademik.",
      prereqCheck,
      needsVerification,
    };
  }

  if (prereqCheck.needsConfirmation) {
    return {
      status: "needs_confirmation",
      badgeText: "Perlu Konfirmasi",
      badgeVariant: "amber",
      buttonText: "Perlu Konfirmasi",
      canSelect: false,
      reason: `Status kelulusan prasyarat (${prereqCheck.unconfirmedPrerequisites.join(", ")}) belum dapat diverifikasi dan memerlukan konfirmasi akademik.`,
      prereqCheck,
      needsVerification,
    };
  }

  if (!prereqCheck.isValid) {
    return {
      status: "prereq_unmet",
      badgeText: "Prasyarat Belum Terpenuhi",
      badgeVariant: "red",
      buttonText: "Belum Memenuhi Syarat",
      canSelect: false,
      reason: `Prasyarat belum terpenuhi: ${prereqCheck.missingPrerequisites.join(", ")}.`,
      prereqCheck,
      needsVerification,
    };
  }

  return {
    status: "eligible",
    badgeText: "Memenuhi Syarat",
    badgeVariant: "green",
    buttonText: "+ Ambil",
    canSelect: true,
    reason: null,
    prereqCheck,
    needsVerification,
  };
}

export default function StudyPlanPlanner({
  selectedCourses = [],
  onSelectCourse,
  onDeselectCourse,
  studentData = {},
  courseHistory = [],
  verifiedPassedCodes = [],
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Evaluasi riwayat akademik mahasiswa secara real
  const historyResult = useMemo(
    () => calculateCompletedCredits(courseHistory, studentData),
    [courseHistory, studentData]
  );

  // Satukan daftar kode mata kuliah yang terbukti lulus valid
  const verifiedCodes = useMemo(() => {
    const set = new Set(
      (historyResult.verifiedCourseCodes || []).map((c) =>
        String(c).trim().toUpperCase()
      )
    );
    if (Array.isArray(verifiedPassedCodes)) {
      for (const c of verifiedPassedCodes) {
        if (c) set.add(String(c).trim().toUpperCase());
      }
    }
    return Array.from(set);
  }, [historyResult.verifiedCourseCodes, verifiedPassedCodes]);

  const verifiedPassedSet = useMemo(() => new Set(verifiedCodes), [verifiedCodes]);

  const unconfirmedCodes = useMemo(
    () =>
      historyResult.unconfirmedCourses.map((c) =>
        String(c.courseCode).trim().toUpperCase()
      ),
    [historyResult]
  );

  const unconfirmedSet = useMemo(
    () => new Set(unconfirmedCodes),
    [unconfirmedCodes]
  );

  // Jumlah mata kuliah pada setiap kategori dihitung dari keseluruhan 90 data kurikulum
  const courseCounts = useMemo(() => {
    const counts = {};
    for (const tab of CATEGORY_TABS) {
      counts[tab.id] = COURSES.filter((course) =>
        isCourseMatchingTab(course, tab.id)
      ).length;
    }
    return counts;
  }, []);

  // Filter katalog mata kuliah berdasarkan tab aktif dan query pencarian
  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return COURSES.filter((course) => {
      // 1. Filter kategori
      if (!isCourseMatchingTab(course, activeTab)) {
        return false;
      }

      // 2. Filter query pencarian (kode atau nama mata kuliah)
      if (q) {
        const codeMatch = String(course.code || "").toLowerCase().includes(q);
        const nameMatch = String(course.name || "").toLowerCase().includes(q);
        if (!codeMatch && !nameMatch) return false;
      }

      return true;
    });
  }, [activeTab, searchQuery]);

  // Validasi real-time rencana studi yang dipilih (KRS)
  const validationResult = useMemo(
    () => validateStudyPlan(selectedCourses, studentData, courseHistory),
    [selectedCourses, studentData, courseHistory]
  );

  const maxAllowedCredits = getMaximumCredits(studentData.gpa);
  const totalSelectedCredits = validationResult.totalSelectedCredits;
  const isOverLimit = totalSelectedCredits > maxAllowedCredits;

  // Set kode mata kuliah yang sudah dipilih dalam KRS
  const selectedCodeSet = useMemo(
    () => new Set(selectedCourses.map((c) => String(c.code).trim().toUpperCase())),
    [selectedCourses]
  );

  return (
    <div className="space-y-6">
      {/* Header Modul */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              Perencana Studi & Simulator KRS Semester
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Rencanakan mata kuliah semester depan dengan validasi kuota SKS dan prasyarat secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2">
            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Kapasitas Beban (IPK: {studentData.gpa !== undefined && studentData.gpa !== null ? Number(studentData.gpa).toFixed(2) : "Standar"})
              </span>
              <span className={`text-base font-bold ${isOverLimit ? "text-rose-600" : "text-blue-700"}`}>
                {totalSelectedCredits} / {maxAllowedCredits} SKS
              </span>
            </div>
            <div className={`w-3 h-3 rounded-full ${isOverLimit ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom: Katalog Pilihan vs Panel KRS Terpilih */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Katalog Lengkap 90 Mata Kuliah (7 Kolom) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            {/* Header Bagian Katalog */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800">
                  Katalog Kurikulum 2024
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan {filteredCourses.length} dari {COURSES.length} Mata Kuliah
              </span>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="space-y-3">
              {/* 7 Category Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs overflow-x-auto max-w-full">
                {CATEGORY_TABS.map((tab) => {
                  const count = courseCounts[tab.id] ?? 0;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-xs ${
                        isActive
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode atau nama mata kuliah..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* List Kartu Mata Kuliah */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  Tidak ada mata kuliah yang cocok dengan filter atau pencarian.
                </div>
              ) : (
                filteredCourses.map((course) => {
                  const isSelected = selectedCodeSet.has(course.code);
                  const eligibility = getCourseEligibility(
                    course,
                    verifiedPassedSet,
                    unconfirmedCodes
                  );

                  const isCrossSemester =
                    typeof studentData.currentSemester === "number" &&
                    typeof course.recommendedSemester === "number" &&
                    course.recommendedSemester !== studentData.currentSemester &&
                    course.recommendedSemester >= 1 &&
                    course.recommendedSemester <= 8;

                  return (
                    <div
                      key={course.code}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-blue-50/40 border-blue-200 shadow-xs"
                          : eligibility.status === "passed"
                          ? "bg-slate-50/70 border-slate-200/80"
                          : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Baris Kode, Nama, SKS, Badge Status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              {course.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-800">
                              {course.name}
                            </span>
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {course.credits} SKS
                            </span>

                            {/* Badge Status Kelayakan */}
                            <Badge variant={eligibility.badgeVariant} size="sm">
                              {eligibility.badgeText}
                            </Badge>

                            {/* Peringatan Verifikasi Kurikulum jika perlu */}
                            {eligibility.needsVerification && (
                              <Badge variant="amber" size="sm">
                                Perlu Verifikasi Kurikulum
                              </Badge>
                            )}
                          </div>

                          {/* Metadata: Semester Rekomendasi, Jenis, Lintas Semester */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-slate-500">
                            <span>
                              Sem. Rekomendasi:{" "}
                              {course.recommendedSemester === 0
                                ? "0 (Matrikulasi)"
                                : course.recommendedSemester}
                            </span>
                            <span>•</span>
                            <span>
                              Jenis:{" "}
                              {course.type ? (
                                <span className="font-medium text-slate-700">{course.type}</span>
                              ) : (
                                <span className="text-amber-700 font-medium">Belum Ditentukan</span>
                              )}
                            </span>

                            {course.type === "Elective" && (
                              <Badge variant="amber" size="sm">
                                Pilihan / Elective
                              </Badge>
                            )}

                            {isCrossSemester && (
                              <Badge variant="purple" size="sm">
                                Lintas Semester Diizinkan
                              </Badge>
                            )}
                          </div>

                          {/* Daftar Prasyarat */}
                          <div className="mt-2.5 text-[11px]">
                            {Array.isArray(course.prerequisites) && course.prerequisites.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap text-slate-600">
                                <span className="font-medium text-slate-500">Prasyarat:</span>
                                {course.prerequisites.map((p) => {
                                  const isPrereqPassed = verifiedPassedSet.has(p);
                                  const isPrereqUnconfirmed = unconfirmedSet.has(p);
                                  if (isPrereqPassed) {
                                    return (
                                      <span
                                        key={p}
                                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px]"
                                        title="Prasyarat telah diselesaikan secara valid"
                                      >
                                        ✓ {p}
                                      </span>
                                    );
                                  }
                                  if (isPrereqUnconfirmed) {
                                    return (
                                      <span
                                        key={p}
                                        className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px]"
                                        title="Status kelulusan prasyarat memerlukan konfirmasi akademik"
                                      >
                                        ? {p} (Perlu Konfirmasi)
                                      </span>
                                    );
                                  }
                                  return (
                                    <span
                                      key={p}
                                      className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[10px]"
                                      title="Prasyarat belum dipenuhi"
                                    >
                                      ✕ {p} (Belum Lulus)
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-400">Tanpa prasyarat</span>
                            )}
                          </div>

                          {/* Alasan / Keterangan mengapa belum dapat diambil */}
                          {eligibility.reason && eligibility.status !== "passed" && (
                            <p
                              className={`text-[11px] mt-2 font-medium ${
                                eligibility.status === "needs_confirmation"
                                  ? "text-amber-700"
                                  : "text-rose-600"
                              }`}
                            >
                              {eligibility.reason}
                            </p>
                          )}

                          {/* Peringatan Verifikasi Kurikulum */}
                          {eligibility.needsVerification && (
                            <p className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200 rounded-lg px-2.5 py-1 mt-2">
                              Peringatan: Data mata kuliah ini masih perlu diverifikasi oleh pihak fakultas / program studi.
                            </p>
                          )}
                        </div>

                        {/* Tombol Aksi Ambil / Batal */}
                        <div className="shrink-0 flex items-center sm:self-center">
                          {isSelected ? (
                            <button
                              type="button"
                              onClick={() => onDeselectCourse && onDeselectCourse(course.code)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Batal
                            </button>
                          ) : eligibility.canSelect ? (
                            <button
                              type="button"
                              onClick={() => onSelectCourse && onSelectCourse(course)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                            >
                              + Ambil
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              title={eligibility.reason || "Mata kuliah belum dapat diambil"}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed whitespace-nowrap"
                            >
                              {eligibility.buttonText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rencana Studi (KRS) Terpilih (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Rencana Studi Semester (KRS)
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {selectedCourses.length} Mata Kuliah
              </span>
            </div>

            {/* Kapasitas Beban SKS Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Beban Studi:</span>
                <span className={`font-bold ${isOverLimit ? "text-rose-600" : "text-slate-800"}`}>
                  {totalSelectedCredits} dari {maxAllowedCredits} SKS
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverLimit ? "bg-rose-500" : "bg-blue-600"
                  }`}
                  style={{
                    width: `${Math.min(100, (totalSelectedCredits / maxAllowedCredits) * 100)}%`,
                  }}
                />
              </div>
              {isOverLimit && (
                <p className="text-[11px] text-rose-600 font-medium">
                  Melebihi batas maksimal {maxAllowedCredits} SKS per semester!
                </p>
              )}
            </div>

            {/* Alert Validasi Real-Time */}
            {validationResult.errors.length > 0 && (
              <Alert
                type="error"
                title="Rencana Studi Belum Valid"
                message={validationResult.errors.join(" ")}
              />
            )}

            {validationResult.unconfirmedNotes.length > 0 && (
              <Alert
                type="warning"
                title="Perlu Konfirmasi Akademik"
                message={validationResult.unconfirmedNotes.join(" ")}
              />
            )}

            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <Alert
                type="warning"
                title="Perhatian Akademik"
                message={validationResult.warnings.join(" ")}
              />
            )}

            {validationResult.isValid && selectedCourses.length > 0 && (
              <Alert
                type="success"
                title="Rencana Studi Memenuhi Syarat"
                message="Seluruh mata kuliah dan total SKS sesuai dengan aturan akademik Unklab."
              />
            )}

            {/* Daftar Mata Kuliah Terpilih */}
            {selectedCourses.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Sparkles className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">Belum ada mata kuliah dipilih</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                  Pilih mata kuliah dari katalog di sebelah kiri untuk menyusun rencana studi semester.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {selectedCourses.map((c) => (
                  <div
                    key={c.code}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-700">{c.code}</span>
                        <span className="font-semibold text-slate-800 truncate">{c.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.credits} SKS · Sem. {c.recommendedSemester} · {c.type || "Belum Ditentukan"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeselectCourse && onDeselectCourse(c.code)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus dari rencana studi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
