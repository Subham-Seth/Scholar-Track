import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Target,
  Sparkles,
  Database,
  Layers,
  Code2,
  Lock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Educational Capstone Mini-Project</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          About Scholar-Track
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Scholar-Track is a modern scholarship discovery, eligibility assessment, and application tracking platform built from scratch to empower students across India to access higher education funding without barriers.
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">The Problem We Address</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every year, crores of rupees in government and philanthropic educational grants go unclaimed. Deserving students face multiple roadblocks: scattered official portals, confusing eligibility criteria, missed application windows, and lack of guidance on complex document verification processes.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">The Scholar-Track Solution</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Scholar-Track consolidates verified national, state, and corporate schemes into one centralized portal. Students can instantly check rule-based eligibility with clear explanations, manage application statuses across a 5-stage pipeline, and get 24/7 AI assistance via ScholarBot.
          </p>
        </div>
      </div>

      {/* Technology Stack & Architecture */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-6">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            Modern & Secure Technology Stack
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Engineered with a clean, decoupled TypeScript architecture replacing legacy, heavy frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Code2 className="w-4 h-4" />
              <span>Frontend Client</span>
            </div>
            <p className="text-slate-300">
              React 18, Vite, TypeScript, Tailwind CSS, React Router, Lucide Icons, and Recharts for interactive dashboard analytics.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>Backend REST API</span>
            </div>
            <p className="text-slate-300">
              Node.js, Express.js, TypeScript, Zod schema validation, Helmet security headers, and rate-limiting middleware.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Database className="w-4 h-4" />
              <span>Database Layer</span>
            </div>
            <p className="text-slate-300">
              MongoDB Atlas with Mongoose ODM, utilizing compound unique indexing, text search indexes, and safe upsert seeding.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>ScholarBot AI Assistant</span>
            </div>
            <p className="text-slate-300">
              Configurable backend AI provider (Google Gemini / OpenAI) with built-in zero-dependency Knowledge Engine fallback.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>Security & Privacy</span>
            </div>
            <p className="text-slate-300">
              Bcrypt password hashing (salt 10), JWT session authentication, zero credentials committed to Git, and strict CORS.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 text-teal-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Portals Only</span>
            </div>
            <p className="text-slate-300">
              Direct linking to authentic government and foundation portals; clear identification of unverified demonstration data.
            </p>
          </div>
        </div>
      </div>

      {/* College Project Disclaimer */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
        <h3 className="text-base font-bold text-slate-900">Academic Demonstration Notice</h3>
        <p>
          Scholar-Track was created as an educational demonstration project. It is intended to showcase full-stack software development principles, UI/UX design, database engineering, and practical AI integration.
        </p>
        <p className="text-slate-500 text-xs">
          Scholarship eligibility rules, amounts, and closing dates are sourced from published guidelines of bodies such as the Department of Higher Education (NSP), AICTE, Tata Trusts, and Reliance Foundation. Students should always cross-verify announcements with the official granting authority.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/scholarships"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-100 transition"
        >
          <span>Explore Scholarship Directory</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
