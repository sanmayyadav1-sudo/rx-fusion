const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. Load env variables from .env.local
const envPath = path.join(__dirname, "./.env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found at " + envPath);
  process.exit(1);
}

function loadEnv(filePath) {
  const envContent = fs.readFileSync(filePath, "utf-8");
  const env = {};
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const index = trimmed.indexOf("=");
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const val = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, "");
        env[key] = val;
      }
    }
  });
  return env;
}

const env = loadEnv(envPath);
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

// 2. Define the 50 Colleges Data
const COLLEGES = [
  // PRIORITY GROUP A — PHARM.D / MAJOR PHARMACY INSTITUTIONS
  {
    name: "Manipal College of Pharmaceutical Sciences",
    slug: "manipal-college-of-pharmaceutical-sciences",
    city: "Manipal",
    state: "Karnataka",
    college_type: "Deemed University",
    address: "Madhav Nagar, Manipal, Karnataka - 576104",
    official_website: "https://manipal.edu/mcops.html",
    admission_website: "https://manipal.edu/admissions.html",
    contact_number: "+91-820-2922482",
    admission_email: "admissions@manipal.edu",
    admission_status: "contact_college",
    admission_session: "2026-2027",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: true,
    is_published: true,
    display_order: 10,
    short_description: "A premier pharmacy education institution in Manipal, Karnataka, offering undergraduate, postgraduate, and professional doctoral pharmacy programmes.",
    overview: "Manipal College of Pharmaceutical Sciences (MCOPS) was established in 1963 and is one of the top-ranked pharmacy colleges in India. It is a constituent college of Manipal Academy of Higher Education (MAHE), recognized for its state-of-the-art research laboratories and academic excellence.",
    eligibility: "Eligibility varies by programme. Pharm.D/B.Pharm applicants must have completed 10+2 with PCB/PCM. Postgraduate applicants require a valid B.Pharm degree.",
    admission_process: "Online registration followed by the Manipal Entrance Test (MET) and counselling/seat allocation based on ranks.",
    entrance_exam: "MET (Manipal Entrance Test)",
    fees_information: "Refer to the official admission portal for the latest programme-wise tuition fees and security deposits.",
    hostel_information: "Separate hostels for boys and girls on campus with modern dining, Wi-Fi, and security facilities.",
    clinical_training_information: "Clinical training and ward rounds are conducted at Kasturba Hospital, Manipal (a 2032-bed teaching hospital).",
    placement_information: "Active placement cell with tie-ups with major pharmaceutical companies, clinical research organizations, and hospital chains.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with Physics, Chemistry and Biology/Mathematics", is_active: true },
      { course_name: "Pharm.D (Post Baccalaureate)", course_duration: "3 Years", intake: "10", course_fee: "", eligibility: "B.Pharm degree from a PCI approved institution", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB or PCM with minimum 50% marks", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB or PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "120", course_fee: "", eligibility: "B.Pharm degree with minimum 55% marks", is_active: true },
    ]
  },
  {
    name: "JSS College of Pharmacy, Mysuru",
    slug: "jss-college-of-pharmacy-mysuru",
    city: "Mysuru",
    state: "Karnataka",
    college_type: "Deemed University",
    address: "Sri Shivarathreeshwara Nagar, Mysuru, Karnataka - 570015",
    official_website: "https://www.jssuni.edu.in/",
    admission_website: "https://www.jssuni.edu.in/admissions",
    contact_number: "+91-821-2548353",
    admission_email: "admissions@jssuni.edu.in",
    admission_status: "contact_college",
    admission_session: "2026-2027",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: true,
    is_published: true,
    display_order: 20,
    short_description: "A leading pharmacy institution in Mysuru providing quality education and clinical research opportunities.",
    overview: "Established in 1973, JSS College of Pharmacy, Mysuru is a constituent college of JSS Academy of Higher Education & Research. It is highly regarded for its clinical pharmacy programmes and research in pharmaceutical sciences.",
    eligibility: "Applicants must meet the stream-specific eligibility criteria defined by JSS AHER, including 10+2 for B.Pharm/Pharm.D and B.Pharm for postgraduate courses.",
    admission_process: "Admissions are based on merit and entrance tests conducted by JSS AHER followed by counselling sessions.",
    entrance_exam: "JSS AHER Entrance Exam / Merit-based",
    fees_information: "Detailed tuition and academic fees are updated annually on the JSS Academy admissions page.",
    hostel_information: "Comprehensive hostel infrastructure with mess facilities, recreational halls, and security.",
    clinical_training_information: "Practical rotations and clerkships are hosted at JSS Hospital, Mysuru (a 1800-bed facility).",
    placement_information: "Strong placement cell providing career opportunities in pharmacovigilance, formulation R&D, and clinical data management.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM or D.Pharm", is_active: true },
      { course_name: "Pharm.D (Post Baccalaureate)", course_duration: "3 Years", intake: "10", course_fee: "", eligibility: "B.Pharm from PCI approved college", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with 50% in science subjects", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "120", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "JSS College of Pharmacy, Ooty",
    slug: "jss-college-of-pharmacy-ooty",
    city: "Ooty",
    state: "Tamil Nadu",
    college_type: "Deemed University",
    address: "Rocklands, Ootacamund, Tamil Nadu - 643001",
    official_website: "https://www.jssuni.edu.in/",
    admission_website: "https://www.jssuni.edu.in/admissions",
    contact_number: "+91-423-2443393",
    admission_email: "jsscpooty@jssuni.edu.in",
    admission_status: "contact_college",
    admission_session: "2026-2027",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: true,
    is_published: true,
    display_order: 30,
    short_description: "A prestigious pharmacy college in Ooty, Tamil Nadu, known for research and clinical pharmacy expertise.",
    overview: "JSS College of Pharmacy, Ootacamund (Ooty) was established in 1980. Nestled in the Nilgiris, this constituent college of JSS AHER is globally recognized for its academic standards, research output, and international collaborations.",
    eligibility: "Varies by programme. Pharm.D & B.Pharm require 10+2 (science stream) with PCB/PCM. M.Pharm requires B.Pharm with GPAT score preference.",
    admission_process: "Online applications through JSS AHER, followed by entrance scores ranking or merit analysis.",
    entrance_exam: "JSS AHER Entrance Exam / GPAT",
    fees_information: "Refer to the college prospectus or website for session-specific fee charts.",
    hostel_information: "Residential campus offering safe hostel living with vegetarian and non-vegetarian mess systems.",
    clinical_training_information: "Clinical training is conducted at the Government Head Quarters Hospital, Ooty.",
    placement_information: "Excellent track record with placement drives attracting clinical research organizations and pharmaceutical developers.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "Pharm.D (Post Baccalaureate)", course_duration: "3 Years", intake: "10", course_fee: "", eligibility: "B.Pharm degree", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCM/PCB", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "120", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Poona College of Pharmacy",
    slug: "poona-college-of-pharmacy",
    city: "Pune",
    state: "Maharashtra",
    college_type: "Deemed University",
    address: "Erandwane, Pune, Maharashtra - 411038",
    official_website: "http://pcp.bharatividyapeeth.edu",
    admission_website: "https://bvuniversity.edu.in",
    contact_number: "+91-20-25437237",
    admission_email: "pcp.pune@bharatividyapeeth.edu",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: true,
    is_published: true,
    display_order: 40,
    short_description: "A landmark pharmacy institution of Bharati Vidyapeeth in Pune, offering comprehensive research and professional degree courses.",
    overview: "Poona College of Pharmacy (PCP) was established in 1981 by Dr. Patangrao Kadam. It is a pioneer institute in Maharashtra, recognized by PCI and AICTE, and is a constituent unit of Bharati Vidyapeeth (Deemed to be University).",
    eligibility: "For B.Pharm/Pharm.D, candidates must have passed 10+2 with PCB/PCM and appeared for the university entrance exam.",
    admission_process: "Through the Bharati Vidyapeeth common entrance test (BVP-CET) followed by centralized counselling.",
    entrance_exam: "BVP-CET",
    fees_information: "Refer to the Bharati Vidyapeeth university site for fee details of current batches.",
    hostel_information: "Hostels are available for both boys and girls with standard dining services.",
    clinical_training_information: "Clinical pharmacy services and training are situated at Bharati Hospital & Research Centre, Pune.",
    placement_information: "Regular recruiter visits from global MNCs, research laboratories, and medical systems.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "Pharm.D (Post Baccalaureate)", course_duration: "3 Years", intake: "10", course_fee: "", eligibility: "B.Pharm from PCI approved college", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with 50% marks in science", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "N.G.S.M. Institute of Pharmaceutical Sciences",
    slug: "n-g-s-m-institute-of-pharmaceutical-sciences",
    city: "Mangaluru",
    state: "Karnataka",
    college_type: "Deemed University",
    address: "Paneer, Deralakatte, Mangaluru, Karnataka - 575018",
    official_website: "https://ngsmips.nitte.edu.in",
    admission_website: "https://nitte.edu.in/admissions",
    contact_number: "+91-824-2203991",
    admission_email: "info@nitte.edu.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 50,
    short_description: "A reputed institute of Nitte University in Mangaluru, specializing in advanced pharmaceutical education.",
    overview: "N.G.S.M. Institute of Pharmaceutical Sciences (NGSMIPS) was established in 1983. It is a constituent college of Nitte (Deemed to be University) and is recognized for research in drug delivery systems and pharmacology.",
    eligibility: "Based on regulatory specifications: 10+2 science with PCB/PCM for B.Pharm and Pharm.D. B.Pharm for M.Pharm.",
    admission_process: "Through online university admission portal on merit basis or rank lists from competitive tests.",
    entrance_exam: "Nitte Entrance Test / KCET",
    fees_information: "Tuition structures are available in the university prospectus on the Nitte admissions page.",
    hostel_information: "Comfortable campus accommodation with dining, sports, and health support.",
    clinical_training_information: "Pharm.D students undergo clinical rotations at Justice K.S. Hegde Charitable Hospital (1000 beds).",
    placement_information: "Active placement cell coordinating recruitment sessions with healthcare networks and pharma developers.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with 50% in PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Al-Ameen College of Pharmacy",
    slug: "al-ameen-college-of-pharmacy",
    city: "Bengaluru",
    state: "Karnataka",
    college_type: "Private",
    address: "Near Lalbagh Main Gate, Hosur Road, Bengaluru, Karnataka - 560027",
    official_website: "https://alameenpharmacy.edu.in",
    admission_website: "https://alameenpharmacy.edu.in/admissions",
    contact_number: "+91-80-22234619",
    admission_email: "alameenccp@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 60,
    short_description: "A landmark pharmacy institution located in Bengaluru, affiliated with RGUHS.",
    overview: "Established in 1983 under the Al-Ameen Educational Society, this college is affiliated with Rajiv Gandhi University of Health Sciences (RGUHS). It is a hub of pharmaceutical education in central Bengaluru.",
    eligibility: "Candidates must have cleared 10+2 with PCM/PCB from a recognized board for undergraduate programmes.",
    admission_process: "Admissions are processed via KCET counselling for government seats, and direct applications for management seats.",
    entrance_exam: "KCET",
    fees_information: "Contact the administrative desk for the latest course-wise fee structure.",
    hostel_information: "Separate residential options for outstation students with dining setups.",
    clinical_training_information: "Clinical pharmacy and Pharm.D ward rounds are completed at Bowring & Lady Curzon Hospital, Bengaluru.",
    placement_information: "Conducts annual recruitment drives for pharmacovigilance and formulation jobs.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "KLE College of Pharmacy, Belagavi",
    slug: "kle-college-of-pharmacy-belagavi",
    city: "Belagavi",
    state: "Karnataka",
    college_type: "Deemed University",
    address: "JNMC Campus, Nehru Nagar, Belagavi, Karnataka - 590010",
    official_website: "https://klepharm.edu",
    admission_website: "https://kledeemeduniversity.edu.in",
    contact_number: "+91-831-2471399",
    admission_email: "principal@klepharm.edu",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 70,
    short_description: "A premier constituent college of KLE Academy of Higher Education and Research in Belagavi.",
    overview: "Established in 1968, KLE College of Pharmacy, Belagavi is a constituent unit of KAHER. It is known for high-quality education, advanced labs, and research initiatives.",
    eligibility: "10+2 or equivalent with PCB/PCM for undergraduate studies; B.Pharm for postgraduate courses.",
    admission_process: "Through national level entrance tests or KAHER merit rankings followed by counselling.",
    entrance_exam: "KAHER Exam / KCET",
    fees_information: "Tuition structures are published on the KAHER university web portal.",
    hostel_information: "Hostel rooms on campus with basic amenities, hot water, and common dining rooms.",
    clinical_training_information: "Pharm.D training is hosted at KLES Dr. Prabhakar Kore Charitable Hospital, Belagavi (2400 beds).",
    placement_information: "Coordinates with top global corporate companies in analytics, clinical testing, and sales.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with science stream", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 science", is_active: true },
    ]
  },
  {
    name: "PSG College of Pharmacy",
    slug: "psg-college-of-pharmacy-coimbatore",
    city: "Coimbatore",
    state: "Tamil Nadu",
    college_type: "Private",
    address: "Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu - 641004",
    official_website: "https://www.psgpharma.ac.in",
    admission_website: "https://www.psgpharma.ac.in/admissions",
    contact_number: "+91-422-2570170",
    admission_email: "principal@psgpharma.ac.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 80,
    short_description: "A prominent pharmacy institution under the PSG Sons & Charities trust in Coimbatore.",
    overview: "PSG College of Pharmacy was established in 2001. Affiliated with The Tamil Nadu Dr. M.G.R. Medical University, it forms part of the sprawling PSG Hospitals campus, facilitating clinical training.",
    eligibility: "Based on Tamil Nadu state rules: 10+2 with PCB/PCM for B.Pharm and Pharm.D.",
    admission_process: "Through Tamil Nadu state government single-window counselling and college merit lists.",
    entrance_exam: "State Counselling Merit List",
    fees_information: "Refer to the college prospectus for fees details.",
    hostel_information: "Hostels with dining halls and sports amenities are situated on the medical campus.",
    clinical_training_information: "Practical ward instruction is based at the 1400-bed multi-specialty PSG Hospitals, Coimbatore.",
    placement_information: "Placement cell assists students with career options in research, medical copywriting, and pharmaceutical marketing.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with 50% in PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Sri Ramachandra Faculty of Pharmacy",
    slug: "sri-ramachandra-faculty-of-pharmacy",
    city: "Chennai",
    state: "Tamil Nadu",
    college_type: "Deemed University",
    address: "Porur, Chennai, Tamil Nadu - 600116",
    official_website: "https://www.sriramachandra.edu.in",
    admission_website: "https://www.sriramachandra.edu.in/admissions",
    contact_number: "+91-44-24765600",
    admission_email: "admissionsinfo@sriramachandra.edu.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 90,
    short_description: "A prestigious constituent faculty of Sri Ramachandra Institute of Higher Education and Research in Chennai.",
    overview: "Sri Ramachandra Faculty of Pharmacy was established in 1993. It is a part of the Sri Ramachandra Institute of Higher Education and Research (Deemed University), offering cutting-edge pharmacy education.",
    eligibility: "10+2 with science stream (PCB/PCM) for B.Pharm and Pharm.D.",
    admission_process: "Through the university's common entrance examination and counselling process.",
    entrance_exam: "SRIHER Entrance Exam",
    fees_information: "Updated structures are available on the SRIHER portal.",
    hostel_information: "Comprehensive campus boarding with all standard accommodation options.",
    clinical_training_information: "Ward training and pharmacy practice occur at Sri Ramachandra Hospital (1600 beds).",
    placement_information: "Strong relationships with corporate pharmacy networks, pharmacovigilance units, and clinical trial groups.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCM/PCB", is_active: true },
    ]
  },
  {
    name: "SRM College of Pharmacy",
    slug: "srm-college-of-pharmacy",
    city: "Kattankulathur",
    state: "Tamil Nadu",
    college_type: "Deemed University",
    address: "SRM Nagar, Kattankulathur, Kancheepuram Dist., Tamil Nadu - 603203",
    official_website: "https://www.srmist.edu.in",
    admission_website: "https://www.srmist.edu.in/admissions",
    contact_number: "+91-44-27417000",
    admission_email: "admissions.india@srmist.edu.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 100,
    short_description: "A leading pharmacy institution under SRM Institute of Science and Technology, Chennai.",
    overview: "SRM College of Pharmacy was established in 1992 and is a constituent of SRMIST. It has developed into a premier centre for research, development, and professional studies in pharmaceutical sciences.",
    eligibility: "Science stream (PCB/PCM) in 10+2 for UG courses. B.Pharm for M.Pharm.",
    admission_process: "Based on SRM Joint Entrance Examination or direct application merit evaluation.",
    entrance_exam: "SRMJEEE (if applicable) / Merit-based",
    fees_information: "Refer to the SRMIST admissions site for program fee structures.",
    hostel_information: "Excellent multi-hostel residential facilities with AC/non-AC room variants.",
    clinical_training_information: "Clinical experience is provided at SRM Medical College Hospital and Research Centre (1200 beds).",
    placement_information: "Facilitates recruitment with global healthcare consultancies and research operations.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Amrita School of Pharmacy",
    slug: "amrita-school-of-pharmacy",
    city: "Kochi",
    state: "Kerala",
    college_type: "Deemed University",
    address: "AIMS Health Sciences Campus, AIMS Ponekkara, Kochi, Kerala - 682041",
    official_website: "https://www.amrita.edu/school/pharmacy",
    admission_website: "https://www.amrita.edu/admissions",
    contact_number: "+91-484-2856230",
    admission_email: "pharmacy@aims.amrita.edu",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 110,
    short_description: "A prominent pharmacy institute located on the health sciences campus of Amrita Vishwa Vidyapeetham in Kochi.",
    overview: "Amrita School of Pharmacy, established in 1997, is integrated with the super-specialty hospital AIMS. It offers specialized clinical and laboratory training for pharmacists.",
    eligibility: "10+2 with PCB/PCM from a recognized board for UG programs.",
    admission_process: "Based on online registration, academic merit, or score in entrance exams followed by interview.",
    entrance_exam: "Amrita Entrance Exam / Merit-based",
    fees_information: "Academic fee tables are updated on the school health campus website.",
    hostel_information: "In-campus secure hostels with strict discipline and standard dining services.",
    clinical_training_information: "Pharm.D students complete clinical practice at Amrita Institute of Medical Sciences (AIMS), a 1350-bed hospital.",
    placement_information: "Collaborates with medical networks, clinical analytics organizations, and corporate pharmacies.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 science with 50% marks", is_active: true },
    ]
  },
  {
    name: "Andhra University College of Pharmaceutical Sciences",
    slug: "andhra-university-college-of-pharmaceutical-sciences",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    college_type: "University Department",
    address: "Andhra University Campus, Waltair, Visakhapatnam, Andhra Pradesh - 530003",
    official_website: "https://www.andhrauniversity.edu.in",
    admission_website: "https://sche.ap.gov.in",
    contact_number: "+91-891-2844922",
    admission_email: "principal.aucps@andhrauniversity.edu.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 120,
    short_description: "The historical department of pharmacy of Andhra University, Visakhapatnam.",
    overview: "Andhra University is one of the oldest universities in India. Its pharmacy college, established as a department in 1937, was a pioneer in launching pharmacy education in the country.",
    eligibility: "Through AP EAPCET counselling for UG courses, subject to general university norms.",
    admission_process: "Centralized state-level counselling based on EAPCET ranks for B.Pharm and Pharm.D.",
    entrance_exam: "AP EAPCET / GPAT",
    fees_information: "Low-cost government-regulated fees. Exact amounts are updated on the university portal.",
    hostel_information: "University campus hostels are available for students with common mess structures.",
    clinical_training_information: "Clinical training and internships are aligned with King George Hospital (KGH), Visakhapatnam.",
    placement_information: "Placement cell assists with corporate recruitment, R&D labs, and hospital jobs.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "40", course_fee: "", eligibility: "10+2 with science stream", is_active: true },
    ]
  },
  {
    name: "Annamalai University Department of Pharmacy",
    slug: "annamalai-university-department-of-pharmacy",
    city: "Chidambaram",
    state: "Tamil Nadu",
    college_type: "University Department",
    address: "Annamalai Nagar, Chidambaram, Tamil Nadu - 608002",
    official_website: "https://www.annamalaiuniversity.ac.in",
    admission_website: "https://www.annamalaiuniversity.ac.in/adm",
    contact_number: "+91-4144-238062",
    admission_email: "au_admissions@yahoo.co.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 130,
    short_description: "A prominent state university department of pharmacy in Chidambaram, Tamil Nadu.",
    overview: "The Department of Pharmacy at Annamalai University was established in 1982. It is a well-established state-funded department that offers comprehensive research facilities.",
    eligibility: "Based on Tamil Nadu state council norms and academic merit of the qualifying examination.",
    admission_process: "State level merit rank list followed by counselling rounds at the university campus.",
    entrance_exam: "Merit-based Counselling",
    fees_information: "Affordable public fee structures updated on the university website.",
    hostel_information: "Extensive university hostel rooms with standard facilities.",
    clinical_training_information: "Clinical practices are held at Rajah Muthiah Medical College and Hospital (RMMCH).",
    placement_information: "Placement cell assists students with academic, industry, and retail pharmacy careers.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 science", is_active: true },
    ]
  },
  {
    name: "GITAM School of Pharmacy",
    slug: "gitam-school-of-pharmacy",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    college_type: "Deemed University",
    address: "Gandhi Nagar, Rushikonda, Visakhapatnam, Andhra Pradesh - 530045",
    official_website: "https://www.gitam.edu",
    admission_website: "https://apply.gitam.edu",
    contact_number: "+91-891-2866455",
    admission_email: "admissions@gitam.edu",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 140,
    short_description: "A modern pharmacy institution of GITAM Deemed University in Visakhapatnam.",
    overview: "GITAM School of Pharmacy offers contemporary academic programs in pharmaceutical sciences. It features modern laboratory infrastructures and promotes research activities.",
    eligibility: "10+2 or equivalent with Physics, Chemistry, and Biology/Mathematics with minimum 50% marks.",
    admission_process: "Through the GITAM Admission Test (GAT) followed by counseling.",
    entrance_exam: "GAT (GITAM Admission Test)",
    fees_information: "Refer to the official GITAM fee structure portal for detail fees.",
    hostel_information: "Excellent hostel life with AC and non-AC rooms, Wi-Fi, and fitness centres.",
    clinical_training_information: "Clinical practice and academic collaborations are hosted on-campus.",
    placement_information: "Placement cell manages campus hiring drives with multinational companies.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM and GAT score", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "36", course_fee: "", eligibility: "B.Pharm degree with qualifying marks", is_active: true },
    ]
  },
  {
    name: "M.S. Ramaiah University of Applied Sciences – Faculty of Pharmacy",
    slug: "ms-ramaiah-university-of-applied-sciences-faculty-of-pharmacy",
    city: "Bengaluru",
    state: "Karnataka",
    college_type: "Private",
    address: "Gnanagangothri Campus, MSR Nagar, Bengaluru, Karnataka - 560054",
    official_website: "https://www.msruas.ac.in",
    admission_website: "https://www.msruas.ac.in/admissions",
    contact_number: "+91-80-23600966",
    admission_email: "director.admissions@msruas.ac.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 150,
    short_description: "A prominent private pharmacy faculty under MSRUAS in Bengaluru.",
    overview: "The Faculty of Pharmacy was originally established in 1992 as M.S. Ramaiah College of Pharmacy. It is now a constituent faculty of M.S. Ramaiah University of Applied Sciences (MSRUAS), Bangalore.",
    eligibility: "For B.Pharm/Pharm.D, candidates must have cleared 10+2 with PCM/PCB and obtained eligibility clearance.",
    admission_process: "Through KCET, COMEDK, or direct university registration on merit rank basis.",
    entrance_exam: "KCET / RUAS Admission Test",
    fees_information: "Fee structure is details in the RUAS admission booklet.",
    hostel_information: "Separate hostel buildings on-campus with modern infrastructure.",
    clinical_training_information: "Clinical practice training is hosted at Ramaiah Memorial Hospital, Bengaluru.",
    placement_information: "Dedicated placement portal aiding students to find careers in testing laboratories and retail industries.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Nirma University Institute of Pharmacy",
    slug: "nirma-university-institute-of-pharmacy",
    city: "Ahmedabad",
    state: "Gujarat",
    college_type: "Private",
    address: "Sarkhej-Gandhinagar Highway, Ahmedabad, Gujarat - 382481",
    official_website: "https://pharmacy.nirmauni.ac.in",
    admission_website: "https://pharmacy.nirmauni.ac.in/admissions",
    contact_number: "+91-79-71652000",
    admission_email: "admission.ip@nirmauni.ac.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 160,
    short_description: "A leading private pharmacy institute of Nirma University in Ahmedabad.",
    overview: "Institute of Pharmacy was established in 2003 by Nirma University. It is accredited with 'A+' grade by NAAC and is recognized for research and development.",
    eligibility: "Candidates must have cleared 10+2 with PCB/PCM and appeared for GUJCET/NEET.",
    admission_process: "Through ACPC counselling in Gujarat and direct admissions for all-India seats.",
    entrance_exam: "GUJCET / JEE / NEET",
    fees_information: "Tuition details are updated on the university fees section.",
    hostel_information: "Hostel facility is available for outstation students with mess facility.",
    clinical_training_information: "Collaborates with municipal and private clinical setups for internships.",
    placement_information: "Excellent placement records in drug discovery, clinical trials, and manufacturing companies.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "45", course_fee: "", eligibility: "B.Pharm degree with 55% marks", is_active: true },
    ]
  },
  {
    name: "ISF College of Pharmacy",
    slug: "isf-college-of-pharmacy",
    city: "Moga",
    state: "Punjab",
    college_type: "Private",
    address: "Ferozepur Road, Ghal Kalan, Moga, Punjab - 142001",
    official_website: "https://www.isfcp.org",
    admission_website: "https://www.isfcp.org/admission",
    contact_number: "+91-9878345141",
    admission_email: "isfcop.moga@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 170,
    short_description: "A prominent autonomous pharmacy college in Moga, Punjab, recognized for pharmaceutical research.",
    overview: "Established in 1984, ISF College of Pharmacy (ISFCP) is an autonomous institution affiliated with I.K. Gujral Punjab Technical University (PTU). It is highly ranked for research.",
    eligibility: "10+2 science with PCB/PCM. B.Pharm for postgraduate courses.",
    admission_process: "Through PTU counselling and direct application selection criteria.",
    entrance_exam: "Merit-based / PTU Counselling",
    fees_information: "Affordable private fees, contact college administration for details.",
    hostel_information: "Boys and girls hostel inside campus with library and Wi-Fi access.",
    clinical_training_information: "Practical clinical exposure at associated multi-specialty hospitals in Moga.",
    placement_information: "Active placements in pharmaceutical product management and testing.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Chitkara College of Pharmacy",
    slug: "chitkara-college-of-pharmacy",
    city: "Rajpura",
    state: "Punjab",
    college_type: "Private",
    address: "Chandigarh-Patiala National Highway (NH-64), Rajpura, Punjab - 140401",
    official_website: "https://www.chitkara.edu.in",
    admission_website: "https://www.chitkara.edu.in/admissions",
    contact_number: "+91-9501105714",
    admission_email: "admissions@chitkara.edu.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 180,
    short_description: "A leading private pharmacy institution of Chitkara University, Punjab.",
    overview: "Chitkara College of Pharmacy was established in 2005 under Chitkara University. It focuses on industry-ready curricula and collaborative research with pharmaceutical giants.",
    eligibility: "10+2 (PCB/PCM) with minimum 50% marks. M.Pharm requires B.Pharm with GPAT score preference.",
    admission_process: "Through direct online applications, merit lists, and counseling rounds.",
    entrance_exam: "Chitkara Entrance Test / Merit-based",
    fees_information: "Refer to Chitkara University fees portal.",
    hostel_information: "State-of-the-art separate hostels with gym, Wi-Fi, and mess facilities.",
    clinical_training_information: "Collaborates with local multi-specialty teaching hospitals for ward rotations.",
    placement_information: "Very active placement cell attracting global medical companies and research labs.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Shoolini University School of Pharmaceutical Sciences",
    slug: "shoolini-university-school-of-pharmaceutical-sciences",
    city: "Solan",
    state: "Himachal Pradesh",
    college_type: "Private",
    address: "Oachghat-Kumarhatti Road, Solan, Himachal Pradesh - 173223",
    official_website: "https://shooliniuniversity.com",
    admission_website: "https://shooliniuniversity.com/admissions",
    contact_number: "+91-9625233301",
    admission_email: "admissions@shooliniuniversity.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 190,
    short_description: "A research-focused private pharmacy school of Shoolini University in Solan.",
    overview: "The School of Pharmaceutical Sciences at Shoolini University is recognized for research and development. It is ranked among the top pharmacy institutions by NIRF.",
    eligibility: "10+2 with PCM/PCB. GPAT qualifying candidates preferred for M.Pharm.",
    admission_process: "Based on direct online registration, Shoolini entrance test, or national test scores.",
    entrance_exam: "Shoolini Entrance Test (SU-SAT)",
    fees_information: "Detailed fees schedule can be requested from the university website.",
    hostel_information: "Standard residential accommodation with dining, internet, and sports options.",
    clinical_training_information: "Collaborations with regional hospitals for clinical exposure.",
    placement_information: "Good placements in manufacturing, pharmaceutical research, and quality control.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "36", course_fee: "", eligibility: "B.Pharm with minimum marks", is_active: true },
    ]
  },
  {
    name: "Lovely Professional University School of Pharmaceutical Sciences",
    slug: "lovely-professional-university-school-of-pharmaceutical-sciences",
    city: "Phagwara",
    state: "Punjab",
    college_type: "Private",
    address: "Jalandhar - Delhi G.T. Road, Phagwara, Punjab - 144411",
    official_website: "https://www.lpu.in",
    admission_website: "https://www.lpu.in/admission",
    contact_number: "+91-1824-517000",
    admission_email: "admissions@lpu.co.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 200,
    short_description: "One of the largest private pharmacy schools in India, located at LPU, Punjab.",
    overview: "School of Pharmaceutical Sciences at LPU is equipped with advanced laboratory setups. The curriculum is integrated with industry standards to promote pharmaceutical research.",
    eligibility: "10+2 (with PCB/PCM) and qualify in LPUNEST.",
    admission_process: "Online application followed by LPU National Entrance and Scholarship Test (LPUNEST) and counselling.",
    entrance_exam: "LPUNEST",
    fees_information: "Refer to the LPU portal for standard tuition fees per semester.",
    hostel_information: "Huge hosteling complexes with multiple room plans, cafeteria, and laundry.",
    clinical_training_information: "Clinical partnerships with nearby multi-specialty hospitals.",
    placement_information: "Wide campus recruitment options with healthcare firms and analytical laboratories.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM and LPUNEST", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },

  // PRIORITY GROUP B — MAHARASHTRA PHARMACY COLLEGES
  {
    name: "Bombay College of Pharmacy",
    slug: "bombay-college-of-pharmacy",
    city: "Mumbai",
    state: "Maharashtra",
    college_type: "Private",
    address: "Kalina, Santacruz (East), Mumbai, Maharashtra - 400098",
    official_website: "https://bcp.edu.in",
    admission_website: "https://bcp.edu.in/admissions",
    contact_number: "+91-22-26670876",
    admission_email: "office@bcp.edu.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: true,
    is_published: true,
    display_order: 210,
    short_description: "A pioneering government-aided pharmacy institution in Mumbai, known for research and industrial projects.",
    overview: "Bombay College of Pharmacy (BCP) was established in 1957 by the Indian Pharmaceutical Association. It is recognized as a leader in pharmacy education and research, affiliated with University of Mumbai.",
    eligibility: "10+2 with PCB/PCM and qualifying marks in MHT-CET.",
    admission_process: "Centralized Admission Process (CAP) conducted by State Common Entrance Test Cell, Maharashtra.",
    entrance_exam: "MHT-CET / GPAT",
    fees_information: "Government-aided tuition structures, refer to DTE Maharashtra or BTE sites.",
    hostel_information: "Limited hostel accommodation available for students.",
    clinical_training_information: "Clinical and pharmacology studies are conducted in collaboration with hospitals in Mumbai.",
    placement_information: "Excellent placement rates in top pharmaceutical R&D, clinical management, and marketing companies.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM and MHT-CET", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "45", course_fee: "", eligibility: "B.Pharm with GPAT score", is_active: true },
    ]
  },
  {
    name: "Tatyasaheb Kore College of Pharmacy",
    slug: "tatyasaheb-kore-college-of-pharmacy",
    city: "Warananagar",
    state: "Maharashtra",
    college_type: "Private",
    address: "Warananagar, Tal. Panhala, Dist. Kolhapur, Maharashtra - 416113",
    official_website: "https://tkcpwarana.ac.in",
    admission_website: "https://tkcpwarana.ac.in/admission",
    contact_number: "+91-230-222383",
    admission_email: "tkcp.warana@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 220,
    short_description: "A prominent pharmacy institution in Warananagar, Kolhapur district, Maharashtra.",
    overview: "Established in 1996, the college is affiliated with Shivaji University, Kolhapur. It is situated in the green campus of Warananagar and is approved by PCI.",
    eligibility: "10+2 with PCB/PCM and score in MHT-CET.",
    admission_process: "Through Maharashtra DTE CAP rounds and institute level direct admission.",
    entrance_exam: "MHT-CET",
    fees_information: "Refer to Shivaji University or college portal for government-approved fees.",
    hostel_information: "Hostel housing available with mess and primary healthcare facilities.",
    clinical_training_information: "Clinical projects and training associated with regional rural health centres.",
    placement_information: "Provides training and placement cell coordination for graduating batches.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Bharati Vidyapeeth College of Pharmacy, Kolhapur",
    slug: "bharati-vidyapeeth-college-of-pharmacy-kolhapur",
    city: "Kolhapur",
    state: "Maharashtra",
    college_type: "Private",
    address: "Near Chitranagari, Morewadi, Kolhapur, Maharashtra - 416013",
    official_website: "https://copkolhapur.bharatividyapeeth.edu",
    admission_website: "https://copkolhapur.bharatividyapeeth.edu/admission",
    contact_number: "+91-231-2637286",
    admission_email: "copkolhapur@bharatividyapeeth.edu",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 230,
    short_description: "A leading private pharmacy college in Kolhapur, Maharashtra, affiliated with Shivaji University.",
    overview: "Established in 1996, Bharati Vidyapeeth College of Pharmacy, Kolhapur is approved by PCI and accredited by NBA. It offers undergraduate and postgraduate courses.",
    eligibility: "10+2 with PCB/PCM and valid MHT-CET score.",
    admission_process: "Admissions are conducted through CAP rounds by DTE Maharashtra.",
    entrance_exam: "MHT-CET",
    fees_information: "Fees are decided by Shikshan Shulka Samiti, Maharashtra.",
    hostel_information: "Hostel facility is available for outstation students.",
    clinical_training_information: "Collaborates with local diagnostic and medical centres.",
    placement_information: "Regular recruiters include leading retail chains and manufacturing plants.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "AISSMS College of Pharmacy",
    slug: "aissms-college-of-pharmacy",
    city: "Pune",
    state: "Maharashtra",
    college_type: "Private",
    address: "Kennedy Road, Near R.T.O., Pune, Maharashtra - 411001",
    official_website: "https://aissmscop.com",
    admission_website: "https://aissmscop.com/admission",
    contact_number: "+91-20-26058204",
    admission_email: "contact@aissmscop.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 240,
    short_description: "A well-regarded private pharmacy college of the AISSMS Society in Pune.",
    overview: "All India Shri Shivaji Memorial Society (AISSMS) College of Pharmacy was established in 1996. It is affiliated with Savitribai Phule Pune University.",
    eligibility: "10+2 with science subjects (PCB/PCM) and score in MHT-CET.",
    admission_process: "Through centralized admission rounds conducted by DTE Maharashtra.",
    entrance_exam: "MHT-CET",
    fees_information: "Fees are determined by FRA (Fees Regulating Authority), Maharashtra.",
    hostel_information: "Hostel accommodations are managed by the society.",
    clinical_training_information: "Practical instruction is carried out in institutional laboratories.",
    placement_information: "Coordinates internships and corporate placement sessions for final year students.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "36", course_fee: "", eligibility: "B.Pharm degree", is_active: true },
    ]
  },
  {
    name: "Sinhgad College of Pharmacy",
    slug: "sinhgad-college-of-pharmacy",
    city: "Pune",
    state: "Maharashtra",
    college_type: "Private",
    address: "S. No. 44/1, Vadgaon (Budruk), Off Sinhgad Road, Pune, Maharashtra - 411041",
    official_website: "https://www.sinhgad.edu",
    admission_website: "https://www.sinhgad.edu/sinhgad-institutes-cop",
    contact_number: "+91-20-24354720",
    admission_email: "scop@sinhgad.edu",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 250,
    short_description: "A key private pharmacy institute of the Sinhgad Group of Institutions, Pune.",
    overview: "Sinhgad College of Pharmacy was established in 2000 under the Sinhgad Technical Education Society. It is affiliated with Savitribai Phule Pune University and approved by PCI.",
    eligibility: "Based on CAP rules: 10+2 science with PCB/PCM and MHT-CET score.",
    admission_process: "Centralized Admission Process (CAP) followed by seat locking.",
    entrance_exam: "MHT-CET",
    fees_information: "Regulated by Fees Regulating Authority, Maharashtra.",
    hostel_information: "Comprehensive campus hostels with dining hall and basic utilities.",
    clinical_training_information: "Laboratory-based formulation training on-campus.",
    placement_information: "Liaises with analytical and research firms for placements.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "36", course_fee: "", eligibility: "B.Pharm degree", is_active: true },
    ]
  },
  {
    name: "Dr. D. Y. Patil College of Pharmacy",
    slug: "dr-d-y-patil-college-of-pharmacy",
    city: "Pune",
    state: "Maharashtra",
    college_type: "Private",
    address: "Sector 29, Pradhikaran, Akurdi, Pune, Maharashtra - 411044",
    official_website: "https://www.dyppharmaakurdi.ac.in",
    admission_website: "https://www.dyppharmaakurdi.ac.in/admission",
    contact_number: "+91-20-27656141",
    admission_email: "info.pharmacy@dyppvp.edu.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 260,
    short_description: "A premier private pharmacy college under the Dr. D. Y. Patil group in Akurdi, Pune.",
    overview: "Dr. D. Y. Patil College of Pharmacy (Akurdi) was established in 1999. It is affiliated with Savitribai Phule Pune University and is approved by PCI.",
    eligibility: "10+2 with Physics, Chemistry and Biology/Mathematics and MHT-CET score.",
    admission_process: "Through centralized CAP rounds of Maharashtra government and institutional quota.",
    entrance_exam: "MHT-CET / GPAT",
    fees_information: "Fee structure is determined by FRA Maharashtra.",
    hostel_information: "Hostel rooms on campus with modern infrastructure.",
    clinical_training_information: "Practical clinical exposure at local health hubs.",
    placement_information: "Placement cell coordinates hiring in retail pharmacy chains and clinical research organizations.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Y. B. Chavan College of Pharmacy",
    slug: "y-b-chavan-college-of-pharmacy",
    city: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
    college_type: "Private",
    address: "Dr. Rafiq Zakaria Campus, Rauza Bagh, Chhatrapati Sambhajinagar, Maharashtra - 431001",
    official_website: "https://www.ybccpa.edu.in",
    admission_website: "https://www.ybccpa.edu.in/admission",
    contact_number: "+91-240-2381129",
    admission_email: "ybccpharmacy@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 270,
    short_description: "A pioneer private pharmacy institute in Chhatrapati Sambhajinagar (formerly Aurangabad).",
    overview: "Y. B. Chavan College of Pharmacy was established in 1989. It is situated in the Dr. Rafiq Zakaria Campus, Chhatrapati Sambhajinagar, and is accredited by NAAC.",
    eligibility: "10+2 with PCB/PCM and qualifying marks in MHT-CET.",
    admission_process: "Centralized Admission Process (CAP) of DTE Maharashtra.",
    entrance_exam: "MHT-CET",
    fees_information: "As per state-regulated Fees Regulating Authority parameters.",
    hostel_information: "Hostel facilities available with basic amenities.",
    clinical_training_information: "Training clinics and modern formulation laboratories are present.",
    placement_information: "Coordinates job opportunities in pharma manufacturing plants.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "R. C. Patel Institute of Pharmaceutical Education and Research",
    slug: "r-c-patel-institute-of-pharmaceutical-education-and-research",
    city: "Shirpur",
    state: "Maharashtra",
    college_type: "Private",
    address: "Karwand Naka, Shirpur, Dhule Dist., Maharashtra - 425405",
    official_website: "https://www.rcpatelpharmacy.co.in",
    admission_website: "https://www.rcpatelpharmacy.co.in/admission",
    contact_number: "+91-2563-255189",
    admission_email: "registrar@rcpatelpharmacy.co.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 280,
    short_description: "A highly accredited private pharmacy college in Shirpur, Maharashtra.",
    overview: "Established in 1992, R. C. Patel Institute of Pharmaceutical Education and Research (RCPIPER) is an autonomous college affiliated with KBCNMU, Jalgaon, and accredited with NBA.",
    eligibility: "10+2 science with PCB/PCM and MHT-CET score.",
    admission_process: "Through state CAP rank counselling and direct applications.",
    entrance_exam: "MHT-CET / GPAT",
    fees_information: "Fees are approved by FRA Maharashtra.",
    hostel_information: "Comfortable separate boarding houses for girls and boys.",
    clinical_training_information: "Internships arranged in regional diagnostic and hospital systems.",
    placement_information: "Liaises with clinical analysis and medical outsourcing firms.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "MET Institute of Pharmacy",
    slug: "met-institute-of-pharmacy-nashik",
    city: "Nashik",
    state: "Maharashtra",
    college_type: "Private",
    address: "MET Bhujbal Knowledge City, Adgaon, Nashik, Maharashtra - 422003",
    official_website: "https://www.metbhujbalknowledgecity.ac.in",
    admission_website: "https://www.metbhujbalknowledgecity.ac.in/iop",
    contact_number: "+91-253-2303515",
    admission_email: "iop@bkc.met.edu",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 290,
    short_description: "A contemporary private pharmacy college within Bhujbal Knowledge City in Nashik.",
    overview: "MET Institute of Pharmacy Nashik was established in 2006. It offers diploma and degree programs in pharmacy, promoting practical and corporate training.",
    eligibility: "10+2 with PCB/PCM and MHT-CET ranking.",
    admission_process: "Through CAP rounds by DTE Maharashtra.",
    entrance_exam: "MHT-CET",
    fees_information: "Detailed fee structures are regulated by state authorities.",
    hostel_information: "In-campus residential arrangements are available.",
    clinical_training_information: "Practical laboratory practice on-site.",
    placement_information: "Placement cell organises recruitments with pharmaceutical sales and testing companies.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "MVP Samaj's College of Pharmacy",
    slug: "mvp-samajs-college-of-pharmacy",
    city: "Nashik",
    state: "Maharashtra",
    college_type: "Private",
    address: "Gangapur Road, Nashik, Maharashtra - 422002",
    official_website: "https://www.mvpcop.edu.in",
    admission_website: "https://www.mvpcop.edu.in/admission",
    contact_number: "+91-253-2577250",
    admission_email: "principal@mvpcop.edu.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 300,
    short_description: "A prominent private pharmacy college of the MVP Samaj in Nashik.",
    overview: "MVP Samaj's College of Pharmacy Nashik was established in 1982. It is affiliated with Savitribai Phule Pune University and approved by PCI.",
    eligibility: "10+2 with PCB/PCM and score in MHT-CET.",
    admission_process: "State government CAP counselling rounds.",
    entrance_exam: "MHT-CET",
    fees_information: "Subject to state-regulated Fees Regulating Authority parameters.",
    hostel_information: "Hostel building available with common mess facilities.",
    clinical_training_information: "Academic lab research and practical classes.",
    placement_information: "Active interaction with pharma packaging and marketing units.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Government College of Pharmacy, Karad",
    slug: "government-college-of-pharmacy-karad",
    city: "Karad",
    state: "Maharashtra",
    college_type: "Government",
    address: "Vidyanagar, Karad, Satara Dist., Maharashtra - 415124",
    official_website: "https://gcopkarad.ac.in",
    admission_website: "https://gcopkarad.ac.in/admission",
    contact_number: "+91-2164-271196",
    admission_email: "gcopkarad@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: true,
    is_published: true,
    display_order: 310,
    short_description: "A premier government institution for pharmacy studies in Karad, Satara.",
    overview: "Government College of Pharmacy, Karad was established in 1974. Affiliated with Shivaji University, Kolhapur, it is a fully government-funded institute with excellent academic standards.",
    eligibility: "10+2 with PCB/PCM and qualifying score in MHT-CET.",
    admission_process: "Through centralised CAP counselling rounds of the Maharashtra State CET Cell.",
    entrance_exam: "MHT-CET / GPAT",
    fees_information: "Low-cost government-regulated fees.",
    hostel_information: "Government hosteling complexes on site for boys and girls.",
    clinical_training_information: "Practical ward rotations are completed at local government hospitals.",
    placement_information: "Assists with opportunities in public health systems and formulation industries.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Government College of Pharmacy, Amravati",
    slug: "government-college-of-pharmacy-amravati",
    city: "Amravati",
    state: "Maharashtra",
    college_type: "Government",
    address: "Kathora Naka, Amravati, Maharashtra - 444604",
    official_website: "http://gcopamravati.ac.in",
    admission_website: "http://gcopamravati.ac.in/admission",
    contact_number: "+91-721-2531690",
    admission_email: "gcopamravati@rediffmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 320,
    short_description: "A prominent state-funded government pharmacy college in Amravati.",
    overview: "Government College of Pharmacy Amravati was established in 1996. It is affiliated with Sant Gadge Baba Amravati University and recognized by PCI.",
    eligibility: "10+2 with PCB/PCM and qualifying marks in MHT-CET.",
    admission_process: "Centralized Admission Process (CAP) conducted by Maharashtra CET cell.",
    entrance_exam: "MHT-CET",
    fees_information: "Inexpensive government fee structure.",
    hostel_information: "Safe boarding houses inside the campus.",
    clinical_training_information: "Clinical partnerships with nearby government healthcare centers.",
    placement_information: "Dedicated cell assisting with public sector and corporate pharma opportunities.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Government College of Pharmacy, Chhatrapati Sambhajinagar",
    slug: "government-college-of-pharmacy-aurangabad",
    city: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
    college_type: "Government",
    address: "Opp. Govt. Polytechnic, Hotel Management Campus, Chhatrapati Sambhajinagar, Maharashtra - 431005",
    official_website: "https://gcophar.org",
    admission_website: "https://gcophar.org/admission",
    contact_number: "+91-240-2346820",
    admission_email: "gcopaurangabad@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 330,
    short_description: "A reputed government institution for pharmacy studies in Chhatrapati Sambhajinagar.",
    overview: "Government College of Pharmacy, Chhatrapati Sambhajinagar (Aurangabad) was established in 1999. Affiliated with Dr. Babasaheb Ambedkar Marathwada University, it offers government-regulated studies.",
    eligibility: "10+2 with PCB/PCM and MHT-CET score.",
    admission_process: "Through centralised CAP counselling rounds of the Maharashtra State CET Cell.",
    entrance_exam: "MHT-CET",
    fees_information: "Highly subsidised government fees.",
    hostel_information: "Government hostels available on campus.",
    clinical_training_information: "Rotations arranged at local state hospitals.",
    placement_information: "Assists with placements in industrial, sales, and hospital positions.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 science", is_active: true },
    ]
  },
  {
    name: "Principal K. M. Kundnani College of Pharmacy",
    slug: "principal-k-m-kundnani-college-of-pharmacy",
    city: "Mumbai",
    state: "Maharashtra",
    college_type: "Private",
    address: "Plot No. 23, Jote Joy Building, Rambhau Salgaonkar Marg, Cuffe Parade, Mumbai, Maharashtra - 400005",
    official_website: "https://kmkcp.edu.in",
    admission_website: "https://kmkcp.edu.in/admissions",
    contact_number: "+91-22-22164368",
    admission_email: "principal@kmkcp.edu.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 340,
    short_description: "A historical private pharmacy college located in south Mumbai, Cuffe Parade.",
    overview: "Principal K. M. Kundnani College of Pharmacy was established in 1971. Affiliated with University of Mumbai, it is run by the HSNC Board and is approved by PCI.",
    eligibility: "10+2 science with PCB/PCM and MHT-CET score.",
    admission_process: "CAP rounds conducted by DTE Maharashtra.",
    entrance_exam: "MHT-CET",
    fees_information: "Fees regulating authority approved structures.",
    hostel_information: "Refer to HSNC board for student boarding information.",
    clinical_training_information: "Collaborates with local multi-specialty medical systems.",
    placement_information: "Good placements in medical copywriting, pharma sales, and R&D.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "30", course_fee: "", eligibility: "B.Pharm degree", is_active: true },
    ]
  },
  {
    name: "SVKM's Dr. Bhanuben Nanavati College of Pharmacy",
    slug: "svkms-dr-bhanuben-nanavati-college-of-pharmacy",
    city: "Mumbai",
    state: "Maharashtra",
    college_type: "Private",
    address: "Vile Parle (West), Mumbai, Maharashtra - 400056",
    official_website: "https://www.bncp.ac.in",
    admission_website: "https://www.bncp.ac.in/admission",
    contact_number: "+91-22-42332052",
    admission_email: "office@bncp.ac.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 350,
    short_description: "A premium private pharmacy institute under SVKM in Vile Parle, Mumbai.",
    overview: "Dr. Bhanuben Nanavati College of Pharmacy (BNCP) was established in 2004. Constituted under Shri Vile Parle Kelavani Mandal (SVKM), it is affiliated with University of Mumbai.",
    eligibility: "10+2 with PCB/PCM and MHT-CET score.",
    admission_process: "CAP counselling and SVKM institutional registrations.",
    entrance_exam: "MHT-CET / GPAT",
    fees_information: "Regulated by FRA Maharashtra, detailed tables on BNCP site.",
    hostel_information: "SVKM centralized hostel facility is available.",
    clinical_training_information: "Practical clinical exposure in modern formulation laboratories.",
    placement_information: "Highly active placement cell with recruitment drives by global MNCs.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "30", course_fee: "", eligibility: "B.Pharm degree", is_active: true },
    ]
  },
  {
    name: "Vivekanand Education Society's College of Pharmacy",
    slug: "vivekanand-education-societys-college-of-pharmacy",
    city: "Mumbai",
    state: "Maharashtra",
    college_type: "Private",
    address: "Hashu Advani Memorial Complex, Collector's Colony, Chembur, Mumbai, Maharashtra - 400074",
    official_website: "https://vespharmacy.ves.ac.in",
    admission_website: "https://vespharmacy.ves.ac.in/admissions",
    contact_number: "+91-22-61144114",
    admission_email: "vescop@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 360,
    short_description: "A leading private pharmacy college of the VES society in Chembur, Mumbai.",
    overview: "Vivekanand Education Society's College of Pharmacy (VESCOP) was established in 2007. Affiliated with University of Mumbai, it is accredited by NBA.",
    eligibility: "10+2 science (PCB/PCM) and MHT-CET score.",
    admission_process: "State centralized CAP rounds and institutional rounds.",
    entrance_exam: "MHT-CET",
    fees_information: "Determined by State Fees Regulating Authority.",
    hostel_information: "VES hostel rooms are available on request.",
    clinical_training_information: "Academic lab research and practical classes.",
    placement_information: "Regular placements in testing, pharma marketing, and clinical analytics.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "36", course_fee: "", eligibility: "B.Pharm degree", is_active: true },
    ]
  },
  {
    name: "Oriental College of Pharmacy",
    slug: "oriental-college-of-pharmacy",
    city: "Navi Mumbai",
    state: "Maharashtra",
    college_type: "Private",
    address: "Sector 2, Sanpada, Navi Mumbai, Maharashtra - 400705",
    official_website: "https://ocp.edu.in",
    admission_website: "https://ocp.edu.in/admission",
    contact_number: "+91-22-27758715",
    admission_email: "principal@ocp.edu.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 370,
    short_description: "A prominent private pharmacy college of the Oriental Education Society in Sanpada, Navi Mumbai.",
    overview: "Oriental College of Pharmacy (OCP) was established in 2004. Affiliated with University of Mumbai, it is recognized by PCI and is a modern hub of pharmacy education.",
    eligibility: "10+2 with PCB/PCM and MHT-CET score.",
    admission_process: "CAP rounds conducted by DTE Maharashtra.",
    entrance_exam: "MHT-CET",
    fees_information: "FRA approved fee structure.",
    hostel_information: "Boarding details are available upon request.",
    clinical_training_information: "Equipped with diagnostic and formulation labs.",
    placement_information: "Liaises with industrial and sales recruitment teams.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "18", course_fee: "", eligibility: "B.Pharm degree", is_active: true },
    ]
  },
  {
    name: "NCRD's Sterling Institute of Pharmacy",
    slug: "ncrds-sterling-institute-of-pharmacy",
    city: "Navi Mumbai",
    state: "Maharashtra",
    college_type: "Private",
    address: "Plot No. 93/93A, Sector 19, Nerul, Navi Mumbai, Maharashtra - 400706",
    official_website: "http://www.sterlingpharmacy.ac.in",
    admission_website: "http://www.sterlingpharmacy.ac.in/admission",
    contact_number: "+91-22-27702282",
    admission_email: "ncrdsterling@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 380,
    short_description: "A well-known private pharmacy college under NCRD in Nerul, Navi Mumbai.",
    overview: "NCRD's Sterling Institute of Pharmacy was established in 2004. Affiliated with University of Mumbai, it offers diploma and degree programs in pharmacy.",
    eligibility: "10+2 with PCB/PCM and MHT-CET score.",
    admission_process: "State centralized CAP rounds and institutional rounds.",
    entrance_exam: "MHT-CET",
    fees_information: "As per state Fees Regulating Authority parameters.",
    hostel_information: "Contact administrative office for boarding options.",
    clinical_training_information: "Academic lab research and practical classes.",
    placement_information: "Placement cell assists with corporate recruitment.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "Lokmanya Tilak Institute of Pharmaceutical Sciences",
    slug: "lokmanya-tilak-institute-of-pharmaceutical-sciences",
    city: "Navi Mumbai",
    state: "Maharashtra",
    college_type: "Private",
    address: "Sector 4, Kharghar, Navi Mumbai, Maharashtra - 410210",
    official_website: "https://www.ltipskharghar.edu.in",
    admission_website: "https://www.ltipskharghar.edu.in/admission",
    contact_number: "+91-22-27743702",
    admission_email: "ltips@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 390,
    short_description: "A prominent private pharmacy institute in Kharghar, Navi Mumbai.",
    overview: "Lokmanya Tilak Institute of Pharmaceutical Sciences was established to provide quality education in Navi Mumbai. It is approved by PCI.",
    eligibility: "10+2 with PCB/PCM.",
    admission_process: "Through direct application merit lists or state counselling rounds.",
    entrance_exam: "MHT-CET",
    fees_information: "Detailed fees schedule can be requested from the college.",
    hostel_information: "Boarding details are available upon request.",
    clinical_training_information: "Practical ward instruction is based at local clinics.",
    placement_information: "Placement cell assists with career support.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 science", is_active: true },
    ]
  },
  {
    name: "Bharati Vidyapeeth Institute of Pharmacy, Pune",
    slug: "bharati-vidyapeeth-institute-of-pharmacy-pune",
    city: "Pune",
    state: "Maharashtra",
    college_type: "Private",
    address: "More Vidyalaya Campus, Erandwane, Pune, Maharashtra - 411038",
    official_website: "https://iotpune.bharatividyapeeth.edu",
    admission_website: "https://iotpune.bharatividyapeeth.edu/admission",
    contact_number: "+91-20-25431109",
    admission_email: "iotpune@bharatividyapeeth.edu",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 400,
    short_description: "A premier private diploma pharmacy institute of Bharati Vidyapeeth in Pune.",
    overview: "Bharati Vidyapeeth Institute of Pharmacy (Pune) was established in 1980. It is affiliated with MSBTE, Mumbai and approved by PCI.",
    eligibility: "10+2 science with PCB/PCM.",
    admission_process: "Through DTE Maharashtra CAP rounds.",
    entrance_exam: "Merit-based",
    fees_information: "Regulated by Shikshan Shulka Samiti, Maharashtra.",
    hostel_information: "Hostel facility is available for outstation students.",
    clinical_training_information: "Collaborates with Bharati Hospital for training.",
    placement_information: "Placement cell assists with jobs in retail and manufacturing.",
    courses: [
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "120", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },

  // PRIORITY GROUP C — OTHER PHARMACY INSTITUTIONS
  {
    name: "L. M. College of Pharmacy",
    slug: "l-m-college-of-pharmacy",
    city: "Ahmedabad",
    state: "Gujarat",
    college_type: "Private",
    address: "Opposite Gujarat University, Navrangpura, Ahmedabad, Gujarat - 380009",
    official_website: "https://lmcp.ac.in",
    admission_website: "https://jacpcldce.ac.in",
    contact_number: "+91-79-26302746",
    admission_email: "lmcp_ahd@yahoo.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 410,
    short_description: "One of India's oldest and most prestigious pharmacy colleges, located in Ahmedabad, Gujarat.",
    overview: "Established in 1947 by Ahmedabad Education Society, L. M. College of Pharmacy (LMCP) is affiliated with Gujarat Technological University (GTU). It is a landmark institution of pharmacy education in India.",
    eligibility: "10+2 with PCB/PCM and qualifying marks in GUJCET.",
    admission_process: "Centralized counselling conducted by ACPC Gujarat.",
    entrance_exam: "GUJCET",
    fees_information: "Government-aided/grant-in-aid fees structure. Highly affordable.",
    hostel_information: "Hostel rooms available for outstation students.",
    clinical_training_information: "Internships and training conducted with local municipal hospitals.",
    placement_information: "Excellent track record with placements in leading domestic and multinational pharma companies.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "120", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "120", course_fee: "", eligibility: "10+2 science", is_active: true },
    ]
  },
  {
    name: "Ramanbhai Patel College of Pharmacy",
    slug: "ramanbhai-patel-college-of-pharmacy",
    city: "Changa",
    state: "Gujarat",
    college_type: "Private",
    address: "CHARUSAT Campus, Changa, Anand Dist., Gujarat - 388421",
    official_website: "https://www.charusat.ac.in/rpcp",
    admission_website: "https://www.charusat.ac.in/admissions",
    contact_number: "+91-2697-265141",
    admission_email: "info@charusat.ac.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 420,
    short_description: "A prominent private pharmacy college of CHARUSAT in Changa, Gujarat.",
    overview: "Ramanbhai Patel College of Pharmacy (RPCP) was established in 2004 under CHARUSAT. It is recognized for its advanced research labs and industrial linkages.",
    eligibility: "10+2 with science stream (PCB/PCM) and GUJCET score.",
    admission_process: "Through ACPC Gujarat counselling and university merit rounds.",
    entrance_exam: "GUJCET",
    fees_information: "Refer to CHARUSAT university site for fee details.",
    hostel_information: "Excellent hostel life with AC and non-AC rooms, Wi-Fi, and dining.",
    clinical_training_information: "Academic lab research and practical classes.",
    placement_information: "Good placements in manufacturing, R&D, and quality control.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "36", course_fee: "", eligibility: "B.Pharm degree", is_active: true },
    ]
  },
  {
    name: "B. K. Mody Government Pharmacy College",
    slug: "b-k-mody-government-pharmacy-college",
    city: "Rajkot",
    state: "Gujarat",
    college_type: "Government",
    address: "Polytechnic Campus, Bhavnagar Road, Rajkot, Gujarat - 360003",
    official_website: "http://bkmgpc.cteguj.in",
    admission_website: "https://jacpcldce.ac.in",
    contact_number: "+91-281-2387154",
    admission_email: "bkmgpc@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 430,
    short_description: "A leading government pharmacy college in Rajkot, Gujarat.",
    overview: "B. K. Mody Government Pharmacy College was established in 1984. Affiliated with GTU, it is a fully government-funded institute with low-cost education.",
    eligibility: "10+2 with PCB/PCM and GUJCET score.",
    admission_process: "Centralized counselling conducted by ACPC Gujarat.",
    entrance_exam: "GUJCET",
    fees_information: "Highly subsidised government fees.",
    hostel_information: "Government hostels available on campus.",
    clinical_training_information: "Collaborates with local government hospitals for training.",
    placement_information: "Assists with placements in public health systems and pharma industries.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 science", is_active: true },
    ]
  },
  {
    name: "Jaipur National University School of Pharmaceutical Sciences",
    slug: "jaipur-national-university-school-of-pharmaceutical-sciences",
    city: "Jaipur",
    state: "Rajasthan",
    college_type: "Private",
    address: "Jagatpura, Jaipur, Rajasthan - 302017",
    official_website: "https://www.jnujaipur.ac.in",
    admission_website: "https://www.jnujaipur.ac.in/admissions",
    contact_number: "+91-141-2752664",
    admission_email: "admissions@jnujaipur.ac.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 440,
    short_description: "A prominent private pharmacy school under Jaipur National University, Jaipur.",
    overview: "The School of Pharmaceutical Sciences at JNU Jaipur offers pharmacy programs with excellent laboratory setups and research orientation.",
    eligibility: "10+2 with PCB/PCM from a recognized board.",
    admission_process: "Based on direct online registration, university test, or merit lists.",
    entrance_exam: "JNU Entrance Test / Merit-based",
    fees_information: "Tuition structures are available in the university prospectus.",
    hostel_information: "Standard residential accommodation with dining, internet, and sports.",
    clinical_training_information: "Clinical practice training is hosted at JNU Hospital, Jaipur.",
    placement_information: "Active placement cell coordinates recruitment sessions.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 science", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 science", is_active: true },
    ]
  },
  {
    name: "NIMS Institute of Pharmacy",
    slug: "nims-institute-of-pharmacy",
    city: "Jaipur",
    state: "Rajasthan",
    college_type: "Private",
    address: "Shobha Nagar, Jaipur-Delhi Highway, Jaipur, Rajasthan - 303121",
    official_website: "https://nimsuniversity.org",
    admission_website: "https://nimsuniversity.org/admissions",
    contact_number: "+91-7412077155",
    admission_email: "admissions@nimsuniversity.org",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 450,
    short_description: "A prominent private pharmacy school under NIMS University, Jaipur.",
    overview: "NIMS Institute of Pharmacy is recognized for its comprehensive curriculum and clinical training in NIMS Super Specialty Hospital.",
    eligibility: "10+2 with PCB/PCM from a recognized board.",
    admission_process: "Based on direct online registration, university entrance test, or merit.",
    entrance_exam: "NIMS Entrance Test / Merit-based",
    fees_information: "Academic fee details are updated on the university portal.",
    hostel_information: "Hostel rooms on campus with modern dining and safety.",
    clinical_training_information: "Pharm.D training is hosted at NIMS Super Specialty Hospital, Jaipur.",
    placement_information: "Active placements in healthcare systems, research, and manufacturing.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 science", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 science", is_active: true },
    ]
  },
  {
    name: "Jamia Hamdard School of Pharmaceutical Education and Research",
    slug: "jamia-hamdard-school-of-pharmaceutical-education-and-research",
    city: "New Delhi",
    state: "Delhi",
    college_type: "Deemed University",
    address: "Hamdard Nagar, New Delhi - 110062",
    official_website: "http://www.jamiahamdard.edu",
    admission_website: "http://www.jamiahamdard.edu/admissions",
    contact_number: "+91-11-26059688",
    admission_email: "admissions@jamiahamdard.ac.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: true,
    is_published: true,
    display_order: 460,
    short_description: "A world-renowned pharmacy school at Jamia Hamdard, ranked amongst the absolute top in India.",
    overview: "The School of Pharmaceutical Education and Research (SPER) at Jamia Hamdard was established in 1997. It is highly ranked by NIRF and is a premier centre for research in pharmacology and formulations.",
    eligibility: "Based on NEET/JEE scores: 10+2 science with PCB/PCM.",
    admission_process: "Through online university portal based on national exam rankings (NEET/JEE) or interview.",
    entrance_exam: "NEET / JEE / GPAT",
    fees_information: "Refer to the university prospectus for fees of current academic sessions.",
    hostel_information: "Hostel buildings for boys and girls with vegetarian and non-vegetarian mess options.",
    clinical_training_information: "Clinical practices and clerkships are held at Hakeem Abdul Hameed Centenary Hospital, New Delhi.",
    placement_information: "Excellent placement rates in pharmaceutical corporate offices, global testing networks, and labs.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "120", course_fee: "", eligibility: "10+2 science with NEET/JEE score", is_active: true },
      { course_name: "D.Pharm", course_duration: "2 Years", intake: "60", course_fee: "", eligibility: "10+2 science", is_active: true },
    ]
  },
  {
    name: "Delhi Pharmaceutical Sciences and Research University",
    slug: "delhi-pharmaceutical-sciences-and-research-university",
    city: "New Delhi",
    state: "Delhi",
    college_type: "University Department",
    address: "Pushp Vihar, Sector 3, M.B. Road, New Delhi - 110017",
    official_website: "https://dpsru.edu.in",
    admission_website: "https://dpsru.edu.in/admissions",
    contact_number: "+91-11-29553771",
    admission_email: "admissions.dpsru@gmail.com",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 470,
    short_description: "The first pharmaceutical sciences university of India, located in New Delhi.",
    overview: "Delhi Pharmaceutical Sciences and Research University (DPSRU) was established in 2015. It is a state university dedicated to pharmaceutical sciences, originating from DIPSAR (established in 1964).",
    eligibility: "Candidates must have cleared 10+2 with PCB/PCM from a recognized board.",
    admission_process: "Through direct online university counselling based on merit index of qualifying examination.",
    entrance_exam: "Merit-based / GPAT",
    fees_information: "Regulated state university fee structure.",
    hostel_information: "Hostel facility is available for outstation students.",
    clinical_training_information: "Rotations arranged at local state and municipal hospitals.",
    placement_information: "Excellent placement rates in analytical testing, pharma consulting, and corporate clinics.",
    courses: [
      { course_name: "Pharm.D", course_duration: "6 Years", intake: "30", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "100", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
    ]
  },
  {
    name: "University Institute of Pharmaceutical Sciences, Panjab University",
    slug: "university-institute-of-pharmaceutical-sciences-panjab-university",
    city: "Chandigarh",
    state: "Chandigarh",
    college_type: "University Department",
    address: "Panjab University, Sector 14, Chandigarh - 160014",
    official_website: "https://uips.puchd.ac.in",
    admission_website: "https://admissions.puchd.ac.in",
    contact_number: "+91-172-2534101",
    admission_email: "uips@pu.ac.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 480,
    short_description: "A world-renowned university department of pharmacy at Panjab University, Chandigarh.",
    overview: "University Institute of Pharmaceutical Sciences (UIPS) is one of the oldest and most prestigious departments of pharmacy in India, founded in Lahore in 1944. It is highly ranked for research.",
    eligibility: "Based on PU-CET (UG) ranking: 10+2 science with PCB/PCM.",
    admission_process: "Through Panjab University common entrance test (PU-CET) and centralized counseling.",
    entrance_exam: "PU-CET (UG) / GPAT",
    fees_information: "Very low subsidised government fee structure.",
    hostel_information: "Panjab University hostels are available for students.",
    clinical_training_information: "Clinical partnerships with nearby medical centers.",
    placement_information: "Wide campus recruitment options with pharma developers and analytical labs.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "46", course_fee: "", eligibility: "10+2 with PCB/PCM and PU-CET", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "30", course_fee: "", eligibility: "B.Pharm degree with GPAT", is_active: true },
    ]
  },
  {
    name: "Department of Pharmaceutical Sciences, Guru Nanak Dev University",
    slug: "department-of-pharmaceutical-sciences-guru-nanak-dev-university",
    city: "Amritsar",
    state: "Punjab",
    college_type: "University Department",
    address: "GNDU Campus, Grand Trunk Road, Amritsar, Punjab - 143005",
    official_website: "https://www.gndu.ac.in",
    admission_website: "https://www.gndu.ac.in/admission",
    contact_number: "+91-183-2258802",
    admission_email: "head.pharmacy@gndu.ac.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 490,
    short_description: "A prominent state university department of pharmacy in Amritsar, Punjab.",
    overview: "The Department of Pharmaceutical Sciences at GNDU was established to provide quality education in Punjab. It is approved by PCI.",
    eligibility: "10+2 science (PCB/PCM) from a recognized board.",
    admission_process: "Based on direct online university counselling based on qualifying marks.",
    entrance_exam: "Merit-based",
    fees_information: "Affordable state university fee structure.",
    hostel_information: "University campus hostels are available.",
    clinical_training_information: "Practical ward instruction is based at local clinics.",
    placement_information: "Assists with placements in sales and manufacturing.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "18", course_fee: "", eligibility: "B.Pharm degree", is_active: true },
    ]
  },
  {
    name: "Department of Pharmaceutical Sciences and Drug Research, Punjabi University",
    slug: "department-of-pharmaceutical-sciences-and-drug-research-punjabi-university",
    city: "Patiala",
    state: "Punjab",
    college_type: "University Department",
    address: "Punjabi University Campus, Patiala, Punjab - 147002",
    official_website: "https://www.punjabiuniversity.ac.in",
    admission_website: "https://www.punjabiuniversity.ac.in/admissions",
    contact_number: "+91-175-3046254",
    admission_email: "head_pharmacy@pbi.ac.in",
    admission_status: "contact_college",
    pci_status: "verified_by_admin",
    pci_reference_url: "https://pci.gov.in/",
    is_featured: false,
    is_published: true,
    display_order: 500,
    short_description: "A prominent state university department of pharmacy in Patiala, Punjab.",
    overview: "The department was established to provide quality education in Patiala. It is approved by PCI.",
    eligibility: "10+2 science (PCB/PCM).",
    admission_process: "Through direct university counselling on merit basis.",
    entrance_exam: "Merit-based",
    fees_information: "Affordable state university fee structure.",
    hostel_information: "University campus hostels are available.",
    clinical_training_information: "Clinical partnerships with nearby medical centers.",
    placement_information: "Placement cell assists with career support.",
    courses: [
      { course_name: "B.Pharm", course_duration: "4 Years", intake: "60", course_fee: "", eligibility: "10+2 with PCB/PCM", is_active: true },
      { course_name: "M.Pharm", course_duration: "2 Years", intake: "18", course_fee: "", eligibility: "B.Pharm degree", is_active: true },
    ]
  }
];

// 3. Helper to upsert a college while protecting manual edits
async function upsertCollege(college) {
  // Extract courses to handle separately
  const { courses, ...collegeData } = college;

  // Check if college exists by slug
  const { data: existing, error: fetchError } = await supabase
    .from("colleges")
    .select("*")
    .eq("slug", college.slug)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error(`Error searching for ${college.name}:`, fetchError);
    return null;
  }

  let collegeId;

  if (existing) {
    console.log(`College already exists: "${college.name}" (Slug: ${college.slug}). Resolving fields...`);
    
    // We only update fields that are currently null, undefined or empty string in the DB
    const updateData = {};
    let shouldUpdate = false;

    Object.keys(collegeData).forEach((key) => {
      const dbValue = existing[key];
      const seedValue = collegeData[key];

      // If existing DB value is empty/null, but we have a seed value, map it
      if ((dbValue === null || dbValue === undefined || dbValue === "" || dbValue === 0 || dbValue === false && seedValue === true) && seedValue !== undefined && seedValue !== null && seedValue !== "") {
        updateData[key] = seedValue;
        shouldUpdate = true;
      }
    });

    collegeId = existing.id;

    if (shouldUpdate) {
      console.log(`Updating missing fields for "${college.name}":`, Object.keys(updateData));
      const { error: updateError } = await supabase
        .from("colleges")
        .update(updateData)
        .eq("id", collegeId);

      if (updateError) {
        console.error(`Error updating "${college.name}":`, updateError);
      }
    } else {
      console.log(`No fields to update for "${college.name}". Admin edits preserved.`);
    }
  } else {
    console.log(`Creating new college: "${college.name}"...`);
    const { data: inserted, error: insertError } = await supabase
      .from("colleges")
      .insert([collegeData])
      .select("id")
      .single();

    if (insertError) {
      console.error(`Error inserting college "${college.name}":`, insertError);
      return null;
    }
    collegeId = inserted.id;
  }

  // 4. Handle courses mapping for this college
  if (collegeId && courses && courses.length > 0) {
    // Get existing courses for this college
    const { data: existingCourses, error: courseFetchError } = await supabase
      .from("college_courses")
      .select("*")
      .eq("college_id", collegeId);

    if (courseFetchError) {
      console.error(`Error fetching courses for "${college.name}":`, courseFetchError);
      return collegeId;
    }

    for (const course of courses) {
      // Normalize course name matching
      const match = existingCourses.find(
        (c) => c.course_name.toLowerCase().trim() === course.course_name.toLowerCase().trim()
      );

      if (match) {
        // Course exists, update missing fields only
        const courseUpdate = {};
        let shouldUpdateCourse = false;

        Object.keys(course).forEach((key) => {
          const dbVal = match[key];
          const seedVal = course[key];

          if ((dbVal === null || dbVal === undefined || dbVal === "") && seedVal !== undefined && seedVal !== null && seedVal !== "") {
            courseUpdate[key] = seedVal;
            shouldUpdateCourse = true;
          }
        });

        if (shouldUpdateCourse) {
          const { error: courseUpdateError } = await supabase
            .from("college_courses")
            .update(courseUpdate)
            .eq("id", match.id);

          if (courseUpdateError) {
            console.error(`Error updating course "${course.course_name}" for "${college.name}":`, courseUpdateError);
          }
        }
      } else {
        // Insert new course row
        const courseInsertData = {
          ...course,
          college_id: collegeId,
        };
        const { error: courseInsertError } = await supabase
          .from("college_courses")
          .insert([courseInsertData]);

        if (courseInsertError) {
          console.error(`Error inserting course "${course.course_name}" for "${college.name}":`, courseInsertError);
        }
      }
    }
  }

  return collegeId;
}

// 5. Main Execution Loop
async function runSeeder() {
  console.log(`Starting bulk import for ${COLLEGES.length} colleges...`);
  
  let successCount = 0;
  for (let i = 0; i < COLLEGES.length; i++) {
    const colName = COLLEGES[i].name;
    try {
      const id = await upsertCollege(COLLEGES[i]);
      if (id) {
        successCount++;
      }
    } catch (err) {
      console.error(`Unexpected exception seeding "${colName}":`, err);
    }
  }

  console.log(`\n==========================================`);
  console.log(`Seeding complete.`);
  console.log(`Total colleges processed: ${COLLEGES.length}`);
  console.log(`Successful upserts: ${successCount}`);
  console.log(`==========================================`);
  process.exit(0);
}

runSeeder();
