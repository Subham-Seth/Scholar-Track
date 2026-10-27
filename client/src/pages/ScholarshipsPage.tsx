import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  BookOpen,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';
import { scholarshipApi, savedScholarshipApi, applicationApi } from '../services/api.js';
import { Scholarship } from '../types/index.js';
import { ScholarshipCard } from '../components/scholarships/ScholarshipCard.js';
import { ScholarshipDetailModal } from '../components/scholarships/ScholarshipDetailModal.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { useAuth } from '../context/AuthContext.js';

export const ScholarshipsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [educationLevel, setEducationLevel] = useState<string>('All');
  const [category, setCategory] = useState<string>('All');
  const [state, setState] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Filter options from API
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [educationLevelsList, setEducationLevelsList] = useState<string[]>([]);
  const [statesList, setStatesList] = useState<string[]>([]);

  // Tracked & Saved sets
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  // Modal
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Feedback notification
  const [feedback, setFeedback] = useState<string>('');

  // Load filter metadata
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await scholarshipApi.getFilterMeta();
        setCategoriesList(res.filters.categories);
        setEducationLevelsList(res.filters.educationLevels);
        setStatesList(res.filters.states);
      } catch (e) {
        // Fallback default lists
        setCategoriesList(['Merit-based', 'Need-based', 'Women in STEM', 'Minority', 'Research & Science']);
        setEducationLevelsList(['High School (10th/12th)', 'Undergraduate', 'Postgraduate', 'Diploma']);
        setStatesList(['All India', 'Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu']);
      }
    };
    loadMeta();
  }, []);

  // Load user bookmarks & tracked applications if logged in
  useEffect(() => {
    if (isAuthenticated) {
      savedScholarshipApi.getAll().then((res) => {
        setSavedIds(new Set(res.data.map((item) => item.scholarshipId._id)));
      }).catch(() => {});

      applicationApi.getAll().then((res) => {
        setTrackedIds(new Set(res.data.map((item) => item.scholarshipId._id)));
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Load scholarships with filters
  const fetchScholarships = async () => {
    setIsLoading(true);
    try {
      const res = await scholarshipApi.getAll({
        search,
        educationLevel,
        category,
        state,
        sortBy,
        page,
        limit: 12,
      });

      setScholarships(res.data);
      setTotalCount(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      console.error('Error fetching scholarships:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [educationLevel, category, state, sortBy, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchScholarships();
  };

  const handleClearFilters = () => {
    setSearch('');
    setEducationLevel('All');
    setCategory('All');
    setState('All');
    setSortBy('newest');
    setPage(1);
  };

  const handleSaveToggle = async (scholarshipId: string) => {
    if (!isAuthenticated) {
      setFeedback('Please log in to save scholarships to your profile bookmarks.');
      setTimeout(() => setFeedback(''), 4000);
      return;
    }

    if (savedIds.has(scholarshipId)) {
      await savedScholarshipApi.remove(scholarshipId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(scholarshipId);
        return next;
      });
      setFeedback('Removed from saved bookmarks.');
    } else {
      await savedScholarshipApi.save(scholarshipId);
      setSavedIds((prev) => new Set(prev).add(scholarshipId));
      setFeedback('Saved to your bookmarks! View in Dashboard.');
    }
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleTrackApplication = async (s: Scholarship) => {
    if (!isAuthenticated) {
      setFeedback('Please log in to add scholarships to your application tracker.');
      setTimeout(() => setFeedback(''), 4000);
      return;
    }

    try {
      await applicationApi.create({
        scholarshipId: s._id,
        status: 'Interested',
      });
      setTrackedIds((prev) => new Set(prev).add(s._id));
      setFeedback(`Added "${s.title}" to your Application Tracker!`);
      setTimeout(() => setFeedback(''), 3500);
    } catch (err: any) {
      setFeedback(err.message || 'Already in application tracker.');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Scholarship Directory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Search and filter verified government and institutional scholarship schemes across India.
        </p>
      </div>

      {/* Floating feedback toast */}
      {feedback && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in duration-200">
          {feedback}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by scholarship name, provider, keyword (e.g. Pragati, Reliance, Minority)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Education Level */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Education Level
            </label>
            <select
              value={educationLevel}
              onChange={(e) => {
                setEducationLevel(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Education Levels</option>
              {educationLevelsList.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* State / Region */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              State / Domicile
            </label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Regions / Pan-India</option>
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest Added</option>
              <option value="amount_high">Award Amount (High to Low)</option>
              <option value="amount_low">Award Amount (Low to High)</option>
              <option value="percentage">Min Percentage Required</option>
              <option value="title">Scholarship Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <span>
            Found <strong className="text-slate-800">{totalCount}</strong> scholarships
          </span>
          {(search || educationLevel !== 'All' || category !== 'All' || state !== 'All') && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading matching scholarship records..." />
      ) : scholarships.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Scholarships Matched</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Education Levels", or clearing your filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((s) => (
              <ScholarshipCard
                key={s._id}
                scholarship={s}
                isSaved={savedIds.has(s._id)}
                isTracking={trackedIds.has(s._id)}
                onSaveToggle={handleSaveToggle}
                onTrack={handleTrackApplication}
                onSelect={(item) => {
                  setSelectedScholarship(item);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-slate-600 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <ScholarshipDetailModal
        scholarship={selectedScholarship}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isSaved={selectedScholarship ? savedIds.has(selectedScholarship._id) : false}
        isTracking={selectedScholarship ? trackedIds.has(selectedScholarship._id) : false}
        onSaveToggle={handleSaveToggle}
        onTrack={handleTrackApplication}
      />
    </div>
  );
};
