import { Award, BookOpen, Calendar, CheckCircle2 } from "lucide-react";
import StatCard from "../common/StatCard";
import ProgressBar from "../common/ProgressBar";
import { TOTAL_GRADUATION_CREDITS } from "../../data/curriculumData";

export default function AcademicSummary({
  studentData = {},
  completedCredits = 0,
  maxAllowedCredits = 20,
  remainingCredits = 151,
}) {
  const gpa = typeof studentData.gpa === "number" ? studentData.gpa.toFixed(2) : null;
  const currentSemester = studentData.currentSemester || 1;

  return (
    <div className="space-y-4">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: IPK Kumulatif */}
        <StatCard
          title="IPK Kumulatif"
          value={gpa !== null ? gpa : "Belum Ada"}
          subtext={
            gpa !== null
              ? gpa >= 3.35
                ? "Memenuhi syarat beban maksimal 23 SKS"
                : "Beban standar maksimal 20 SKS"
              : "Mahasiswa baru / belum ada nilai resmi"
          }
          icon={Award}
          accent={gpa !== null && gpa >= 3.35 ? "emerald" : "blue"}
          badgeText={gpa !== null ? (gpa >= 3.35 ? "IPK ≥ 3.35" : "IPK < 3.35") : "Semester Baru"}
        />

        {/* Card 2: Batas SKS Semester */}
        <StatCard
          title="Batas Beban SKS"
          value={`${maxAllowedCredits} SKS`}
          subtext={
            maxAllowedCredits === 23
              ? "Beban akselerasi (IPK ≥ 3.35)"
              : "Beban standar semester reguler"
          }
          icon={Calendar}
          accent="purple"
          badgeText={maxAllowedCredits === 23 ? "Maksimal 23 SKS" : "Standar 20 SKS"}
        />

        {/* Card 3: SKS Diperoleh */}
        <StatCard
          title="SKS Diperoleh"
          value={`${completedCredits} / ${TOTAL_GRADUATION_CREDITS}`}
          subtext={`Dari target kelulusan ${TOTAL_GRADUATION_CREDITS} SKS`}
          icon={BookOpen}
          accent="blue"
          badgeText={`Sem. ${currentSemester}`}
        />

        {/* Card 4: Sisa SKS Menuju Lulus */}
        <StatCard
          title="Sisa SKS Kelulusan"
          value={`${remainingCredits} SKS`}
          subtext={
            remainingCredits === 0
              ? "Syarat beban SKS telah terpenuhi!"
              : `Perlu menyelesaikan ${remainingCredits} SKS lagi`
          }
          icon={CheckCircle2}
          accent={remainingCredits === 0 ? "emerald" : "amber"}
          badgeText={remainingCredits === 0 ? "Selesai" : "Dalam Proses"}
        />
      </div>

      {/* Visual Progress Bar */}
      <ProgressBar
        value={completedCredits}
        max={TOTAL_GRADUATION_CREDITS}
        label="Kemajuan Beban Studi Kelulusan"
      />
    </div>
  );
}
