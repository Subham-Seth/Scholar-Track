import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Bookmark,
  Calendar,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Sparkles,
  PlusCircle,
  Check,
} from 'lucide-react';
import { Scholarship } from '../../types/index.js';

interface ScholarshipDetailModalProps {
  scholarship: Scholarship | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  isTracking?: boolean;
  onSaveToggle?: (id: string) => void;
  onTrack?: (scholarship: Scholarship) => void;
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  scholarship,
  isOpen,
  onClose,
  isSaved = false,
  isTracking = false,
  onSaveToggle,
  onTrack,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !scholarship) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {scholarship.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Scheme
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Demonstration Record
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">{scholarship.provider}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {scholarship.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Award Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-emerald-900 uppercase tracking-wide">
                Award Amount & Financial Benefit
              </p>
              <p className="text-xl font-extrabold text-emerald-800">
                {scholarship.awardAmount}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/50">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{scholarship.deadline}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              About the Scheme
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {scholarship.description}
            </p>
          </div>

          {/* Eligibility Criteria Grid */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Eligibility Criteria
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Education Levels:</span>
                <span className="font-semibold text-slate-800">
                  {scholarship.educationLevels.join(', ') || 'All levels'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Minimum Score / Percentage:</span>
                <span className="font-semibold text-slate-800">
                  {scholarship.minPercentage > 0 ? `${scholarship.minPercentage}% or higher` : 'Passing score'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Annual Family Income Ceiling:</span>
                <span className="font-semibold text-slate-800">
                  {scholarship.maxAnnualIncome
                    ? `₹${scholarship.maxAnnualIncome.toLocaleString()} per annum`
                    : 'No income ceiling specified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">State / Domicile:</span>
                <span className="font-semibold text-slate-800">
                  {scholarship.applicableStates.join(', ')}
                </span>
              </div>
            </div>

            {scholarship.academicRequirements && (
              <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                <strong>Academic Details:</strong> {scholarship.academicRequirements}
              </div>
            )}
          </div>

          {/* Required Documents */}
          {scholarship.documentRequirements && scholarship.documentRequirements.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Required Documents Checklist
              </h4>
              <ul className="space-y-2">
                {scholarship.documentRequirements.map((doc, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ask ScholarBot Button */}
          <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-900">Have questions about this scholarship?</p>
                <p className="text-[11px] text-purple-700">Ask ScholarBot for document help, essay tips, or eligibility clarification.</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate(`/scholarbot?prompt=How do I apply for ${encodeURIComponent(scholarship.title)}?`);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shrink-0 transition"
            >
              Ask AI
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onSaveToggle && (
              <button
                onClick={() => onSaveToggle(scholarship._id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  isSaved
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
                {isSaved ? 'Saved in Bookmarks' : 'Save for Later'}
              </button>
            )}

            {onTrack && (
              <button
                onClick={() => onTrack(scholarship)}
                disabled={isTracking}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isTracking
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-white border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                }`}
              >
                {isTracking ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Tracked in Applications
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Add to Application Tracker
                  </>
                )}
              </button>
            )}
          </div>

          <div>
            {scholarship.officialUrl ? (
              <a
                href={scholarship.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <span className="text-xs text-slate-400">Application via College Desk</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
