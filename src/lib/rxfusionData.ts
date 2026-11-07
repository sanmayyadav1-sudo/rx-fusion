export const YR = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'] as const;
export type AcademicYearName = typeof YR[number];

export const SL = ['first-year', 'second-year', 'third-year', 'fourth-year', 'fifth-year', 'sixth-year'] as const;

export const SUB: string[][] = [
  // 1st Year
  [
    'Human anatomy and physiology',
    'Pharmaceutics',
    'Medicinal biochemistry',
    'Pharmaceutical organic chemistry',
    'Pharmaceutical inorganic chemistry',
  ],
  // 2nd Year
  [
    'Pathophysiology',
    'Pharmaceutical microbiology',
    'Pharmacognosy and phytopharmaceuticals',
    'Pharmacology I',
    'Community pharmacy',
  ],
  // 3rd Year
  [
    'Pharmacology II',
    'Pharmaceutical analysis',
    'Medicinal chemistry',
    'Pharmaceutical formulations',
    'Pharmacotherapeutics I',
  ],
  // 4th Year
  [
    'Pharmacotherapeutics II',
    'Pharmacoepidemiology',
    'Clinical pharmacy',
    'Hospital pharmacy',
    'Clinical toxicology',
  ],
  // 5th Year
  [
    'Clinical pharmacokinetics',
    'Biostatistics and research methodology',
    'Pharmacovigilance',
    'Clinical research',
    'Pharmacoeconomics',
  ],
  // 6th Year (Internship)
  [
    'Ward rounds and clinical clerkship',
    'Medication chart review',
    'Patient counselling practice',
    'Drug information service',
    'Internship project report',
  ],
];

export interface SpecialtyItem {
  name: string;
  desc: string;
}

export const SP: SpecialtyItem[] = [
  { name: 'Cardiology', desc: 'Hypertension, heart failure, ACS' },
  { name: 'Infectious Diseases', desc: 'Antimicrobial stewardship' },
  { name: 'Neurology', desc: 'Epilepsy, stroke, Parkinson’s' },
  { name: 'Nephrology', desc: 'CKD, dose adjustment' },
  { name: 'Pulmonology', desc: 'Asthma, COPD' },
  { name: 'Gastroenterology', desc: 'GERD, IBD, liver disease' },
  { name: 'Endocrinology', desc: 'Diabetes, thyroid' },
  { name: 'Oncology', desc: 'Supportive care, chemotherapy' },
  { name: 'Pediatrics', desc: 'Weight-based dosing' },
  { name: 'Dermatology', desc: 'Psoriasis, acne, eczema' },
];

export const FEAT: string[] = [
  'Disease information',
  'Clinical cases',
  'Diagnostic investigations',
  'Treatment approaches',
  'Drug therapy',
  'Pharmaceutical care',
  'Patient counselling',
  'Clinical guidelines',
];

export interface DrugItem {
  g: string; // generic
  b: string; // brands
  c: string; // class
  m: string; // mechanism
  i: string; // indications
  ci: string; // contraindications
  ae: string; // adverse effects
  d: string; // dosage
  x: string; // interactions
  mo: string; // monitoring
  p: string; // patient counselling
}

export const DRUGS: DrugItem[] = [
  {
    g: 'Amlodipine',
    b: 'Amlip, Norvasc',
    c: 'Dihydropyridine calcium channel blocker',
    m: 'Blocks L-type calcium channels in vascular smooth muscle, causing vasodilation.',
    i: 'Hypertension, chronic stable angina',
    ci: 'Cardiogenic shock, severe aortic stenosis',
    ae: 'Ankle oedema, flushing, headache',
    d: 'Adults: 5 mg once daily, usual maximum 10 mg daily',
    x: 'Simvastatin (limit simvastatin dose), CYP3A4 inhibitors',
    mo: 'Blood pressure, heart rate, oedema',
    p: 'Report swelling of the feet; take at the same time daily',
  },
  {
    g: 'Amoxicillin',
    b: 'Novamox, Mox',
    c: 'Aminopenicillin',
    m: 'Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.',
    i: 'Respiratory, urinary and ENT infections; part of H. pylori regimens',
    ci: 'Penicillin hypersensitivity',
    ae: 'Diarrhoea, rash, rarely anaphylaxis',
    d: 'Adults: commonly 500 mg three times daily; adjust in renal impairment',
    x: 'Methotrexate, warfarin',
    mo: 'Allergy history, renal function, clinical response',
    p: 'Complete the prescribed course; report rash or breathing difficulty',
  },
  {
    g: 'Atorvastatin',
    b: 'Atorva, Lipitor',
    c: 'HMG-CoA reductase inhibitor (statin)',
    m: 'Reduces hepatic cholesterol synthesis and upregulates LDL receptors.',
    i: 'Dyslipidaemia, cardiovascular risk reduction',
    ci: 'Active liver disease, pregnancy',
    ae: 'Myalgia, raised transaminases, rarely rhabdomyolysis',
    d: 'Adults: 10 to 80 mg once daily',
    x: 'Clarithromycin, cyclosporine, large amounts of grapefruit juice',
    mo: 'Lipid profile, liver enzymes, CK if muscle symptoms',
    p: 'Report unexplained muscle pain or dark urine',
  },
  {
    g: 'Levetiracetam',
    b: 'Levipil, Keppra',
    c: 'Antiepileptic',
    m: 'Binds synaptic vesicle protein SV2A, modulating neurotransmitter release.',
    i: 'Focal and generalised seizures',
    ci: 'Hypersensitivity',
    ae: 'Somnolence, irritability, mood changes',
    d: 'Adults: start 500 mg twice daily; reduce in renal impairment',
    x: 'Few pharmacokinetic interactions',
    mo: 'Renal function, mood and behaviour, seizure frequency',
    p: 'Do not stop suddenly; report mood changes',
  },
  {
    g: 'Metformin',
    b: 'Glycomet, Glucophage',
    c: 'Biguanide',
    m: 'Reduces hepatic glucose output and improves insulin sensitivity.',
    i: 'Type 2 diabetes mellitus',
    ci: 'Severe renal impairment, metabolic acidosis',
    ae: 'Gastrointestinal upset, vitamin B12 deficiency, rarely lactic acidosis',
    d: 'Adults: start 500 mg with meals, titrate; check the label and renal function',
    x: 'Iodinated contrast, alcohol',
    mo: 'eGFR, HbA1c, vitamin B12',
    p: 'Take with food; hold during acute illness with dehydration',
  },
  {
    g: 'Salbutamol',
    b: 'Asthalin, Ventolin',
    c: 'Short-acting beta-2 agonist',
    m: 'Stimulates beta-2 receptors, relaxing bronchial smooth muscle.',
    i: 'Asthma and COPD symptom relief',
    ci: 'Hypersensitivity',
    ae: 'Tremor, tachycardia, hypokalaemia at high doses',
    d: 'Inhaler: 100 to 200 mcg as needed',
    x: 'Non-selective beta-blockers',
    mo: 'Symptom response, heart rate, potassium at high doses',
    p: 'Rinse spacer; seek care if relief is short-lived',
  },
];

export interface BlogItem {
  title: string;
  category: string;
  author: string;
  readTime: string;
}

export const BLOGS: BlogItem[] = [
  {
    title: 'How to read a clinical trial in ten minutes',
    category: 'Evidence',
    author: 'Dr. A. Kulkarni',
    readTime: '6 min',
  },
  {
    title: 'Antimicrobial stewardship for interns',
    category: 'Clinical',
    author: 'R. Patil',
    readTime: '8 min',
  },
  {
    title: 'Writing your first review article',
    category: 'Research',
    author: 'S. Desai',
    readTime: '9 min',
  },
  {
    title: 'Vancouver referencing without the pain',
    category: 'Research',
    author: 'M. Shaikh',
    readTime: '5 min',
  },
  {
    title: 'Drug interactions worth memorising',
    category: 'Clinical',
    author: 'Dr. A. Kulkarni',
    readTime: '7 min',
  },
  {
    title: 'Planning the Pharm.D final year',
    category: 'Education',
    author: 'R. Patil',
    readTime: '4 min',
  },
];

export interface NewsItem {
  title: string;
  category: string;
}

export const NEWS: NewsItem[] = [
  { title: 'Curriculum review discussion for Pharm.D programmes', category: 'Pharmacy education' },
  { title: 'Clinical pharmacist roles expand in tertiary hospitals', category: 'Clinical pharmacy' },
  { title: 'New trial summary on SGLT2 inhibitors in CKD', category: 'Pharmaceutical research' },
  { title: 'Hospital medication safety initiative announced', category: 'Healthcare developments' },
  { title: 'Drug labelling update circulated for comment', category: 'Regulatory updates' },
  { title: 'Workshop on pharmacovigilance reporting', category: 'Pharmacy education' },
];

export interface ResourceItem {
  title: string;
  desc: string;
}

export const RES: ResourceItem[] = [
  { title: 'Educational PDFs', desc: 'Year-wise summary notes (sample)' },
  { title: 'Clinical guidelines', desc: 'Index of guideline sources' },
  { title: 'Study templates', desc: 'Weekly planner and SOAP template' },
  { title: 'Reference materials', desc: 'Abbreviation and unit sheets' },
  { title: 'Research documents', desc: 'Review article checklist' },
  { title: 'Academic resources', desc: 'Past question patterns' },
];

export interface ResearchHubTopic {
  title: string;
  desc: string;
}

export const RH: ResearchHubTopic[] = [
  { title: 'Research methodology', desc: 'Study designs, sampling, bias and validity.' },
  { title: 'Review article writing', desc: 'Scope, search strategy, synthesis and structure.' },
  { title: 'Literature search', desc: 'PubMed, Boolean operators, MeSH terms.' },
  { title: 'Evidence-based medicine', desc: 'Appraising and applying trial evidence.' },
  { title: 'Vancouver referencing', desc: 'Numbered citations and reference list format.' },
  { title: 'Publication guidance', desc: 'Choosing a journal, submission and peer review.' },
  { title: 'Research competitions', desc: 'Posters and review article contests.' },
];

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export const QZ: QuizQuestion[] = [
  {
    question: 'Which drug class does atorvastatin belong to?',
    options: ['Beta-blocker', 'HMG-CoA reductase inhibitor', 'ACE inhibitor', 'Loop diuretic'],
    correct: 1,
  },
  {
    question: 'Which antibiotic class does amoxicillin belong to?',
    options: ['Macrolide', 'Aminopenicillin', 'Fluoroquinolone', 'Tetracycline'],
    correct: 1,
  },
  {
    question: 'Which electrolyte disturbance is common with high-dose salbutamol?',
    options: ['Hyperkalaemia', 'Hypokalaemia', 'Hypernatraemia', 'Hypercalcaemia'],
    correct: 1,
  },
];

export interface FlashcardItem {
  front: string;
  back: string;
}

export const FCS: FlashcardItem[] = [
  { front: 'Antidote for paracetamol overdose', back: 'N-acetylcysteine' },
  { front: 'Target of metformin’s main effect', back: 'Reduced hepatic glucose output' },
  { front: 'Reference style used in biomedical journals', back: 'Vancouver (numbered)' },
  { front: 'Vitamin K antagonist anticoagulant', back: 'Warfarin' },
];

export const IX: Record<string, [string, string]> = {
  'aspirin|warfarin': ['Major', 'Additive bleeding risk. Avoid or monitor closely.'],
  'clarithromycin|simvastatin': ['Major', 'CYP3A4 inhibition raises statin levels and rhabdomyolysis risk.'],
  'contrast|metformin': ['Moderate', 'Risk of lactic acidosis with acute renal injury; follow local protocol.'],
  'nitrates|sildenafil': ['Major', 'Severe hypotension. Contraindicated.'],
  'lisinopril|spironolactone': ['Moderate', 'Hyperkalaemia risk. Monitor potassium and renal function.'],
};

export const IXD: string[] = [
  'aspirin',
  'clarithromycin',
  'contrast',
  'lisinopril',
  'metformin',
  'nitrates',
  'sildenafil',
  'simvastatin',
  'spironolactone',
  'warfarin',
];

export const DM = 'Demonstration content';

