/**
 * studentService.js
 * Layanan Firestore untuk membaca dan menyimpan data profil mahasiswa
 * serta riwayat mata kuliah.
 *
 * Struktur Firestore:
 *   users/{uid}                        → dokumen profil mahasiswa
 *   users/{uid}/courseHistory/{id}     → sub-koleksi riwayat mata kuliah
 *   users/{uid}/issueReports/{id}      → sub-koleksi laporan masalah akademik
 *
 * Ketentuan:
 * - Tidak menyimpan atau mengubah data dari student-data-template.json secara langsung.
 * - Tidak memuat data mahasiswa palsu atau nilai yang dikarang.
 * - Jika dokumen tidak ditemukan, return null (bukan error).
 * - Semua field mengacu pada skema student-data-template.json.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebase.js";

// ─── PROFIL MAHASISWA ─────────────────────────────────────────────────────────

/**
 * Memeriksa apakah data profil mahasiswa sudah lengkap untuk personalisasi layanan.
 * Kriteria lengkap:
 * - Nama lengkap terisi
 * - NIM terisi
 * - Fakultas & Program studi terisi
 * - Semester aktif terisi (1-14)
 * - IPK terisi angka valid (0.00 - 4.00)
 *
 * @param {Object|null} profile Objek profil mahasiswa
 * @returns {boolean} true jika profil telah lengkap
 */
export function isProfileComplete(profile) {
  if (!profile) return false;
  if (profile.isProfileCompleted === true) return true;

  const hasName = Boolean(profile.fullName && String(profile.fullName).trim().length >= 2);
  const hasNim = Boolean(profile.studentNumber && String(profile.studentNumber).trim().length >= 3);
  const hasFaculty = Boolean(profile.faculty && String(profile.faculty).trim());
  const hasProgram = Boolean(profile.studyProgram && String(profile.studyProgram).trim());
  const hasSemester =
    typeof profile.currentSemester === "number" &&
    profile.currentSemester >= 1 &&
    profile.currentSemester <= 14;
  const hasGpa =
    typeof profile.gpa === "number" &&
    !isNaN(profile.gpa) &&
    profile.gpa >= 0.0 &&
    profile.gpa <= 4.0;

  return hasName && hasNim && hasFaculty && hasProgram && hasSemester && hasGpa;
}

/**
 * Memeriksa ketersediaan/keunikan NIM mahasiswa di Firestore.
 * @param {string} nim Nomor Induk Mahasiswa
 * @param {string} currentUid UID mahasiswa yang sedang login
 * @returns {Promise<{ available: boolean, error?: string }>}
 */
export async function checkNimAvailability(nim, currentUid) {
  if (!nim || !String(nim).trim()) {
    return { available: false, error: "NIM wajib diisi." };
  }
  const cleanNim = String(nim).trim().toUpperCase();

  try {
    const nimRef = doc(db, "nims", cleanNim);
    const snap = await getDoc(nimRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.uid && data.uid !== currentUid) {
        return {
          available: false,
          error: `NIM '${cleanNim}' sudah digunakan oleh mahasiswa lain.`,
        };
      }
    }
    return { available: true };
  } catch (err) {
    console.warn("[studentService] checkNimAvailability warning:", err);
    // Jika ada kendala akses rules nims pada environment tertentu, jangan memblokir
    return { available: true };
  }
}

/**
 * Menyimpan profil lengkap mahasiswa setelah registrasi / pengisian form.
 * Melakukan validasi ketat, pengecekan keunikan NIM, dan pencatatan ke Firestore.
 *
 * @param {string} uid Firebase UID
 * @param {Object} profileData
 * @returns {Promise<{ success: boolean, profile?: Object, error?: string }>}
 */
export async function saveStudentProfile(uid, profileData = {}) {
  if (!uid) {
    return { success: false, error: "Pengguna tidak terautentikasi." };
  }

  const fullName = String(profileData.fullName || "").trim();
  const studentNumber = String(profileData.studentNumber || "").trim().toUpperCase();
  const email = String(profileData.email || "").trim();
  const faculty = String(profileData.faculty || "").trim();
  const studyProgram = String(profileData.studyProgram || "").trim();
  const curriculum = String(profileData.curriculum || "").trim() || "2024";
  const currentSemester = Number(profileData.currentSemester);
  const gpa = Number(profileData.gpa);
  const completedCredits = Number(profileData.completedCredits);
  const status = profileData.status || "active";

  // 1. Validasi Identitas
  if (!fullName || fullName.length < 2) {
    return { success: false, error: "Nama lengkap wajib diisi (minimal 2 karakter)." };
  }
  if (!studentNumber || studentNumber.length < 3) {
    return { success: false, error: "NIM wajib diisi dengan benar." };
  }

  // 2. Validasi Informasi Akademik
  if (!faculty) {
    return { success: false, error: "Fakultas wajib diisi." };
  }
  if (!studyProgram) {
    return { success: false, error: "Program studi wajib diisi." };
  }
  if (isNaN(currentSemester) || currentSemester < 1 || currentSemester > 14) {
    return { success: false, error: "Semester harus berada dalam rentang 1 sampai 14." };
  }

  // 3. Validasi Informasi Perkuliahan
  if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
    return { success: false, error: "IPK harus berada dalam rentang 0.00 sampai 4.00." };
  }
  if (isNaN(completedCredits) || completedCredits < 0) {
    return { success: false, error: "Total SKS harus bernilai angka 0 atau lebih." };
  }

  // 4. Validasi Keunikan NIM
  const nimCheck = await checkNimAvailability(studentNumber, uid);
  if (!nimCheck.available) {
    return { success: false, error: nimCheck.error || "NIM sudah terdaftar." };
  }

  try {
    // A. Catat ke koleksi indeks nims
    try {
      const nimRef = doc(db, "nims", studentNumber);
      await setDoc(nimRef, {
        uid,
        studentNumber,
        updatedAt: serverTimestamp(),
      });
    } catch (nimErr) {
      console.warn("[studentService] Gagal memperbarui indeks nims:", nimErr);
    }

    // B. Simpan data profil mahasiswa di users/{uid}
    const userRef = doc(db, "users", uid);
    const payload = {
      fullName,
      studentNumber,
      email,
      faculty,
      studyProgram,
      institution: "Universitas Klabat",
      curriculum,
      currentSemester,
      gpa,
      completedCredits,
      status,
      isProfileCompleted: true,
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, payload, { merge: true });
    return { success: true, profile: { id: uid, ...payload } };
  } catch (err) {
    console.error("[studentService] saveStudentProfile error:", err);
    return { success: false, error: err.message || "Gagal menyimpan data profil ke Firestore." };
  }
}

/**
 * Mengambil dokumen profil mahasiswa dari Firestore.
 * @param {string} uid Firebase UID mahasiswa yang sedang login
 * @returns {Promise<Object|null>} Data profil atau null jika belum ada
 */
export async function getStudentProfile(uid) {
  if (!uid) return null;
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("[studentService] getStudentProfile error:", err);
    return null;
  }
}

/**
 * Membuat dokumen profil mahasiswa baru di Firestore.
 * Hanya dipanggil saat profil belum ada (dokumen users/{uid} tidak ditemukan).
 *
 * @param {string} uid Firebase UID
 * @param {Object} profileData Data profil awal (tidak boleh berisi data fabrikasi)
 * @returns {Promise<boolean>} true jika berhasil
 */
export async function createStudentProfile(uid, profileData = {}) {
  if (!uid) return false;
  try {
    const ref = doc(db, "users", uid);
    await setDoc(ref, {
      studentNumber: profileData.studentNumber || "",
      fullName: profileData.fullName || "",
      studyProgram: profileData.studyProgram || "Informatika",
      faculty: profileData.faculty || "Fakultas Ilmu Komputer",
      institution: profileData.institution || "Universitas Klabat",
      curriculum: profileData.curriculum || "2024",
      currentSemester: profileData.currentSemester || 1,
      gpa: null,              // IPK tidak boleh dikarang — hanya diisi dari data resmi
      completedCredits: 0,    // Hitung dari riwayat, bukan langsung set
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("[studentService] createStudentProfile error:", err);
    return false;
  }
}

/**
 * Memperbarui sebagian data profil mahasiswa.
 * Hanya field yang ada di profileData yang akan diperbarui.
 *
 * @param {string} uid Firebase UID
 * @param {Object} profileData Field-field yang diperbarui
 * @returns {Promise<boolean>} true jika berhasil
 */
export async function updateStudentProfile(uid, profileData = {}) {
  if (!uid) return false;
  try {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, {
      ...profileData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("[studentService] updateStudentProfile error:", err);
    return false;
  }
}

// ─── RIWAYAT MATA KULIAH ─────────────────────────────────────────────────────

/**
 * Mengambil seluruh riwayat mata kuliah mahasiswa dari sub-koleksi Firestore.
 *
 * @param {string} uid Firebase UID mahasiswa
 * @returns {Promise<Array>} Daftar riwayat mata kuliah (atau array kosong)
 */
export async function getCourseHistory(uid) {
  if (!uid) return [];
  try {
    const ref = collection(db, "users", uid, "courseHistory");
    const q = query(ref, orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    // Jika index belum tersedia, coba tanpa ordering
    console.warn("[studentService] getCourseHistory ordered query failed, retrying without order:", err.code);
    try {
      const ref = collection(db, "users", uid, "courseHistory");
      const snap = await getDocs(ref);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (fallbackErr) {
      console.error("[studentService] getCourseHistory fallback error:", fallbackErr);
      return [];
    }
  }
}

/**
 * Menambahkan satu entri riwayat mata kuliah ke sub-koleksi Firestore.
 *
 * @param {string} uid Firebase UID mahasiswa
 * @param {Object} record Objek riwayat mata kuliah
 * @param {string} record.courseCode   Kode mata kuliah (dari kurikulum resmi)
 * @param {string} record.courseName   Nama mata kuliah
 * @param {number|null} record.creditsEarned  SKS diperoleh (null jika belum terverifikasi)
 * @param {string} record.academicYear Tahun akademik, misal "2024/2025"
 * @param {string} record.semesterType "odd" | "even" | "intersemester"
 * @param {string} record.status       "completed" | "ongoing"
 * @returns {Promise<string|null>} ID dokumen baru atau null jika gagal
 */
export async function addCourseHistoryRecord(uid, record) {
  if (!uid || !record?.courseCode) return null;
  try {
    const ref = collection(db, "users", uid, "courseHistory");
    const docRef = await addDoc(ref, {
      courseCode: record.courseCode,
      courseName: record.courseName || "",
      creditsEarned: typeof record.creditsEarned === "number" ? record.creditsEarned : null,
      academicYear: record.academicYear || "",
      semesterType: record.semesterType || "odd",
      status: record.status || "completed",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("[studentService] addCourseHistoryRecord error:", err);
    return null;
  }
}

/**
 * Menghapus satu entri riwayat mata kuliah dari Firestore.
 *
 * @param {string} uid Firebase UID mahasiswa
 * @param {string} recordId ID dokumen riwayat yang akan dihapus
 * @returns {Promise<boolean>} true jika berhasil
 */
export async function deleteCourseHistoryRecord(uid, recordId) {
  if (!uid || !recordId) return false;
  try {
    const ref = doc(db, "users", uid, "courseHistory", recordId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.error("[studentService] deleteCourseHistoryRecord error:", err);
    return false;
  }
}

// ─── LAPORAN MASALAH AKADEMIK ─────────────────────────────────────────────────

/**
 * Mengambil seluruh laporan masalah akademik mahasiswa.
 *
 * @param {string} uid Firebase UID mahasiswa
 * @returns {Promise<Array>} Daftar laporan atau array kosong
 */
export async function getIssueReports(uid) {
  if (!uid) return [];
  try {
    const ref = collection(db, "users", uid, "issueReports");
    const q = query(ref, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("[studentService] getIssueReports ordered query failed, retrying:", err.code);
    try {
      const ref = collection(db, "users", uid, "issueReports");
      const snap = await getDocs(ref);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (fallbackErr) {
      console.error("[studentService] getIssueReports fallback error:", fallbackErr);
      return [];
    }
  }
}

/**
 * Menyimpan laporan masalah akademik baru ke Firestore.
 *
 * @param {string} uid Firebase UID mahasiswa
 * @param {Object} report
 * @param {string} report.category      "presensi" | "krs" | "nilai"
 * @param {string} [report.courseCode]  Kode mata kuliah terkait (opsional)
 * @param {string} report.description   Deskripsi masalah dari mahasiswa
 * @returns {Promise<string|null>} ID laporan baru atau null jika gagal
 */
export async function addIssueReport(uid, report) {
  if (!uid || !report?.category || !report?.description) return null;
  try {
    const ref = collection(db, "users", uid, "issueReports");
    const docRef = await addDoc(ref, {
      category: report.category,
      courseCode: report.courseCode || null,
      description: report.description,
      status: "submitted",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("[studentService] addIssueReport error:", err);
    return null;
  }
}
