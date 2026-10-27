import React, { useState } from 'react';
import {
  ExternalLink,
  Trash2,
  Calendar,
  Edit3,
  Check,
  AlertCircle,
  Building,
  DollarSign,
} from 'lucide-react';
import { ApplicationItem, ApplicationStatus } from '../../types/index.js';

interface ApplicationTrackerProps {
  applications: ApplicationItem[];
  onStatusChange: (id: string, newStatus: ApplicationStatus) => Promise<void>;
  onUpdateNotes: (id: string, notes: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Interested',
  'Planning to Apply',
  'Applied',
  'Documents Pending',
  'Completed',
];

const STATUS_BADGES: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  Interested: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  'Planning to Apply': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  Applied: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Documents Pending': { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
};

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onStatusChange,
  onUpdateNotes,
  onDelete,
}) => {
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const handleStartEdit = (app: ApplicationItem) => {
    setEditingNotesId(app._id);
    setTempNotes(app.notes || '');
  };

  const handleSaveNotes = async (id: string) => {
    await onUpdateNotes(id, tempNotes);
    setEditingNotesId(null);
  };

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          No Applications Added to Tracker Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Visit the scholarship directory to explore verified schemes, check your eligibility, and click "Track" to manage your application deadlines here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => {
        const badgeStyle = STATUS_BADGES[app.status] || STATUS_BADGES['Interested'];
        const isEditing = editingNotesId === app._id;

        return (
          <div
            key={app._id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            {/* Scholarship Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                >
                  {app.status}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  {app.scholarshipId.provider}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 truncate">
                {app.scholarshipId.title}
              </h4>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <DollarSign className="w-3.5 h-3.5" />
                  {app.scholarshipId.awardAmount}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline: {app.scholarshipId.deadline}
                </span>
              </div>

              {/* Notes Section */}
              <div className="mt-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Add personal notes (e.g. Sent documents via post on Oct 12)"
                      className="text-xs px-3 py-1.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1"
                    />
                    <button
                      onClick={() => handleSaveNotes(app._id)}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                      title="Save note"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="italic">
                      {app.notes ? `Note: "${app.notes}"` : 'No notes added.'}
                    </span>
                    <button
                      onClick={() => handleStartEdit(app)}
                      className="p-1 hover:text-indigo-600 rounded transition"
                      title="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Status Selector & Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Change Pipeline Status
                </label>
                <select
                  value={app.status}
                  onChange={(e) => onStatusChange(app._id, e.target.value as ApplicationStatus)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {app.scholarshipId.officialUrl && (
                <a
                  href={app.scholarshipId.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition"
                  title="Open official portal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to remove this scholarship from your tracker?')) {
                    onDelete(app._id);
                  }
                }}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition"
                title="Remove from tracker"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
