import { Scholarship, IScholarship } from '../models/Scholarship.js';
import { EligibilityInput, ScholarshipEligibilityAssessment } from '../types/index.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  reply: string;
  providerUsed: 'gemini' | 'openai' | 'fallback-knowledge-engine';
  suggestedQuestions: string[];
  groundedScholarships?: {
    id: string;
    title: string;
    awardAmount: string;
    officialUrl: string;
    provider: string;
  }[];
  disclaimer: string;
}

const SCHOLARBOT_DISCLAIMER =
  'ScholarBot provides guidance and discovery assistance based on available criteria. Eligibility and deadlines must always be verified with the official scholarship provider.';

export class AIService {
  private static getActiveProvider(): 'gemini' | 'openai' | 'fallback' {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const providerConfig = (process.env.AI_PROVIDER || '').toLowerCase();

    if (providerConfig === 'fallback') return 'fallback';
    if (geminiKey && geminiKey.trim() !== '' && geminiKey !== 'your_gemini_api_key_here') {
      return 'gemini';
    }
    if (openAiKey && openAiKey.trim() !== '' && openAiKey !== 'your_openai_api_key_here') {
      return 'openai';
    }
    return 'fallback';
  }

  /**
   * Main chat function for ScholarBot
   */
  public static async chat(
    message: string,
    history: ChatMessage[] = [],
    userProfile?: EligibilityInput
  ): Promise<ChatResponse> {
    const provider = this.getActiveProvider();

    // Retrieve database context for grounding
    const dbKeywords = this.extractKeywords(message);
    const groundedScholarships = await this.findRelevantScholarships(dbKeywords);

    if (provider === 'gemini') {
      try {
        const reply = await this.callGemini(message, history, groundedScholarships, userProfile);
        return {
          reply,
          providerUsed: 'gemini',
          suggestedQuestions: this.generateFollowUpSuggestions(message),
          groundedScholarships: groundedScholarships.map((s) => ({
            id: s._id.toString(),
            title: s.title,
            awardAmount: s.awardAmount,
            officialUrl: s.officialUrl,
            provider: s.provider,
          })),
          disclaimer: SCHOLARBOT_DISCLAIMER,
        };
      } catch (err: any) {
        console.warn('⚠️ Gemini API call failed, falling back to Knowledge Engine:', err.message);
        // Fallback gracefully
      }
    } else if (provider === 'openai') {
      try {
        const reply = await this.callOpenAI(message, history, groundedScholarships, userProfile);
        return {
          reply,
          providerUsed: 'openai',
          suggestedQuestions: this.generateFollowUpSuggestions(message),
          groundedScholarships: groundedScholarships.map((s) => ({
            id: s._id.toString(),
            title: s.title,
            awardAmount: s.awardAmount,
            officialUrl: s.officialUrl,
            provider: s.provider,
          })),
          disclaimer: SCHOLARBOT_DISCLAIMER,
        };
      } catch (err: any) {
        console.warn('⚠️ OpenAI API call failed, falling back to Knowledge Engine:', err.message);
        // Fallback gracefully
      }
    }

    // Fallback: Intelligent Knowledge Engine (No external API key needed, zero-cost, 100% reliable)
    const reply = this.knowledgeEngineFallback(message, groundedScholarships, userProfile);
    return {
      reply,
      providerUsed: 'fallback-knowledge-engine',
      suggestedQuestions: this.generateFollowUpSuggestions(message),
      groundedScholarships: groundedScholarships.map((s) => ({
        id: s._id.toString(),
        title: s.title,
        awardAmount: s.awardAmount,
        officialUrl: s.officialUrl,
        provider: s.provider,
      })),
      disclaimer: SCHOLARBOT_DISCLAIMER,
    };
  }

  /**
   * Grounding: Search relevant scholarships from MongoDB
   */
  private static async findRelevantScholarships(keywords: string[]): Promise<IScholarship[]> {
    try {
      if (keywords.length === 0) {
        return await Scholarship.find().limit(4).exec();
      }

      const regexQueries = keywords.map((kw) => ({
        $or: [
          { title: { $regex: kw, $options: 'i' } },
          { provider: { $regex: kw, $options: 'i' } },
          { categories: { $regex: kw, $options: 'i' } },
          { tags: { $regex: kw, $options: 'i' } },
          { educationLevels: { $regex: kw, $options: 'i' } },
        ],
      }));

      const results = await Scholarship.find({ $or: regexQueries }).limit(5).exec();
      if (results.length > 0) return results;

      return await Scholarship.find().limit(3).exec();
    } catch (e) {
      return [];
    }
  }

  private static extractKeywords(text: string): string[] {
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = clean.split(/\s+/).filter((w) => w.length > 2);
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'about', 'how', 'what', 'can', 'you', 'give',
      'show', 'tell', 'scholarship', 'scholarships', 'student', 'students', 'please',
    ]);
    return tokens.filter((t) => !stopWords.has(t)).slice(0, 6);
  }

  /**
   * Gemini API call with grounding
   */
  private static async callGemini(
    message: string,
    history: ChatMessage[],
    grounded: IScholarship[],
    profile?: EligibilityInput
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const groundedContext = grounded
      .map(
        (s) =>
          `[SCHOLARSHIP] Name: ${s.title}\nProvider: ${s.provider}\nAmount: ${s.awardAmount}\nLevels: ${s.educationLevels.join(', ')}\nMin %: ${s.minPercentage}%\nMax Income: ${s.maxAnnualIncome ? '₹' + s.maxAnnualIncome : 'No limit'}\nPortal: ${s.officialUrl}\nDocs: ${s.documentRequirements.join(', ')}`
      )
      .join('\n\n');

    const profileContext = profile
      ? `Student Profile Context:\nEducation Level: ${profile.educationLevel || 'Not specified'}\nAcademic Percentage: ${profile.academicPercentage || 'Not specified'}%\nAnnual Family Income: ${profile.annualIncome ? '₹' + profile.annualIncome : 'Not specified'}\nState: ${profile.state || 'Not specified'}\nCategory: ${profile.category || 'Not specified'}`
      : 'No student profile context provided.';

    const systemInstruction = `You are ScholarBot, the intelligent scholarship discovery and application assistant for Scholar-Track.
Your core principles:
1. Provide encouraging, professional, and well-structured guidance to students.
2. Ground scholarship-specific facts STRICTLY on the provided scholarship database context.
3. NEVER fabricate application deadlines or invent official links.
4. Clearly state that scholarship eligibility is determined by official governing bodies.
5. If the user asks about documents, application tips, or statement drafting, give actionable step-by-step guidance.

Available Scholarship Database Records:\n${groundedContext || 'None available'}\n\n${profileContext}`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }],
      },
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as any;
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I processed your request but could not generate a response. Please check your query.'
    );
  }

  /**
   * OpenAI API Call
   */
  private static async callOpenAI(
    message: string,
    history: ChatMessage[],
    grounded: IScholarship[],
    profile?: EligibilityInput
  ): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const groundedContext = grounded
      .map(
        (s) =>
          `[SCHOLARSHIP] Name: ${s.title} | Provider: ${s.provider} | Amount: ${s.awardAmount} | Min %: ${s.minPercentage}% | Portal: ${s.officialUrl}`
      )
      .join('\n');

    const messages = [
      {
        role: 'system',
        content: `You are ScholarBot, the intelligent scholarship assistant for Scholar-Track. Ground scholarship answers strictly on: ${groundedContext}. Always remind students to verify criteria with official providers.`,
      },
      ...history.slice(-4),
      { role: 'user', content: message },
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API status ${response.status}`);
    }

    const data = (await response.json()) as any;
    return data?.choices?.[0]?.message?.content || 'No response generated.';
  }

  /**
   * ScholarBot Built-in Knowledge Engine (Rule & Database Fallback)
   * Clearly marked so users know it is the built-in offline engine.
   */
  private static knowledgeEngineFallback(
    message: string,
    grounded: IScholarship[],
    profile?: EligibilityInput
  ): string {
    const lower = message.toLowerCase();

    // 1. Documents question
    if (lower.includes('document') || lower.includes('certificate') || lower.includes('proof')) {
      return `### 📄 Standard Scholarship Document Checklist

Most scholarship providers require the following official documents:
1. **Academic Records**: Previous year / semester marksheets, Class 10th & 12th board passing certificates.
2. **Income Certificate**: Issued by a competent revenue authority (e.g. Tehsildar, Sub-Divisional Magistrate). Usually valid for the current financial year.
3. **Identity & Domicile Proof**: Aadhaar Card, State Domicile Certificate (where applicable).
4. **Institutional Proof**: Bonafide Student Certificate signed by the Head of Institution, current year admission fee receipt.
5. **Bank Account Details**: Active student bank account passbook copy (must be linked to Aadhaar for Direct Benefit Transfer/DBT).

*💡 Pro Tip: Keep scanned PDF copies under 200 KB as most portals (like NSP) enforce file size limits.*`;
    }

    // 2. Statement of Purpose / Essay guidance
    if (lower.includes('sop') || lower.includes('statement') || lower.includes('essay') || lower.includes('letter')) {
      return `### ✍️ How to Write an Effective Scholarship Statement / Essay

Follow this 4-part framework to stand out:
1. **Introduction & Aspirations**: Briefly state your academic program, your passion for your field, and long-term career vision.
2. **Academic & Extracurricular Dedication**: Mention specific projects, achievements, leadership roles, or obstacles you overcame.
3. **Financial Need & Impact**: Honestly and respectfully explain your family's financial situation and how this scholarship will enable your education.
4. **Commitment to Give Back**: Explain how completing your degree will allow you to contribute to your community and society.

*Note: You can also use our **AI Application Guidance** tool in the navigation bar to generate customized drafts!*`;
    }

    // 3. Eligibility inquiry
    if (lower.includes('eligib') || lower.includes('qualif') || lower.includes('can i apply')) {
      if (grounded.length > 0) {
        const list = grounded
          .map(
            (s) =>
              `- **${s.title}** (${s.provider})\n  • **Amount**: ${s.awardAmount}\n  • **Eligibility**: Min ${s.minPercentage}% score, ${s.maxAnnualIncome ? 'Family income below ₹' + s.maxAnnualIncome.toLocaleString() : 'No family income limit'}\n  • **Official Portal**: [Visit Official Site](${s.officialUrl})`
          )
          .join('\n\n');

        return `### 🎓 Relevant Scholarships from Database

Here are the scholarships that match your query from our verified database:

${list}

*To get an automated criteria match with your exact academic percentage and family income, try our **Eligibility Checker** from the top menu.*`;
      }

      return `Scholarship eligibility usually depends on four core criteria:
1. **Academic Performance**: Minimum marks (typically 50% to 80% depending on whether it is merit or need-based).
2. **Family Income Limit**: Ranging from ₹2.5 Lakhs to ₹8 Lakhs per annum for government/need-based schemes.
3. **Course & Education Level**: Higher Secondary, Diploma, Undergraduate, or Postgraduate.
4. **Special Categories**: State domicile, minority status, or female students in STEM.

You can run an instant evaluation using the **Eligibility Checker** tool in the menu!`;
    }

    // 4. Inquiries about how to use Scholar-Track
    if (lower.includes('how to use') || lower.includes('what is scholar-track') || lower.includes('features')) {
      return `### 🌟 Welcome to Scholar-Track!

Scholar-Track helps you discover, verify, and organize your scholarship applications in one place:
- **Scholarship Directory**: Search and filter through national, state, and private scholarships with verified criteria.
- **Eligibility Checker**: Enter your details once to see exactly which scholarships you qualify for and why.
- **Application Tracker**: Save scholarships, manage deadlines, and track statuses from "Interested" to "Applied" and "Completed".
- **AI Application Guidance**: Generate document checklists, SOP outlines, and application email drafts.
- **ScholarBot**: Ask any question about requirements, procedures, and scholarship tips.`;
    }

    // 5. Default grounded response
    if (grounded.length > 0) {
      const schList = grounded
        .slice(0, 3)
        .map(
          (s) =>
            `- **${s.title}**\n  *Provider*: ${s.provider} | *Award*: ${s.awardAmount}\n  *Min Percentage*: ${s.minPercentage}% | *Link*: ${s.officialUrl}`
        )
        .join('\n\n');

      return `### 🔍 Scholarship Recommendations from Database

Based on your question, here are relevant scholarships found in Scholar-Track:

${schList}

*For official guidelines, please visit the respective official portals. You can also ask me specific questions like "What documents do I need for Pragati scholarship?" or "How do I check my eligibility?"*`;
    }

    return `### 🤖 ScholarBot Assistant

I am here to help you navigate scholarships, understand eligibility requirements, and organize your applications.

You can ask me:
- *"Which scholarships are available for undergraduate students?"*
- *"What documents are needed for need-based scholarships?"*
- *"How does the AICTE Pragati scholarship work?"*
- *"How do I draft a scholarship inquiry email?"*

*(Note: ScholarBot is currently operating in Knowledge Engine mode. You can configure a Gemini API key in \`server/.env\` for custom AI responses).*`;
  }

  private static generateFollowUpSuggestions(query: string): string[] {
    const q = query.toLowerCase();
    if (q.includes('document')) {
      return [
        'How do I get an income certificate?',
        'What is an institutional bonafide certificate?',
        'Which scholarships are open for girls in engineering?',
      ];
    }
    if (q.includes('eligib')) {
      return [
        'What scholarships are available for family income under 4 Lakhs?',
        'Are there scholarships for students with 60% to 75% marks?',
        'How do I track my submitted applications?',
      ];
    }
    return [
      'What documents do I need for state scholarships?',
      'How to write a strong scholarship statement?',
      'Show me scholarships for undergraduate students.',
    ];
  }

  /**
   * Rule-Based & AI-Enhanced Scholarship Recommendations
   */
  public static async getRecommendations(
    profile: EligibilityInput
  ): Promise<ScholarshipEligibilityAssessment[]> {
    const allScholarships = await Scholarship.find().exec();
    const assessments: ScholarshipEligibilityAssessment[] = [];

    const userEdu = (profile.educationLevel || '').trim().toLowerCase();
    const userPct = profile.academicPercentage || 0;
    const userIncome = profile.annualIncome !== undefined ? profile.annualIncome : undefined;
    const userState = (profile.state || '').trim().toLowerCase();
    const userGender = (profile.gender || '').trim().toLowerCase();
    const userCategory = (profile.category || '').trim().toLowerCase();

    for (const s of allScholarships) {
      const breakdown = [];
      let satisfiedCount = 0;
      let totalCriteriaCount = 0;
      const missingCriteria: string[] = [];

      // 1. Education Level
      if (s.educationLevels && s.educationLevels.length > 0) {
        totalCriteriaCount++;
        const matched =
          !userEdu ||
          s.educationLevels.some((lvl) => lvl.toLowerCase().includes(userEdu) || userEdu.includes(lvl.toLowerCase()));
        if (matched) {
          satisfiedCount++;
          breakdown.push({
            criterion: 'Education Level',
            satisfied: true,
            userValue: profile.educationLevel || 'Any',
            requiredValue: s.educationLevels.join(', '),
            message: `Your education level (${profile.educationLevel || 'General'}) matches the eligible levels (${s.educationLevels.join(', ')}).`,
          });
        } else {
          missingCriteria.push(`Education level must be one of: ${s.educationLevels.join(', ')}`);
          breakdown.push({
            criterion: 'Education Level',
            satisfied: false,
            userValue: profile.educationLevel,
            requiredValue: s.educationLevels.join(', '),
            message: `This scholarship requires ${s.educationLevels.join(', ')}, but your profile indicates ${profile.educationLevel}.`,
          });
        }
      }

      // 2. Minimum Percentage
      if (s.minPercentage > 0) {
        totalCriteriaCount++;
        const satisfied = userPct >= s.minPercentage;
        if (satisfied) {
          satisfiedCount++;
          breakdown.push({
            criterion: 'Academic Percentage',
            satisfied: true,
            userValue: `${userPct}%`,
            requiredValue: `>= ${s.minPercentage}%`,
            message: `Your score (${userPct}%) exceeds the minimum required threshold (${s.minPercentage}%).`,
          });
        } else {
          missingCriteria.push(`Minimum score requirement of ${s.minPercentage}%`);
          breakdown.push({
            criterion: 'Academic Percentage',
            satisfied: false,
            userValue: `${userPct}%`,
            requiredValue: `>= ${s.minPercentage}%`,
            message: `Your score of ${userPct}% is below the minimum threshold of ${s.minPercentage}%.`,
          });
        }
      }

      // 3. Family Income Ceiling
      if (s.maxAnnualIncome && s.maxAnnualIncome > 0) {
        totalCriteriaCount++;
        if (userIncome !== undefined) {
          const satisfied = userIncome <= s.maxAnnualIncome;
          if (satisfied) {
            satisfiedCount++;
            breakdown.push({
              criterion: 'Annual Family Income',
              satisfied: true,
              userValue: `₹${userIncome.toLocaleString()}`,
              requiredValue: `<= ₹${s.maxAnnualIncome.toLocaleString()}`,
              message: `Your annual family income (₹${userIncome.toLocaleString()}) is within the permissible ceiling (₹${s.maxAnnualIncome.toLocaleString()}).`,
            });
          } else {
            missingCriteria.push(`Annual family income ceiling (<= ₹${s.maxAnnualIncome.toLocaleString()})`);
            breakdown.push({
              criterion: 'Annual Family Income',
              satisfied: false,
              userValue: `₹${userIncome.toLocaleString()}`,
              requiredValue: `<= ₹${s.maxAnnualIncome.toLocaleString()}`,
              message: `Your family income (₹${userIncome.toLocaleString()}) exceeds the limit of ₹${s.maxAnnualIncome.toLocaleString()}.`,
            });
          }
        } else {
          breakdown.push({
            criterion: 'Annual Family Income',
            satisfied: true,
            userValue: 'Not specified',
            requiredValue: `<= ₹${s.maxAnnualIncome.toLocaleString()}`,
            message: `Requires annual family income below ₹${s.maxAnnualIncome.toLocaleString()}. Please provide your income to verify.`,
          });
        }
      }

      // 4. Applicable State / Region
      if (s.applicableStates && s.applicableStates.length > 0 && !s.applicableStates.includes('All India')) {
        totalCriteriaCount++;
        const satisfied =
          !userState ||
          s.applicableStates.some((st) => st.toLowerCase() === userState || userState.includes(st.toLowerCase()));
        if (satisfied) {
          satisfiedCount++;
          breakdown.push({
            criterion: 'Applicable State',
            satisfied: true,
            userValue: profile.state || 'Any',
            requiredValue: s.applicableStates.join(', '),
            message: `Eligible for state domicile in: ${s.applicableStates.join(', ')}.`,
          });
        } else {
          missingCriteria.push(`Domicile required in: ${s.applicableStates.join(', ')}`);
          breakdown.push({
            criterion: 'Applicable State',
            satisfied: false,
            userValue: profile.state,
            requiredValue: s.applicableStates.join(', '),
            message: `This scheme is restricted to residents of ${s.applicableStates.join(', ')}.`,
          });
        }
      }

      // 5. Gender Eligibility
      if (s.genderEligibility && s.genderEligibility !== 'All') {
        totalCriteriaCount++;
        const satisfied = !userGender || userGender === s.genderEligibility.toLowerCase();
        if (satisfied) {
          satisfiedCount++;
          breakdown.push({
            criterion: 'Gender Criteria',
            satisfied: true,
            userValue: profile.gender || 'Any',
            requiredValue: s.genderEligibility,
            message: `Matches gender criteria (${s.genderEligibility}).`,
          });
        } else {
          missingCriteria.push(`Gender requirement (${s.genderEligibility})`);
          breakdown.push({
            criterion: 'Gender Criteria',
            satisfied: false,
            userValue: profile.gender,
            requiredValue: s.genderEligibility,
            message: `This specific program is earmarked for ${s.genderEligibility} applicants.`,
          });
        }
      }

      const matchScore =
        totalCriteriaCount > 0 ? Math.round((satisfiedCount / totalCriteriaCount) * 100) : 100;

      let status: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'INELIGIBLE';
      if (matchScore === 100) {
        status = 'ELIGIBLE';
      } else if (matchScore >= 50) {
        status = 'PARTIALLY_ELIGIBLE';
      } else {
        status = 'INELIGIBLE';
      }

      // Recommendation reasoning
      let reason = '';
      if (status === 'ELIGIBLE') {
        reason = `High Match (${matchScore}%): You satisfy all primary criteria including academic thresholds and education level.`;
      } else if (status === 'PARTIALLY_ELIGIBLE') {
        reason = `Moderate Match (${matchScore}%): You meet several requirements, but check: ${missingCriteria.join('; ')}.`;
      } else {
        reason = `Low Match (${matchScore}%): Does not meet critical criteria: ${missingCriteria.join('; ')}.`;
      }

      assessments.push({
        scholarshipId: s._id.toString(),
        title: s.title,
        provider: s.provider,
        awardAmount: s.awardAmount,
        status,
        matchScore,
        satisfiedCount,
        totalCriteriaCount,
        breakdown,
        missingCriteria,
        recommendationReason: reason,
        officialUrl: s.officialUrl,
        isVerified: s.isVerified,
      });
    }

    // Sort by match score descending
    return assessments.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * AI Application Guidance Studio
   */
  public static async generateApplicationGuidance(params: {
    type: 'sop' | 'checklist' | 'email' | 'mistakes';
    scholarshipTitle?: string;
    studentDetails?: {
      name?: string;
      course?: string;
      college?: string;
      goals?: string;
      financialContext?: string;
    };
  }): Promise<{ content: string; type: string; disclaimer: string }> {
    const provider = this.getActiveProvider();
    const title = params.scholarshipTitle || 'General Scholarship Application';
    const student = params.studentDetails || {};

    // If Gemini or OpenAI is configured, attempt generative formulation
    if (provider === 'gemini') {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        let prompt = '';
        if (params.type === 'sop') {
          prompt = `Write a well-structured Statement of Purpose / Scholarship Application Essay for a student named "${student.name || 'Student'}" applying for "${title}". Their course is "${student.course || 'Undergraduate Studies'}", college "${student.college || 'University'}", goals: "${student.goals || 'Academic excellence and community impact'}", financial context: "${student.financialContext || 'Seeking financial support to cover educational expenses'}". Format with clear sections: Introduction, Academic Drive, Financial Need, and Future Vision. Keep it authentic, professional, and clear. Label it clearly as a draft template.`;
        } else if (params.type === 'email') {
          prompt = `Draft a professional email inquiry from student "${student.name || 'Applicant'}" to the scholarship committee for "${title}". Purpose: Inquiring about document submission and application verification. Include Subject Line, respectful salutation, concise body, and professional closing.`;
        } else if (params.type === 'checklist') {
          prompt = `Generate a comprehensive preparation and document checklist for applying to "${title}". Include Pre-application, Required Documents, and Submission verification steps.`;
        } else {
          prompt = `Provide a comprehensive guide to the Top 7 Common Scholarship Application Mistakes and how to avoid them for "${title}".`;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are an expert academic advisor for Scholar-Track. Do NOT invent fake credentials or certificates.\n\n${prompt}`,
                  },
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return {
              content: text,
              type: params.type,
              disclaimer:
                'AI-generated draft for review and editing. Do not submit without reviewing your personal facts and official provider rules.',
            };
          }
        }
      } catch (e) {
        console.warn('Gemini guidance generation failed, using structured template:', e);
      }
    }

    // Fallback: Expert Structured Guidance Templates
    let content = '';

    if (params.type === 'sop') {
      content = `### 📝 Statement of Purpose / Scholarship Essay (Draft Template)

**Applicant:** ${student.name || '[Your Full Name]'}
**Scholarship:** ${title}
**Course / Major:** ${student.course || '[Your Program / Degree]'}
**Institution:** ${student.college || '[Your College / University]'}

---

#### 1. Introduction & Academic Passion
I am writing to express my earnest application for the **${title}**. Currently pursuing my **${student.course || 'Degree'}** at **${student.college || 'my institution'}**, my academic journey is driven by a deep fascination with my discipline and a desire to leverage my learning to address real-world challenges.

#### 2. Academic Achievements & Extracurricular Dedication
Throughout my academic tenure, I have maintained consistent scholastic performance, demonstrating perseverance, curiosity, and discipline. In addition to coursework, I have actively participated in practical projects and peer-learning initiatives that strengthened my technical and collaborative capabilities.

#### 3. Financial Context & Justification
${student.financialContext || 'Pursuing higher education entails substantial financial investment in tuition, academic materials, and laboratory resources. Securing this scholarship would alleviate financial pressure on my family, enabling me to focus wholeheartedly on academic excellence and research without undue economic anxiety.'}

#### 4. Long-Term Career Vision & Giving Back
My career ambition is: ${student.goals || 'to graduate with honors, excel as a responsible professional, and mentor future underprivileged students in pursuing higher education'}. This scholarship is more than financial assistance; it is an empowering vote of confidence in my potential to make meaningful contributions to my community.

I express my deepest gratitude to the selection committee for considering my application.

Sincerely,  
**${student.name || '[Your Full Name]'}**  
[Contact Email / Phone Number]`;
    } else if (params.type === 'email') {
      content = `### ✉️ Formal Scholarship Application Inquiry Email

**To:** [Scholarship Committee / Provider Contact Email]
**Subject:** Application Inquiry & Document Submission – ${title} – [Your Application ID / Full Name]

Dear Scholarship Selection Committee,

I hope this email finds you well.

I am writing to respectfully inquire regarding the application submission procedures for the **${title}**. I am a full-time student pursuing **${student.course || 'my degree program'}** at **${student.college || 'my institution'}**, and I am eager to submit my application for your esteemed scheme.

Could you kindly confirm:
1. The exact deadline for document verification for the current academic session.
2. Whether income certificates issued in the current financial year require state gazetted officer countersignature.
3. The expected notification timeline for shortlisted candidates.

I have assembled all certified marksheets, bonafide verification certificates, and domicile documents according to your published guidelines.

Thank you very much for your time, guidance, and for supporting students in their academic endeavors.

With sincere regards,

**${student.name || '[Your Full Name]'}**  
Student ID: [Your Student ID / Roll No.]  
Phone: [Your Phone Number]  
Email: [Your Registered Email]`;
    } else if (params.type === 'checklist') {
      content = `### 📋 Comprehensive Application Checklist for ${title}

#### Phase 1: Pre-Application Verification
- [ ] Read official eligibility criteria thoroughly on the official provider portal.
- [ ] Confirm your family income falls within the permissible threshold.
- [ ] Verify that your degree/diploma program is recognized by UGC/AICTE.
- [ ] Check the official closing date and set a reminder 5 days in advance.

#### Phase 2: Document Collation & Attestation
- [ ] **Academic Transcripts**: Self-attested copies of 10th, 12th, and all completed college semesters.
- [ ] **Income Proof**: Valid Tehsildar / SDO / Competent Revenue Authority income certificate.
- [ ] **Institutional Bonafide**: Signed & stamped Bonafide Certificate from College Dean / Principal.
- [ ] **Fee Receipt**: Official payment receipt for current academic year tuition.
- [ ] **Bank Passbook**: First page showing Account Holder Name, Account Number, and IFSC code (ensure Aadhaar linking).
- [ ] **Aadhaar / Government ID**: Clear scanned copy front & back.

#### Phase 3: Final Submission & Records
- [ ] Ensure all scanned PDFs are under the required upload size (typically 100KB – 200KB).
- [ ] Review all typed personal details for zero spelling errors.
- [ ] Download and print the final Application Submission Confirmation PDF.
- [ ] Note down the Application ID and keep login credentials in a secure place.`;
    } else {
      content = `### ⚠️ Top 7 Scholarship Application Mistakes & How to Avoid Them

1. **Submitting Expired Income Certificates**
   *Mistake:* Many government schemes reject applications if the income certificate is from an outdated financial year.
   *Fix:* Check the issue date. Obtain an updated certificate from your local revenue authority early.

2. **Unlinked Bank Accounts (Aadhaar Seeding Failure)**
   *Mistake:* Direct Benefit Transfer (DBT) funds bounce if your bank account is not mapped with your Aadhaar in NPCI database.
   *Fix:* Visit your bank branch and ask the manager to verify NPCI mapping for DBT transactions.

3. **Missing Principal / Dean Signatures on Bonafide**
   *Mistake:* Using a temporary student ID card instead of an official college bonafide letterhead with the seal.
   *Fix:* Request a formal Bonafide Certificate from your college administrative desk in advance.

4. **Blurry or Illegible Scans**
   *Mistake:* Smartphone camera photos with shadows, glare, or cut-off corners getting automatically rejected by document scanners.
   *Fix:* Use a flatbed scanner or a dedicated scanning app with high contrast and straight borders.

5. **Discrepancy in Name Spelling**
   *Mistake:* Name on Aadhaar (e.g. "Kumar Rahul") does not match Class 10th certificate (e.g. "Rahul Kumar").
   *Fix:* Ensure your scholarship portal registration matches the exact name ordering on your Class 10th marksheet.

6. **Waiting Until the Final Deadline Hour**
   *Mistake:* National portals (like scholarships.gov.in) face extreme server traffic and crashes during the last 48 hours.
   *Fix:* Submit at least 1 week before the deadline.

7. **Generic Copy-Pasted Essays**
   *Mistake:* Copying standard internet essays without mentioning your actual goals, course, or personal challenges.
   *Fix:* Personalize your essay using your real experiences and aspirations.`;
    }

    return {
      content,
      type: params.type,
      disclaimer:
        'AI-generated draft for review and editing. Do not submit without reviewing your personal facts and official provider rules.',
    };
  }
}
