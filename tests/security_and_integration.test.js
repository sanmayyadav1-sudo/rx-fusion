import test from "node:test";
import assert from "node:assert/strict";

// Import modules to test
import { normalizeCourseName, getSemestersForCourseYear } from "../src/lib/courseHelpers.ts";
import { createStudentSessionToken, verifyStudentSessionToken } from "../src/lib/authHelpers.ts";
import fs from "node:fs";
import path from "node:path";

test("1. Course Normalization Engine", (t) => {
  assert.equal(normalizeCourseName("M.Pharm"), "M Pharm");
  assert.equal(normalizeCourseName("M Pharm"), "M Pharm");
  assert.equal(normalizeCourseName("m.pharm."), "M Pharm");
  assert.equal(normalizeCourseName("mpharm"), "M Pharm");

  assert.equal(normalizeCourseName("Pharm.D"), "Pharm D");
  assert.equal(normalizeCourseName("Pharm D"), "Pharm D");
  assert.equal(normalizeCourseName("pharmd"), "Pharm D");

  assert.equal(normalizeCourseName("B.Pharm"), "B Pharm");
  assert.equal(normalizeCourseName("B Pharm"), "B Pharm");

  assert.equal(normalizeCourseName("D.Pharm"), "D Pharm");
  assert.equal(normalizeCourseName("D Pharm"), "D Pharm");
});

test("2. Semester Resolution Engine for M.Pharm & Pharm.D", (t) => {
  assert.deepEqual(getSemestersForCourseYear("M Pharm", "1st Year"), [1, 2]);
  assert.deepEqual(getSemestersForCourseYear("M.Pharm.", "2nd Year"), [3, 4]);
  assert.equal(normalizeCourseName("M Pharm"), "M Pharm");

  assert.deepEqual(getSemestersForCourseYear("Pharm.D", "1st Year"), [1]);
  assert.deepEqual(getSemestersForCourseYear("Pharm.D", "5th Year"), [5]);
  assert.deepEqual(getSemestersForCourseYear("Pharm.D", "6th Year (Internship)"), [6]);
});

test("3. Signed Session Token Authentication", async (t) => {
  const studentId = "std_9988776655";
  const email = "student@rxfusion.edu";

  // Create token
  const token = await createStudentSessionToken(studentId, email);
  assert.ok(token && typeof token === "string");
  assert.equal(token.split(".").length, 2);

  // Verify token
  const payload = await verifyStudentSessionToken(token);
  assert.ok(payload);
  assert.equal(payload.studentId, studentId);
  assert.equal(payload.email, email);

  // Tampered signature should fail
  const parts = token.split(".");
  const tamperedToken = `${parts[0]}.invalid_signature_hash`;
  const tamperedPayload = await verifyStudentSessionToken(tamperedToken);
  assert.equal(tamperedPayload, null);

  // Invalid format should fail
  assert.equal(await verifyStudentSessionToken("not_a_jwt_token"), null);
  assert.equal(await verifyStudentSessionToken(""), null);
});

test("4. Migration SQL File Integrity Verification", (t) => {
  const migrationPath = path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260903_add_labs_to_bookmarks_check.sql"
  );
  assert.ok(fs.existsSync(migrationPath), "Migration file 20260903_add_labs_to_bookmarks_check.sql must exist");

  const sqlContent = fs.readFileSync(migrationPath, "utf8");
  assert.ok(sqlContent.includes("student_bookmarks_content_type_check"), "SQL must drop/add student_bookmarks constraint");
  assert.ok(sqlContent.includes("'labs'"), "SQL must include 'labs' in CHECK constraint array");
  assert.ok(sqlContent.includes("student_recent_activity_content_type_check"), "SQL must update student_recent_activity constraint");
});

test("5. Search Infrastructure Verification", (t) => {
  const searchApiPath = path.join(process.cwd(), "src", "app", "api", "search", "route.ts");
  assert.ok(fs.existsSync(searchApiPath), "Search API route must exist");
  const content = fs.readFileSync(searchApiPath, "utf8");
  assert.ok(content.includes("flashcards"), "Search API must query flashcards");
  assert.ok(content.includes("question_bank"), "Search API must query question bank");
  assert.ok(content.includes("question_papers"), "Search API must query question papers");
});
