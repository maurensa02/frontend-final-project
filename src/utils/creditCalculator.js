import {
  TOTAL_GRADUATION_CREDITS,
  ACADEMIC_RULES,
} from "../data/curriculumData.js";

/**
 * Menghasilkan batas maksimal SKS per semester berdasarkan IPK mahasiswa.
 * Aturan Akademik resmi Unklab (db.json):
 * - IPK >= 3.35: maksimal 23 SKS
 * - IPK < 3.35: maksimal 20 SKS
 * - Jika IPK bernilai null / undefined / belum tersedia:
 *   Menggunakan batas konservatif 20 SKS (beban standar) tanpa membuat asumsi IPK mahasiswa.
 *
 * @param {number|null|undefined} gpa Nilai IPK mahasiswa
 * @returns {number} Batas maksimal SKS (20 atau 23)
 */
export function getMaximumCredits(gpa) {
  if (typeof gpa !== "number" || isNaN(gpa) || gpa === null) {
    return 20; // Batas konservatif standar saat IPK belum tersedia
  }

  return gpa >= 3.35 ? 23 : 20;
}

/**
 * Mengambil IPK dari data profil mahasiswa.
 * Tidak melakukan rekaan atau fabrikasi nilai huruf ke IPK.
 *
 * @param {Object} studentData Objek mahasiswa dari student-data-template
 * @returns {number|null} Nilai IPK terverifikasi atau null jika belum ada
 */
export function getStudentGPA(studentData = {}) {
  if (typeof studentData?.gpa === "number" && !isNaN(studentData.gpa)) {
    return studentData.gpa;
  }
  return null;
}

/**
 * Menghitung total SKS yang telah diperoleh secara valid dari riwayat akademik.
 * Ketentuan Ketat:
 * - Menggunakan data `creditsEarned` jika bertipe angka positif.
 * - `creditsEarned: null` TIDAK dihitung sebagai SKS yang diperoleh.
 * - Tidak mengasumsikan nilai huruf (misal C atau C-) sebagai lulus sebelum ada aturan resmi.
 * - Jika data riwayat memiliki status yang belum diverifikasi, status kelulusan ditandai butuh konfirmasi.
 *
 * @param {Array<Object>} courseHistory Daftar riwayat mata kuliah mahasiswa
 * @param {Object} [studentData={}] Profil mahasiswa (opsional: dapat memiliki completedCredits terverifikasi)
 * @returns {{
 *   completedCredits: number,
 *   verifiedCourseCodes: string[],
 *   unconfirmedCourses: Array<Object>,
 *   hasUnverifiedRecords: boolean
 * }}
 */
export function calculateCompletedCredits(courseHistory = [], studentData = {}) {
  // Jika profil mahasiswa memiliki data completedCredits terverifikasi langsung
  const profileCredits = typeof studentData?.completedCredits === "number"
    ? studentData.completedCredits
    : null;

  if (!Array.isArray(courseHistory) || courseHistory.length === 0) {
    return {
      completedCredits: profileCredits !== null ? profileCredits : 0,
      verifiedCourseCodes: [],
      unconfirmedCourses: [],
      hasUnverifiedRecords: false,
    };
  }

  let totalCredits = 0;
  const verifiedCourseCodes = [];
  const unconfirmedCourses = [];

  for (const item of courseHistory) {
    if (!item) continue;

    const courseCode = String(item.courseCode || item.code || "").trim().toUpperCase();
    const creditsEarned = item.creditsEarned;

    // Hanya jika creditsEarned adalah angka valid > 0 yang diakui sebagai SKS diperoleh
    if (typeof creditsEarned === "number" && creditsEarned > 0) {
      totalCredits += creditsEarned;
      if (courseCode) verifiedCourseCodes.push(courseCode);
    } else {
      // Jika creditsEarned null, status completed tanpa kepastian SKS, atau nilai belum jelas
      unconfirmedCourses.push({
        courseCode,
        status: item.status || "unknown",
        grade: item.grade ?? null,
        creditsEarned: item.creditsEarned ?? null,
        note: item.note || "Informasi kelulusan belum memadai atau belum terverifikasi.",
      });
    }
  }

  // Jika riwayat memiliki data terverifikasi, gunakan itu; jika tidak dan profil ada, gunakan profil
  const effectiveCredits = profileCredits !== null && profileCredits > totalCredits
    ? profileCredits
    : totalCredits;

  return {
    completedCredits: effectiveCredits,
    verifiedCourseCodes,
    unconfirmedCourses,
    hasUnverifiedRecords: unconfirmedCourses.length > 0,
  };
}

/**
 * Menghitung sisa SKS menuju target kelulusan 151 SKS.
 *
 * @param {number} completedCredits Total SKS yang telah lulus
 * @returns {number} Sisa SKS menuju 151 SKS
 */
export function calculateRemainingCredits(completedCredits = 0) {
  const credits = Number(completedCredits) || 0;
  return Math.max(0, TOTAL_GRADUATION_CREDITS - credits);
}

/**
 * Menghitung total beban SKS dari daftar mata kuliah yang dipilih.
 *
 * @param {Array<Object>} courses
 * @returns {number} Total SKS
 */
export function calculateTotalCredits(courses = []) {
  if (!Array.isArray(courses)) return 0;
  return courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
}

export {
  TOTAL_GRADUATION_CREDITS,
  ACADEMIC_RULES,
};
