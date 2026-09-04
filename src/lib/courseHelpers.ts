/**
 * Canonical course normalization utility for RxFusion.
 * Standardizes all academic stream inputs to canonical internal database representation:
 * - "Pharm D"
 * - "B Pharm"
 * - "D Pharm"
 * - "M Pharm"
 */
export function normalizeCourseName(courseStr: string | null | undefined): string {
  if (!courseStr) return "";
  const trimmed = courseStr.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase().replace(/\./g, "");

  if (lower === "pharm d" || lower === "pharmd") return "Pharm D";
  if (lower === "b pharm" || lower === "bpharm") return "B Pharm";
  if (lower === "d pharm" || lower === "dpharm") return "D Pharm";
  if (lower === "m pharm" || lower === "mpharm") return "M Pharm";

  // Check substring matches if exact match failed
  if (lower.includes("pharm d") || lower.includes("pharmd")) return "Pharm D";
  if (lower.includes("b pharm") || lower.includes("bpharm")) return "B Pharm";
  if (lower.includes("d pharm") || lower.includes("dpharm")) return "D Pharm";
  if (lower.includes("m pharm") || lower.includes("mpharm")) return "M Pharm";

  return trimmed;
}

/**
 * Returns supported semester numbers for a given course and year string.
 */
export function getSemestersForCourseYear(course: string, currentYear: string): number[] {
  const normalizedCourse = normalizeCourseName(course);
  const yearStr = currentYear.toLowerCase();
  
  if (normalizedCourse === "Pharm D") {
    if (yearStr.includes("1st")) return [1];
    if (yearStr.includes("2nd")) return [2];
    if (yearStr.includes("3rd")) return [3];
    if (yearStr.includes("4th")) return [4];
    if (yearStr.includes("5th")) return [5];
    if (yearStr.includes("6th") || yearStr.includes("internship")) return [6];
    return [1];
  }

  if (normalizedCourse === "D Pharm") {
    if (yearStr.includes("1st")) return [1];
    if (yearStr.includes("2nd")) return [2];
    return [1];
  }

  if (normalizedCourse === "B Pharm") {
    if (yearStr.includes("1st")) return [1, 2];
    if (yearStr.includes("2nd")) return [3, 4];
    if (yearStr.includes("3rd")) return [5, 6];
    if (yearStr.includes("4th")) return [7, 8];
    return [1, 2];
  }

  if (normalizedCourse === "M Pharm") {
    if (yearStr.includes("1st")) return [1, 2];
    if (yearStr.includes("2nd")) return [3, 4];
    return [1, 2];
  }

  return [];
}

/**
 * Returns list of valid academic years for a given course.
 */
export function getYearsForCourse(courseName: string): number[] {
  const norm = normalizeCourseName(courseName);
  if (norm === "Pharm D") return [1, 2, 3, 4, 5, 6];
  if (norm === "B Pharm") return [1, 2, 3, 4];
  if (norm === "D Pharm") return [1, 2];
  if (norm === "M Pharm") return [1, 2];
  return [1, 2, 3, 4];
}

/**
 * Returns formatted full title for a course.
 */
export function getCourseFullName(courseName: string): string {
  const norm = normalizeCourseName(courseName);
  if (norm === "Pharm D") return "Pharm.D (Doctor of Pharmacy)";
  if (norm === "B Pharm") return "B.Pharm (Bachelor of Pharmacy)";
  if (norm === "D Pharm") return "D.Pharm (Diploma in Pharmacy)";
  if (norm === "M Pharm") return "M.Pharm (Master of Pharmacy)";
  return courseName;
}

/**
 * Returns clean short display name for a course.
 */
export function getCourseShortName(courseName: string): string {
  const norm = normalizeCourseName(courseName);
  if (norm === "Pharm D") return "Pharm.D";
  if (norm === "B Pharm") return "B.Pharm";
  if (norm === "D Pharm") return "D.Pharm";
  if (norm === "M Pharm") return "M.Pharm";
  return courseName;
}

/**
 * Returns human-readable academic year label.
 */
export function getYearLabel(year: number, courseName?: string): string {
  const norm = courseName ? normalizeCourseName(courseName) : "";
  switch (year) {
    case 1: return "1st Year";
    case 2: return "2nd Year";
    case 3: return "3rd Year";
    case 4: return "4th Year";
    case 5: return "5th Year";
    case 6: return norm === "Pharm D" ? "6th Year / Internship" : "6th Year";
    default: return `Year ${year}`;
  }
}

