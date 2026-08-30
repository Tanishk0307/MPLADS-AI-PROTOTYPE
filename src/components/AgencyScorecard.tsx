import { useEffect, useState, useMemo } from 'react';
import {
  Building2,
  AlertTriangle,
  Award,
  RefreshCw,
  Search,
  Clock,
  TrendingUp,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { api, type AgencyScorecardItem } from '@/lib/api';
import { formatLakhs } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

import type { Project, User } from '@/types/database';

interface AgencyScorecardProps {
  scorecard?: AgencyScorecardItem[];
  projects?: Project[];
  onSelectProject?: (projectId: string) => void;
  user?: User | null;
}

export function AgencyScorecard({ scorecard, projects: _projects, onSelectProject, user: _user }: AgencyScorecardProps) {
  const { t, isHindi } = useLanguage();
  const [scorecards, setScorecards] = useState<AgencyScorecardItem[]>(scorecard ?? []);
  const [loading, setLoading] = useState(!scorecard || scorecard.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'CRITICAL' | 'MEDIUM' | 'LOW'>('ALL');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAgencyScorecard();
      setScorecards(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load contractor scorecard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scorecard && scorecard.length > 0) {
      setScorecards(scorecard);
      setLoading(false);
    } else {
      load();
    }
  }, [scorecard]);

  const filtered = useMemo(() => {
    return scorecards.filter((item) => {
      if (filterRisk !== 'ALL' && item.risk_level !== filterRisk) return false;
      if (!search.trim()) return true;
      return item.agency_name.toLowerCase().includes(search.toLowerCase().trim());
    });
  }, [scorecards, search, filterRisk]);

  const summary = useMemo(() => {
    const totalAgencies = scorecards.length;
    const criticalAgencies = scorecards.filter((a) => a.risk_level === 'CRITICAL').length;
    const totalProjects = scorecards.reduce((sum, a) => sum + a.total_projects, 0);
    const avgDelay = scorecards.length
      ? Math.round(scorecards.reduce((sum, a) => sum + a.avg_delay_days, 0) / scorecards.length)
      : 0;
    return { totalAgencies, criticalAgencies, totalProjects, avgDelay };
  }, [scorecards]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm animate-pulse">
        <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">{t.loadingScores}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-red-200 shadow-sm">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">Failed to load scorecard</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={load}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
        >
          {t.refreshData}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Award className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                {t.agencyScorecardTitle}
                <span className="text-xs bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold">
                  {scorecards.length} {t.navAgencies}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.agencyScorecardSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-red-400">{t.severityCritical}</p>
            <p className="text-xl font-black text-red-200">{summary.criticalAgencies}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-amber-400">{t.avgDelayDays}</p>
            <p className="text-xl font-black text-amber-200">{summary.avgDelay}d</p>
          </div>
          <button
            onClick={load}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={t.refreshData}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search & Risk Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.agencySearchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {(
            [
              { key: 'ALL', label: t.agencyTabAll, count: scorecards.length },
              {
                key: 'CRITICAL',
                label: t.agencyTabCritical,
                count: scorecards.filter((s) => s.risk_level === 'CRITICAL').length,
                color: 'text-red-700 bg-red-50 border-red-200',
              },
              {
                key: 'MEDIUM',
                label: t.agencyTabMedium,
                count: scorecards.filter((s) => s.risk_level === 'MEDIUM').length,
                color: 'text-amber-700 bg-amber-50 border-amber-200',
              },
              {
                key: 'LOW',
                label: t.agencyTabLow,
                count: scorecards.filter((s) => s.risk_level === 'LOW').length,
                color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
              },
            ] as const
          ).map((tab) => {
            const isActive = filterRisk === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterRisk(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/60 text-slate-700 font-mono">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agency Scorecards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isCrit = item.risk_level === 'CRITICAL';
          const isMed = item.risk_level === 'MEDIUM';

          const gradeLabel = isCrit
            ? t.gradeCriticalRisk
            : isMed
            ? t.gradeModerateWatch
            : item.performance_grade.includes('A')
            ? t.gradeExemplary
            : t.gradeSatisfactory;

          return (
            <div
              key={item.agency_name}
              className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                isCrit
                  ? 'border-red-300 ring-1 ring-red-100'
                  : isMed
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isCrit
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : isMed
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{item.agency_name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.total_projects} {t.agencyProjectsMonitored} · {item.citizen_proofs_count} {t.agencyPhotoAudits}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border whitespace-nowrap ${
                    isCrit
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : isMed
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {gradeLabel}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center my-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t.agencySanctioned}</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{formatLakhs(item.total_sanctioned_cr)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t.agencySpent}</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{formatLakhs(item.total_spent_cr)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t.agencyUtilization}</p>
                  <p className="text-xs font-bold text-indigo-700 mt-0.5">{item.utilization_percent}%</p>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> {t.agencyAvgExecutionDelay}
                  </span>
                  <span className={`font-bold ${item.avg_delay_days > 60 ? 'text-red-600' : 'text-slate-800'}`}>
                    {item.avg_delay_days > 0 ? `+${item.avg_delay_days} ${t.agencyDaysOverdue}` : t.agencyOnSchedule}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-slate-400" /> {t.agencyAvgCostOverrun}
                  </span>
                  <span className={`font-bold ${item.avg_cost_overrun_pct > 20 ? 'text-red-600' : 'text-slate-800'}`}>
                    {item.avg_cost_overrun_pct > 0 ? `+${item.avg_cost_overrun_pct}% ${t.agencyOverBudget}` : t.agencyWithinBudget}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-slate-400" /> {t.agencyVigilanceFlags}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.flagged_count > 0 && (
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.2 rounded-full border border-red-200">
                        {item.flagged_count} {t.agencyFlagged}
                      </span>
                    )}
                    {item.stalled_count > 0 && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.2 rounded-full border border-amber-200">
                        {item.stalled_count} {t.agencyStalled}
                      </span>
                    )}
                    {item.completed_count > 0 && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.2 rounded-full border border-emerald-200">
                        {item.completed_count} {t.agencyCompleted}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Projects Monitored by this Agency */}
              {(() => {
                const agencyProjects = (_projects || []).filter(
                  (p) => (p.implementing_agency || 'Unassigned Contractor') === item.agency_name
                );

                if (agencyProjects.length === 0) return null;

                return (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="uppercase tracking-wider">
                        {t.agencyAssignedWorks} ({agencyProjects.length}):
                      </span>
                      <span className="text-[10px] font-normal text-slate-400">{t.agencyClickToOpenDossier}</span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {agencyProjects.map((p) => {
                        const isFlagged = p.status === 'flagged';
                        const isStalled = p.status === 'stalled';
                        const isComp = p.status === 'completed';

                        const statusLabel = isFlagged
                          ? t.statusFlagged
                          : isStalled
                          ? t.statusStalled
                          : isComp
                          ? t.statusCompleted
                          : t.statusOngoing;

                        return (
                          <div
                            key={p.id}
                            onClick={() => onSelectProject?.(p.id)}
                            className="p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200/80 transition-all flex items-center justify-between gap-2 cursor-pointer group/proj shadow-2xs hover:border-emerald-300"
                            title={`${t.agencyClickToOpenDossier} - ${p.name}`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs text-slate-900 group-hover/proj:text-emerald-700 truncate flex items-center gap-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    isFlagged
                                      ? 'bg-red-500 animate-pulse'
                                      : isStalled
                                      ? 'bg-amber-500'
                                      : isComp
                                      ? 'bg-emerald-500'
                                      : 'bg-blue-500'
                                  }`}
                                />
                                <span className="truncate">{p.name}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
                                <span className="truncate">{p.location || 'Ghaziabad, UP'}</span>
                              </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span
                                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                                  isFlagged
                                    ? 'bg-red-100 text-red-800 border-red-300'
                                    : isStalled
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : isComp
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-blue-100 text-blue-800 border-blue-300'
                                }`}
                              >
                                {statusLabel}
                              </span>
                              <p className="text-[10px] font-mono text-slate-600 font-semibold mt-0.5">
                                {formatLakhs(p.spent_amount_cr)} / {formatLakhs(p.sanctioned_amount_cr)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
          {t.agencyNoMatches}
        </div>
      )}
    </div>
  );
}
