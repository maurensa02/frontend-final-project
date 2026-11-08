import assert from "node:assert/strict";
import { COURSES } from "../src/data/curriculumData.js";
import { checkPrerequisites } from "../src/utils/prerequisiteValidator.js";
import { validateStudyPlan } from "../src/services/studyPlanService.js";

console.log("===================================================================");
console.log("  PENGUJIAN VALIDASI TAB SEMESTER 1-8 & KATALOG 90 MATA KULIAH");
console.log("===================================================================\n");

// Definisi tab katalog
const CATEGORY_TABS = [
  { id: "all", label: "Semua", expectedCount: 90 },
  { id: "sem1", label: "Semester 1", expectedCount: 6, expectedSemester: 1 },
  { id: "sem2", label: "Semester 2", expectedCount: 8, expectedSemester: 2 },
  { id: "sem3", label: "Semester 3", expectedCount: 7, expectedSemester: 3 },
  { id: "sem4", label: "Semester 4", expectedCount: 7, expectedSemester: 4 },
  { id: "sem5", label: "Semester 5", expectedCount: 7, expectedSemester: 5 },
  { id: "sem6", label: "Semester 6", expectedCount: 7, expectedSemester: 6 },
  { id: "sem7", label: "Semester 7", expectedCount: 5, expectedSemester: 7 },
  { id: "sem8", label: "Semester 8", expectedCount: 3, expectedSemester: 8 },
  { id: "sem0", label: "Semester 0", expectedCount: 5, expectedSemester: 0 },
  { id: "elective", label: "Elective", expectedCount: 11 },
  { id: "mbkm", label: "MBKM / Studi Independen", expectedCount: 17 },
  { id: "english", label: "Advanced English", expectedCount: 6 },
];

function isCourseMatchingTab(course, tabId) {
  switch (tabId) {
    case "sem1":
      return course.recommendedSemester === 1;
    case "sem2":
      return course.recommendedSemester === 2;
    case "sem3":
      return course.recommendedSemester === 3;
    case "sem4":
      return course.recommendedSemester === 4;
    case "sem5":
      return course.recommendedSemester === 5;
    case "sem6":
      return course.recommendedSemester === 6;
    case "sem7":
      return course.recommendedSemester === 7;
    case "sem8":
      return course.recommendedSemester === 8;
    case "sem0":
      return course.recommendedSemester === 0;
    case "elective":
      return course.type === "Elective";
    case "mbkm":
      return typeof course.code === "string" && course.code.startsWith("IFKM");
    case "english":
      return course.recommendedSemester === 9 && course.type === "General";
    case "all":
    default:
      return true;
  }
}

// 1. Pengujian Jumlah Tab & Urutan
console.log("Pengujian 1: Verifikasi 13 Tab Kategori & Urutan Tepat");
assert.equal(CATEGORY_TABS.length, 13, "Harus ada tepat 13 tab");
const expectedLabels = [
  "Semua",
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
  "Semester 0",
  "Elective",
  "MBKM / Studi Independen",
  "Advanced English",
];
assert.deepEqual(
  CATEGORY_TABS.map((t) => t.label),
  expectedLabels,
  "Urutan label tab harus tepat sesuai spesifikasi"
);
console.log("  [PASS] 13 tab terdefinisi dengan urutan yang benar");

// 2. Pengujian Jumlah Mata Kuliah per Tab & Kepastian Tidak Ada Mata Kuliah yang Salah Semester
console.log("\nPengujian 2: Verifikasi Jumlah Mata Kuliah & Semester Filter");
for (const tab of CATEGORY_TABS) {
  const matches = COURSES.filter((c) => isCourseMatchingTab(c, tab.id));
  assert.equal(
    matches.length,
    tab.expectedCount,
    `Tab ${tab.label} harus memiliki ${tab.expectedCount} mata kuliah (ditemukan ${matches.length})`
  );

  // Jika tab semester, pastikan seluruh mata kuliah benar-benar memiliki recommendedSemester yang sesuai
  if (typeof tab.expectedSemester === "number") {
    const wrongSemesterCourses = matches.filter(
      (c) => c.recommendedSemester !== tab.expectedSemester
    );
    assert.equal(
      wrongSemesterCourses.length,
      0,
      `Tab ${tab.label} tidak boleh memuat mata kuliah di luar semester ${tab.expectedSemester}`
    );
  }

  // Jika tab Elective, pastikan tipe adalah Elective
  if (tab.id === "elective") {
    assert.ok(matches.every((c) => c.type === "Elective"));
  }

  // Jika tab MBKM, pastikan kode diawali IFKM
  if (tab.id === "mbkm") {
    assert.ok(matches.every((c) => String(c.code).startsWith("IFKM")));
  }

  // Jika tab Advanced English, pastikan Sem 9 & General
  if (tab.id === "english") {
    assert.ok(matches.every((c) => c.recommendedSemester === 9 && c.type === "General"));
  }

  console.log(`  [PASS] ${tab.label}: ${matches.length} mata kuliah (Semester valid: 100%)`);
}

// 3. Verifikasi Total Keseluruhan Mata Kuliah Tetap 90
console.log("\nPengujian 3: Verifikasi Konsistensi Data Sumber (90 Mata Kuliah)");
assert.equal(COURSES.length, 90, "Total mata kuliah kurikulum harus tepat 90");
const sem1to8Count = [1, 2, 3, 4, 5, 6, 7, 8].reduce(
  (sum, s) => sum + COURSES.filter((c) => c.recommendedSemester === s).length,
  0
);
assert.equal(sem1to8Count, 50, "Total Semester 1-8 harus tepat 50 mata kuliah (pengganti tab Reguler)");
console.log(`  [PASS] Total Semester 1-8: ${sem1to8Count} mata kuliah`);
console.log(`  [PASS] Tab Semua: ${COURSES.length} mata kuliah`);

// 4. Pencarian kode dan nama bersamaan dengan tab semester
console.log("\nPengujian 4: Pencarian Kode dan Nama bersama Tab Semester");
{
  // Pencarian IFAP171 di Semester 1
  const search1 = COURSES.filter(
    (c) => isCourseMatchingTab(c, "sem1") && c.code.toLowerCase().includes("ifap171")
  );
  assert.equal(search1.length, 1);
  assert.equal(search1[0].code, "IFAP171");

  // Pencarian IFAP171 di Semester 2 (harus 0 karena IFAP171 ada di Semester 1)
  const search2 = COURSES.filter(
    (c) => isCourseMatchingTab(c, "sem2") && c.code.toLowerCase().includes("ifap171")
  );
  assert.equal(search2.length, 0);

  // Pencarian nama "Struktur Data" di Semester 2
  const search3 = COURSES.filter(
    (c) => isCourseMatchingTab(c, "sem2") && c.name.toLowerCase().includes("struktur data")
  );
  assert.equal(search3.length, 1);
  assert.equal(search3[0].code, "IFAP172");
  console.log("  [PASS] Pencarian kode dan nama berfungsi bersama filter tab semester");
}

// 5. Verifikasi Kelayakan Prasyarat & Tombol Ambil
console.log("\nPengujian 5: Status Kelayakan Prasyarat pada Tab Semester");
{
  function evaluateEligibility(course, verifiedPassedSet, unconfirmedCodes) {
    const code = String(course.code).trim().toUpperCase();
    const isPassed = verifiedPassedSet.has(code);
    const prereqCheck = checkPrerequisites(course, Array.from(verifiedPassedSet), unconfirmedCodes);
    if (isPassed) return { canSelect: false, status: "passed" };
    if (prereqCheck.needsConfirmation) return { canSelect: false, status: "needs_confirmation" };
    if (!prereqCheck.isValid) return { canSelect: false, status: "prereq_unmet" };
    return { canSelect: true, status: "eligible" };
  }

  const passedCodes = new Set(["IFKV131"]);
  const unconfirmed = [];

  // IFKV131 di Semester 1 (sudah lulus)
  const ifkv131 = COURSES.find((c) => c.code === "IFKV131");
  const elig1 = evaluateEligibility(ifkv131, passedCodes, unconfirmed);
  assert.equal(elig1.canSelect, false);
  assert.equal(elig1.status, "passed");

  // IFAP172 di Semester 2 (prasyarat IFKV131 sudah terpenuhi)
  const ifap172 = COURSES.find((c) => c.code === "IFAP172");
  const elig2 = evaluateEligibility(ifap172, passedCodes, unconfirmed);
  assert.equal(elig2.canSelect, true);
  assert.equal(elig2.status, "eligible");

  // IFAP272 di Semester 3 (prasyarat IFPT182 belum lulus) -> tetap tampil di Semester 3, tombol nonaktif
  const ifap272 = COURSES.find((c) => c.code === "IFAP272");
  const elig3 = evaluateEligibility(ifap272, passedCodes, unconfirmed);
  assert.equal(elig3.canSelect, false);
  assert.equal(elig3.status, "prereq_unmet");

  console.log("  [PASS] IFKV131 (Sem 1) -> Sudah Lulus (canSelect: false)");
  console.log("  [PASS] IFAP172 (Sem 2) -> Memenuhi Syarat (canSelect: true)");
  console.log("  [PASS] IFAP272 (Sem 3) -> Prasyarat Belum Terpenuhi (canSelect: false, tetap tampil)");
}

// 6. Penambahan & Penghapusan pada KRS
console.log("\nPengujian 6: Penambahan & Penghapusan KRS");
{
  let selected = [];
  const c1 = COURSES.find((c) => c.code === "IFAP171"); // 6 SKS
  const c2 = COURSES.find((c) => c.code === "IFAP172"); // 3 SKS

  selected = [...selected, c1, c2];
  assert.equal(selected.length, 2);

  const val = validateStudyPlan(selected, { gpa: 3.4 }, []);
  assert.equal(val.totalSelectedCredits, 9);
  assert.equal(val.maxAllowedCredits, 23);

  // Hapus c1
  selected = selected.filter((c) => c.code !== "IFAP171");
  assert.equal(selected.length, 1);
  assert.equal(selected[0].code, "IFAP172");
  console.log("  [PASS] Operasi KRS dan penghitungan SKS berjalan sempurna");
}

console.log("\n===================================================================");
console.log("  SELURUH 6 PENGUJIAN TAB SEMESTER 1-8 BERHASIL 100%!");
console.log("===================================================================\n");
