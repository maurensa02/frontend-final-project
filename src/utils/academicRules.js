import {
  TOTAL_GRADUATION_CREDITS,
  ACADEMIC_RULES,
  COURSES,
  REGULAR_COURSES,
  ELECTIVE_COURSES,
  PREREQUISITE_COURSES,
  UNVERIFIED_COURSES,
} from "../data/curriculumData.js";

import {
  getMaximumCredits,
  getStudentGPA,
  calculateCompletedCredits,
  calculateRemainingCredits,
  calculateTotalCredits,
} from "./creditCalculator.js";

import {
  checkPrerequisites,
  getAvailableCourses,
  findCourseByCode,
} from "./prerequisiteValidator.js";

/**
 * Menghitung persentase kemajuan menuju kelulusan 151 SKS.
 *
 * @param {number} completedCredits Total SKS yang telah lulus
 * @returns {number} Persentase progres (0 - 100%)
 */
export function calculateProgressPercentage(completedCredits = 0) {
  const credits = Number(completedCredits) || 0;
  const percentage = (credits / TOTAL_GRADUATION_CREDITS) * 100;
  return Math.min(100, Math.max(0, Number(percentage.toFixed(1))));
}

export {
  TOTAL_GRADUATION_CREDITS,
  ACADEMIC_RULES,
  COURSES,
  REGULAR_COURSES,
  ELECTIVE_COURSES,
  PREREQUISITE_COURSES,
  UNVERIFIED_COURSES,
  getMaximumCredits,
  getStudentGPA,
  calculateCompletedCredits,
  calculateRemainingCredits,
  calculateTotalCredits,
  checkPrerequisites,
  getAvailableCourses,
  findCourseByCode,
};
