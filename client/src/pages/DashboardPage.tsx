import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Bookmark,
  CheckCircle,
  FileText,
  User as UserIcon,
  Sparkles,
  TrendingUp,
  DollarSign,
  Plus,
  Compass,
  ArrowRight,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { applicationApi, savedScholarshipApi, aiApi } from '../services/api.js';
import { ApplicationItem, SavedScholarshipItem, ApplicationStatus, EligibilityAssessment } from '../types/index.js';
import { DashboardCharts } from '../components/dashboard/DashboardCharts.js';
import { ApplicationTracker } from '../components/dashboard/ApplicationTracker.js';
import { ProfileSettings } from '../components/dashboard/ProfileSettings.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { useAuth } from '../context/AuthContext.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'tracker' | 'saved' | 'profile'>('overview');
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<SavedScholarshipItem[]>([]);
  const [recommendations, setRecommendations] = useState<EligibilityAssessment[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [totalPotentialValue, setTotalPotentialValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string>('');

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [appRes, savedRes, recRes] = await Promise.all([
        applicationApi.getAll(),
        savedScholarshipApi.getAll(),
        aiApi.getRecommendations().catch(() => ({ data: [] })),
      ]);

      setApplications(appRes.data);
      setStatusCounts(appRes.summary.statusCounts);
      setTotalPotentialValue(appRes.summary.totalPotentialValue);
      setSavedScholarships(savedRes.data);
      setRecommendations(recRes.data || []);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await applicationApi.update(id, { status: newStatus });
      setNotification(`Status updated to "${newStatus}"!`);
      setTimeout(() => setNotification(''), 3000);
      loadDashboardData();
    } catch (e: any) {
      setNotification(e.message || 'Error updating status.');
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    try {
      await applicationApi.update(id, { notes });
      setNotification('Personal note saved.');
      setTimeout(() => setNotification(''), 3000);
      loadDashboardData();
    } catch (e: any) {
      setNotification(e.message || 'Error updating notes.');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await applicationApi.delete(id);
      setNotification('Scholarship removed from application tracker.');
      setTimeout(() => setNotification(''), 3000);
      loadDashboardData();
    } catch (e: any) {
      setNotification(e.message || 'Error removing application.');
    }
  };

  const handleRemoveSaved = async (id: string) => {
    try {
      await savedScholarshipApi.remove(id);
      setSavedScholarships((prev) => prev.filter((s) => s._id !== id && s.scholarshipId._id !== id));
      setNotification('Removed from saved bookmarks.');
      setTimeout(() => setNotification(''), 3000);
    } catch (e: any) {
      setNotification(e.message || 'Error removing bookmark.');
    }
  };

  const handleMoveToTracker = async (scholarshipId: string) => {
    try {
      await applicationApi.create({ scholarshipId, status: 'Interested' });
      setNotification('Added to application tracker!');
      setTimeout(() => setNotification(''), 3000);
      loadDashboardData();
    } catch (e: any) {
      setNotification(e.message || 'Already in application tracker.');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading student dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Student Success Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Scholar'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            {user?.educationLevel || 'Undergraduate'} Student
            {user?.academicPercentage ? ` • ${user.academicPercentage}% Academic Score` : ''}
            {user?.state ? ` • ${user.state}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/scholarships"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
          >
            <Compass className="w-4 h-4" />
            Browse New Schemes
          </Link>
          <Link
            to="/scholarbot"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            Consult ScholarBot
          </Link>
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700">
          {notification}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview & Charts
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition whitespace-nowrap ${
            activeTab === 'tracker'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Application Tracker
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {applications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition whitespace-nowrap ${
            activeTab === 'saved'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Scholarships
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {savedScholarships.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Profile & Matching Rules
        </button>
      </div>

      {/* Tab 1: Overview & Charts */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <DashboardCharts
            applications={applications}
            statusCounts={statusCounts}
            totalPotentialValue={totalPotentialValue}
            savedCount={savedScholarships.length}
          />

          {/* AI-Powered Tailored Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Top Recommended for Your Profile
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Algorithmically matched against your education level and percentage.
                  </p>
                </div>
                <Link
                  to="/eligibility"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Run Full Audit
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.scholarshipId}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span className="truncate max-w-[150px]">{rec.provider}</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {rec.matchScore}% Match
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                        {rec.title}
                      </h4>
                      <p className="text-xs font-semibold text-emerald-700 mt-2">
                        {rec.awardAmount}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {rec.recommendationReason}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <Link
                        to={`/scholarships/${rec.scholarshipId}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleMoveToTracker(rec.scholarshipId)}
                        className="text-xs font-semibold px-2.5 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Track
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Application Tracker */}
      {activeTab === 'tracker' && (
        <div className="animate-in fade-in duration-200">
          <ApplicationTracker
            applications={applications}
            onStatusChange={handleStatusChange}
            onUpdateNotes={handleUpdateNotes}
            onDelete={handleDeleteApplication}
          />
        </div>
      )}

      {/* Tab 3: Saved Scholarships */}
      {activeTab === 'saved' && (
        <div className="animate-in fade-in duration-200 space-y-4">
          {savedScholarships.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Saved Scholarships Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Click the bookmark icon on any scholarship in the directory to save it to this private list.
              </p>
              <Link
                to="/scholarships"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
              >
                Browse Scholarships
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedScholarships.map((saved) => (
                <div
                  key={saved._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {saved.scholarshipId.provider}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {saved.scholarshipId.title}
                    </h4>
                    <p className="text-xs font-bold text-emerald-700 mt-2">
                      {saved.scholarshipId.awardAmount}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {saved.scholarshipId.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleMoveToTracker(saved.scholarshipId._id)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                    >
                      Add to Tracker
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/scholarships/${saved.scholarshipId._id}`}
                        className="px-3 py-1.5 text-slate-700 hover:text-indigo-600 text-xs font-semibold"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleRemoveSaved(saved._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Student Profile Settings */}
      {activeTab === 'profile' && (
        <div className="animate-in fade-in duration-200">
          <ProfileSettings />
        </div>
      )}
    </div>
  );
};
