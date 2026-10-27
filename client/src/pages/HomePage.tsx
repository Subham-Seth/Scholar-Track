import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  CheckCircle,
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Users,
  Compass,
  FileCheck2,
  Zap,
} from 'lucide-react';
import { scholarshipApi } from '../services/api.js';
import { Scholarship } from '../types/index.js';
import { ScholarshipCard } from '../components/scholarships/ScholarshipCard.js';
import { ScholarshipDetailModal } from '../components/scholarships/ScholarshipDetailModal.js';
import { useAuth } from '../context/AuthContext.js';

export const HomePage: React.FC = () => {
  const [featuredScholarships, setFeaturedScholarships] = useState<Scholarship[]>([]);
  const [totalCount, setTotalCount] = useState<number>(10);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await scholarshipApi.getAll({ limit: 3, featured: 'true' });
        if (res.data && res.data.length > 0) {
          setFeaturedScholarships(res.data);
          setTotalCount(res.pagination.total);
        }
      } catch (err) {
        console.warn('Could not load featured scholarships from API directly:', err);
      }
    };
    loadFeatured();
  }, []);

  const handleSelectScholarship = (s: Scholarship) => {
    setSelectedScholarship(s);
    setModalOpen(true);
  };

  const handleDemoClick = async () => {
    try {
      await quickDemoLogin();
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-indigo-50/50 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-100/80 text-indigo-800 border border-indigo-200 shadow-sm animate-in fade-in duration-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Gen Scholarship Discovery & Tracking Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Find the Right Scholarship.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
                Shape Your Future.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Scholar-Track helps students discover relevant scholarships, understand eligibility
              requirements, and manage their scholarship journey in one place.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/scholarships"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/25 group"
              >
                <span>Explore Scholarships</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                to="/eligibility"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition shadow-sm"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Check Eligibility</span>
              </Link>

              <button
                onClick={handleDemoClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                title="Instant login with demo student account"
              >
                <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span>1-Click Student Demo</span>
              </button>
            </div>

            {/* Security Guarantee Badge */}
            <div className="pt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Free & Secure
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI-Powered Assistant
              </span>
              <span>•</span>
              <span>Verified Portals Only</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          REAL STATS SECTION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400">
                {totalCount > 0 ? totalCount : 10}+
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Verified Schemes
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">₹50+ Lakhs</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Potential Scholarship Aid
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-purple-400">100% Rule-Based</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Accurate Eligibility Match
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400">24/7</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                ScholarBot AI Guidance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED SCHOLARSHIPS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Handpicked Opportunities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Scholarships
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top national and institutional programs with verified eligibility standards.
            </p>
          </div>

          <Link
            to="/scholarships"
            className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            <span>View All Scholarships</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Scholarships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredScholarships.map((s) => (
            <ScholarshipCard
              key={s._id}
              scholarship={s}
              onSelect={handleSelectScholarship}
            />
          ))}
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS
          ========================================================================= */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How Scholar-Track Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Four streamlined steps from scholarship search to verified submission.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Explore the Directory</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by your education level, income limits, state domicile, and academic score with real verified portals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Instant Eligibility Check</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Input your credentials to see an objective criteria match breakdown without guessing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Consult ScholarBot</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask our AI assistant for document checklists, application email drafts, and statement advice.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Track to Completion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Organize all your deadlines from "Interested" to "Documents Pending" and "Completed" on your student dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CTA BANNER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Ready to find the scholarships you qualify for?
            </h3>
            <p className="text-indigo-100 text-sm">
              Create your free student profile today and let Scholar-Track match you with educational aid.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-indigo-700 bg-white hover:bg-slate-100 transition text-center shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              to="/scholarbot"
              className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-900/60 hover:bg-indigo-900/80 border border-indigo-400/30 transition text-center"
            >
              Chat with ScholarBot
            </Link>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <ScholarshipDetailModal
        scholarship={selectedScholarship}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
