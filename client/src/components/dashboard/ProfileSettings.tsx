import React, { useState } from 'react';
import { Save, Check, User, Mail, GraduationCap, Percent, DollarSign, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const ProfileSettings: React.FC = () => {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    educationLevel: user?.educationLevel || 'Undergraduate',
    academicPercentage: user?.academicPercentage !== undefined ? String(user.academicPercentage) : '',
    annualIncome: user?.annualIncome !== undefined ? String(user.annualIncome) : '',
    state: user?.state || '',
    category: user?.category || 'General',
    gender: user?.gender || 'Prefer not to say',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateUserProfile({
        name: formData.name,
        educationLevel: formData.educationLevel,
        academicPercentage: formData.academicPercentage ? Number(formData.academicPercentage) : undefined,
        annualIncome: formData.annualIncome ? Number(formData.annualIncome) : undefined,
        state: formData.state,
        category: formData.category,
        gender: formData.gender,
      });

      setSuccessMsg('Profile updated successfully! Used automatically for recommendations.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 max-w-3xl shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Student Profile & Academic Criteria</h3>
        <p className="text-xs text-slate-500 mt-1">
          Scholar-Track matches your saved profile against thousands of eligibility combinations to surface relevant scholarships automatically.
        </p>
      </div>

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Education Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Education Level</label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
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
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Annual Family Income */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Annual Family Household Income (₹)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                min="0"
                step="5000"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                placeholder="e.g. 350000"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* State / Region */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              State / Domicile
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Maharashtra, Karnataka, Delhi"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Social Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="General">General / Open</option>
              <option value="OBC">Other Backward Classes (OBC)</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="EWS">Economically Weaker Section (EWS)</option>
              <option value="Minority">Minority Community</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other / Non-Binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
};
