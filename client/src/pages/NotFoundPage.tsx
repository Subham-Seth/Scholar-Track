import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-7xl font-black text-indigo-600">404</h1>
        <h2 className="text-2xl font-bold text-slate-900">Page Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The page you are looking for does not exist or may have been relocated.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/scholarships"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
          >
            <Compass className="w-4 h-4" />
            Scholarships
          </Link>
        </div>
      </div>
    </div>
  );
};
