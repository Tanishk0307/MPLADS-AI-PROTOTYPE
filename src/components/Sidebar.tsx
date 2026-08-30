import {
  LayoutDashboard,
  ShieldAlert,
  HardHat,
  Camera,
  FileSpreadsheet,
  Lock,
  X,
} from 'lucide-react';
import type { UserRole } from '@/types/database';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarProps {
  active: string;
  onNavigate: (key: string) => void;
  onClose?: () => void;
  riskCount?: number;
  proofsCount?: number;
  agenciesCount?: number;
  userRole?: UserRole;
}

export function Sidebar({
  active,
  onNavigate,
  onClose,
  riskCount = 0,
  proofsCount = 0,
  agenciesCount = 0,
  userRole,
}: SidebarProps) {
  const { t } = useLanguage();
  const isExecutive = userRole === 'MP' || userRole === 'SNA' || userRole === 'Ministry' || userRole === 'DM' || userRole === 'CDO';

  const items = [
    {
      key: 'dashboard',
      label: t.navDashboard,
      icon: LayoutDashboard,
    },
    {
      key: 'risk',
      label: t.navRisk,
      icon: ShieldAlert,
      badge: riskCount > 0 ? `${riskCount} ${t.flaggedCountBadge}` : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      key: 'agencies',
      label: t.navAgencies,
      icon: HardHat,
      badge: agenciesCount > 0 ? `${agenciesCount} ${t.projectsCountLabel}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-black',
    },
    {
      key: 'proofs',
      label: t.navProofs,
      icon: Camera,
      badge: proofsCount > 0 ? `${proofsCount} ${t.citizenReportsCountLabel}` : undefined,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      key: 'reports',
      label: t.navReports,
      icon: FileSpreadsheet,
      badge: isExecutive ? 'CSV' : 'Official',
      badgeColor: isExecutive ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700 font-bold',
    },
  ];

  return (
    <aside className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.governanceCommand}</h3>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <nav className="space-y-1.5">
          {items.map((item) => {
            const isActive = active === item.key;
            const isRestricted = item.key === 'reports' && userRole === 'Guest';

            if (isRestricted) {
              return (
                <div
                  key={item.key}
                  title="Restricted for Citizen (Official Clearance Required)"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl opacity-35 bg-slate-100/70 text-slate-400 cursor-not-allowed select-none border border-dashed border-slate-300"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                </div>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-slate-800 text-slate-200 border border-slate-700' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs">
        <p className="text-xs font-bold text-amber-900">{t.citizenTransparencyView}</p>
        <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
          {t.citizenTransparencySub}
        </p>
        <button
          onClick={() => onNavigate('proofs')}
          className="mt-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 w-full py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Camera className="h-3.5 w-3.5" /> {t.uploadGroundProof}
        </button>
      </div>
    </aside>
  );
}
