import { COURSES } from "../data/curriculumData.js";

/**
 * Peta seluruh mata kuliah dari db.json untuk pencarian cepat berdasarkan kode.
 */
const COURSE_MAP = new Map(
  COURSES.map((course) => [String(course.code).trim().toUpperCase(), course])
);

/**
 * Memeriksa apakah seluruh prasyarat suatu mata kuliah telah diselesaikan secara valid.
 * Penanganan Defensif:
 * - Jika data prerequisites null, undefined, atau bukan array -> ditangani secara aman tanpa melempar error.
 * - Mata kuliah dengan prasyarat kosong -> langsung valid.
 * - Memeriksa daftar kode yang terverifikasi lulus (verifiedPassedCodes).
 * - Jika ada riwayat mata kuliah yang berstatus completed tetapi SKS/kelulusannya belum jelas (unconfirmedCodes),
 *   ditandai sebagai unconfirmedPrerequisites (memerlukan konfirmasi) daripada menganggap otomatis lulus.
 *
 * @param {Object} course Objek mata kuliah kurikulum
 * @param {Array<string>} [verifiedPassedCodes=[]] Kode mata kuliah yang terbukti lulus valid
 * @param {Array<string>} [unconfirmedCodes=[]] Kode mata kuliah yang status kelulusannya belum dapat dipastikan
 * @returns {{
 *   isValid: boolean,
 *   needsConfirmation: boolean,
 *   missingPrerequisites: string[],
 *   unconfirmedPrerequisites: string[],
 *   reason: string | null
 * }}
 */
export function checkPrerequisites(
  course,
  verifiedPassedCodes = [],
  unconfirmedCodes = []
) {
  if (!course) {
    return {
      isValid: false,
      needsConfirmation: false,
      missingPrerequisites: [],
      unconfirmedPrerequisites: [],
      reason: "Objek mata kuliah tidak valid atau kosong.",
    };
  }

  // Penanganan defensif: jika prerequisites null, undefined, atau bukan array
  const rawPrereqs = course.prerequisites;
  if (!Array.isArray(rawPrereqs) || rawPrereqs.length === 0) {
    return {
      isValid: true,
      needsConfirmation: false,
      missingPrerequisites: [],
      unconfirmedPrerequisites: [],
      reason: null,
    };
  }

  const verifiedSet = new Set(
    (verifiedPassedCodes || []).map((c) => String(c).trim().toUpperCase())
  );
  const unconfirmedSet = new Set(
    (unconfirmedCodes || []).map((c) => String(c).trim().toUpperCase())
  );

  const missingPrerequisites = [];
  const unconfirmedPrerequisites = [];

  for (const rawCode of rawPrereqs) {
    if (!rawCode || typeof rawCode !== "string") continue;

    const prereqCode = rawCode.trim().toUpperCase();

    // 1. Cek apakah sudah terbukti lulus secara valid
    if (verifiedSet.has(prereqCode)) {
      continue;
    }

    // 2. Cek apakah pernah diambil tetapi informasinya belum dapat dipastikan
    if (unconfirmedSet.has(prereqCode)) {
      unconfirmedPrerequisites.push(prereqCode);
      continue;
    }

    // 3. Jika sama sekali belum diambil / belum lulus
    missingPrerequisites.push(prereqCode);
  }

  // Jika ada prasyarat yang sama sekali belum terpenuhi
  if (missingPrerequisites.length > 0) {
    return {
      isValid: false,
      needsConfirmation: false,
      missingPrerequisites,
      unconfirmedPrerequisites,
      reason: `Prasyarat belum terpenuhi: ${missingPrerequisites.join(", ")}.`,
    };
  }

  // Jika semua prasyarat terpenuhi tetapi ada yang status kelulusannya belum terverifikasi
  if (unconfirmedPrerequisites.length > 0) {
    return {
      isValid: false,
      needsConfirmation: true,
      missingPrerequisites: [],
      unconfirmedPrerequisites,
      reason: `Status kelulusan prasyarat (${unconfirmedPrerequisites.join(", ")}) belum dapat diverifikasi dan memerlukan konfirmasi resmi.`,
    };
  }

  return {
    isValid: true,
    needsConfirmation: false,
    missingPrerequisites: [],
    unconfirmedPrerequisites: [],
    reason: null,
  };
}

/**
 * Mengambil daftar mata kuliah yang tersedia untuk diambil mahasiswa:
 * - Mata kuliah yang belum pernah lulus.
 * - Seluruh prasyaratnya sudah terpenuhi secara valid.
 * - Memperbolehkan pengambilan di luar semester rekomendasi jika prasyarat terpenuhi.
 * - TIDAK otomatis memasukkan seluruh katalog semester 9 (35 mata kuliah, 134 SKS).
 *
 * @param {Array<Object>} [curriculum=COURSES] Seluruh kurikulum
 * @param {Array<string>} [verifiedPassedCodes=[]] Kode mata kuliah yang sudah lulus
 * @param {Array<string>} [unconfirmedCodes=[]] Kode mata kuliah yang belum terkonfirmasi
 * @param {Object} [options={}] Opsi penyaringan
 * @param {boolean} [options.includeElectives=true] Apakah menyertakan mata kuliah pilihan
 * @param {boolean} [options.includeMBKM=false] Default false: jangan otomatis memasukkan studi independen
 * @param {number|null} [options.targetSemester=null] Filter semester spesifik (jika diinginkan)
 * @returns {Array<Object>} Daftar mata kuliah yang memenuhi syarat
 */
export function getAvailableCourses(
  curriculum = COURSES,
  verifiedPassedCodes = [],
  unconfirmedCodes = [],
  options = {}
) {
  if (!Array.isArray(curriculum)) return [];

  const verifiedSet = new Set(
    (verifiedPassedCodes || []).map((c) => String(c).trim().toUpperCase())
  );

  const includeElectives = options.includeElectives !== false;
  const includeMBKM = options.includeMBKM === true;
  const targetSemester = typeof options.targetSemester === "number" ? options.targetSemester : null;

  return curriculum.filter((course) => {
    if (!course || !course.code) return false;

    const courseCode = String(course.code).trim().toUpperCase();

    // 1. Mencegah pengambilan ulang mata kuliah yang sudah lulus
    if (verifiedSet.has(courseCode)) {
      return false;
    }

    // 2. Filter spesifik Semester 9 agar tidak membanjiri rencana studi
    if (course.recommendedSemester === 9) {
      if (course.type === "Elective" && !includeElectives) return false;
      if (courseCode.startsWith("IFKM") && !includeMBKM) return false;
    }

    // 3. Filter target semester jika diminta (tetapi aturan umum mengizinkan lintas semester)
    if (targetSemester !== null && course.recommendedSemester !== targetSemester) {
      return false;
    }

    // 4. Periksa kelengkapan prasyarat
    const prereqCheck = checkPrerequisites(course, verifiedPassedCodes, unconfirmedCodes);
    return prereqCheck.isValid;
  });
}

/**
 * Mencari detail mata kuliah dari db.json berdasarkan kode.
 *
 * @param {string} code Kode mata kuliah
 * @returns {Object|null} Objek mata kuliah kurikulum
 */
export function findCourseByCode(code = "") {
  if (!code) return null;
  return COURSE_MAP.get(String(code).trim().toUpperCase()) || null;
}
