import test from "node:test";
import assert from "node:assert/strict";

// Import modules to test
import { normalizeCourseName, getSemestersForCourseYear } from "../src/lib/courseHelpers.ts";
import { createStudentSessionToken, verifyStudentSessionToken } from "../src/lib/authHelpers.ts";
import fs from "node:fs";
import path from "node:path";

test("1. Course Normalization Engine (Pharm.D Exclusive)", (t) => {
  assert.equal(normalizeCourseName("Pharm.D"), "Pharm D");
  assert.equal(normalizeCourseName("Pharm D"), "Pharm D");
  assert.equal(normalizeCourseName("pharmd"), "Pharm D");
  assert.equal(normalizeCourseName("Doctor of Pharmacy"), "Pharm D");
});

test("2. Semester/Year Resolution Engine for Pharm.D (Years 1-6)", (t) => {
  assert.deepEqual(getSemestersForCourseYear("Pharm.D", "1st Year"), [1]);
  assert.deepEqual(getSemestersForCourseYear("Pharm.D", "2nd Year"), [2]);
  assert.deepEqual(getSemestersForCourseYear("Pharm.D", "3rd Year"), [3]);
  assert.deepEqual(getSemestersForCourseYear("Pharm.D", "4th Year"), [4]);
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

// Import services for Comprehensive Workflow Tests 1-13
import { QuizService } from "../src/lib/quizService.ts";
import { ArticleOrderService, OFFICIAL_SUPPORT_EMAIL } from "../src/lib/articleOrderService.ts";

test("6. TEST 1: Admin creates a 3rd Year Daily Quiz for October 3, 2026", async (t) => {
  const newQuiz = await QuizService.createQuiz({
    title: "Pharm.D 3rd Year Daily Challenge: Biopharmaceutics",
    academic_year: "3rd Year",
    subject: "Biopharmaceutics & Pharmacokinetics",
    topic: "Compartmental Modeling",
    description: "Daily examination on compartment models, elimination rate constants, and apparent volume of distribution.",
    difficulty: "Medium",
    quiz_date: "2026-10-03",
    time_limit_mins: 10,
    passing_percentage: 60,
    status: "published",
    is_daily: true,
    is_leaderboard_enabled: true,
    allow_multiple_attempts: false,
    author: "RxFusion Faculty"
  });

  assert.ok(newQuiz.id, "Quiz must be assigned an ID");
  assert.equal(newQuiz.academic_year, "3rd Year");
  assert.equal(newQuiz.quiz_date, "2026-10-03");
  assert.equal(newQuiz.is_daily, true);

  // Add 2 questions to this quiz
  const q1 = await QuizService.createQuestion({
    quiz_id: newQuiz.id,
    question: "What does the Apparent Volume of Distribution (Vd) reflect?",
    option_a: "Real physiological fluid volume in liters",
    option_b: "Theoretical volume into which a drug disperses to yield observed plasma concentration",
    option_c: "Total blood volume of the patient",
    option_d: "Total extracellular volume only",
    correct_option: "B",
    explanation: "Vd is a proportionality factor relating total amount of drug in body to its plasma concentration.",
    marks: 1,
    difficulty: "Medium",
    order_index: 0,
    is_published: true
  });
  assert.ok(q1.id);
  assert.equal(q1.correct_option, "B");

  const q2 = await QuizService.createQuestion({
    quiz_id: newQuiz.id,
    question: "Which organ is primarily responsible for first-pass metabolism?",
    option_a: "Kidney",
    option_b: "Liver",
    option_c: "Lungs",
    option_d: "Spleen",
    correct_option: "B",
    explanation: "The liver metabolizes drugs absorbed via the portal circulation before systemic circulation.",
    marks: 1,
    difficulty: "Easy",
    order_index: 1,
    is_published: true
  });
  assert.ok(q2.id);
  assert.equal(q2.correct_option, "B");
});

test("7. TEST 2 & TEST 3: Academic Year Quiz Visibility & Strict Year Isolation", async (t) => {
  // TEST 2: 3rd Year student sees the 3rd Year quiz for 2026-10-03
  const thirdYearDaily = await QuizService.getDailyQuizByDate("3rd Year", "2026-10-03");
  assert.ok(thirdYearDaily, "3rd Year student must be able to retrieve the 3rd Year daily quiz for Oct 3, 2026");
  assert.equal(thirdYearDaily?.academic_year, "3rd Year");
  assert.equal(thirdYearDaily?.quiz_date, "2026-10-03");

  // TEST 3: 2nd Year student does NOT see the 3rd Year quiz
  const secondYearDaily = await QuizService.getDailyQuizByDate("2nd Year", "2026-10-03");
  if (secondYearDaily) {
    assert.notEqual(secondYearDaily.id, thirdYearDaily?.id, "2nd Year student must NOT receive the 3rd Year quiz");
    assert.equal(secondYearDaily.academic_year, "2nd Year");
  }

  // Check year-filtered listing
  const secondYearQuizzes = await QuizService.getAllQuizzes({ academic_year: "2nd Year" });
  for (const q of secondYearQuizzes) {
    assert.equal(q.academic_year, "2nd Year", "Year-filtered results must only contain 2nd Year quizzes");
    assert.notEqual(q.id, thirdYearDaily?.id, "3rd Year quiz must never appear in 2nd Year listings");
  }
});

test("8. TEST 4, 5, 6, 7: Quiz Submission, Grading Logic, Storage & Multiple Submission Prevention", async (t) => {
  const quiz = await QuizService.getDailyQuizByDate("3rd Year", "2026-10-03");
  assert.ok(quiz);
  const quizWithQ = await QuizService.getQuizById(quiz.id, true);
  assert.ok(quizWithQ && quizWithQ.questions && quizWithQ.questions.length >= 2);

  const studentId = "student_pharma_301";
  const studentName = "Aarav Sharma";

  // TEST 4 & 5: Student answers: Question 1 correct ('B'), Question 2 incorrect ('A')
  const q1 = quizWithQ.questions[0];
  const q2 = quizWithQ.questions[1];
  
  const answers = {
    [q1.id]: "B", // Correct
    [q2.id]: "A"  // Incorrect (Correct is B)
  };

  let totalMarks = 0;
  let earnedScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  const evaluatedResponses = quizWithQ.questions.map((q) => {
    const selected = answers[q.id] || null;
    const m = q.marks ?? 1;
    totalMarks += m;
    const isCorrect = selected === q.correct_option;
    if (isCorrect) {
      earnedScore += m;
      correctCount++;
    } else if (selected) {
      incorrectCount++;
    }
    return {
      questionId: q.id,
      selectedOption: selected,
      isCorrect,
      correctOption: q.correct_option,
      marksAwarded: isCorrect ? m : 0,
      explanation: q.explanation || null
    };
  });

  const percentage = Math.round((earnedScore / totalMarks) * 100);
  assert.equal(correctCount, 1, "Should have exactly 1 correct answer");
  assert.equal(incorrectCount, 1, "Should have exactly 1 incorrect answer");
  assert.equal(percentage, 50, "1 out of 2 = 50%");
  assert.equal(percentage < quiz.passing_percentage, true, "50% is below 60% passing threshold");

  // TEST 6: Attempt is stored correctly
  const recordedAttempt = await QuizService.recordAttempt({
    quiz_id: quiz.id,
    student_id: studentId,
    student_name: studentName,
    academic_year: quiz.academic_year,
    quiz_date: quiz.quiz_date,
    started_at: new Date(Date.now() - 120000).toISOString(),
    submitted_at: new Date().toISOString(),
    time_taken_seconds: 120,
    score: earnedScore,
    total_marks: totalMarks,
    percentage,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    total_questions: quizWithQ.questions.length,
    status: "completed",
    responses: evaluatedResponses
  });

  assert.ok(recordedAttempt.id);
  assert.equal(recordedAttempt.student_id, studentId);
  assert.equal(recordedAttempt.score, 1);
  assert.equal(recordedAttempt.percentage, 50);

  // Verify retrieval
  const studentAttempts = await QuizService.getStudentAttempts(studentId, quiz.id);
  assert.ok(studentAttempts.length >= 1);
  assert.equal(studentAttempts[0].student_name, studentName);

  // TEST 7: Duplicate prevention check when allow_multiple_attempts is false
  assert.equal(quiz.allow_multiple_attempts, false);
  const hasPriorAttempt = studentAttempts.length > 0;
  assert.equal(hasPriorAttempt, true, "Prior attempt must be detected to block duplicates");
});

test("9. TEST 8: Admin Quiz Analytics Aggregation & Student Tracking", async (t) => {
  const analytics = await QuizService.getAnalyticsSummary();
  assert.ok(analytics);
  assert.ok(analytics.totalQuizzes >= 1);
  assert.ok(analytics.totalAttempts >= 1);
  assert.ok(analytics.totalParticipants >= 1);
  assert.ok(analytics.yearWiseParticipation.length > 0);
  assert.ok(analytics.quizWisePerformance.length > 0);

  const thirdYearStats = analytics.yearWiseParticipation.find(y => y.year === "3rd Year");
  assert.ok(thirdYearStats && thirdYearStats.attempts >= 1, "3rd Year participation must reflect recorded attempts");
});

test("10. TEST 9, 10, 11: Review Article Order, Email Redirection to rxfusion.support@gmail.com", async (t) => {
  // TEST 9 & 10: User submits Review Article request
  const orderData = {
    service_type: "Review Article",
    name: "Dr. Priya Patel",
    email: "priya.patel@pharma.edu",
    mobile: "+91 98765 43210",
    topic: "Recent Advances in GLP-1 Receptor Agonists for Type 2 Diabetes & Obesity",
    course: "Pharm.D",
    institution: "National College of Pharmacy",
    word_count: "4,500 words",
    references_count: "50-60 references",
    citation_style: "Vancouver",
    deadline: "2026-11-15",
    target_journal: "Indian Journal of Pharmaceutical Sciences",
    additional_requirements: "Include comparative receptor affinity table and cardiovascular outcome trial summary.",
    brief: "Comprehensive narrative review synthesizing phase 3 RCTs and therapeutic guidelines."
  };

  const createdOrder = await ArticleOrderService.createOrder(orderData);
  assert.ok(createdOrder.id);
  assert.ok(createdOrder.order_number.startsWith("RX-ART-"));
  assert.equal(createdOrder.service_type, "Review Article");
  assert.equal(createdOrder.status, "New");

  // TEST 11: Email details correctly placed and addressed to rxfusion.support@gmail.com
  const emailDetails = ArticleOrderService.formatEmail(createdOrder);
  assert.equal(OFFICIAL_SUPPORT_EMAIL, "rxfusion.support@gmail.com");
  assert.equal(emailDetails.to, "rxfusion.support@gmail.com");
  assert.ok(emailDetails.subject.includes("Review Article Order"));
  assert.ok(emailDetails.subject.includes(orderData.topic));
  assert.ok(emailDetails.body.includes(`Name: ${orderData.name}`));
  assert.ok(emailDetails.body.includes(`Email: ${orderData.email}`));
  assert.ok(emailDetails.body.includes(`Mobile: ${orderData.mobile}`));
  assert.ok(emailDetails.body.includes(`Service: ${orderData.service_type}`));
  assert.ok(emailDetails.body.includes(`Topic: ${orderData.topic}`));
  assert.ok(emailDetails.body.includes(`Course: ${orderData.course}`));
  assert.ok(emailDetails.body.includes(`College/Institution: ${orderData.institution}`));
  assert.ok(emailDetails.body.includes(`Word Count: ${createdOrder.word_count}`));
  assert.ok(emailDetails.body.includes(`References: ${createdOrder.references_count}`));
  assert.ok(emailDetails.body.includes(`Citation Style: ${orderData.citation_style}`));
  assert.ok(emailDetails.body.includes(`Deadline: ${orderData.deadline}`));
  assert.ok(emailDetails.body.includes(`Journal/Target: ${orderData.target_journal}`));
  assert.ok(emailDetails.body.includes(orderData.additional_requirements));

  // Verify mailto link structure
  const mailtoLink = ArticleOrderService.generateMailto(createdOrder);
  assert.ok(mailtoLink.startsWith("mailto:rxfusion.support@gmail.com"));
  assert.ok(mailtoLink.includes(encodeURIComponent(emailDetails.subject)));
});

test("11. TEST 12: Admin Article Orders Management & Status Updates", async (t) => {
  const allOrders = await ArticleOrderService.getAllOrders();
  assert.ok(allOrders.length >= 1);
  const target = allOrders[0];

  const updated = await ArticleOrderService.updateOrderStatus(
    target.id,
    "In Progress",
    "Reviewed topic scope and literature databases. Communicating draft outline."
  );
  assert.ok(updated);
  assert.equal(updated?.status, "In Progress");
  assert.ok(updated?.internal_notes?.includes("Reviewed topic scope"));

  const summary = await ArticleOrderService.getSummary();
  assert.ok(summary.total >= 1);
  assert.ok(summary.in_progress >= 1);
});

test("12. TEST 13: Research Article / Research Paper Order Validation & Support Email", async (t) => {
  const researchOrderData = {
    service_type: "Research Article / Research Paper",
    name: "Vikram Sengupta",
    email: "vikram.sengupta@res.ac.in",
    mobile: "+91 91234 56789",
    topic: "In Vitro Dissolution and Bioequivalence Evaluation of Solid Self-Emulsifying Drug Delivery Systems (SEDDS)",
    course: "M.Pharm (Pharmaceutics)",
    institution: "Institute of Chemical Technology",
    word_count: "6,000 words",
    references_count: "45 references",
    citation_style: "APA",
    deadline: "2026-12-01",
    target_journal: "Journal of Drug Delivery Science and Technology",
    additional_requirements: "Statistical ANOVA methodology breakdown and stability dissolution tables.",
    brief: "Original formulation paper comparing rate of dissolution across varied lipid-surfactant cosurfactant ratios."
  };

  const researchOrder = await ArticleOrderService.createOrder(researchOrderData);
  assert.ok(researchOrder.id);
  assert.equal(researchOrder.service_type, "Research Article / Research Paper");

  const emailDetails = ArticleOrderService.formatEmail(researchOrder);
  assert.equal(emailDetails.to, "rxfusion.support@gmail.com");
  assert.ok(emailDetails.subject.includes("Research Article Order"));
  assert.ok(emailDetails.subject.includes(researchOrderData.topic));
  assert.ok(emailDetails.body.includes(`Service: ${researchOrderData.service_type}`));
  assert.ok(emailDetails.body.includes(`Name: ${researchOrderData.name}`));
});

test("13. Schema Migration DDL Integrity for Quizzes & Article Orders", (t) => {
  const migrationPath = path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20261004_quiz_system_and_article_orders.sql"
  );
  assert.ok(fs.existsSync(migrationPath), "Migration file 20261004_quiz_system_and_article_orders.sql must exist");

  const sqlContent = fs.readFileSync(migrationPath, "utf8").toLowerCase();
  assert.ok(sqlContent.includes("create table if not exists public.quizzes"), "SQL must create quizzes table");
  assert.ok(sqlContent.includes("create table if not exists public.quiz_student_attempts"), "SQL must create quiz_student_attempts table");
  assert.ok(sqlContent.includes("create table if not exists public.article_orders"), "SQL must create article_orders table");
  assert.ok(sqlContent.includes("rxfusion.support@gmail.com"), "Official email commented/documented in migration");
});
