import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Bookmark,
  PlusCircle,
  Check,
  FileCheck,
  Share2,
  Sparkles,
} from 'lucide-react';
import { scholarshipApi, savedScholarshipApi, applicationApi } from '../services/api.js';
import { Scholarship } from '../types/index.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { useAuth } from '../context/AuthContext.js';

export const ScholarshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [related, setRelated] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await scholarshipApi.getById(id);
        setScholarship(res.data);
        setRelated(res.related || []);

        if (isAuthenticated) {
          const [savedRes, appRes] = await Promise.all([
            savedScholarshipApi.getAll().catch(() => ({ data: [] })),
            applicationApi.getAll().catch(() => ({ data: [] })),
          ]);

          setIsSaved(savedRes.data.some((s) => s.scholarshipId._id === id));
          setIsTracking(appRes.data.some((a) => a.scholarshipId._id === id));
        }
      } catch (err) {
        console.error('Error fetching detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id, isAuthenticated]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated || !scholarship) {
      setNotification('Please log in to save scholarships.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    try {
      if (isSaved) {
        await savedScholarshipApi.remove(scholarship._id);
        setIsSaved(false);
        setNotification('Removed from saved.');
      } else {
        await savedScholarshipApi.save(scholarship._id);
        setIsSaved(true);
        setNotification('Saved to your bookmarks!');
      }
      setTimeout(() => setNotification(''), 3000);
    } catch (e: any) {
      setNotification(e.message || 'Error updating bookmark.');
    }
  };

  const handleTrack = async () => {
    if (!isAuthenticated || !scholarship) {
      setNotification('Please log in to track scholarships.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    try {
      await applicationApi.create({ scholarshipId: scholarship._id, status: 'Interested' });
      setIsTracking(true);
      setNotification('Added to your Application Tracker!');
      setTimeout(() => setNotification(''), 3000);
    } catch (e: any) {
      setNotification(e.message || 'Already in application tracker.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading scholarship details..." />;
  }

  if (!scholarship) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Scholarship Not Found</h2>
        <p className="text-xs text-slate-500">The requested scholarship could not be located.</p>
        <Link
          to="/scholarships"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/scholarships"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Scholarships
        </Link>
      </div>

      {notification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg">
          {notification}
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Verification & Provider */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {scholarship.isVerified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Scheme
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Demonstration Record
              </span>
            )}
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {scholarship.provider}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToggle}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isSaved
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-600' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={handleTrack}
              disabled={isTracking}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                isTracking
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              }`}
            >
              {isTracking ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Tracked
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Track Application
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {scholarship.title}
        </h1>

        {/* Benefit Highlight Card */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1">
              Grant Amount & Financial Value
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {scholarship.awardAmount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white/90 px-3.5 py-2 rounded-xl border border-slate-200/60">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Deadline: {scholarship.deadline}</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Overview & Scope
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {scholarship.description}
          </p>
        </div>

        {/* Eligibility Criteria Matrix */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Mandatory Eligibility Standards
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block mb-1">Education Level</span>
              <span className="font-bold text-slate-800 text-sm">
                {scholarship.educationLevels.join(', ')}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block mb-1">Academic Percentage</span>
              <span className="font-bold text-slate-800 text-sm">
                {scholarship.minPercentage > 0 ? `Minimum ${scholarship.minPercentage}%` : 'Passing Grade'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block mb-1">Annual Family Income Ceiling</span>
              <span className="font-bold text-slate-800 text-sm">
                {scholarship.maxAnnualIncome ? `≤ ₹${scholarship.maxAnnualIncome.toLocaleString()}` : 'No family income limit'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block mb-1">Eligible States / Regions</span>
              <span className="font-bold text-slate-800 text-sm">
                {scholarship.applicableStates.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Document Checklist */}
        {scholarship.documentRequirements && scholarship.documentRequirements.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              Required Verification Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scholarship.documentRequirements.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portal Button & Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() =>
              navigate(`/scholarbot?prompt=What are the best tips to apply for ${encodeURIComponent(scholarship.title)}?`)
            }
            className="flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-2.5 rounded-xl transition"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Consult ScholarBot about this scheme</span>
          </button>

          {scholarship.officialUrl ? (
            <a
              href={scholarship.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="text-xs text-slate-400">Apply through College Administrative Desk</span>
          )}
        </div>
      </div>
    </div>
  );
};
