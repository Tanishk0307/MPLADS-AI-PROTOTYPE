import { useState } from 'react';
import {
  Activity,
  RefreshCw,
  LogOut,
  Menu,
  ShieldCheck,
  Camera,
  LayoutDashboard,
  HardHat,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import type { User, UserRole } from '@/types/database';
import { useLanguage, LanguageSwitcher } from '@/context/LanguageContext';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onToggleSidebar: () => void;
  highRiskCount: number;
  onRefresh: () => void;
  activeNav?: string;
  onNavigate?: (key: string) => void;
  onOpenAiModal?: () => void;
}

export function Header({
  user,
  onLogout,
  onToggleSidebar,
  highRiskCount,
  onRefresh,
  activeNav = 'dashboard',
  onNavigate,
  onOpenAiModal,
}: HeaderProps) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const roleLabels: Record<UserRole, string> = {
    MP: t.roleMp,
    SNA: t.roleSna,
    DM: t.roleDm,
    Ministry: t.roleMinistry,
    Agency: t.roleAgency,
    CDO: t.roleCdo,
    Engineer: t.roleEngineer,
    Admin: t.roleAdmin,
    Guest: t.roleGuest,
  };

  return (
    <header className="bg-white border-b-4 border-amber-500 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex justify-between items-center gap-2">
        {/* Brand & Title */}
        <div
          onClick={() => onNavigate?.('dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSidebar();
            }}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 flex items-center justify-center border-2 border-emerald-500 flex-shrink-0">
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              {t.appTitle}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
              {t.districtCommandCenter}{' '}
              <span className="text-emerald-700 font-bold">{t.ghaziabadUp}</span>
            </p>
          </div>
        </div>

        {/* Top Page Switcher Pills (Responsive for tablet and desktop) */}
        {onNavigate && (
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNav === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden lg:inline">{t.navDashboard}</span>
            </button>

            <button
              onClick={() => onNavigate('risk')}
              className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNav === 'risk'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-red-700'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-red-500" />
              <span className="hidden lg:inline">{t.navRisk}</span>
            </button>

            <button
              onClick={() => onNavigate('agencies')}
              className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNav === 'agencies'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <HardHat className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden lg:inline">{t.navAgencies}</span>
            </button>

            <button
              onClick={() => onNavigate('proofs')}
              className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNav === 'proofs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <Camera className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden lg:inline">{t.navProofs}</span>
            </button>

            {/* Reports & Audits Tab - Semi-transparent and strictly non-clickable for Citizens */}
            {user?.role === 'Guest' ? (
              <div
                title={t.viewOnlyBadge + ' (Official Clearance Required)'}
                className="px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 opacity-35 bg-slate-200/60 text-slate-400 cursor-not-allowed select-none border border-dashed border-slate-300"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden lg:inline">{t.navReports}</span>
                <Lock className="h-3 w-3 text-slate-400" />
              </div>
            ) : (
              <button
                onClick={() => onNavigate('reports')}
                className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeNav === 'reports'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-cyan-700'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-500" />
                <span className="hidden lg:inline">{t.navReports}</span>
              </button>
            )}
          </div>
        )}

        {/* User Role, AI Bot, Language Switcher & Refresh Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Search Assistant Header Button */}
          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title={t.aiAssistantTitle}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI</span>
            </button>
          )}

          {/* Language Switcher Button with Dropdown (English / हिंदी) */}
          <LanguageSwitcher variant="header" />

          {highRiskCount > 0 && (
            <button
              onClick={() => onNavigate?.('risk')}
              className="hidden sm:flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer"
              title="Click to view AI High Risk Center"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {highRiskCount} {t.criticalCountBadge}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs px-2.5 sm:px-3 py-1.5 rounded-full font-semibold border hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="hidden sm:inline">{user?.role ? roleLabels[user.role] : 'Guest'}</span>
              <span className="sm:hidden">{user?.role || 'Guest'}</span>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                  <div className="p-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-800">{user?.email || 'citizen@ghaziabad.gov.in'}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{user?.role ? roleLabels[user.role] : ''}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> {t.switchRoleLogout}
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onRefresh}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            title={t.refreshData}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
