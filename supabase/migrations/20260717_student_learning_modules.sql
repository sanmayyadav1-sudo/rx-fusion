-- =======================================================
-- MIGRATION: STUDENT LEARNING MODULES
-- =======================================================

-- 1. Create quiz_questions table
create table if not exists public.quiz_questions (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  explanation text,
  clinical_pearl text,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create quiz_attempts table
create table if not exists public.quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.student_profiles(id) on delete cascade not null,
  question_id uuid references public.quiz_questions(id) on delete cascade not null,
  selected_option text not null,
  is_correct boolean not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, question_id)
);

-- 3. Create question_bank table
create table if not exists public.question_bank (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text,
  course text not null check (course in ('Pharm D', 'B Pharm', 'D Pharm')),
  year integer not null,
  subject text not null,
  topic text,
  question_type text check (question_type in ('LAQ', 'SAQ', 'MCQ', 'Short', 'Long')) default 'Short' not null,
  marks integer,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create question_papers table
create table if not exists public.question_papers (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  university text not null,
  course text not null check (course in ('Pharm D', 'B Pharm', 'D Pharm')),
  year integer not null,
  subject text not null,
  exam_year integer not null,
  exam_type text check (exam_type in ('Regular', 'Supplementary', 'Model', 'Internal')) default 'Regular' not null,
  file_url text not null,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create flashcards table
create table if not exists public.flashcards (
  id uuid default gen_random_uuid() primary key,
  term text not null,
  definition text not null,
  course text not null check (course in ('Pharm D', 'B Pharm', 'D Pharm')),
  year integer not null,
  subject text not null,
  category text,
  topic text,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create student_flashcards_learned table
create table if not exists public.student_flashcards_learned (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.student_profiles(id) on delete cascade not null,
  flashcard_id uuid references public.flashcards(id) on delete cascade not null,
  learned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, flashcard_id)
);

-- Enable RLS
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.question_bank enable row level security;
alter table public.question_papers enable row level security;
alter table public.flashcards enable row level security;
alter table public.student_flashcards_learned enable row level security;

-- Select Policies for published content
create policy "Published quiz questions are viewable by everyone"
  on public.quiz_questions for select
  using (is_published = true or public.is_admin());

create policy "Published question bank are viewable by everyone"
  on public.question_bank for select
  using (is_published = true or public.is_admin());

create policy "Published question papers are viewable by everyone"
  on public.question_papers for select
  using (is_published = true or public.is_admin());

create policy "Published flashcards are viewable by everyone"
  on public.flashcards for select
  using (is_published = true or public.is_admin());

-- Admin full access policies
create policy "Admins can do everything on quiz_questions"
  on public.quiz_questions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can do everything on quiz_attempts"
  on public.quiz_attempts for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can do everything on question_bank"
  on public.question_bank for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can do everything on question_papers"
  on public.question_papers for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can do everything on flashcards"
  on public.flashcards for all
  using (public.is_admin())
  with check (public.is_admin());

-- Student attempts and learned flashcards access:
create policy "Anyone can select or insert quiz attempts"
  on public.quiz_attempts for all
  using (true);

create policy "Anyone can select or insert learned flashcards"
  on public.student_flashcards_learned for all
  using (true);

-- Indexes for performance
create index if not exists idx_quiz_questions_is_published on public.quiz_questions(is_published);
create index if not exists idx_quiz_attempts_student_id on public.quiz_attempts(student_id);
create index if not exists idx_question_bank_lookup on public.question_bank(course, year, subject);
create index if not exists idx_question_papers_lookup on public.question_papers(course, year, subject);
create index if not exists idx_flashcards_lookup on public.flashcards(course, year, subject);
create index if not exists idx_learned_flashcards_student on public.student_flashcards_learned(student_id);

-- =======================================================
-- INITIAL SEED RECORDS (Conflict-Safe)
-- =======================================================

-- 1. Quiz questions
insert into public.quiz_questions (question, option_a, option_b, option_c, option_d, correct_option, explanation, clinical_pearl)
values
  ('Which of the following is the drug of choice for treating paracetamol (acetaminophen) overdose?', 'Atropine', 'N-acetylcysteine', 'Naloxone', 'Flumazenil', 'B', 'N-acetylcysteine restores depleted glutathione reserves in the liver, allowing safe metabolism of NAPQI, the toxic metabolite of paracetamol.', 'Always administer N-acetylcysteine early, ideally within 8 hours of ingestion, to prevent severe hepatic necrosis.'),
  ('What is the primary mechanism of action of loop diuretics like furosemide?', 'Inhibition of Na-Cl symporter in DCT', 'Inhibition of Na-K-2Cl cotransporter in Thick Ascending Loop', 'Aldosterone receptor antagonism', 'Inhibition of carbonic anhydrase in PCT', 'B', 'Loop diuretics block the Na+/K+/2Cl- cotransporter in the thick ascending limb of the loop of Henle, leading to major excretion of water, sodium, potassium, and chloride.', 'Furosemide can cause profound hypokalemia and ototoxicity at high doses, particularly when combined with aminoglycosides.'),
  ('Which anticoagulant works by directly inhibiting thrombin (Factor IIa)?', 'Warfarin', 'Dabigatran', 'Rivaroxaban', 'Heparin', 'B', 'Dabigatran is a direct thrombin inhibitor. Rivaroxaban inhibits Factor Xa. Warfarin inhibits Vitamin K epoxide reductase.', 'Dabigatran has a specific reversal agent called Idarucizumab (Praxbind) for emergencies.')
on conflict do nothing;

-- 2. Question Bank questions
insert into public.question_bank (question, answer, course, year, subject, topic, question_type, marks)
values
  ('Explain the mechanism of action, therapeutic uses, and adverse effects of Beta-Blockers.', 'Beta-blockers block beta-1 adrenergic receptors in the heart, decreasing heart rate, myocardial contractility, and cardiac output. Uses: hypertension, angina, arrhythmias, chronic heart failure. Adverse effects: bradycardia, bronchospasm (non-selective like propranolol), fatigue, masking of hypoglycemia.', 'B Pharm', 3, 'Pharmacology-II', 'Cardiovascular Drugs', 'LAQ', 10),
  ('Describe the first-pass metabolism with suitable examples.', 'First-pass metabolism is the rapid degradation of a drug in the liver or gut wall before it reaches systemic circulation. Example: Nitroglycerin, Propranolol, Morphine. This is why nitroglycerin is administered sublingually to bypass the liver.', 'B Pharm', 1, 'Human Anatomy and Physiology', 'Digestive System / Absorption', 'Short', 5),
  ('What are the clinical manifestations and management of anaphylactic shock?', 'Anaphylactic shock is a severe Type-I hypersensitivity reaction. Signs include hypotension, bronchospasm, urticaria, angioedema. Management: Immediate intramuscular Epinephrine/Adrenaline (1:1000 dilution, 0.3-0.5 mg), oxygen, IV fluids, antihistamines, and corticosteroids.', 'Pharm D', 3, 'Pharmacotherapeutics-II', 'Immunology & Shock', 'Long', 10)
on conflict do nothing;

-- 3. Question Papers (using standard public PDF link or mock file)
insert into public.question_papers (title, university, course, year, subject, exam_year, exam_type, file_url)
values
  ('Pharmacology-II Year 3 PYQ 2024', 'RGUHS University', 'B Pharm', 3, 'Pharmacology-II', 2024, 'Regular', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
  ('Clinical Pharmacy Practice 2023', 'PCI Model Paper', 'Pharm D', 5, 'Clinical Pharmacy', 2023, 'Model', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
  ('Pharmaceutics-I Regular Paper 2022', 'MSBTE Board', 'D Pharm', 1, 'Pharmaceutics-I', 2022, 'Regular', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')
on conflict do nothing;

-- 4. Flashcards
insert into public.flashcards (term, definition, course, year, subject, category, topic)
values
  ('Bioavailability', 'The fraction of an administered dose of unchanged drug that reaches the systemic circulation.', 'B Pharm', 1, 'Pharmaceutics-I', 'General Pharmaceutics', 'Pharmacokinetics'),
  ('Therapeutic Index (TI)', 'The ratio of the dose that produces toxicity to the dose that produces a clinically desired effective response (TI = TD50 / ED50). A narrow TI means small margin of safety.', 'B Pharm', 2, 'Pharmacology-I', 'Basic Principles', 'Pharmacodynamics'),
  ('Half-Life (t1/2)', 'The time required for the concentration of a drug in the plasma to decrease by one-half (50%) of its initial value.', 'Pharm D', 2, 'Pharmacology-I', 'Pharmacokinetics', 'Drug Elimination'),
  ('Gillespie''s Rule', 'A guideline describing the dosage adjust for pediatric patients based on surface area calculation.', 'Pharm D', 1, 'Pharmaceutics', 'Calculations', 'Pediatrics')
on conflict do nothing;
