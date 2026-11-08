import { useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  BookX,
  ChevronDown,
  ChevronRight,
  Send,
  CheckCircle2,
  Clock,
  Info,
  FileText,
} from "lucide-react";
import Alert from "../common/Alert";
import Badge from "../common/Badge";
import { COURSES } from "../../data/curriculumData";

// ─── Definisi Kategori Masalah ─────────────────────────────────────────────────

const ISSUE_CATEGORIES = [
  {
    id: "presensi",
    label: "Masalah Presensi",
    icon: ClipboardList,
    color: "blue",
    shortDesc: "Kehadiran tidak tercatat, error absensi, atau konflik jadwal.",
    sop: [
      "Hubungi dosen pengampu mata kuliah yang bersangkutan untuk mengonfirmasi kehadiran.",
      "Minta surat keterangan kehadiran atau berita acara koreksi dari dosen.",
      "Serahkan bukti ke bagian administrasi Fakultas Ilmu Komputer (FIK) dalam batas waktu yang ditentukan.",
      "Pantau pembaruan presensi di portal akademik setelah proses verifikasi selesai.",
      "Jika tidak ada respons dalam 3 hari kerja, hubungi Staf Akademik FIK secara langsung.",
    ],
    note: "Pastikan membawa bukti pendukung seperti foto absensi, bukti kehadiran, atau jadwal kuliah resmi.",
  },
  {
    id: "krs",
    label: "Masalah KRS / Pengisian Jadwal",
    icon: FileText,
    color: "purple",
    shortDesc: "Gagal mengisi KRS, mata kuliah terkunci, atau konflik jadwal.",
    sop: [
      "Pastikan masa pengisian KRS masih aktif sesuai kalender akademik.",
      "Periksa apakah seluruh prasyarat mata kuliah yang ingin diambil sudah terpenuhi.",
      "Pastikan total SKS yang diambil tidak melebihi batas: 23 SKS (IPK ≥ 3,35) atau 20 SKS (IPK < 3,35).",
      "Hubungi Dosen Pembimbing Akademik (PA) untuk persetujuan dan pembukaan akses KRS.",
      "Jika sistem mengalami gangguan teknis, laporkan ke bagian IT / helpdesk kampus dengan menyertakan screenshot.",
      "Simpan bukti pengisian KRS yang berhasil (PDF atau tangkapan layar).",
    ],
    note: "KRS yang tidak diisi pada waktunya dapat memengaruhi status keaktifan mahasiswa di semester tersebut.",
  },
  {
    id: "nilai",
    label: "Nilai Belum Muncul",
    icon: BookX,
    color: "amber",
    shortDesc: "Nilai akhir tidak tampil di portal, atau terdapat ketidaksesuaian nilai.",
    sop: [
      "Tunggu hingga batas waktu resmi input nilai oleh dosen telah terlewati (biasanya 2 minggu setelah UAS).",
      "Hubungi dosen pengampu untuk mengonfirmasi apakah nilai sudah diinput ke sistem akademik.",
      "Jika dosen sudah menginput tetapi nilai masih tidak muncul, laporkan ke bagian administrasi akademik FIK.",
      "Siapkan bukti pendukung: tangkapan layar portal akademik yang menunjukkan nilai belum muncul, beserta kode dan nama mata kuliah.",
      "Minta tanda terima laporan dari bagian administrasi sebagai arsip.",
    ],
    note: "Nilai yang sudah final tidak dapat diubah tanpa prosedur resmi dari pejabat akademik yang berwenang.",
  },
];

// ─── Komponen Kartu Kategori (Accordion) ─────────────────────────────────────

function IssueCard({ category, isExpanded, onToggle }) {
  const Icon = category.icon;
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };
  const iconBg = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
  };
  const badgeVariant = {
    blue: "blue",
    purple: "purple",
    amber: "amber",
  };

  return (
    <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
      {/* Header Accordion */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/60 transition-colors cursor-pointer"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg[category.color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight">{category.label}</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{category.shortDesc}</p>
        </div>
        {isExpanded
          ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>

      {/* Body Accordion */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-slate-100 space-y-4">
          {/* Langkah SOP */}
          <div className="pt-4">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Langkah Penanganan
            </p>
            <ol className="space-y-2">
              {category.sop.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-600">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 ${colorMap[category.color]}`}>
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Catatan Penting */}
          <div className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-xs ${colorMap[category.color]}`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{category.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Komponen Utama AcademicIssuesHub ─────────────────────────────────────────

export default function AcademicIssuesHub({
  issueReports = [],
  onSubmitIssue,
  isSubmitting = false,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [formCategory, setFormCategory] = useState("");
  const [formCourseCode, setFormCourseCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function toggleCard(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!formCategory) {
      setSubmitError("Pilih kategori masalah terlebih dahulu.");
      return;
    }
    if (!formDescription.trim() || formDescription.trim().length < 20) {
      setSubmitError("Deskripsi masalah minimal 20 karakter.");
      return;
    }

    try {
      if (onSubmitIssue) {
        await onSubmitIssue({
          category: formCategory,
          courseCode: formCourseCode || null,
          description: formDescription.trim(),
        });
      }
      setSubmitSuccess(true);
      setFormCategory("");
      setFormCourseCode("");
      setFormDescription("");
    } catch {
      setSubmitError("Gagal mengirim laporan. Periksa koneksi internet dan coba lagi.");
    }
  }

  const categoryBadgeMap = {
    presensi: "blue",
    krs: "purple",
    nilai: "amber",
  };
  const categoryLabelMap = {
    presensi: "Presensi",
    krs: "KRS",
    nilai: "Nilai",
  };
  const statusBadgeMap = {
    submitted: { variant: "blue", label: "Dikirim" },
    in_review: { variant: "purple", label: "Ditinjau" },
    resolved: { variant: "green", label: "Selesai" },
  };

  return (
    <div className="space-y-8">

      {/* Panduan Penanganan Masalah */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Panduan Penanganan Masalah Akademik
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pilih kategori masalah untuk melihat langkah penanganan yang direkomendasikan.
          </p>
        </div>

        <div className="space-y-3">
          {ISSUE_CATEGORIES.map((cat) => (
            <IssueCard
              key={cat.id}
              category={cat}
              isExpanded={expandedId === cat.id}
              onToggle={() => toggleCard(cat.id)}
            />
          ))}
        </div>
      </section>

      {/* Form Laporan Masalah */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            Laporkan Masalah Akademik
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Isi formulir berikut untuk mencatat masalah yang Anda hadapi. Laporan ini tersimpan dalam akun Anda.
          </p>
        </div>

        {submitSuccess && (
          <Alert
            type="success"
            title="Laporan Berhasil Dicatat"
            message="Masalah akademik Anda telah disimpan. Silakan tindak lanjuti sesuai panduan di atas."
            onClose={() => setSubmitSuccess(false)}
          />
        )}

        {submitError && (
          <Alert
            type="error"
            title="Gagal Mengirim Laporan"
            message={submitError}
            onClose={() => setSubmitError("")}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori Masalah <span className="text-red-500">*</span>
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              required
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">-- Pilih Kategori --</option>
              {ISSUE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Mata Kuliah Terkait (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mata Kuliah Terkait{" "}
              <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <select
              value={formCourseCode}
              onChange={(e) => setFormCourseCode(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">-- Tidak Ada / Tidak Diketahui --</option>
              {COURSES.map((c) => (
                <option key={c.code} value={c.code}>
                  [{c.code}] {c.name} ({c.credits} SKS)
                </option>
              ))}
            </select>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi Masalah <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              required
              rows={4}
              minLength={20}
              placeholder="Jelaskan masalah yang Anda hadapi secara jelas dan singkat. Contoh: Presensi saya pada tanggal 10 November 2024 tidak tercatat meskipun saya hadir..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimal 20 karakter · {formDescription.length} karakter
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Menyimpan..." : "Kirim Laporan"}
            </button>
          </div>
        </form>
      </section>

      {/* Riwayat Laporan */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-slate-500" />
          Riwayat Laporan Saya
          {issueReports.length > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
              {issueReports.length}
            </span>
          )}
        </h3>

        {issueReports.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <CheckCircle2 className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum ada laporan</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Laporan masalah akademik yang Anda kirim akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {issueReports.map((report, idx) => {
              const badgeInfo = statusBadgeMap[report.status] || { variant: "gray", label: report.status };
              return (
                <div
                  key={report.id || idx}
                  className="flex items-start gap-3 p-4 border border-slate-200/80 rounded-xl bg-slate-50/40"
                >
                  <div className="mt-0.5 shrink-0">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {report.category && (
                        <Badge variant={categoryBadgeMap[report.category] || "gray"} size="sm">
                          {categoryLabelMap[report.category] || report.category}
                        </Badge>
                      )}
                      {report.courseCode && (
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {report.courseCode}
                        </span>
                      )}
                      <Badge variant={badgeInfo.variant} size="sm">
                        {badgeInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {report.description}
                    </p>
                    {report.createdAt?.toDate && (
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        {report.createdAt.toDate().toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
