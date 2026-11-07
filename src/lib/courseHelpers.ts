/**
 * Canonical course normalization utility for RxFusion.
 * RxFusion is exclusively built for Doctor of Pharmacy (Pharm.D).
 * Standardizes all academic inputs to canonical internal representation:
 * - "Pharm D" / "Pharm.D"
 */
export function normalizeCourseName(courseStr: string | null | undefined): string {
  if (!courseStr) return "Pharm D";
  const trimmed = courseStr.trim();
  if (!trimmed) return "Pharm D";

  const lower = trimmed.toLowerCase().replace(/\./g, "");

  if (lower === "pharm d" || lower === "pharmd" || lower.includes("pharm")) {
    return "Pharm D";
  }

  return "Pharm D";
}

/**
 * Returns supported academic year index [1-6] for Pharm.D.
 */
export function getSemestersForCourseYear(course: string, currentYear: string): number[] {
  void course;
  const yearStr = (currentYear || "").toLowerCase();
  
  if (yearStr.includes("1st") || yearStr.includes("first")) return [1];
  if (yearStr.includes("2nd") || yearStr.includes("second")) return [2];
  if (yearStr.includes("3rd") || yearStr.includes("third")) return [3];
  if (yearStr.includes("4th") || yearStr.includes("fourth")) return [4];
  if (yearStr.includes("5th") || yearStr.includes("fifth")) return [5];
  if (yearStr.includes("6th") || yearStr.includes("sixth") || yearStr.includes("intern")) return [6];
  
  return [1];
}

/**
 * Returns supported academic years for Pharm.D (Years 1 to 6).
 */
export function getYearsForCourse(course?: string): number[] {
  void course;
  return [1, 2, 3, 4, 5, 6];
}

/**
 * Returns short badge or display name for course.
 */
export function getCourseShortName(course?: string): string {
  void course;
  return "Pharm.D";
}

/**
 * Returns formatted year label for Pharm.D.
 * Accepts (year, course) or (course, year).
 */
export function getYearLabel(yearOrCourse?: number | string, courseOrYear?: number | string): string {
  let y = 1;
  if (typeof yearOrCourse === "number") {
    y = yearOrCourse;
  } else if (typeof courseOrYear === "number") {
    y = courseOrYear;
  } else if (!isNaN(Number(yearOrCourse))) {
    y = Number(yearOrCourse);
  } else if (!isNaN(Number(courseOrYear))) {
    y = Number(courseOrYear);
  }

  if (y === 6) return "6th Year (Internship)";
  const suffix = y === 1 ? "st" : y === 2 ? "nd" : y === 3 ? "rd" : "th";
  return `${y}${suffix} Year`;
}

/**
 * Returns all supported academic years for Pharm.D (Years 1 to 6).
 */
export function getSupportedYears(course?: string): number[] {
  void course;
  return [1, 2, 3, 4, 5, 6];
}

/**
 * Returns formal title for Pharm.D.
 */
export function getCourseFullName(course?: string): string {
  void course;
  return "Doctor of Pharmacy (Pharm.D)";
}

/**
 * Returns standardized short badge label.
 */
export function getCourseDisplayBadge(course?: string): string {
  void course;
  return "Pharm.D";
}
