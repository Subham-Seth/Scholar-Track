import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Sliders,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Bookmark,
  ExternalLink,
  GraduationCap,
  Percent,
  DollarSign,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { eligibilityApi, savedScholarshipApi } from '../services/api.js';
import { EligibilityAssessment } from '../types/index.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { useAuth } from '../context/AuthContext.js';

export const EligibilityCheckerPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form inputs
  const [formData, setFormData] = useState({
    educationLevel: 'Undergraduate',
    academicPercentage: '80',
    annualIncome: '350000',
    state: 'Maharashtra',
    category: 'General',
    gender: 'All',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    eligible: EligibilityAssessment[];
    partiallyEligible: EligibilityAssessment[];
    ineligible: EligibilityAssessment[];
    totalEvaluated: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'eligible' | 'partially' | 'ineligible'>('eligible');
  const [notification, setNotification] = useState('');

  // Auto-fill from user profile if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        educationLevel: user.educationLevel || prev.educationLevel,
        academicPercentage: user.academicPercentage !== undefined ? String(user.academicPercentage) : prev.academicPercentage,
        annualIncome: user.annualIncome !== undefined ? String(user.annualIncome) : prev.annualIncome,
        state: user.state || prev.state,
        category: user.category || prev.category,
        gender: user.gender || prev.gender,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        educationLevel: formData.educationLevel,
        academicPercentage: formData.academicPercentage ? Number(formData.academicPercentage) : undefined,
        annualIncome: formData.annualIncome ? Number(formData.annualIncome) : undefined,
        state: formData.state,
        category: formData.category,
        gender: formData.gender !== 'All' ? formData.gender : undefined,
      };

      const res = await eligibilityApi.check(payload);
      setResults({
        eligible: res.results.eligible,
        partiallyEligible: res.results.partiallyEligible,
        ineligible: res.results.ineligible,
        totalEvaluated: res.summary.totalEvaluated,
      });

      if (res.results.eligible.length > 0) {
        setActiveTab('eligible');
      } else if (res.results.partiallyEligible.length > 0) {
        setActiveTab('partially');
      } else {
        setActiveTab('ineligible');
      }
    } catch (err: any) {
      console.error('Error running eligibility check:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (scholarshipId: string) => {
    if (!isAuthenticated) {
      setNotification('Please log in to bookmark scholarships.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    try {
      await savedScholarshipApi.save(scholarshipId);
      setNotification('Saved to your bookmarks! View in Dashboard.');
      setTimeout(() => setNotification(''), 3000);
    } catch (e: any) {
      setNotification(e.message || 'Already saved.');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Rule-Based Automated Assessment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Scholarship Eligibility Checker
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Enter your academic and financial credentials once. Our matching engine will objectively compare your profile against verified scholarship criteria in MongoDB.
        </p>
      </div>

      {notification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg">
          {notification}
        </div>
      )}

      {/* Main Grid: Form on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Your Student Credentials</h2>
            {user && (
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Synced from Profile
              </span>
            )}
          </div>

          <form onSubmit={handleEvaluate} className="space-y-4">
            {/* Education Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Education Level
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="High School (10th/12th)">High School (10th / 12th)</option>
                  <option value="Diploma">Diploma / Polytechnic</option>
                  <option value="Undergraduate">Undergraduate (B.Tech, B.Sc, B.Com, etc.)</option>
                  <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, MBA, etc.)</option>
                  <option value="Ph.D./Doctoral">Ph.D. / Doctoral Research</option>
                </select>
              </div>
            </div>

            {/* Academic Percentage */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Percentage / Aggregate (%)
              </label>
              <div className="relative">
                <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="academicPercentage"
                  value={formData.academicPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 82.5"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Annual Income */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Household Income (₹)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  step="10000"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  placeholder="e.g. 350000"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* State Domicile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State / Region Domicile
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra, Karnataka, Delhi"
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Social Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                  <option value="Minority">Minority</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="All">All / Any</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Database Records...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Check Instant Eligibility</span>
                </>
              )}
            </button>
          </form>

          {/* Preliminary Disclaimer Note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Preliminary Discovery Note:</strong> Results are computed using published criteria. Always cross-check specific university cutoff percentiles on official portals.
            </span>
          </div>
        </div>

        {/* Right Column: Assessment Results */}
        <div className="lg:col-span-7 space-y-4">
          {!results && !isLoading && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Sliders className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Ready to Evaluate Your Eligibility
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Fill in your academic marks and household income on the left, then click "Check Instant Eligibility" to see a full breakdown of matching scholarships.
              </p>
              <button
                onClick={() => handleEvaluate()}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Run Sample Evaluation
              </button>
            </div>
          )}

          {isLoading && <LoadingSpinner message="Auditing criteria against MongoDB records..." />}

          {results && !isLoading && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Summary Metric Ribbon */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab('eligible')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    activeTab === 'eligible'
                      ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">100% Eligible</span>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                    {results.eligible.length}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Satisfies all rules</p>
                </button>

                <button
                  onClick={() => setActiveTab('partially')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    activeTab === 'partially'
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">Partially Eligible</span>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-amber-700 mt-1">
                    {results.partiallyEligible.length}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Missing 1-2 criteria</p>
                </button>

                <button
                  onClick={() => setActiveTab('ineligible')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    activeTab === 'ineligible'
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800">Ineligible</span>
                    <XCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-rose-700 mt-1">
                    {results.ineligible.length}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Criteria not satisfied</p>
                </button>
              </div>

              {/* Assessment List */}
              <div className="space-y-4">
                {(activeTab === 'eligible'
                  ? results.eligible
                  : activeTab === 'partially'
                  ? results.partiallyEligible
                  : results.ineligible
                ).map((item) => (
                  <div
                    key={item.scholarshipId}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.status === 'ELIGIBLE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : item.status === 'PARTIALLY_ELIGIBLE'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {item.matchScore}% Match
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {item.provider}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg block">
                          {item.awardAmount}
                        </span>
                      </div>
                    </div>

                    {/* Recommendation Reason */}
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                      <strong>Assessment Verdict:</strong> {item.recommendationReason}
                    </div>

                    {/* Detailed Criteria Checklist Breakdown */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Criteria Audit:
                      </p>
                      {item.breakdown.map((crit, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-start gap-2 text-xs py-1 px-2 rounded-lg bg-slate-50/70"
                        >
                          {crit.satisfied ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <span className="font-semibold text-slate-800">
                              {crit.criterion}:{' '}
                            </span>
                            <span className="text-slate-600">{crit.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSave(item.scholarshipId)}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          Save
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/scholarbot?prompt=Can you explain why I am ${item.matchScore}% matched for ${encodeURIComponent(
                                item.title
                              )}?`
                            )
                          }
                          className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Ask ScholarBot
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/scholarships/${item.scholarshipId}`}
                          className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-1.5"
                        >
                          Details
                        </Link>
                        {item.officialUrl && (
                          <a
                            href={item.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-xl transition shadow-sm"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
