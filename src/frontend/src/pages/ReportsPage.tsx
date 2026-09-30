import React, { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../services/api';
import { Card, Table, Tr, Td, Pagination, Button, ErrorState, Select } from '../components/ui';
import { BarChart3, TrendingUp, Users, Calendar, ArrowUpRight, DollarSign, Bus } from 'lucide-react';

interface ReportsPageProps {
  onNotify: (msg: string, type?: any) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNotify }) => {
  const [period, setPeriod] = useState('monthly');
  const [revenueData, setRevenueData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [revRes, statsRes] = await Promise.all([
        dashboardAPI.revenueReport({ period }),
        dashboardAPI.stats(),
      ]);
      setRevenueData(revRes.data.data || revRes.data);
      setStats(statsRes.data.data || statsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reports & Analytics</h2>
          <p className="text-slate-400 text-sm">Financial revenue, ridership, and operational metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'daily', label: 'Last 7 Days (Daily)' },
              { value: 'weekly', label: 'Last 4 Weeks (Weekly)' },
              { value: 'monthly', label: 'Last 6 Months (Monthly)' },
            ]}
          />
          <Button variant="secondary" onClick={fetchReports}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchReports} />
      ) : (
        <>
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                ₹{Number(stats?.total_revenue || stats?.revenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs last period
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed Trips</span>
                <Bus className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {stats?.trips_count || stats?.completed_trips || '0'}
              </div>
              <div className="text-xs text-slate-400 mt-1">Operational routes active</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {stats?.bookings_count || stats?.total_bookings || '0'}
              </div>
              <div className="text-xs text-indigo-400 mt-1">Tickets & Shuttle Passes</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered Passengers</span>
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {stats?.passengers_count || stats?.total_passengers || '0'}
              </div>
              <div className="text-xs text-slate-400 mt-1">Active customer accounts</div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <Card title="Revenue Breakdown & Trend">
            {Array.isArray(revenueData) && revenueData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64 flex items-end gap-3 pt-6 pb-2 px-4 border-b border-slate-700/50">
                  {revenueData.map((item: any, idx: number) => {
                    const rev = Number(item.revenue || item.total_amount || 0);
                    const maxRev = Math.max(...revenueData.map((d: any) => Number(d.revenue || d.total_amount || 1)));
                    const heightPct = Math.max(12, Math.round((rev / (maxRev || 1)) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{rev}
                        </div>
                        <div
                          className="w-full bg-gradient-to-t from-cyan-600 to-indigo-500 rounded-t-sm transition-all duration-300 group-hover:brightness-125"
                          style={{ height: `${heightPct}%` }}
                        />
                        <div className="text-xs text-slate-400 truncate w-full text-center">
                          {item.period || item.label || item.date || `P${idx+1}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                No revenue trend data available for the chosen timeframe.
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
