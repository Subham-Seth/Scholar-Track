import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Scholarship } from '../models/Scholarship.js';
import { connectDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const seedScholarshipsData = [
  {
    title: 'Central Sector Scheme of Scholarship for College and University Students (CSSS)',
    provider: 'Department of Higher Education, Ministry of Education, Govt. of India',
    description:
      'Provides financial assistance to meritorious students from low-income families to meet part of their daily expenses while pursuing higher studies in colleges and universities.',
    awardAmount: '₹12,000 to ₹20,000 per annum',
    amountValue: 20000,
    educationLevels: ['Undergraduate', 'Postgraduate'],
    academicRequirements: 'Above 80th percentile in relevant stream in Class XII board exams.',
    minPercentage: 80,
    maxAnnualIncome: 450000, // 4.5 LPA
    applicableStates: ['All India'],
    categories: ['Merit-based', 'Need-based'],
    genderEligibility: 'All',
    deadline: 'Annual cycle (typically Oct - Dec via National Scholarship Portal)',
    officialUrl: 'https://scholarships.gov.in',
    isVerified: true,
    isDemo: false,
    documentRequirements: [
      'Class 12th Board Marksheet',
      'Valid Family Income Certificate issued by competent revenue authority',
      'College Admission / Bonafide Certificate',
      'Bank Account Passbook (Aadhaar linked)',
      'Aadhaar Card',
    ],
    tags: ['Government', 'Central Sector', 'Higher Education', 'Merit-cum-Means'],
    featured: true,
  },
  {
    title: 'AICTE Pragati Scholarship for Girl Students',
    provider: 'All India Council for Technical Education (AICTE)',
    description:
      'A flagship scheme by the Government of India aimed at providing assistance for advancement of girls pursuing technical education (Degree or Diploma).',
    awardAmount: '₹50,000 per annum towards tuition and incidental expenses',
    amountValue: 50000,
    educationLevels: ['Undergraduate', 'Diploma'],
    academicRequirements: 'Admitted to 1st year or 2nd year (lateral entry) of AICTE-approved Degree/Diploma course.',
    minPercentage: 60,
    maxAnnualIncome: 800000, // 8 LPA
    applicableStates: ['All India'],
    categories: ['Women in STEM', 'Technical Education', 'Need-based'],
    genderEligibility: 'Female',
    deadline: 'Annual cycle (typically Nov - Jan via National Scholarship Portal)',
    officialUrl: 'https://www.aicte-india.org',
    isVerified: true,
    isDemo: false,
    documentRequirements: [
      '10th and 12th / ITI Marksheet',
      'AICTE Approved College Admission Allotment Letter',
      'Family Income Certificate (< 8 Lakhs per annum)',
      'Aadhaar Card',
      'Bonafide Certificate from Head of Institution',
    ],
    tags: ['AICTE', 'Girls in Tech', 'Engineering', 'Diploma', 'Government'],
    featured: true,
  },
  {
    title: 'Reliance Foundation Undergraduate Scholarship',
    provider: 'Reliance Foundation',
    description:
      'Supports meritorious undergraduate students across all streams of study in India to continue their education without financial constraints, fostering academic excellence and leadership.',
    awardAmount: 'Up to ₹2,00,000 over duration of degree program',
    amountValue: 200000,
    educationLevels: ['Undergraduate'],
    academicRequirements: 'Enrolled in 1st year full-time undergraduate degree program with minimum 60% in Class 12.',
    minPercentage: 60,
    maxAnnualIncome: 1500000, // Preference up to 2.5 LPA, eligible up to 15 LPA
    applicableStates: ['All India'],
    categories: ['Merit-based', 'Need-based'],
    genderEligibility: 'All',
    deadline: 'Annual application window (typically Aug - Oct)',
    officialUrl: 'https://www.scholarships.reliancefoundation.org',
    isVerified: true,
    isDemo: false,
    documentRequirements: [
      'Class 10 and 12 Marksheets',
      'Current College Enrollment / Bonafide Proof',
      'Annual Household Income Proof (ITR / Salary Slip / Income Certificate)',
      'Government Photo ID Proof',
      'Aptitude Test Score (conducted by Foundation)',
    ],
    tags: ['Private', 'Foundation', 'Undergraduate', 'Leadership'],
    featured: true,
  },
  {
    title: 'INSPIRE Scholarship for Higher Education (SHE)',
    provider: 'Department of Science & Technology (DST), Govt. of India',
    description:
      'Offered to meritorious students to pursue undergraduate and postgraduate courses in Natural and Basic Sciences, aimed at attracting young talent to scientific research.',
    awardAmount: '₹80,000 per annum (₹60,000 scholarship + ₹20,000 mentorship/project grant)',
    amountValue: 80000,
    educationLevels: ['Undergraduate', 'Postgraduate'],
    academicRequirements: 'Top 1% in Class XII Board examination, or rank within top 10,000 in JEE/NEET, enrolled in B.Sc./B.S./Int. M.Sc. in Natural & Basic Sciences.',
    minPercentage: 85,
    maxAnnualIncome: undefined, // Pure merit, no income ceiling
    applicableStates: ['All India'],
    categories: ['Merit-based', 'Research & Science'],
    genderEligibility: 'All',
    deadline: 'Annual window (typically Dec - Jan via online-inspire.gov.in)',
    officialUrl: 'https://online-inspire.gov.in',
    isVerified: true,
    isDemo: false,
    documentRequirements: [
      'Class 12th Board Marksheet',
      'Class 10th Certificate for Date of Birth proof',
      'College Admission / Endorsement Certificate from Principal/Dean',
      'Aadhaar Card',
      'State/National Board Rank / Advisory Note',
    ],
    tags: ['Science', 'Research', 'Pure Merit', 'DST', 'B.Sc / M.Sc'],
    featured: true,
  },
  {
    title: 'Post Matric Scholarship Scheme for Minorities',
    provider: 'Ministry of Minority Affairs, Govt. of India',
    description:
      'Provides scholarship for higher education to meritorious students belonging to notified minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).',
    awardAmount: 'Course fee maintenance up to ₹10,000 per annum',
    amountValue: 10000,
    educationLevels: ['High School (10th/12th)', 'Undergraduate', 'Postgraduate', 'Ph.D./Doctoral'],
    academicRequirements: 'Minimum 50% marks in previous final examination.',
    minPercentage: 50,
    maxAnnualIncome: 200000, // 2 LPA
    applicableStates: ['All India'],
    categories: ['Minority', 'Need-based'],
    genderEligibility: 'All',
    deadline: 'Annual cycle via National Scholarship Portal (NSP)',
    officialUrl: 'https://scholarships.gov.in',
    isVerified: true,
    isDemo: false,
    documentRequirements: [
      'Previous Year Marksheet',
      'Minority Community Self-Declaration Certificate',
      'Annual Income Certificate issued by Revenue Authority',
      'Fee Receipt / College Admission Proof',
      'Bank Account details',
    ],
    tags: ['Minority', 'Government', 'NSP', 'Financial Need'],
    featured: false,
  },
  {
    title: 'HDFC Badhte Kadam Scholarship',
    provider: 'HDFC Bank Parivartan',
    description:
      'Designed to help students facing socio-economic crisis, loss of breadwinner, or extreme financial distress to continue their school and college education.',
    awardAmount: 'Up to ₹30,000 to ₹1,00,000 based on level of study',
    amountValue: 50000,
    educationLevels: ['High School (10th/12th)', 'Undergraduate', 'Postgraduate'],
    academicRequirements: 'Passed previous examination with at least 60% marks and facing financial hardship.',
    minPercentage: 60,
    maxAnnualIncome: 600000, // 6 LPA
    applicableStates: ['All India'],
    categories: ['Need-based', 'CSR Initiative'],
    genderEligibility: 'All',
    deadline: 'Rolling / Annual announcements via Buddy4Study portal',
    officialUrl: 'https://www.hdfcbank.com',
    isVerified: true,
    isDemo: false,
    documentRequirements: [
      'Marksheet of the previous qualifying examination',
      'Family Income Proof (Salary slip, Form 16, or Govt Income Certificate)',
      'Proof of crisis/distress (if applicable)',
      'Government Photo ID & Address Proof',
      'College Fee Structure & Current Year Admission Proof',
    ],
    tags: ['CSR', 'Banking', 'Need-based', 'Relief Support'],
    featured: false,
  },
  {
    title: 'Adobe Research Women-in-Technology Scholarship',
    provider: 'Adobe Systems',
    description:
      'Recognizes outstanding female undergraduate and masters students worldwide studying Computer Science, Computer Engineering, or closely related technical disciplines.',
    awardAmount: 'USD $10,000 one-time award + Creative Cloud subscription + Mentorship',
    amountValue: 800000, // approx INR equivalent
    educationLevels: ['Undergraduate', 'Postgraduate'],
    academicRequirements: 'Enrolled in Computer Science/Engineering with exceptional academic performance and technical leadership.',
    minPercentage: 75,
    maxAnnualIncome: undefined, // Merit-based
    applicableStates: ['All India'],
    categories: ['Women in STEM', 'Merit-based', 'International / Corporate'],
    genderEligibility: 'Female',
    deadline: 'Annual international window (typically Aug - Oct)',
    officialUrl: 'https://research.adobe.com/scholarship',
    isVerified: true,
    isDemo: false,
    documentRequirements: [
      'Resume / Curriculum Vitae highlighting projects & contributions',
      'Academic Transcripts',
      'Three Letters of Recommendation',
      'Four Essay Answers regarding passion for technology and leadership',
    ],
    tags: ['Tech', 'Coding', 'Women in Tech', 'Global', 'Adobe'],
    featured: true,
  },
  {
    title: 'Tata Trusts Means Grant for College Education',
    provider: 'Tata Trusts',
    description:
      'Need-based financial grant offered to underprivileged college students to cover tuition fees in accredited institutions across India.',
    awardAmount: 'Partial tuition fee reimbursement (₹15,000 - ₹50,000)',
    amountValue: 35000,
    educationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
    academicRequirements: 'Minimum passing percentage with verified low household income.',
    minPercentage: 55,
    maxAnnualIncome: 400000, // 4 LPA
    applicableStates: ['All India'],
    categories: ['Need-based'],
    genderEligibility: 'All',
    deadline: 'Annual window announced on Tata Trusts official portal',
    officialUrl: 'https://www.tatatrusts.org',
    isVerified: true,
    isDemo: false,
    documentRequirements: [
      'Family Income Certificate / Form 16',
      'Original Fee Receipts',
      'Academic Marksheets for all previous semesters',
      'Aadhaar Card and Student ID Card',
    ],
    tags: ['Tata', 'Philanthropy', 'Underprivileged', 'Fee Support'],
    featured: false,
  },
  {
    title: 'Narotam Sekhsaria Post-Graduate Scholarship',
    provider: 'Narotam Sekhsaria Foundation',
    description:
      'Merit-based interest-free loan scholarship for exceptional Indian students pursuing postgraduate studies in top Indian and international universities.',
    awardAmount: 'Interest-free loan scholarship up to ₹20,00,000',
    amountValue: 2000000,
    educationLevels: ['Postgraduate', 'Ph.D./Doctoral'],
    academicRequirements: 'Indian national, age below 30 years, holding or awaiting undergraduate degree with consistently high academic record.',
    minPercentage: 75,
    maxAnnualIncome: undefined,
    applicableStates: ['All India'],
    categories: ['Merit-based', 'Study Abroad / Higher Studies'],
    genderEligibility: 'All',
    deadline: 'Annual window (typically Jan - March)',
    officialUrl: 'https://pg.nsfoundation.co.in',
    isVerified: true,
    isDemo: false,
    documentRequirements: [
      'Attested copies of all graduation marks sheets and degree certificates',
      'GRE / GMAT / GATE / CAT scorecard if applicable',
      'University Admission Acceptance Letter',
      'Statement of Purpose (SOP) and Letters of Recommendation',
    ],
    tags: ['Masters', 'Loan Scholarship', 'Global', 'Higher Studies'],
    featured: false,
  },
  {
    title: 'State Merit-cum-Means Demonstration Scholarship (Sample)',
    provider: 'Demonstration Department of State Higher Education',
    description:
      'Demonstration record for regional state-specific scholarship workflows, showcasing regional quota matching, income threshold, and document validation within Scholar-Track.',
    awardAmount: '₹25,000 per academic year',
    amountValue: 25000,
    educationLevels: ['Undergraduate', 'Diploma'],
    academicRequirements: 'Domicile of participating states with min 65% aggregate.',
    minPercentage: 65,
    maxAnnualIncome: 300000, // 3 LPA
    applicableStates: ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu'],
    categories: ['State Specific', 'Need-based'],
    genderEligibility: 'All',
    deadline: 'Demonstration Record (For Testing Matching Rules)',
    officialUrl: 'https://scholar-track.example.org/demo-state-scheme',
    isVerified: false,
    isDemo: true,
    documentRequirements: [
      'State Domicile Certificate',
      'Income Certificate from Tehsildar',
      'Class 12th / Diploma Marksheet',
      'College ID & Fee Receipt',
    ],
    tags: ['Demo', 'State Specific', 'Simulation', 'Testing'],
    featured: false,
  },
];

export const seedDatabase = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.warn('⚠️ [SEED SKIP] Database not connected. Seed script terminating cleanly.');
      return;
    }

    console.log('🌱 Starting safe seed of demonstration scholarships...');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of seedScholarshipsData) {
      // Safe upsert by title - never deletes user or application data
      const res = await Scholarship.updateOne(
        { title: item.title },
        { $set: item },
        { upsert: true }
      );

      if (res.upsertedCount > 0) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }

    console.log(
      `✅ [SEED COMPLETE] Successfully seeded. Inserted: ${insertedCount}, Updated: ${updatedCount}. Total items: ${seedScholarshipsData.length}`
    );
  } catch (error: any) {
    console.error('❌ [SEED ERROR] Failed to seed database:', error.message);
  }
};

// If run directly via CLI (e.g. `npm run seed`)
if (process.argv[1] && process.argv[1].includes('seed')) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}
