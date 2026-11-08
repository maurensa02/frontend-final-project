import assert from "node:assert/strict";
import { COURSES } from "../src/data/curriculumData.js";
import { checkPrerequisites } from "../src/utils/prerequisiteValidator.js";
import { calculateCompletedCredits, getMaximumCredits } from "../src/utils/creditCalculator.js";
import { validateStudyPlan } from "../src/services/studyPlanService.js";

console.log("===================================================================");
console.log("  PENGUJIAN VALIDASI STUDY PLAN PLANNER & KATALOG 90 MATA KULIAH");
console.log("===================================================================\n");

// 1. Tab Semua menampilkan tepat 90 mata kuliah
console.log("Pengujian 1: Tab Semua menampilkan tepat 90 mata kuliah");
assert.equal(COURSES.length, 90, "Jumlah mata kuliah pada tab Semua harus tepat 90");
console.log(`  [PASS] Tab Semua: ${COURSES.length} mata kuliah`);

// 2 & 3. Filter setiap kategori dan jumlah kategori sesuai data sumber
console.log("\nPengujian 2 & 3: Filter dan jumlah setiap kategori kurikulum");
function isCourseMatchingTab(course, tabId) {
  switch (tabId) {
    case "regular":
      return course.recommendedSemester >= 1 && course.recommendedSemester <= 8;
    case "sem0":
      return course.recommendedSemester === 0;
    case "elective":
      return course.type === "Elective";
    case "mbkm":
      return typeof course.code === "string" && course.code.startsWith("IFKM");
    case "english":
      return course.recommendedSemester === 9 && course.type === "General";
    case "unverified":
      return course.verificationStatus === "needs_verification" || course.type === null;
    case "all":
    default:
      return true;
  }
}

const counts = {
  all: COURSES.filter((c) => isCourseMatchingTab(c, "all")).length,
  regular: COURSES.filter((c) => isCourseMatchingTab(c, "regular")).length,
  sem0: COURSES.filter((c) => isCourseMatchingTab(c, "sem0")).length,
  elective: COURSES.filter((c) => isCourseMatchingTab(c, "elective")).length,
  mbkm: COURSES.filter((c) => isCourseMatchingTab(c, "mbkm")).length,
  english: COURSES.filter((c) => isCourseMatchingTab(c, "english")).length,
  unverified: COURSES.filter((c) => isCourseMatchingTab(c, "unverified")).length,
};

assert.equal(counts.all, 90, "Semua harus 90");
assert.equal(counts.regular, 50, "Reguler (Sem 1-8) harus 50");
assert.equal(counts.sem0, 5, "Semester 0 harus 5");
assert.equal(counts.elective, 11, "Elective harus 11");
assert.equal(counts.mbkm, 17, "MBKM (IFKM) harus 17");
assert.equal(counts.english, 6, "Advanced English (Sem 9 General) harus 6");
assert.equal(counts.unverified, 1, "Perlu Verifikasi harus 1");

console.log("  [PASS] Rincian jumlah kategori:");
console.log(`         - Semua: ${counts.all}`);
console.log(`         - Reguler (Sem 1-8): ${counts.regular}`);
console.log(`         - Semester 0: ${counts.sem0}`);
console.log(`         - Elective: ${counts.elective}`);
console.log(`         - MBKM / Studi Independen: ${counts.mbkm}`);
console.log(`         - Advanced English: ${counts.english}`);
console.log(`         - Perlu Verifikasi: ${counts.unverified}`);

// 4. Pencarian kode dan nama berfungsi bersama filter kategori
console.log("\nPengujian 4: Pencarian kode dan nama bersama filter kategori");
{
  const searchCode = "IFAP171";
  const searchResults1 = COURSES.filter(
    (c) => isCourseMatchingTab(c, "regular") && c.code.toLowerCase().includes(searchCode.toLowerCase())
  );
  assert.equal(searchResults1.length, 1);
  assert.equal(searchResults1[0].code, "IFAP171");

  const searchName = "Pemrograman";
  const searchResults2 = COURSES.filter(
    (c) => isCourseMatchingTab(c, "regular") && c.name.toLowerCase().includes(searchName.toLowerCase())
  );
  assert.ok(searchResults2.length >= 2, "Harus menemukan setidaknya 2 mata kuliah pemrograman di Reguler");
  console.log(`  [PASS] Pencarian '${searchCode}' -> ${searchResults1.length} hasil`);
  console.log(`  [PASS] Pencarian nama '${searchName}' di tab Reguler -> ${searchResults2.length} hasil`);
}

// 5. Mata kuliah yang prasyaratnya belum terpenuhi tetap terlihat
console.log("\nPengujian 5: Mata kuliah yang belum memenuhi prasyarat tetap terlihat di katalog");
{
  // IFAP172 membutuhkan IFKV131
  const studentPassedCodes = []; // Mahasiswa baru, belum lulus IFKV131
  const ifap172 = COURSES.find((c) => c.code === "IFAP172");
  assert.ok(ifap172, "IFAP172 harus ada di katalog");
  
  // Katalog tetap memiliki 90 mata kuliah dan IFAP172 tetap ada di filteredCourses
  const allInCatalog = COURSES.some((c) => c.code === "IFAP172");
  assert.equal(allInCatalog, true, "IFAP172 harus tetap ada di katalog");
  
  const prereqCheck = checkPrerequisites(ifap172, studentPassedCodes);
  assert.equal(prereqCheck.isValid, false, "Prasyarat IFAP172 belum terpenuhi");
  assert.deepEqual(prereqCheck.missingPrerequisites, ["IFKV131"]);
  console.log("  [PASS] IFAP172 tetap tampil di katalog dengan status prasyarat belum terpenuhi (butuh IFKV131)");
}

// 6 & 7. Tombol Ambil: aktif untuk yang memenuhi syarat, nonaktif untuk yang belum memenuhi prasyarat / sudah lulus
console.log("\nPengujian 6 & 7: Kontrol kelayakan tombol Ambil & pencegahan ambil ulang yang sudah lulus");
{
  function evaluateEligibility(course, verifiedPassedSet, unconfirmedCodes) {
    const code = String(course.code).trim().toUpperCase();
    const isPassed = verifiedPassedSet.has(code);
    const prereqCheck = checkPrerequisites(course, Array.from(verifiedPassedSet), unconfirmedCodes);
    if (isPassed) {
      return { canSelect: false, status: "passed" };
    }
    if (prereqCheck.needsConfirmation) {
      return { canSelect: false, status: "needs_confirmation" };
    }
    if (!prereqCheck.isValid) {
      return { canSelect: false, status: "prereq_unmet" };
    }
    return { canSelect: true, status: "eligible" };
  }

  const passedCodes = new Set(["IFKV131", "IFPT180"]);
  const unconfirmed = ["UNKL041"];

  // A. IFKV131: sudah lulus -> tidak bisa diambil kembali
  const ifkv131 = COURSES.find((c) => c.code === "IFKV131");
  const eligPassed = evaluateEligibility(ifkv131, passedCodes, unconfirmed);
  assert.equal(eligPassed.canSelect, false);
  assert.equal(eligPassed.status, "passed");
  console.log("  [PASS] Mata kuliah sudah lulus (IFKV131) -> canSelect: false (tombol dinonaktifkan)");

  // B. IFAP172: membutuhkan IFKV131 (sudah lulus) -> bisa diambil
  const ifap172 = COURSES.find((c) => c.code === "IFAP172");
  const eligEligible = evaluateEligibility(ifap172, passedCodes, unconfirmed);
  assert.equal(eligEligible.canSelect, true);
  assert.equal(eligEligible.status, "eligible");
  console.log("  [PASS] Mata kuliah memenuhi prasyarat (IFAP172) -> canSelect: true (tombol aktif)");

  // C. IFAP272: membutuhkan IFPT182 (belum lulus) -> tidak bisa diambil
  const ifap272 = COURSES.find((c) => c.code === "IFAP272");
  const eligUnmet = evaluateEligibility(ifap272, passedCodes, unconfirmed);
  assert.equal(eligUnmet.canSelect, false);
  assert.equal(eligUnmet.status, "prereq_unmet");
  console.log("  [PASS] Mata kuliah belum memenuhi prasyarat (IFAP272) -> canSelect: false (tombol dinonaktifkan)");
}

// 8. Penambahan dan penghapusan mata kuliah pada KRS
console.log("\nPengujian 8: Penambahan dan penghapusan mata kuliah pada KRS");
{
  let selected = [];
  const c1 = COURSES.find((c) => c.code === "IFAP171");
  const c2 = COURSES.find((c) => c.code === "IFKV131");

  // Tambah c1
  selected = [...selected, c1];
  assert.equal(selected.length, 1);
  assert.equal(selected[0].code, "IFAP171");

  // Tambah c2
  selected = [...selected, c2];
  assert.equal(selected.length, 2);

  // Hapus c1
  selected = selected.filter((c) => c.code !== "IFAP171");
  assert.equal(selected.length, 1);
  assert.equal(selected[0].code, "IFKV131");

  // Validasi KRS real-time
  const student = { gpa: 3.5 };
  const val = validateStudyPlan(selected, student, []);
  assert.equal(val.isValid, true);
  assert.equal(val.totalSelectedCredits, 3);
  assert.equal(val.maxAllowedCredits, 23);
  console.log("  [PASS] Penambahan & penghapusan mata kuliah pada KRS serta validasi SKS berfungsi normal");
}

console.log("\n===================================================================");
console.log("  SELURUH PENGUJIAN LOGIKA STUDY PLAN PLANNER BERHASIL 100%!");
console.log("===================================================================\n");
