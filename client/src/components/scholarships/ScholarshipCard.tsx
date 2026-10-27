import React from 'react';
import {
  Bookmark,
  Calendar,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  Award,
  PlusCircle,
  Check,
} from 'lucide-react';
import { Scholarship } from '../../types/index.js';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  isSaved?: boolean;
  isTracking?: boolean;
  onSaveToggle?: (id: string) => void;
  onTrack?: (scholarship: Scholarship) => void;
  onSelect: (scholarship: Scholarship) => void;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scholarship,
  isSaved = false,
  isTracking = false,
  onSaveToggle,
  onTrack,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Badges */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
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

            {scholarship.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Award className="w-3 h-3 text-indigo-600" />
                Featured
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          {onSaveToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveToggle(scholarship._id);
              }}
              title={isSaved ? 'Remove from saved' : 'Save scholarship'}
              className={`p-2 rounded-xl transition ${
                isSaved
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
            </button>
          )}
        </div>

        {/* Title & Provider */}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 line-clamp-1">
          {scholarship.provider}
        </p>
        <h3
          onClick={() => onSelect(scholarship)}
          className="text-base font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition line-clamp-2 leading-snug mb-2"
        >
          {scholarship.title}
        </h3>

        {/* Award Amount Badge */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl px-3 py-2 mb-3">
          <p className="text-[11px] font-medium text-emerald-800">Benefit / Award</p>
          <p className="text-sm font-bold text-emerald-700 truncate">{scholarship.awardAmount}</p>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {scholarship.description}
        </p>

        {/* Key Criteria Metrics */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 block">Min Percentage:</span>
            <span className="font-semibold text-slate-800">
              {scholarship.minPercentage > 0 ? `${scholarship.minPercentage}%` : 'Passing Grade'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Income Limit:</span>
            <span className="font-semibold text-slate-800 truncate block">
              {scholarship.maxAnnualIncome
                ? `≤ ₹${(scholarship.maxAnnualIncome / 100000).toFixed(1)} Lakhs/yr`
                : 'No Income Cap'}
            </span>
          </div>
        </div>

        {/* Categories & Education Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {scholarship.educationLevels.slice(0, 2).map((lvl) => (
            <span
              key={lvl}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
            >
              <GraduationCap className="w-3 h-3 text-slate-500" />
              {lvl}
            </span>
          ))}
          {scholarship.categories.slice(0, 1).map((cat) => (
            <span
              key={cat}
              className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer / Action Bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate max-w-[130px]">{scholarship.deadline}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onTrack && (
            <button
              onClick={() => onTrack(scholarship)}
              disabled={isTracking}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                isTracking
                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                  : 'bg-white border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {isTracking ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Tracked
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Track
                </>
              )}
            </button>
          )}

          <button
            onClick={() => onSelect(scholarship)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
