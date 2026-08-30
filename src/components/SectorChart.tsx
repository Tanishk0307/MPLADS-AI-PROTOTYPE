import { useMemo } from 'react';
import type { Project, Sector } from '@/types/database';
import { formatLakhs } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface SectorChartProps {
  projects: Project[];
  sectors: Sector[];
}

export function SectorChart({ projects, sectors }: SectorChartProps) {
  const { t } = useLanguage();
  const data = useMemo(() => {
    const map = new Map<string, { sanctioned: number; spent: number }>();
    for (const p of projects) {
      if (!p.sector_id) continue;
      const cur = map.get(p.sector_id) ?? { sanctioned: 0, spent: 0 };
      cur.sanctioned += p.sanctioned_amount_cr;
      cur.spent += p.spent_amount_cr;
      map.set(p.sector_id, cur);
    }
    return sectors
      .map((s) => {
        const d = map.get(s.id) ?? { sanctioned: 0, spent: 0 };
        return {
          name: s.name,
          sanctioned: d.sanctioned,
          spent: d.spent,
          utilization: d.sanctioned > 0 ? (d.spent / d.sanctioned) * 100 : 0,
        };
      })
      .filter((d) => d.sanctioned > 0)
      .sort((a, b) => b.sanctioned - a.sanctioned);
  }, [projects, sectors]);

  const maxVal = Math.max(...data.map((d) => d.sanctioned), 1);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">{t.sectorDistributionTitle}</h3>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-slate-200" /> {t.sanctionedLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-brand-600" /> {t.spentLabel}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((d, i) => (
          <div key={d.name} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-600">{d.name}</span>
              <span className="text-xs text-slate-400">{d.utilization.toFixed(0)}% {t.utilizationLabel}</span>
            </div>
            <div className="space-y-1">
              <div className="relative h-5 bg-slate-100 rounded-md overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-slate-200 rounded-md transition-all duration-700"
                  style={{ width: `${(d.sanctioned / maxVal) * 100}%` }}
                />
              </div>
              <div className="relative h-5 bg-slate-100 rounded-md overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-md transition-all duration-700 ${
                    d.utilization > 100 ? 'bg-gradient-to-r from-red-500 to-red-700' : 'bg-gradient-to-r from-brand-500 to-brand-700'
                  }`}
                  style={{ width: `${(d.spent / maxVal) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-500">
              <span>{formatLakhs(d.sanctioned)}</span>
              <span className="font-semibold text-brand-600">{formatLakhs(d.spent)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
