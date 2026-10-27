import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Scholar<span className="text-indigo-400">-Track</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Modern scholarship discovery and student assistance platform designed to connect aspiring students with life-changing educational opportunities.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent & Secure Platform</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/scholarships" className="hover:text-white transition">
                  Browse Scholarships
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-white transition">
                  Eligibility Checker
                </Link>
              </li>
              <li>
                <Link to="/scholarbot" className="hover:text-white transition flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  ScholarBot Assistant
                </Link>
              </li>
              <li>
                <Link to="/guidance" className="hover:text-white transition">
                  AI Application Guidance
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Verified Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  National Scholarship Portal (NSP)
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.aicte-india.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  AICTE Pragati Portal
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://online-inspire.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  DST INSPIRE Portal
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.tatatrusts.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  Tata Trusts Philanthropy
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* College Project Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Project Information
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Scholar-Track was developed as an educational capstone mini-project. It showcases a modern MERN-stack architecture with AI augmentation.
            </p>
            <p className="text-[11px] text-slate-500 leading-normal">
              Disclaimer: Preliminary eligibility calculations are based on general criteria. Students must verify official closing dates and terms with scheme providers.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Scholar-Track. Built for college project demonstration.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>using React, Vite, Node.js & MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
