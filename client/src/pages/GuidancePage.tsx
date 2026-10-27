import React, { useState } from 'react';
import {
  FileText,
  CheckSquare,
  Mail,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Send,
  Loader2,
} from 'lucide-react';
import { aiApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const GuidancePage: React.FC = () => {
  const { user } = useAuth();

  const [activeTool, setActiveTool] = useState<'sop' | 'checklist' | 'email' | 'mistakes'>('sop');
  const [scholarshipTitle, setScholarshipTitle] = useState('Central Sector Scheme / General Scholarship');
  const [studentDetails, setStudentDetails] = useState({
    name: user?.name || '',
    course: 'B.Tech / Bachelor of Science',
    college: 'State University of Technology',
    goals: 'Software engineering, open-source development, and mentoring underrepresented students',
    financialContext: 'Single-earner household seeking tuition grant to cover laboratory and semester fees',
  });

  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (toolType?: 'sop' | 'checklist' | 'email' | 'mistakes') => {
    const selected = toolType || activeTool;
    setIsLoading(true);
    setCopied(false);

    try {
      const res = await aiApi.getApplicationGuidance({
        type: selected,
        scholarshipTitle,
        studentDetails,
      });

      setGeneratedContent(res.content);
    } catch (err: any) {
      setGeneratedContent('Error generating guidance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Application Guidance Studio</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Application Guidance & Drafting
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Craft compelling Statements of Purpose, generate customized document checklists, draft formal inquiries, and avoid critical submission errors.
        </p>
      </div>

      {/* Tool Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setActiveTool('sop');
            handleGenerate('sop');
          }}
          className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
            activeTool === 'sop'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Statement of Purpose (SOP)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Structure persuasive essays with academic focus and community impact.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 mt-3 block">
            Generate Outline →
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTool('checklist');
            handleGenerate('checklist');
          }}
          className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
            activeTool === 'checklist'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Document Checklist</h3>
            <p className="text-xs text-slate-500 mt-1">
              Comprehensive list of attested documents, income certificates & seals.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-3 block">
            Generate Checklist →
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTool('email');
            handleGenerate('email');
          }}
          className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
            activeTool === 'email'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Application Inquiry Email</h3>
            <p className="text-xs text-slate-500 mt-1">
              Professional email templates to scholarship nodal officers & review committees.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-purple-600 mt-3 block">
            Draft Email →
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTool('mistakes');
            handleGenerate('mistakes');
          }}
          className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
            activeTool === 'mistakes'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Top 7 Common Mistakes</h3>
            <p className="text-xs text-slate-500 mt-1">
              Avoid bank account mapping issues, deadline server crashes & expired certificates.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-rose-600 mt-3 block">
            View Mistakes Guide →
          </span>
        </button>
      </div>

      {/* Main Studio Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Details */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Customize Application Context
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Scholarship Title
            </label>
            <input
              type="text"
              value={scholarshipTitle}
              onChange={(e) => setScholarshipTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student Full Name
            </label>
            <input
              type="text"
              value={studentDetails.name}
              onChange={(e) => setStudentDetails({ ...studentDetails, name: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Degree / Program of Study
            </label>
            <input
              type="text"
              value={studentDetails.course}
              onChange={(e) => setStudentDetails({ ...studentDetails, course: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              College / University Name
            </label>
            <input
              type="text"
              value={studentDetails.college}
              onChange={(e) => setStudentDetails({ ...studentDetails, college: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Goals & Aspirations
            </label>
            <textarea
              rows={2}
              value={studentDetails.goals}
              onChange={(e) => setStudentDetails({ ...studentDetails, goals: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Financial Context / Reason for Support
            </label>
            <textarea
              rows={2}
              value={studentDetails.financialContext}
              onChange={(e) =>
                setStudentDetails({ ...studentDetails, financialContext: e.target.value })
              }
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Draft...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Customized Content</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Output Canvas */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Generated Application Draft</h3>
              <p className="text-[11px] text-slate-400">
                Review, personalize, and verify before official submission.
              </p>
            </div>

            {generatedContent && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/60 rounded-2xl border border-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-800">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <p className="text-xs">Formulating your personalized scholarship guidance draft...</p>
              </div>
            ) : generatedContent ? (
              generatedContent
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400 p-8">
                <BookOpen className="w-10 h-10 text-slate-300" />
                <p className="text-xs">
                  Click <strong>"Generate Customized Content"</strong> or select one of the 4 tools above to generate a draft.
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 leading-normal">
            <strong>Ethical & Academic Integrity Notice:</strong> AI drafts are starting points. Do NOT invent fake documents, fake certificates, or altered income values. Always verify facts with your institution.
          </div>
        </div>
      </div>
    </div>
  );
};
