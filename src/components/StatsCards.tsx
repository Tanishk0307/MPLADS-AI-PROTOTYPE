import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, FolderKanban, ShieldAlert } from 'lucide-react';
import { formatLakhs, formatCount } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface StatsCardsProps {
  totalSanctioned: number;
  totalSpent: number;
  totalProjects: number;
  criticalCount: number;
}

export function StatsCards({ totalSanctioned, totalSpent, totalProjects, criticalCount }: StatsCardsProps) {
  const { t } = useLanguage();
  const utilization = totalSanctioned > 0 ? (totalSpent / totalSanctioned) * 100 : 0;
  const isOverrun = totalSpent > totalSanctioned;

  const stats: {
    label: string;
    value: string;
    sub: string;
    subColor: string;
    icon: ReactNode;
    iconBg: string;
    accent: string;
    delay: string;
  }[] = [
    {
      label: t.sanctionedFund,
      value: formatLakhs(totalSanctioned),
      sub: t.released100,
      subColor: 'text-emerald-600',
      icon: <TrendingUp className="h-5 w-5" />,
      iconBg: 'bg-slate-100 text-slate-600',
      accent: 'text-slate-900',
      delay: '0ms',
    },
    {
      label: t.actualExpenditure,
      value: formatLakhs(totalSpent),
      sub: isOverrun ? t.overrunDetected : `${utilization.toFixed(1)}% ${t.utilized}`,
      subColor: isOverrun ? 'text-red-500' : 'text-emerald-600',
      icon: <TrendingDown className="h-5 w-5" />,
      iconBg: 'bg-emerald-100 text-emerald-600',
      accent: isOverrun ? 'text-red-600' : 'text-emerald-600',
      delay: '80ms',
    },
    {
      label: t.sanctionedWorks,
      value: formatCount(totalProjects),
      sub: t.ghaziabadRegion,
      subColor: 'text-slate-500',
      icon: <FolderKanban className="h-5 w-5" />,
      iconBg: 'bg-blue-100 text-blue-600',
      accent: 'text-slate-900',
      delay: '160ms',
    },
    {
      label: t.aiCriticalRiskFlags,
      value: formatCount(criticalCount),
      sub: criticalCount > 0 ? t.immediateAuditReq : t.allClear,
      subColor: criticalCount > 0 ? 'text-red-600' : 'text-emerald-600',
      icon: <ShieldAlert className="h-5 w-5" />,
      iconBg: 'bg-red-100 text-red-600',
      accent: 'text-red-700',
      delay: '240ms',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
          style={{ animationDelay: s.delay, animationFillMode: 'backwards' }}
        >
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
          <div className="flex items-center justify-between mt-1">
            <p className={`text-xl font-black ${s.accent}`}>{s.value}</p>
            <div className={`rounded-lg p-2 ${s.iconBg}`}>{s.icon}</div>
          </div>
          <span className={`text-[10px] font-bold ${s.subColor}`}>{s.sub}</span>
        </div>
      ))}
    </div>
  );
}
