import {
  COURSES,
  ACADEMIC_RULES,
  TOTAL_GRADUATION_CREDITS,
} from "../data/curriculumData.js";

import {
  getMaximumCredits,
  getStudentGPA,
  calculateCompletedCredits,
  calculateRemainingCredits,
  calculateTotalCredits,
} from "../utils/creditCalculator.js";

import {
  checkPrerequisites,
  findCourseByCode,
} from "../utils/prerequisiteValidator.js";

/**
 * Memvalidasi rencana studi (KRS) mahasiswa berdasarkan aturan akademik Unklab:
 * 1. Mencegah duplikasi mata kuliah di dalam rencana studi yang dipilih.
 * 2. Memeriksa total SKS agar tidak melebihi batas IPK (23 SKS jika IPK >= 3.35; 20 SKS jika IPK < 3.35 atau null).
 * 3. Memeriksa kelengkapan prasyarat berdasarkan kode mata kuliah di db.json.
 * 4. Mendukung pengambilan mata kuliah lintas semester (di luar recommendedSemester) asalkan prasyarat terpenuhi.
 * 5. Mendukung pemilihan mata kuliah pilihan (Electives).
 * 6. Mencegah pengambilan ulang mata kuliah yang sudah lulus tanpa menerapkan aturan asumsi pengulangan.
 * 7. Jika ada prasyarat yang status kelulusannya belum dapat dipastikan, memberikan catatan kebutuhan konfirmasi.
 *
 * @param {Array<Object|string>} selectedCourses Mata kuliah yang dipilih (objek atau kode)
 * @param {Object} [studentData={}] Data mahasiswa (misal: { gpa, completedCredits, currentSemester })
 * @param {Array<Object>} [courseHistory=[]] Riwayat mata kuliah mahasiswa
 * @param {Object} [options={}] Opsi tambahan
 * @returns {{
 *   isValid: boolean,
 *   totalSelectedCredits: number,
 *   maxAllowedCredits: number,
 *   completedCredits: number,
 *   remainingCredits: number,
 *   gpa: number|null,
 *   errors: string[],
 *   warnings: string[],
 *   unconfirmedNotes: string[],
 *   courseSummary: Array<Object>
 * }}
 */
export function validateStudyPlan(
  selectedCourses = [],
  studentData = {},
  courseHistory = []
) {
  const errors = [];
  const warnings = [];
  const unconfirmedNotes = [];

  // 1. Tentukan IPK secara aman (tanpa fabrikasi atau asumsi nilai)
  const effectiveGpa = getStudentGPA(studentData);
  const maxAllowedCredits = getMaximumCredits(effectiveGpa);

  // 2. Evaluasi riwayat akademik mahasiswa
  const historyResult = calculateCompletedCredits(courseHistory, studentData);
  const completedCredits = historyResult.completedCredits;
  const remainingCredits = calculateRemainingCredits(completedCredits);

  const verifiedPassedCodes = historyResult.verifiedCourseCodes;
  const unconfirmedCodes = historyResult.unconfirmedCourses.map((c) => c.courseCode);

  const verifiedPassedSet = new Set(verifiedPassedCodes.map((c) => String(c).trim().toUpperCase()));
  const unconfirmedSet = new Set(unconfirmedCodes.map((c) => String(c).trim().toUpperCase()));

  // 3. Normalisasi dan proses setiap mata kuliah yang dipilih
  const seenCodes = new Set();
  const courseSummary = [];
  const normalizedCourses = [];

  for (const item of selectedCourses) {
    if (!item) continue;

    let courseObj = null;
    if (typeof item === "string") {
      courseObj = findCourseByCode(item) || { code: item, name: item, credits: 0, prerequisites: [] };
    } else if (typeof item === "object") {
      // Jika objek hanya membawa kode, lengkapi dengan metadata db.json
      const dbMatch = findCourseByCode(item.code || item.id);
      courseObj = dbMatch ? { ...dbMatch, ...item } : item;
    }

    if (!courseObj || !courseObj.code) continue;
    normalizedCourses.push(courseObj);
  }

  const totalSelectedCredits = calculateTotalCredits(normalizedCourses);

  for (const course of normalizedCourses) {
    const code = String(course.code).trim().toUpperCase();
    const name = course.name || code;
    const credits = Number(course.credits) || 0;
    const recommendedSemester = course.recommendedSemester;

    // A. Mencegah duplikasi mata kuliah dalam rencana studi
    if (seenCodes.has(code)) {
      errors.push(`Duplikasi mata kuliah: ${name} (${code}) dipilih lebih dari satu kali.`);
    } else {
      seenCodes.add(code);
    }

    // B. Mencegah pengambilan ulang mata kuliah yang sudah lulus
    if (verifiedPassedSet.has(code)) {
      errors.push(
        `Mata kuliah ${name} (${code}) sudah tercatat lulus dalam riwayat akademik. Berdasarkan kebijakan saat ini, mata kuliah yang sudah lulus tidak direkomendasikan kembali secara otomatis (aturan pengulangan masih berstatus needs_clarification).`
      );
    }

    // C. Peringatan jika mata kuliah pernah diambil tetapi status kelulusannya belum terverifikasi
    if (unconfirmedSet.has(code)) {
      warnings.push(
        `Mata kuliah ${name} (${code}) tercatat dalam riwayat studi sebelumnya namun informasi kelulusannya belum memadai/belum terverifikasi.`
      );
    }

    // D. Memeriksa prasyarat mata kuliah
    const prereqCheck = checkPrerequisites(course, verifiedPassedCodes, unconfirmedCodes);
    if (!prereqCheck.isValid) {
      if (prereqCheck.missingPrerequisites.length > 0) {
        errors.push(
          `Prasyarat untuk ${name} (${code}) belum terpenuhi. Mata kuliah prasyarat yang belum diambil: ${prereqCheck.missingPrerequisites.join(", ")}.`
        );
      }
      if (prereqCheck.needsConfirmation) {
        unconfirmedNotes.push(
          `Prasyarat untuk ${name} (${code}) bergantung pada mata kuliah (${prereqCheck.unconfirmedPrerequisites.join(", ")}) yang informasi kelulusannya belum memadai dan perlu dikonfirmasi.`
        );
      }
    }

    // E. Pengambilan di luar semester rekomendasi (informasi validasi positif / catatan)
    const currentStudentSemester = studentData.currentSemester;
    if (
      typeof currentStudentSemester === "number" &&
      typeof recommendedSemester === "number" &&
      recommendedSemester !== currentStudentSemester
    ) {
      // Diizinkan oleh aturan akademik selama prasyarat terpenuhi
      // Tidak dimasukkan ke errors
    }

    courseSummary.push({
      code,
      name,
      credits,
      recommendedSemester,
      type: course.type || "Major",
      prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites : [],
    });
  }

  // 4. Memeriksa batas SKS berdasarkan IPK
  if (totalSelectedCredits > maxAllowedCredits) {
    const gpaText = effectiveGpa !== null ? `IPK ${effectiveGpa.toFixed(2)}` : "IPK belum tersedia (beban standar)";
    errors.push(
      `Total beban SKS yang dipilih (${totalSelectedCredits} SKS) melebihi batas maksimal yang diizinkan (${maxAllowedCredits} SKS untuk ${gpaText}).`
    );
  }

  // Status valid jika tidak ada error blocking
  const isValid = errors.length === 0 && unconfirmedNotes.length === 0;

  return {
    isValid,
    totalSelectedCredits,
    maxAllowedCredits,
    completedCredits,
    remainingCredits,
    gpa: effectiveGpa,
    errors,
    warnings,
    unconfirmedNotes,
    courseSummary,
  };
}

export {
  COURSES,
  ACADEMIC_RULES,
  TOTAL_GRADUATION_CREDITS,
};
