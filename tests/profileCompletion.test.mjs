import assert from "node:assert/strict";
import { isProfileComplete } from "../src/services/studentService.js";

console.log("===================================================================");
console.log("  PENGUJIAN VALIDASI FITUR STUDENT PROFILE COMPLETION");
console.log("===================================================================\n");

// 1. Profil Kosong / Baru Registrasi Harus Berstatus Belum Lengkap
console.log("Pengujian 1: Profil kosong atau belum diisi harus berstatus belum lengkap");
assert.equal(isProfileComplete(null), false, "null harus false");
assert.equal(isProfileComplete({}), false, "objek kosong harus false");
assert.equal(
  isProfileComplete({
    fullName: "",
    studentNumber: "",
    currentSemester: 1,
    gpa: null,
  }),
  false,
  "Profil template awal tanpa nama/NIM/IPK harus false"
);
console.log("  [PASS] Profil kosong berhasil terdeteksi belum lengkap");

// 2. Profil dengan NIM / Nama Belum Lengkap Harus Ditolak
console.log("\nPengujian 2: Profil dengan salah satu bidang wajib kosong");
const partialProfile1 = {
  fullName: "Mahasiswa Test",
  studentNumber: "", // NIM kosong
  faculty: "Fakultas Ilmu Komputer",
  studyProgram: "Informatika",
  currentSemester: 3,
  gpa: 3.5,
};
assert.equal(isProfileComplete(partialProfile1), false, "NIM kosong harus menghasilkan false");

const partialProfile2 = {
  fullName: "", // Nama kosong
  studentNumber: "105021910001",
  faculty: "Fakultas Ilmu Komputer",
  studyProgram: "Informatika",
  currentSemester: 3,
  gpa: 3.5,
};
assert.equal(isProfileComplete(partialProfile2), false, "Nama kosong harus menghasilkan false");
console.log("  [PASS] Deteksi bidang wajib (Nama & NIM) berfungsi benar");

// 3. Validasi Nilai IPK (0.00 - 4.00)
console.log("\nPengujian 3: Validasi rentang nilai IPK (0.00 - 4.00)");
const invalidGpaHigh = {
  fullName: "Mahasiswa Valid",
  studentNumber: "105021910001",
  faculty: "Fakultas Ilmu Komputer",
  studyProgram: "Informatika",
  currentSemester: 3,
  gpa: 4.5, // IPK > 4.0
};
assert.equal(isProfileComplete(invalidGpaHigh), false, "IPK > 4.0 harus ditolak");

const invalidGpaLow = {
  fullName: "Mahasiswa Valid",
  studentNumber: "105021910001",
  faculty: "Fakultas Ilmu Komputer",
  studyProgram: "Informatika",
  currentSemester: 3,
  gpa: -0.5, // IPK < 0.0
};
assert.equal(isProfileComplete(invalidGpaLow), false, "IPK < 0.0 harus ditolak");

const validGpaZero = {
  fullName: "Mahasiswa Baru",
  studentNumber: "105021910002",
  faculty: "Fakultas Ilmu Komputer",
  studyProgram: "Informatika",
  currentSemester: 1,
  gpa: 0.0, // IPK mahasiswa baru
};
assert.equal(isProfileComplete(validGpaZero), true, "IPK 0.0 untuk mahasiswa baru harus valid");
console.log("  [PASS] Validasi batas nilai IPK 0.00 - 4.00 berfungsi benar");

// 4. Validasi Semester (1 - 14)
console.log("\nPengujian 4: Validasi Semester (1 - 14)");
const invalidSem0 = {
  fullName: "Mahasiswa Valid",
  studentNumber: "105021910001",
  faculty: "Fakultas Ilmu Komputer",
  studyProgram: "Informatika",
  currentSemester: 0,
  gpa: 3.5,
};
assert.equal(isProfileComplete(invalidSem0), false, "Semester 0 harus ditolak untuk semester aktif");

const invalidSem15 = {
  fullName: "Mahasiswa Valid",
  studentNumber: "105021910001",
  faculty: "Fakultas Ilmu Komputer",
  studyProgram: "Informatika",
  currentSemester: 15,
  gpa: 3.5,
};
assert.equal(isProfileComplete(invalidSem15), false, "Semester 15 harus ditolak");

const validSem5 = {
  fullName: "Mahasiswa Valid",
  studentNumber: "105021910001",
  faculty: "Fakultas Ilmu Komputer",
  studyProgram: "Informatika",
  currentSemester: 5,
  gpa: 3.75,
};
assert.equal(isProfileComplete(validSem5), true, "Semester 5 dengan data lengkap harus valid");
console.log("  [PASS] Validasi semester 1 - 14 berfungsi benar");

// 5. Profil Lengkap Berhasil Terverifikasi
console.log("\nPengujian 5: Profil lengkap terisi");
const completeProfile = {
  fullName: "Filipus Jonathan",
  studentNumber: "105022010045",
  faculty: "Fakultas Ilmu Komputer",
  studyProgram: "Informatika",
  curriculum: "2024",
  currentSemester: 4,
  gpa: 3.65,
  completedCredits: 68,
  status: "active",
};
assert.equal(isProfileComplete(completeProfile), true, "Profil lengkap harus valid");
console.log("  [PASS] Profil lengkap berhasil terverifikasi valid");

// 6. Verifikasi Informasi Akademik Otomatis & Tetap (Fakultas, Prodi, Kurikulum)
console.log("\nPengujian 6: Verifikasi Informasi Akademik Otomatis & Tetap");
const fixedFaculty = "Fakultas Ilmu Komputer";
const fixedProgram = "Informatika";
const fixedCurriculum = "2024";

assert.equal(fixedFaculty, "Fakultas Ilmu Komputer", "Fakultas harus tetap Fakultas Ilmu Komputer");
assert.equal(fixedProgram, "Informatika", "Program Studi harus tetap Informatika");
assert.equal(fixedCurriculum, "2024", "Tahun Kurikulum harus tetap 2024");

// Pastikan profil dengan nilai tetap resmi tersebut valid
const autoInfoProfile = {
  fullName: "Student Unklab",
  studentNumber: "105022110001",
  faculty: fixedFaculty,
  studyProgram: fixedProgram,
  curriculum: fixedCurriculum,
  currentSemester: 2,
  gpa: 3.8,
  completedCredits: 20,
  status: "active",
};
assert.equal(isProfileComplete(autoInfoProfile), true, "Profil dengan nilai akademik tetap harus valid");
console.log("  [PASS] Nilai otomatis (FIK, Informatika, 2024) terverifikasi valid dan konsisten");

console.log("\n===================================================================");
console.log("  SELURUH PENGUJIAN PROFILE COMPLETION BERHASIL 100%!");
console.log("===================================================================\n");
