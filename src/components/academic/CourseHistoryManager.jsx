import { useState } from "react";
import { Plus, Trash2, BookCheck, AlertCircle, Search, Filter } from "lucide-react";
import Badge from "../common/Badge";
import Modal from "../common/Modal";
import { COURSES } from "../../data/curriculumData";
import { findCourseByCode } from "../../utils/prerequisiteValidator";

export default function CourseHistoryManager({
  courseHistory = [],
  onAddCourse,
  onRemoveCourse,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseCode, setSelectedCourseCode] = useState("");
  const [creditsEarned, setCreditsEarned] = useState("");
  const [academicYear, setAcademicYear] = useState("2024/2025");
  const [semesterType, setSemesterType] = useState("odd");
  const [searchTerm, setSearchTerm] = useState("");

  // Handler saat memilih mata kuliah di dropdown
  function handleCourseChange(e) {
    const code = e.target.value;
    setSelectedCourseCode(code);
    const match = findCourseByCode(code);
    if (match) {
      setCreditsEarned(String(match.credits));
    }
  }

  // Handler submit form tambah riwayat
  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedCourseCode) return;

    const match = findCourseByCode(selectedCourseCode);
    const newRecord = {
      id: "SC" + Date.now(),
      courseCode: selectedCourseCode,
      courseName: match ? match.name : selectedCourseCode,
      creditsEarned: Number(creditsEarned) || (match ? match.credits : 0),
      academicYear,
      semesterType,
      status: "completed",
    };

    if (onAddCourse) {
      onAddCourse(newRecord);
    }

    // Reset form & tutup modal
    setSelectedCourseCode("");
    setCreditsEarned("");
    setIsModalOpen(false);
  }

  // Filter daftar riwayat berdasarkan kata kunci pencarian
  const filteredHistory = courseHistory.filter((item) => {
    const match = findCourseByCode(item.courseCode);
    const name = match ? match.name : (item.courseName || "");
    const code = item.courseCode || "";
    const q = searchTerm.toLowerCase();
    return code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
      {/* Header & Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookCheck className="w-5 h-5 text-blue-600" />
            Riwayat Mata Kuliah Mahasiswa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar mata kuliah yang telah diselesaikan untuk kalkulasi SKS kelulusan.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Riwayat Mata Kuliah
        </button>
      </div>

      {/* Bar Pencarian */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari kode atau nama mata kuliah riwayat..."
          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Daftar Riwayat Mata Kuliah */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Belum ada riwayat mata kuliah</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Klik tombol &quot;Tambah Riwayat Mata Kuliah&quot; di atas untuk mencatatkan mata kuliah yang telah Anda selesaikan.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Mata Kuliah</th>
                <th className="py-3 px-4 text-center">Beban</th>
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-4">Status Verifikasi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item, idx) => {
                const match = findCourseByCode(item.courseCode);
                const name = match ? match.name : (item.courseName || item.courseCode);
                const isVerified = typeof item.creditsEarned === "number" && item.creditsEarned > 0;

                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                      {item.courseCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div>{name}</div>
                      {match && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Sem. Rekomendasi: {match.recommendedSemester === 0 ? "Matrikulasi (Sem 0)" : `Semester ${match.recommendedSemester}`} · {match.type}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                        {isVerified ? `${item.creditsEarned} SKS` : "0 SKS"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.academicYear || "-"} · {item.semesterType === "odd" ? "Ganjil" : item.semesterType === "even" ? "Genap" : "Intersemester"}
                    </td>
                    <td className="py-3 px-4">
                      {isVerified ? (
                        <Badge variant="green" size="sm">
                          Terverifikasi Lulus
                        </Badge>
                      ) : (
                        <Badge variant="amber" size="sm">
                          Menunggu Konfirmasi
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {onRemoveCourse && (
                        <button
                          onClick={() => onRemoveCourse(item.courseCode || item.id)}
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus dari riwayat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah Riwayat Mata Kuliah */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Riwayat Mata Kuliah Selesai"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Mata Kuliah (Kurikulum Resmi 2024)
            </label>
            <select
              value={selectedCourseCode}
              onChange={handleCourseChange}
              required
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {COURSES.map((c) => (
                <option key={c.code} value={c.code}>
                  [{c.code}] {c.name} ({c.credits} SKS) - Sem. {c.recommendedSemester}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                SKS Diperoleh
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={creditsEarned}
                onChange={(e) => setCreditsEarned(e.target.value)}
                required
                placeholder="Misal: 3"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tahun Akademik
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
                placeholder="2024/2025"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Semester
            </label>
            <select
              value={semesterType}
              onChange={(e) => setSemesterType(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="odd">Ganjil (Odd)</option>
              <option value="even">Genap (Even)</option>
              <option value="intersemester">Intersemester</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
            >
              Simpan ke Riwayat
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
