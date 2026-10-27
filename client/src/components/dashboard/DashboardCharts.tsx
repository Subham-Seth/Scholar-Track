import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ApplicationItem } from '../../types/index.js';

interface DashboardChartsProps {
  applications: ApplicationItem[];
  statusCounts: Record<string, number>;
  totalPotentialValue: number;
  savedCount: number;
}

const STATUS_COLORS: Record<string, string> = {
  Interested: '#64748b', // Slate
  'Planning to Apply': '#f59e0b', // Amber
  Applied: '#6366f1', // Indigo
  'Documents Pending': '#f43f5e', // Rose
  Completed: '#10b981', // Emerald
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  applications,
  statusCounts,
  totalPotentialValue,
  savedCount,
}) => {
  // Pie chart data
  const pieData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status] || '#94a3b8',
    }));

  // Bar chart data for top tracked scholarships
  const barData = applications.slice(0, 5).map((app) => ({
    name:
      app.scholarshipId.title.length > 20
        ? app.scholarshipId.title.slice(0, 18) + '...'
        : app.scholarshipId.title,
    amount: app.scholarshipId.amountValue || 0,
    status: app.status,
  }));

  return (
    <div className="space-y-6">
      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tracked Applications
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{applications.length}</span>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Active Tracker
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Saved Bookmarks
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{savedCount}</span>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Shortlisted
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Potential Scholarship Value
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700">
              ₹{(totalPotentialValue / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Total Aid
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Completed / Awarded
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {statusCounts['Completed'] || 0}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Milestone
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      {applications.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown Donut Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Application Pipeline Distribution
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Real-time progress of your scholarship applications
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} applications`, name]}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Amount Breakdown Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Potential Aid by Tracked Program
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Financial award amounts of top tracked scholarships (in ₹)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => `₹${val >= 100000 ? val / 100000 + 'L' : val / 1000 + 'k'}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Award Value']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center">
          <p className="text-sm font-medium text-slate-600">No applications tracked yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Browse the scholarship directory and click "Track" on any scheme to generate your pipeline charts.
          </p>
        </div>
      )}
    </div>
  );
};
