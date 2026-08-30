import { useMemo, useState } from 'react';
import { Search, ChevronRight, CircleDot, Star } from 'lucide-react';
import type { Project, ProjectStatus, UserRole } from '@/types/database';
import { formatLakhs } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface ProjectTableProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  cdoStarredIds?: string[];
  onToggleCdoStar?: (projectId: string) => void;
  isCdoUser?: boolean;
  userRole?: UserRole;
  dmInspectedIds?: string[];
}

type Filter = 'all' | 'starred' | ProjectStatus;

export function ProjectTable({
  projects,
  onSelectProject,
  cdoStarredIds = [],
  onToggleCdoStar,
  userRole,
  dmInspectedIds = [],
}: ProjectTableProps) {
  const { t, isHindi } = useLanguage();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const canPutStar =
    userRole === 'MP' ||
    userRole === 'SNA' ||
    userRole === 'Ministry' ||
    userRole === 'DM' ||
    userRole === 'CDO';

  const isCdoUser = userRole === 'CDO';

  const statusConfig: Record<ProjectStatus, { label: string; badge: string }> = {
    ongoing: { label: t.statusOngoing, badge: 'bg-blue-50 text-blue-700' },
    completed: { label: t.statusCompleted, badge: 'bg-emerald-50 text-emerald-700' },
    stalled: { label: t.statusStalled, badge: 'bg-amber-50 text-amber-700' },
    flagged: { label: t.statusFlagged, badge: 'bg-red-50 text-red-700' },
  };

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const isStarred = cdoStarredIds.includes(p.id);
      if (filter === 'starred' && !isStarred) return false;
      if (filter !== 'all' && filter !== 'starred' && p.status !== filter) return false;

      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.sector?.name.toLowerCase().includes(q) ||
        p.implementing_agency?.toLowerCase().includes(q)
      );
    });
  }, [projects, search, filter, cdoStarredIds]);

  const filterButtons: { key: Filter; label: string; count?: number }[] = [
    { key: 'all', label: t.filterAll },
    { key: 'starred', label: `${t.filterCdoStarred} (${cdoStarredIds.length})` },
    { key: 'flagged', label: t.filterFlagged },
    { key: 'ongoing', label: t.filterOngoing },
    { key: 'completed', label: t.filterCompleted },
    { key: 'stalled', label: t.filterStalled },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            {t.projectsMonitoringTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isCdoUser
              ? t.projectsMonitoringCdoSub
              : t.projectsMonitoringGenSub}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-slate-100 overflow-x-auto">
        {filterButtons.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              filter === f.key
                ? f.key === 'starred'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="w-10 px-3 py-3 text-center">{t.colStar}</th>
              <th className="px-5 py-3 font-semibold">{t.colProject}</th>
              <th className="px-3 py-3 font-semibold hidden sm:table-cell">{t.colSector}</th>
              <th className="px-3 py-3 font-semibold text-right">{t.colSanctioned}</th>
              <th className="px-3 py-3 font-semibold text-right">{t.colSpent}</th>
              <th className="px-3 py-3 font-semibold">{t.colStatus}</th>
              <th className="px-2 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((p) => {
              const sc = statusConfig[p.status];
              const pct = p.sanctioned_amount_cr > 0 ? (p.spent_amount_cr / p.sanctioned_amount_cr) * 100 : 0;
              const isStarred = cdoStarredIds.includes(p.id);
              const isDmInspected = dmInspectedIds.includes(p.id);

              return (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-3 text-center" onClick={(e) => {
                    if (canPutStar && onToggleCdoStar) {
                      e.stopPropagation();
                      onToggleCdoStar(p.id);
                    }
                  }}>
                    <button
                      type="button"
                      disabled={!canPutStar}
                      title={
                        canPutStar
                          ? isStarred
                            ? t.removeStarBtn
                            : t.starActionByAuthority
                          : isStarred
                          ? t.cdoStarVigilance
                          : 'Authority Only'
                      }
                      className={`p-1 rounded-lg transition-transform ${
                        canPutStar ? 'hover:scale-125 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          isStarred
                            ? 'text-amber-500 fill-current drop-shadow-sm'
                            : canPutStar
                            ? 'text-slate-300 hover:text-amber-400'
                            : 'text-slate-200 opacity-40'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-medium text-slate-800">{p.name}</p>
                      {isStarred && (
                        <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200 border border-amber-400 px-1.5 py-0.2 rounded shadow-2xs">
                          ⭐ {isHindi ? 'सांसद द्वारा निरीक्षण' : 'Inspection from MP'}
                        </span>
                      )}
                      {isDmInspected && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                          {isHindi ? '✔️ DM निरीक्षण' : '✔️ DM Inspected'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{p.location}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-600 text-xs hidden sm:table-cell">{p.sector?.name}</td>
                  <td className="px-3 py-3 text-right font-medium text-slate-700">{formatLakhs(p.sanctioned_amount_cr)}</td>
                  <td className="px-3 py-3 text-right">
                    <span className={`font-medium ${pct > 100 ? 'text-red-600' : 'text-brand-600'}`}>
                      {formatLakhs(p.spent_amount_cr)}
                    </span>
                    <span className="block text-[10px] text-slate-400">{pct.toFixed(0)}%</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.badge}`}>
                      <CircleDot className="h-2.5 w-2.5" />
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-400">{t.noProjectsMatch}</div>
        )}
      </div>
    </div>
  );
}
