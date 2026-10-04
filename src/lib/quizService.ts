import fs from "fs";
import path from "path";
import { getServiceSupabaseClient } from "./authHelpers";
import { Quiz, QuizQuestion, QuizAttempt, AcademicYear, QuizAnalyticsSummary, LeaderboardEntry } from "@/types/quiz";

const DATA_DIR = path.join(process.cwd(), ".data");
const QUIZZES_FILE = path.join(DATA_DIR, "quizzes.json");
const QUESTIONS_FILE = path.join(DATA_DIR, "quiz_questions.json");
const ATTEMPTS_FILE = path.join(DATA_DIR, "quiz_attempts.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Seed default initial quizzes for all 5 academic years if empty
function getInitialSeedQuizzes(): { quizzes: Quiz[]; questions: QuizQuestion[] } {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const quiz1Id = "quiz-3rd-year-daily-today";
  const quiz2Id = "quiz-3rd-year-daily-yesterday";
  const quiz3Id = "quiz-2nd-year-daily-today";
  const quiz4Id = "quiz-1st-year-daily-today";
  const quiz5Id = "quiz-4th-year-daily-today";
  const quiz6Id = "quiz-5th-year-daily-today";

  const quizzes: Quiz[] = [
    {
      id: quiz1Id,
      title: "Clinical Pharmacokinetics & Therapeutic Drug Monitoring",
      academic_year: "3rd Year",
      subject: "Pharmacology & Therapeutics",
      topic: "Clearance, Half-life & Loading Doses",
      description: "Master essential mathematical and clinical principles of drug elimination, steady-state plasma concentrations, and narrow therapeutic index drugs.",
      difficulty: "Medium",
      quiz_date: today,
      time_limit_mins: 15,
      passing_percentage: 60,
      status: "published",
      is_daily: true,
      is_leaderboard_enabled: true,
      allow_multiple_attempts: false,
      author: "RxFusion Faculty",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: quiz2Id,
      title: "Cardiovascular Drug Therapy: Heart Failure & Hypertensive Crisis",
      academic_year: "3rd Year",
      subject: "Pharmacotherapeutics-II",
      topic: "ACE Inhibitors, ARBs & Inotropes",
      description: "Evaluation of evidence-based pharmacological management of acute and chronic heart failure according to ACC/AHA guidelines.",
      difficulty: "Hard",
      quiz_date: yesterday,
      time_limit_mins: 20,
      passing_percentage: 60,
      status: "published",
      is_daily: true,
      is_leaderboard_enabled: true,
      allow_multiple_attempts: true,
      author: "RxFusion Faculty",
      created_at: new Date(Date.now() - 90000000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: quiz3Id,
      title: "Autonomic Nervous System: Sympathomimetics & Parasympathomimetics",
      academic_year: "2nd Year",
      subject: "Pharmacology-I",
      topic: "Adrenergic & Cholinergic Receptors",
      description: "Fundamental receptor subtypes, signal transduction mechanisms, and therapeutic applications of catecholamines.",
      difficulty: "Medium",
      quiz_date: today,
      time_limit_mins: 15,
      passing_percentage: 50,
      status: "published",
      is_daily: true,
      is_leaderboard_enabled: true,
      allow_multiple_attempts: false,
      author: "RxFusion Faculty",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: quiz4Id,
      title: "Human Anatomy & Physiology: Fundamentals of Renal Clearance",
      academic_year: "1st Year",
      subject: "Human Anatomy and Physiology",
      topic: "Nephron Function & Glomerular Filtration",
      description: "Basic histological and physiological filtration mechanisms of the glomerulus and tubule transport.",
      difficulty: "Easy",
      quiz_date: today,
      time_limit_mins: 10,
      passing_percentage: 50,
      status: "published",
      is_daily: true,
      is_leaderboard_enabled: true,
      allow_multiple_attempts: false,
      author: "RxFusion Faculty",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: quiz5Id,
      title: "Clinical Toxicology & Poisoning Antidotes",
      academic_year: "4th Year",
      subject: "Clinical Toxicology",
      topic: "Heavy Metals, Organophosphates & Paracetamol",
      description: "Diagnostic protocols and targeted antidote selection for emergency department toxicological presentations.",
      difficulty: "Hard",
      quiz_date: today,
      time_limit_mins: 20,
      passing_percentage: 65,
      status: "published",
      is_daily: true,
      is_leaderboard_enabled: true,
      allow_multiple_attempts: false,
      author: "RxFusion Faculty",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: quiz6Id,
      title: "Advanced Clinical Pharmacotherapy in Critical Care",
      academic_year: "5th Year",
      subject: "Clinical Pharmacokinetics & Pharmacogenomics",
      topic: "Septic Shock, ECMO & TDM in Sepsis",
      description: "Complex dosing considerations for hydrophilic antibiotics in critically ill patients undergoing renal replacement therapy.",
      difficulty: "Hard",
      quiz_date: today,
      time_limit_mins: 25,
      passing_percentage: 70,
      status: "published",
      is_daily: true,
      is_leaderboard_enabled: true,
      allow_multiple_attempts: false,
      author: "RxFusion Faculty",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const questions: QuizQuestion[] = [
    // Quiz 1 (3rd Year)
    {
      id: "q-3rd-1",
      quiz_id: quiz1Id,
      question: "Which parameter remains constant during zero-order elimination kinetics?",
      option_a: "Half-life of the drug",
      option_b: "Clearance rate",
      option_c: "Amount of drug eliminated per unit time",
      option_d: "Fraction of drug eliminated per unit time",
      correct_option: "C",
      explanation: "In zero-order kinetics (capacity-limited elimination), a constant amount (not fraction) of drug is eliminated per unit time because elimination pathways become saturated (e.g., ethanol, phenytoin at therapeutic levels).",
      clinical_pearl: "Small dose increments of zero-order drugs can produce disproportionate, catastrophic increases in serum concentrations.",
      marks: 1,
      difficulty: "Medium",
      order_index: 0,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: "q-3rd-2",
      quiz_id: quiz1Id,
      question: "A drug has a volume of distribution (Vd) of 35 L and a target plasma concentration of 10 mg/L. What is the required IV loading dose?",
      option_a: "35 mg",
      option_b: "350 mg",
      option_c: "700 mg",
      option_d: "175 mg",
      correct_option: "B",
      explanation: "Loading Dose (LD) = Vd × Target Concentration. Here, LD = 35 L × 10 mg/L = 350 mg.",
      clinical_pearl: "Loading dose is independent of clearance; clearance determines maintenance dose, whereas Vd determines loading dose.",
      marks: 1,
      difficulty: "Medium",
      order_index: 1,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: "q-3rd-3",
      quiz_id: quiz1Id,
      question: "Which of the following antimicrobial agents requires routine Therapeutic Drug Monitoring (TDM) to avoid vestibulotoxicity and nephrotoxicity?",
      option_a: "Azithromycin",
      option_b: "Gentamicin",
      option_c: "Ceftriaxone",
      option_d: "Amoxicillin",
      correct_option: "B",
      explanation: "Aminoglycosides like gentamicin have a narrow therapeutic window and cause concentration-dependent nephrotoxicity and irreversible ototoxicity. Trough levels must be monitored before dosing.",
      clinical_pearl: "Extended-interval (once-daily) aminoglycoside dosing exploits concentration-dependent killing and the post-antibiotic effect while lowering nephrotoxicity risk.",
      marks: 1,
      difficulty: "Easy",
      order_index: 2,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: "q-3rd-4",
      quiz_id: quiz1Id,
      question: "After how many half-lives does a continuously infused drug approximately reach 93.75% of its steady-state concentration (Css)?",
      option_a: "2 half-lives",
      option_b: "3 half-lives",
      option_c: "4 half-lives",
      option_d: "5 half-lives",
      correct_option: "C",
      explanation: "1 half-life = 50%, 2 = 75%, 3 = 87.5%, 4 = 93.75%, and 5 = 96.875% of steady state. Clinically, 4 to 5 half-lives are considered steady state.",
      clinical_pearl: "Drawing serum levels before 4-5 half-lives will falsely underestimate true steady-state drug exposure.",
      marks: 1,
      difficulty: "Medium",
      order_index: 3,
      is_published: true,
      created_at: new Date().toISOString()
    },

    // Quiz 2 (3rd Year Yesterday)
    {
      id: "q-3rd-y1",
      quiz_id: quiz2Id,
      question: "Which medication combination has been demonstrated to reduce mortality in HFrEF by inhibiting neprilysin and the angiotensin receptor simultaneously?",
      option_a: "Sacubitril / Valsartan",
      option_b: "Spironolactone / Furosemide",
      option_c: "Hydralazine / Isosorbide dinitrate",
      option_d: "Enalapril / Losartan",
      correct_option: "A",
      explanation: "Sacubitril/Valsartan (ARNI) prevents breakdown of natriuretic peptides via neprilysin inhibition while blocking the AT1 receptor, providing superior mortality reduction compared to ACE inhibitors alone.",
      clinical_pearl: "A mandatory 36-hour washout period is required when switching between an ACE inhibitor and an ARNI to avoid severe angioedema.",
      marks: 1,
      difficulty: "Hard",
      order_index: 0,
      is_published: true,
      created_at: new Date().toISOString()
    },

    // Quiz 3 (2nd Year)
    {
      id: "q-2nd-1",
      quiz_id: quiz3Id,
      question: "Which adrenergic receptor subtype mediates relaxation of bronchial smooth muscle and uterine relaxation?",
      option_a: "Alpha-1",
      option_b: "Alpha-2",
      option_c: "Beta-1",
      option_d: "Beta-2",
      correct_option: "D",
      explanation: "Beta-2 adrenergic receptors couple to Gs proteins, activating adenylyl cyclase and increasing intracellular cAMP, causing smooth muscle relaxation in airways and uterus.",
      clinical_pearl: "Non-selective beta-blockers like propranolol can precipitate fatal bronchospasm in asthmatic patients by antagonizing Beta-2 receptors.",
      marks: 1,
      difficulty: "Easy",
      order_index: 0,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: "q-2nd-2",
      quiz_id: quiz3Id,
      question: "What is the primary pharmacological antidote for acute organophosphate pesticide poisoning?",
      option_a: "Physostigmine",
      option_b: "Atropine followed by Pralidoxime",
      option_c: "Neostigmine",
      option_d: "Pilocarprine",
      correct_option: "B",
      explanation: "Atropine competitively blocks excess muscarinic stimulation (drying bronchial secretions), and pralidoxime (2-PAM) reactivates acetylcholinesterase before irreversible aging occurs.",
      clinical_pearl: "Atropinization is guided by clearing of lung crepitations and reversal of bradycardia, not pupillary size alone.",
      marks: 1,
      difficulty: "Medium",
      order_index: 1,
      is_published: true,
      created_at: new Date().toISOString()
    },

    // Quiz 4 (1st Year)
    {
      id: "q-1st-1",
      quiz_id: quiz4Id,
      question: "In the functional nephron, where does the majority (approx. 65-70%) of sodium and water reabsorption take place?",
      option_a: "Distal convoluted tubule",
      option_b: "Proximal convoluted tubule",
      option_c: "Loop of Henle ascending limb",
      option_d: "Collecting duct",
      correct_option: "B",
      explanation: "The proximal convoluted tubule is lined with dense microvilli brush borders and accounts for the isosmostic reabsorption of ~65-70% of filtered water, sodium, glucose, and amino acids.",
      clinical_pearl: "Carbonic anhydrase inhibitors like acetazolamide act primarily at the PCT.",
      marks: 1,
      difficulty: "Easy",
      order_index: 0,
      is_published: true,
      created_at: new Date().toISOString()
    },

    // Quiz 5 (4th Year)
    {
      id: "q-4th-1",
      quiz_id: quiz5Id,
      question: "Which specific antidote is indicated for ethylene glycol and methanol poisoning by acting as a competitive inhibitor of alcohol dehydrogenase?",
      option_a: "Fomepizole",
      option_b: "Dimercaprol",
      option_c: "Deferoxamine",
      option_d: "Calcium gluconate",
      correct_option: "A",
      explanation: "Fomepizole (4-methylpyrazole) inhibits alcohol dehydrogenase with significantly higher affinity than ethanol, preventing conversion of toxic alcohols into glycolic acid/oxalate or formic acid.",
      clinical_pearl: "Fomepizole does not cause CNS depression or hypoglycemia unlike intravenous ethanol infusions.",
      marks: 1,
      difficulty: "Medium",
      order_index: 0,
      is_published: true,
      created_at: new Date().toISOString()
    },

    // Quiz 6 (5th Year)
    {
      id: "q-5th-1",
      quiz_id: quiz6Id,
      question: "In critically ill patients with hyperdynamic septic shock, what primary pharmacokinetic alteration predominantly affects hydrophilic beta-lactams and aminoglycosides?",
      option_a: "Reduced hepatic intrinsic clearance",
      option_b: "Increased Volume of Distribution (Vd) and augmented renal clearance (ARC)",
      option_c: "Decreased glomerular filtration rate only",
      option_d: "Increased alpha-1-acid glycoprotein binding",
      correct_option: "B",
      explanation: "Endothelial permeability and fluid resuscitation dramatically elevate Vd, while capillary hyperperfusion causes augmented renal clearance (ARC), resulting in subtherapeutic antibiotic concentrations.",
      clinical_pearl: "Loading doses of beta-lactams must be aggressive in sepsis, followed by prolonged or continuous infusions to maintain free drug concentration above MIC (%fT > MIC).",
      marks: 1,
      difficulty: "Hard",
      order_index: 0,
      is_published: true,
      created_at: new Date().toISOString()
    }
  ];

  return { quizzes, questions };
}

export class QuizService {
  // ----------------------------------------------------
  // QUIZZES
  // ----------------------------------------------------
  static async getAllQuizzes(filters?: {
    academic_year?: AcademicYear;
    is_daily?: boolean;
    quiz_date?: string;
    status?: string;
  }): Promise<Quiz[]> {
    try {
      const supabase = getServiceSupabaseClient();
      let query = supabase.from("quizzes").select("*, questions:quiz_questions(count)");

      if (filters?.academic_year) {
        query = query.eq("academic_year", filters.academic_year);
      }
      if (filters?.is_daily !== undefined) {
        query = query.eq("is_daily", filters.is_daily);
      }
      if (filters?.quiz_date) {
        query = query.eq("quiz_date", filters.quiz_date);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order("quiz_date", { ascending: false }).order("created_at", { ascending: false });

      if (!error && data) {
        return (data as (Quiz & { questions?: { count: number }[] })[]).map((q) => ({
          ...q,
          questions_count: q.questions?.[0]?.count ?? 0
        })) as Quiz[];
      }
    } catch {
      // Fallback
    }

    // Local file fallback
    let list = readJsonFile<Quiz[]>(QUIZZES_FILE, []);
    if (list.length === 0) {
      const initial = getInitialSeedQuizzes();
      list = initial.quizzes;
      writeJsonFile(QUIZZES_FILE, list);
      writeJsonFile(QUESTIONS_FILE, initial.questions);
    }

    const allQuestions = readJsonFile<QuizQuestion[]>(QUESTIONS_FILE, []);

    let filtered = [...list];
    if (filters?.academic_year) {
      filtered = filtered.filter(q => q.academic_year === filters.academic_year);
    }
    if (filters?.is_daily !== undefined) {
      filtered = filtered.filter(q => q.is_daily === filters.is_daily);
    }
    if (filters?.quiz_date) {
      filtered = filtered.filter(q => q.quiz_date === filters.quiz_date);
    }
    if (filters?.status) {
      filtered = filtered.filter(q => q.status === filters.status);
    }

    return filtered.map(q => ({
      ...q,
      questions_count: allQuestions.filter(x => x.quiz_id === q.id).length
    })).sort((a, b) => b.quiz_date.localeCompare(a.quiz_date));
  }

  static async getDailyQuizByDate(academicYear: AcademicYear, date: string): Promise<Quiz | null> {
    const list = await this.getAllQuizzes({
      academic_year: academicYear,
      quiz_date: date,
      is_daily: true,
      status: "published"
    });
    return list.length > 0 ? list[0] : null;
  }

  static async createQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
    return this.saveQuiz(quizData);
  }

  static async createQuestion(q: Partial<QuizQuestion>): Promise<QuizQuestion> {
    return this.saveQuestion(q);
  }

  static async getAnalyticsSummary(filters?: {
    academic_year?: AcademicYear;
    quiz_date?: string;
    subject?: string;
    quiz_id?: string;
    search_student?: string;
  }): Promise<QuizAnalyticsSummary> {
    return this.getAnalytics(filters);
  }

  static async getQuizById(id: string, includeQuestions = true): Promise<Quiz | null> {
    try {
      const supabase = getServiceSupabaseClient();
      const { data, error } = await supabase.from("quizzes").select("*").eq("id", id).maybeSingle();

      if (!error && data) {
        const quiz = data as Quiz;
        if (includeQuestions) {
          const { data: qData } = await supabase
            .from("quiz_questions")
            .select("*")
            .eq("quiz_id", id)
            .order("order_index", { ascending: true })
            .order("created_at", { ascending: true });
          quiz.questions = (qData || []) as QuizQuestion[];
          quiz.questions_count = quiz.questions.length;
        }
        return quiz;
      }
    } catch {
      // Fallback
    }

    const list = readJsonFile<Quiz[]>(QUIZZES_FILE, []);
    const found = list.find(q => q.id === id);
    if (!found) return null;

    if (includeQuestions) {
      const allQ = readJsonFile<QuizQuestion[]>(QUESTIONS_FILE, []);
      const questions = allQ
        .filter(q => q.quiz_id === id)
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      return {
        ...found,
        questions,
        questions_count: questions.length
      };
    }

    return found;
  }

  static async saveQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
    const now = new Date().toISOString();
    const id = quizData.id || `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const record: Quiz = {
      id,
      title: quizData.title || "Untitled Quiz",
      academic_year: quizData.academic_year || "1st Year",
      subject: quizData.subject || "General Pharmacy",
      topic: quizData.topic || null,
      description: quizData.description || null,
      difficulty: quizData.difficulty || "Medium",
      quiz_date: quizData.quiz_date || now.split("T")[0],
      start_time: quizData.start_time || null,
      end_time: quizData.end_time || null,
      time_limit_mins: Number(quizData.time_limit_mins ?? 15),
      passing_percentage: Number(quizData.passing_percentage ?? 50),
      status: quizData.status || "draft",
      is_daily: !!quizData.is_daily,
      is_leaderboard_enabled: quizData.is_leaderboard_enabled !== false,
      allow_multiple_attempts: !!quizData.allow_multiple_attempts,
      author: quizData.author || "RxFusion Admin",
      created_at: quizData.created_at || now,
      updated_at: now
    };

    // Try Supabase first
    try {
      const supabase = getServiceSupabaseClient();
      const { data, error } = await supabase.from("quizzes").upsert(record).select().single();
      if (!error && data) {
        this.syncLocalQuiz(record);
        return data as Quiz;
      }
    } catch {
      // Fallback
    }

    this.syncLocalQuiz(record);
    return record;
  }

  private static syncLocalQuiz(record: Quiz): void {
    const list = readJsonFile<Quiz[]>(QUIZZES_FILE, []);
    const idx = list.findIndex(q => q.id === record.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record };
    } else {
      list.unshift(record);
    }
    writeJsonFile(QUIZZES_FILE, list);
  }

  static async deleteQuiz(id: string): Promise<boolean> {
    try {
      const supabase = getServiceSupabaseClient();
      await supabase.from("quizzes").delete().eq("id", id);
    } catch {
      // Fallback
    }

    const list = readJsonFile<Quiz[]>(QUIZZES_FILE, []);
    writeJsonFile(QUIZZES_FILE, list.filter(q => q.id !== id));

    const questions = readJsonFile<QuizQuestion[]>(QUESTIONS_FILE, []);
    writeJsonFile(QUESTIONS_FILE, questions.filter(q => q.quiz_id !== id));

    return true;
  }

  static async duplicateQuiz(id: string): Promise<Quiz | null> {
    const original = await this.getQuizById(id, true);
    if (!original) return null;

    const newQuizId = `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const duplicatedQuiz: Quiz = {
      ...original,
      id: newQuizId,
      title: `${original.title} (Copy)`,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const saved = await this.saveQuiz(duplicatedQuiz);

    if (original.questions && original.questions.length > 0) {
      const newQuestions: QuizQuestion[] = original.questions.map((q, idx) => ({
        ...q,
        id: `q-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        quiz_id: newQuizId,
        created_at: new Date().toISOString()
      }));

      for (const q of newQuestions) {
        await this.saveQuestion(q);
      }
      saved.questions = newQuestions;
      saved.questions_count = newQuestions.length;
    }

    return saved;
  }

  // ----------------------------------------------------
  // QUESTIONS
  // ----------------------------------------------------
  static async saveQuestion(q: Partial<QuizQuestion>): Promise<QuizQuestion> {
    const id = q.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record: QuizQuestion = {
      id,
      quiz_id: q.quiz_id,
      question: q.question || "",
      option_a: q.option_a || "",
      option_b: q.option_b || "",
      option_c: q.option_c || "",
      option_d: q.option_d || "",
      correct_option: q.correct_option || "A",
      explanation: q.explanation || null,
      clinical_pearl: q.clinical_pearl || null,
      image_url: q.image_url || null,
      marks: Number(q.marks ?? 1),
      difficulty: q.difficulty || "Medium",
      order_index: Number(q.order_index ?? 0),
      is_published: q.is_published !== false,
      created_at: q.created_at || new Date().toISOString()
    };

    try {
      const supabase = getServiceSupabaseClient();
      const { data, error } = await supabase.from("quiz_questions").upsert(record).select().single();
      if (!error && data) {
        this.syncLocalQuestion(record);
        return data as QuizQuestion;
      }
    } catch {
      // Fallback
    }

    this.syncLocalQuestion(record);
    return record;
  }

  private static syncLocalQuestion(record: QuizQuestion): void {
    const list = readJsonFile<QuizQuestion[]>(QUESTIONS_FILE, []);
    const idx = list.findIndex(item => item.id === record.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record };
    } else {
      list.push(record);
    }
    writeJsonFile(QUESTIONS_FILE, list);
  }

  static async deleteQuestion(id: string): Promise<boolean> {
    try {
      const supabase = getServiceSupabaseClient();
      await supabase.from("quiz_questions").delete().eq("id", id);
    } catch {
      // Fallback
    }
    const list = readJsonFile<QuizQuestion[]>(QUESTIONS_FILE, []);
    writeJsonFile(QUESTIONS_FILE, list.filter(q => q.id !== id));
    return true;
  }

  static async reorderQuestions(quizId: string, orderedIds: string[]): Promise<boolean> {
    const list = readJsonFile<QuizQuestion[]>(QUESTIONS_FILE, []);
    orderedIds.forEach((id, index) => {
      const q = list.find(item => item.id === id);
      if (q) {
        q.order_index = index;
      }
    });
    writeJsonFile(QUESTIONS_FILE, list);

    try {
      const supabase = getServiceSupabaseClient();
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.from("quiz_questions").update({ order_index: i }).eq("id", orderedIds[i]);
      }
    } catch {
      // Ignore
    }
    return true;
  }

  // ----------------------------------------------------
  // STUDENT ATTEMPTS & SUBMISSIONS
  // ----------------------------------------------------
  static async recordAttempt(attempt: Omit<QuizAttempt, "id" | "created_at">): Promise<QuizAttempt> {
    const id = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record: QuizAttempt = {
      ...attempt,
      id,
      created_at: new Date().toISOString()
    };

    try {
      const supabase = getServiceSupabaseClient();
      const { data, error } = await supabase.from("quiz_student_attempts").insert(record).select().single();
      if (!error && data) {
        this.syncLocalAttempt(record);
        return data as QuizAttempt;
      }
    } catch {
      // Fallback
    }

    this.syncLocalAttempt(record);
    return record;
  }

  private static syncLocalAttempt(record: QuizAttempt): void {
    const list = readJsonFile<QuizAttempt[]>(ATTEMPTS_FILE, []);
    list.unshift(record);
    writeJsonFile(ATTEMPTS_FILE, list);
  }

  static async getStudentAttempts(studentId?: string, quizId?: string): Promise<QuizAttempt[]> {
    try {
      const supabase = getServiceSupabaseClient();
      let query = supabase.from("quiz_student_attempts").select("*, quiz:quizzes(title, subject, passing_percentage)");
      if (studentId) query = query.eq("student_id", studentId);
      if (quizId) query = query.eq("quiz_id", quizId);
      const { data, error } = await query.order("submitted_at", { ascending: false });
      if (!error && data) return data as QuizAttempt[];
    } catch {
      // Fallback
    }

    const all = readJsonFile<QuizAttempt[]>(ATTEMPTS_FILE, []);
    const quizzes = readJsonFile<Quiz[]>(QUIZZES_FILE, []);

    let filtered = [...all];
    if (studentId) filtered = filtered.filter(a => a.student_id === studentId);
    if (quizId) filtered = filtered.filter(a => a.quiz_id === quizId);

    return filtered.map(a => {
      const q = quizzes.find(x => x.id === a.quiz_id);
      return {
        ...a,
        quiz: q ? { title: q.title, subject: q.subject, passing_percentage: q.passing_percentage } : undefined
      };
    });
  }

  static async getLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
    const attempts = await this.getStudentAttempts(undefined, quizId);
    
    // Group by student_id or student_name and take the best score
    const bestByStudent = new Map<string, QuizAttempt>();
    attempts.forEach(a => {
      const key = a.student_id || a.student_name;
      const existing = bestByStudent.get(key);
      if (!existing || a.score > existing.score || (a.score === existing.score && a.time_taken_seconds < existing.time_taken_seconds)) {
        bestByStudent.set(key, a);
      }
    });

    const sorted = Array.from(bestByStudent.values()).sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return a.time_taken_seconds - b.time_taken_seconds;
    });

    return sorted.map((att, idx) => ({
      rank: idx + 1,
      student_name: att.student_name || `Student #${idx + 1}`,
      score: att.score,
      total_marks: att.total_marks,
      percentage: att.percentage,
      time_taken_seconds: att.time_taken_seconds,
      submitted_at: att.submitted_at
    }));
  }

  // ----------------------------------------------------
  // ANALYTICS
  // ----------------------------------------------------
  static async getAnalytics(filters?: {
    academic_year?: AcademicYear;
    subject?: string;
    date?: string;
    quiz_id?: string;
    search_student?: string;
  }): Promise<QuizAnalyticsSummary> {
    const allQuizzes = await this.getAllQuizzes();
    let allAttempts = await this.getStudentAttempts();

    if (filters?.academic_year) {
      allAttempts = allAttempts.filter(a => a.academic_year === filters.academic_year);
    }
    if (filters?.date) {
      allAttempts = allAttempts.filter(a => a.quiz_date === filters.date);
    }
    if (filters?.quiz_id) {
      allAttempts = allAttempts.filter(a => a.quiz_id === filters.quiz_id);
    }
    if (filters?.subject) {
      const matchingQuizIds = new Set(allQuizzes.filter(q => q.subject.toLowerCase().includes(filters.subject!.toLowerCase())).map(q => q.id));
      allAttempts = allAttempts.filter(a => matchingQuizIds.has(a.quiz_id));
    }
    if (filters?.search_student) {
      const q = filters.search_student.toLowerCase();
      allAttempts = allAttempts.filter(a => a.student_name.toLowerCase().includes(q));
    }

    const totalAttempts = allAttempts.length;
    const uniqueParticipants = new Set(allAttempts.map(a => a.student_id || a.student_name)).size;

    const scores = allAttempts.map(a => a.score);
    const percentages = allAttempts.map(a => a.percentage);

    const averageScore = totalAttempts > 0 ? Number((scores.reduce((a, b) => a + b, 0) / totalAttempts).toFixed(1)) : 0;
    const averagePercentage = totalAttempts > 0 ? Math.round(percentages.reduce((a, b) => a + b, 0) / totalAttempts) : 0;
    const highestScore = totalAttempts > 0 ? Math.max(...scores) : 0;
    const lowestScore = totalAttempts > 0 ? Math.min(...scores) : 0;

    // Passing count
    const passedAttempts = allAttempts.filter(a => {
      const quiz = allQuizzes.find(q => q.id === a.quiz_id);
      const threshold = quiz?.passing_percentage ?? 50;
      return a.percentage >= threshold;
    }).length;
    const passPercentage = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    // Year-wise participation
    const yearCounts: Record<AcademicYear, { count: number; attempts: number }> = {
      "1st Year": { count: 0, attempts: 0 },
      "2nd Year": { count: 0, attempts: 0 },
      "3rd Year": { count: 0, attempts: 0 },
      "4th Year": { count: 0, attempts: 0 },
      "5th Year": { count: 0, attempts: 0 },
    };
    allQuizzes.forEach(q => {
      if (yearCounts[q.academic_year]) {
        yearCounts[q.academic_year].count++;
      }
    });
    allAttempts.forEach(a => {
      if (yearCounts[a.academic_year]) {
        yearCounts[a.academic_year].attempts++;
      }
    });
    const yearWiseParticipation = Object.entries(yearCounts).map(([year, val]) => ({
      year: year as AcademicYear,
      count: val.count,
      attempts: val.attempts
    }));

    // Subject-wise performance
    const subjectMap = new Map<string, { totalPct: number; count: number }>();
    allAttempts.forEach(a => {
      const q = allQuizzes.find(x => x.id === a.quiz_id);
      const subj = q?.subject || "General";
      const curr = subjectMap.get(subj) || { totalPct: 0, count: 0 };
      curr.totalPct += a.percentage;
      curr.count++;
      subjectMap.set(subj, curr);
    });
    const subjectWisePerformance = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      averagePercentage: Math.round(data.totalPct / data.count),
      attempts: data.count
    }));

    // Day-wise participation
    const dayMap = new Map<string, number>();
    allAttempts.forEach(a => {
      const d = a.quiz_date;
      dayMap.set(d, (dayMap.get(d) || 0) + 1);
    });
    const dayWiseParticipation = Array.from(dayMap.entries())
      .map(([date, attempts]) => ({ date, attempts }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14);

    // Quiz-wise performance
    const quizWisePerformance = allQuizzes.map(q => {
      const qAttempts = allAttempts.filter(a => a.quiz_id === q.id);
      const count = qAttempts.length;
      const avgScore = count > 0 ? Number((qAttempts.reduce((acc, curr) => acc + curr.score, 0) / count).toFixed(1)) : 0;
      const passes = qAttempts.filter(a => a.percentage >= q.passing_percentage).length;
      return {
        quizId: q.id,
        title: q.title,
        academicYear: q.academic_year,
        subject: q.subject,
        attempts: count,
        averageScore: avgScore,
        passPercentage: count > 0 ? Math.round((passes / count) * 100) : 0
      };
    });

    return {
      totalQuizzes: allQuizzes.length,
      totalAttempts,
      totalParticipants: uniqueParticipants,
      averageScore,
      averagePercentage,
      highestScore,
      lowestScore,
      passPercentage,
      yearWiseParticipation,
      subjectWisePerformance,
      dayWiseParticipation,
      quizWisePerformance
    };
  }
}
