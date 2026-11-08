import assert from "node:assert/strict";

import {
  COURSES,
  REGULAR_COURSES,
  PREREQUISITE_COURSES,
  ELECTIVE_COURSES,
  UNVERIFIED_COURSES,
  TOTAL_GRADUATION_CREDITS,
  ACADEMIC_RULES,
} from "../src/data/curriculumData.js";

import {
  getMaximumCredits,
  getStudentGPA,
  calculateCompletedCredits,
  calculateRemainingCredits,
  calculateTotalCredits,
} from "../src/utils/creditCalculator.js";

import {
  checkPrerequisites,
  getAvailableCourses,
  findCourseByCode,
} from "../src/utils/prerequisiteValidator.js";

import { validateStudyPlan } from "../src/services/studyPlanService.js";

console.log("===================================================================");
console.log("  PENGUJIAN RESMI ATURAN AKADEMIK & KURIKULUM 2024 (12 SKENARIO)");
console.log("  Sumber Data: db.json & student-data-template.json");
console.log("===================================================================\n");

// -----------------------------------------------------------------------------
// Skenario 1: IPK 3,35 menghasilkan maksimal 23 SKS
// -----------------------------------------------------------------------------
{
  console.log("Skenario 1: IPK 3.35 menghasilkan batas 23 SKS");
  const maxCredits = getMaximumCredits(3.35);
  assert.equal(maxCredits, 23, "IPK 3.35 seharusnya menghasilkan batas maksimal 23 SKS");
  console.log("  [PASS] getMaximumCredits(3.35) -> 23 SKS");
}

// -----------------------------------------------------------------------------
// Skenario 2: IPK 3,34 menghasilkan maksimal 20 SKS
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 2: IPK 3.34 menghasilkan batas 20 SKS");
  const maxCredits = getMaximumCredits(3.34);
  assert.equal(maxCredits, 20, "IPK 3.34 seharusnya menghasilkan batas maksimal 20 SKS");
  console.log("  [PASS] getMaximumCredits(3.34) -> 20 SKS");
}

// -----------------------------------------------------------------------------
// Skenario 3: IPK null menghasilkan batas konservatif 20 SKS
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 3: IPK null menghasilkan batas konservatif 20 SKS");
  const maxNull = getMaximumCredits(null);
  assert.equal(maxNull, 20, "IPK null harus menghasilkan batas konservatif 20 SKS tanpa asumsi nilai");
  const maxUndefined = getMaximumCredits(undefined);
  assert.equal(maxUndefined, 20, "IPK undefined harus menghasilkan batas konservatif 20 SKS");
  console.log("  [PASS] getMaximumCredits(null) -> 20 SKS (Beban standar aman)");
}

// -----------------------------------------------------------------------------
// Skenario 4: Mata kuliah tanpa prasyarat (IFAP171, IFKV131, UNKL041)
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 4: Mata kuliah tanpa prasyarat (IFAP171 & IFKV131)");
  const ifap171 = findCourseByCode("IFAP171");
  assert.ok(ifap171, "Mata kuliah IFAP171 harus ditemukan di db.json");
  assert.deepEqual(ifap171.prerequisites, [], "IFAP171 tidak memiliki prasyarat di db.json");

  const check171 = checkPrerequisites(ifap171, []);
  assert.equal(check171.isValid, true, "IFAP171 tanpa prasyarat harus langsung valid");
  assert.equal(check171.missingPrerequisites.length, 0);

  const ifkv131 = findCourseByCode("IFKV131");
  assert.ok(ifkv131, "Mata kuliah IFKV131 harus ditemukan di db.json");
  const check131 = checkPrerequisites(ifkv131, []);
  assert.equal(check131.isValid, true, "IFKV131 tanpa prasyarat harus langsung valid");
  console.log("  [PASS] Mata kuliah tanpa prasyarat (IFAP171, IFKV131) langsung valid");
}

// -----------------------------------------------------------------------------
// Skenario 5: Prasyarat terpenuhi (IFAP172 dengan riwayat IFKV131)
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 5: Prasyarat terpenuhi (IFAP172 membutuhkan IFKV131)");
  const ifap172 = findCourseByCode("IFAP172");
  assert.ok(ifap172, "Mata kuliah IFAP172 harus ditemukan di db.json");
  assert.deepEqual(ifap172.prerequisites, ["IFKV131"], "IFAP172 memerlukan IFKV131");

  // Mahasiswa telah lulus IFKV131
  const checkMet = checkPrerequisites(ifap172, ["IFKV131"]);
  assert.equal(checkMet.isValid, true, "IFAP172 harus valid jika IFKV131 sudah lulus");
  assert.equal(checkMet.missingPrerequisites.length, 0);
  console.log("  [PASS] IFAP172 valid ketika prasyarat IFKV131 telah diselesaikan");
}

// -----------------------------------------------------------------------------
// Skenario 6: Prasyarat belum terpenuhi (IFAP172 tanpa IFKV131)
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 6: Prasyarat belum terpenuhi (IFAP172 tanpa IFKV131)");
  const ifap172 = findCourseByCode("IFAP172");

  // Mahasiswa belum menyelesaikan IFKV131
  const checkUnmet = checkPrerequisites(ifap172, []);
  assert.equal(checkUnmet.isValid, false, "IFAP172 harus ditolak jika IFKV131 belum lulus");
  assert.deepEqual(checkUnmet.missingPrerequisites, ["IFKV131"]);
  console.log("  [PASS] IFAP172 ditolak dengan pesan prasyarat IFKV131 belum terpenuhi");
}

// -----------------------------------------------------------------------------
// Skenario 7: Pengambilan lintas semester (IFPT281 Sem 3 diambil awal dengan IFPT180)
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 7: Pengambilan lintas semester (IFPT281 Sem 3 diambil mahasiswa Sem 2)");
  const ifpt281 = findCourseByCode("IFPT281");
  assert.ok(ifpt281, "IFPT281 harus ditemukan di db.json");
  assert.equal(ifpt281.recommendedSemester, 3, "IFPT281 adalah mata kuliah Semester 3");
  assert.deepEqual(ifpt281.prerequisites, ["IFPT180"], "IFPT281 memerlukan IFPT180");

  // Mahasiswa berada di Semester 2, tetapi telah menyelesaikan IFPT180 dari Semester 0
  const studentData = { currentSemester: 2, gpa: 3.50 };
  const history = [{ courseCode: "IFPT180", creditsEarned: 2, status: "completed" }];

  const result = validateStudyPlan([ifpt281], studentData, history);
  assert.equal(result.isValid, true, "Pengambilan lintas semester harus valid selama prasyarat terpenuhi");
  assert.equal(result.errors.length, 0);
  console.log("  [PASS] IFPT281 (Sem 3) berhasil diambil di Sem 2 karena prasyarat IFPT180 terpenuhi");
}

// -----------------------------------------------------------------------------
// Skenario 8: Pemilihan mata kuliah pilihan (Electives: IFKV535, IFKV533)
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 8: Pemilihan mata kuliah pilihan (Electives dari Semester 9)");
  assert.equal(ELECTIVE_COURSES.length, 11, "Harus ada 11 mata kuliah pilihan bertipe Elective di db.json");

  const ifkv535 = findCourseByCode("IFKV535"); // Computer Vision (3 SKS, prereq: IFKV332)
  assert.ok(ifkv535, "IFKV535 harus ditemukan di db.json");
  assert.equal(ifkv535.type, "Elective");

  // Mahasiswa telah lulus IFKV332 dan memilih IFKV535
  const result = validateStudyPlan([ifkv535], { gpa: 3.40 }, [
    { courseCode: "IFKV332", creditsEarned: 3, status: "completed" },
  ]);
  assert.equal(result.isValid, true, "Pemilihan mata kuliah pilihan harus valid jika prasyarat terpenuhi");
  console.log("  [PASS] Mata kuliah pilihan (IFKV535) dapat dipilih mahasiswa");
}

// -----------------------------------------------------------------------------
// Skenario 9: Pencegahan mata kuliah duplikat
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 9: Pencegahan mata kuliah duplikat dalam satu rencana studi");
  const duplicatePlan = [
    findCourseByCode("IFAP171"),
    findCourseByCode("IFAP171"), // Dipilih 2 kali
  ];

  const result = validateStudyPlan(duplicatePlan, { gpa: 3.50 }, []);
  assert.equal(result.isValid, false, "Rencana studi dengan mata kuliah duplikat harus ditolak");
  assert.ok(
    result.errors.some((e) => e.includes("Duplikasi mata kuliah")),
    "Harus memuat pesan error duplikasi"
  );
  console.log("  [PASS] Duplikasi mata kuliah (IFAP171 x2) berhasil dicegah");
}

// -----------------------------------------------------------------------------
// Skenario 10: Penanganan data prasyarat tidak valid
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 10: Penanganan data prasyarat tidak valid (null/undefined/non-array)");
  const malformedCourseNull = { code: "TEST01", name: "Uji Null", credits: 3, prerequisites: null };
  const checkNull = checkPrerequisites(malformedCourseNull, []);
  assert.equal(checkNull.isValid, true, "Prerequisites null harus ditangani secara aman (dianggap tanpa prasyarat)");

  const malformedCourseUndef = { code: "TEST02", name: "Uji Undefined", credits: 3 };
  const checkUndef = checkPrerequisites(malformedCourseUndef, []);
  assert.equal(checkUndef.isValid, true, "Prerequisites undefined harus ditangani secara aman");

  const checkEmptyObj = checkPrerequisites(null, []);
  assert.equal(checkEmptyObj.isValid, false);
  console.log("  [PASS] Data prasyarat tidak valid ditangani secara defensif tanpa error");
}

// -----------------------------------------------------------------------------
// Skenario 11: Riwayat mahasiswa yang belum memiliki informasi kelulusan memadai
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 11: Riwayat mahasiswa tanpa informasi kelulusan memadai");
  // Template studentCourses: creditsEarned null, grade null, status completed
  const unconfirmedHistory = [
    {
      courseCode: "IFKV131",
      status: "completed",
      grade: null,
      creditsEarned: null, // Belum terverifikasi
      note: "Ganti dengan data akademik mahasiswa yang sebenarnya.",
    },
  ];

  // Hitung completed credits
  const creditsResult = calculateCompletedCredits(unconfirmedHistory);
  assert.equal(creditsResult.completedCredits, 0, "creditsEarned: null TIDAK boleh dihitung sebagai SKS lulus");
  assert.equal(creditsResult.hasUnverifiedRecords, true);
  assert.equal(creditsResult.unconfirmedCourses.length, 1);

  // Jika mata kuliah berikutnya (IFAP172) memerlukan IFKV131:
  // Sistem TIDAK boleh menganggap otomatis lulus karena informasinya belum memadai
  const ifap172 = findCourseByCode("IFAP172");
  const planResult = validateStudyPlan([ifap172], { gpa: 3.50 }, unconfirmedHistory);
  assert.equal(planResult.isValid, false, "Tidak boleh otomatis meloloskan prasyarat jika kelulusan belum pasti");
  assert.ok(
    planResult.unconfirmedNotes.some((n) => n.includes("perlu dikonfirmasi")),
    "Harus ada catatan bahwa status prasyarat perlu dikonfirmasi"
  );
  console.log("  [PASS] creditsEarned: null tidak dihitung dan status prasyarat ditandai perlu konfirmasi");
}

// -----------------------------------------------------------------------------
// Skenario 12: Katalog semester 9 tidak otomatis dianggap sebagai kewajiban
// -----------------------------------------------------------------------------
{
  console.log("\nSkenario 12: Katalog semester 9 bukan kewajiban menyeluruh mahasiswa");
  const totalAllCourses = COURSES.length;
  const totalAllCredits = calculateTotalCredits(COURSES);
  assert.equal(totalAllCourses, 90, "Total seluruh mata kuliah di db.json adalah 90");
  assert.equal(totalAllCredits, 286, "Total SKS seluruh mata kuliah di db.json adalah 286 SKS");

  // Target kelulusan kurikulum
  assert.equal(
    TOTAL_GRADUATION_CREDITS,
    151,
    "Target kelulusan adalah 151 SKS, BUKAN 286 SKS"
  );

  // Paket reguler Sem 1-8 adalah 142 SKS
  const regularCredits = calculateTotalCredits(REGULAR_COURSES);
  assert.equal(regularCredits, 142, "Beban paket reguler Semester 1-8 adalah 142 SKS");

  // Mahasiswa hanya memerlukan 151 - 142 = 9 SKS mata kuliah pilihan dari Semester 9
  const remainingForGraduation = TOTAL_GRADUATION_CREDITS - regularCredits;
  assert.equal(remainingForGraduation, 9, "Sisa SKS menuju 151 adalah 9 SKS mata kuliah pilihan");

  // getAvailableCourses secara default TIDAK memasukkan seluruh mata kuliah MBKM (IFKM...)
  const availableDefault = getAvailableCourses(COURSES, [], [], { includeMBKM: false });
  const hasAutoMBKM = availableDefault.some((c) => c.code.startsWith("IFKM"));
  assert.equal(hasAutoMBKM, false, "Studi independen MBKM tidak otomatis dimasukkan ke rekomendasi");
  console.log("  [PASS] Target kelulusan 151 SKS terjaga (bukan 286 SKS) & MBKM tidak otomatis diwajibkan");
}

console.log("\n===================================================================");
console.log("  SELURUH 12 SKENARIO PENGUJIAN RESMI BERHASIL 100%!");
console.log("===================================================================");
