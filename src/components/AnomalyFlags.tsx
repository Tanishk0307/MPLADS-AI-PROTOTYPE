import { AlertTriangle, MapPin, ChevronRight, ShieldAlert, MailWarning, Star, CheckCircle, Lock } from 'lucide-react';
import type { AnomalyResult, Severity, User } from '@/types/database';
import { formatLakhs } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface AnomalyFlagsProps {
  anomalies: AnomalyResult[];
  onSelectProject: (projectId: string) => void;
  cdoStarredIds?: string[];
  onToggleCdoStar?: (projectId: string) => void;
  isCdoUser?: boolean;
  user?: User | null;
  noticedProjectIds?: string[];
  onSendNotice?: (projectId: string) => void;
  dmInspectedIds?: string[];
  onRecordDmInspection?: (projectId: string) => void;
}

const severityStyles: Record<Severity, { border: string; bg: string; badge: string; text: string }> = {
  CRITICAL: { border: 'border-red-200', bg: 'bg-red-50/40', badge: 'bg-red-500 text-white', text: 'text-red-700' },
  MEDIUM: { border: 'border-amber-200', bg: 'bg-amber-50/40', badge: 'bg-amber-500 text-white', text: 'text-amber-700' },
  LOW: { border: 'border-slate-200', bg: 'bg-slate-50', badge: 'bg-slate-500 text-white', text: 'text-slate-600' },
};

export function AnomalyFlags({
  anomalies,
  onSelectProject,
  cdoStarredIds = [],
  onToggleCdoStar,
  user,
  noticedProjectIds = [],
  onSendNotice,
  dmInspectedIds = [],
  onRecordDmInspection,
}: AnomalyFlagsProps) {
  const { t, isHindi } = useLanguage();
  const criticalCount = anomalies.filter((a) => a.severity === 'CRITICAL').length;
  const mediumCount = anomalies.filter((a) => a.severity === 'MEDIUM').length;

  const canPutStar =
    user?.role === 'MP' ||
    user?.role === 'SNA' ||
    user?.role === 'Ministry' ||
    user?.role === 'DM' ||
    user?.role === 'CDO';

  const canSendNotice =
    user?.role === 'MP' ||
    user?.role === 'SNA' ||
    user?.role === 'Ministry' ||
    user?.role === 'DM' ||
    user?.role === 'CDO';

  const isDmUser = user?.role === 'DM';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-red-600">
            <ShieldAlert className="h-4 w-4" />
            {t.aiFlaggedAnomaliesTitle}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {canSendNotice
              ? t.executiveActiveNoticeNote
              : t.viewOnlyNoticeNote}
          </p>
        </div>
        <div className="flex gap-2 text-[10px] font-bold flex-wrap">
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            {criticalCount} {t.severityCritical}
          </span>
          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {mediumCount} {t.severityMedium}
          </span>
          {cdoStarredIds.length > 0 && (
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" /> {cdoStarredIds.length} {t.starredCountBadge}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3.5">
        {anomalies.map((a, i) => {
          const s = severityStyles[a.severity];
          const isStarred = cdoStarredIds.includes(a.projectId);
          const isNoticed = isStarred || noticedProjectIds.includes(a.projectId);

          return (
            <div
              key={a.projectId}
              className={`p-4 ${s.bg} border ${
                isStarred
                  ? 'border-amber-400 ring-2 ring-amber-400 shadow-md'
                  : s.border
              } rounded-xl animate-fade-in-up transition-all`}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {isStarred && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                        <Star className="h-3 w-3 fill-current" /> {t.cdoStarVigilance}
                      </span>
                    )}

                    {isNoticed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-900 text-amber-200 border border-amber-400 px-2 py-0.5 rounded-full">
                        <MailWarning className="h-3 w-3 text-amber-400" /> {t.statutoryNoticeActive}
                      </span>
                    )}

                    <span className="font-bold text-sm text-slate-900">{a.title}</span>
                    <span className={`${s.badge} font-bold text-[9px] px-2 py-0.5 rounded whitespace-nowrap`}>
                      {a.severity === 'CRITICAL' ? t.severityCritical : a.severity} ({a.riskScore}/100)
                    </span>
                  </div>

                  <p className={`text-xs ${s.text} font-medium mt-1 flex items-start gap-1`}>
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    {a.reasons[0]}
                  </p>
                  {a.reasons.length > 1 && (
                    <p className={`text-xs ${s.text} font-medium mt-0.5 flex items-start gap-1`}>
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      {a.reasons[1]}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" /> {a.location} · {a.implementingAgency}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">
                      {t.colSanctioned}: {formatLakhs(a.sanctioned)} → {t.colSpent}: {formatLakhs(a.spent)}
                    </span>
                  </div>
                </div>

                {/* Executive Control Buttons & DM Directives */}
                <div className="flex flex-wrap md:flex-col gap-2 flex-shrink-0 w-full md:w-auto">
                  {/* Star Action Button (MP, SNA, Ministry, DM, CDO) */}
                  {canPutStar && onToggleCdoStar && (
                    <button
                      onClick={() => onToggleCdoStar(a.projectId)}
                      title={
                        isStarred
                          ? t.removeStarBtn
                          : t.starActionByAuthority
                      }
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isStarred
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-1 ring-amber-600'
                          : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-300'
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${isStarred ? 'fill-current text-slate-950' : 'text-amber-500'}`} />
                      {isStarred ? t.starFlagged : (user?.role === 'MP' ? '⭐ MP Star' : user?.role === 'SNA' ? '⭐ SNA Directive' : t.putCdoStar)}
                    </button>
                  )}

                  {/* Send Statutory Notice Button (MP, SNA, Ministry, DM, CDO Authority) */}
                  <button
                    disabled={!canSendNotice || isStarred}
                    onClick={() => onSendNotice?.(a.projectId)}
                    title={
                      !canSendNotice
                        ? t.viewOnlyNoticeNote
                        : isStarred
                        ? t.cdoStarDescActive
                        : isNoticed
                        ? t.noticeIssued
                        : t.sendNotice
                    }
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                      !canSendNotice
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-75'
                        : isNoticed
                        ? 'bg-amber-700 hover:bg-amber-800 text-white ring-1 ring-amber-400 cursor-pointer'
                        : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                    }`}
                  >
                    {!canSendNotice ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : isNoticed ? (
                      <CheckCircle className="h-3.5 w-3.5 text-amber-200" />
                    ) : (
                      <MailWarning className="h-3.5 w-3.5" />
                    )}
                    {isNoticed ? t.noticeIssued : t.sendNotice}
                  </button>

                  {/* SPECIAL FOR DM LOGIN: Higher Authority Site Inspection Order & Action */}
                  {isDmUser && onRecordDmInspection && (
                    <button
                      onClick={() => onRecordDmInspection(a.projectId)}
                      title={t.dmInspectionDirectiveDesc}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        dmInspectedIds.includes(a.projectId)
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse'
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {dmInspectedIds.includes(a.projectId)
                        ? (isHindi ? '✔️ DM निरीक्षण संपन्न' : '✔️ DM Inspected')
                        : (isHindi ? '📋 DM स्थल निरीक्षण करें' : '📋 DM Inspect Site')}
                    </button>
                  )}

                  <button
                    onClick={() => onSelectProject(a.projectId)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    {t.detailsBtn} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* DM Inspection Directive Banner visible inside card if DM or Inspected */}
              {isDmUser && !dmInspectedIds.includes(a.projectId) && (
                <div className="mt-3 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{t.dmInspectionDirectiveTitle}:</span>{' '}
                    <span>{t.dmInspectionDirectiveDesc}</span>
                  </div>
                </div>
              )}

              {dmInspectedIds.includes(a.projectId) && (
                <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{t.dmInspectedNotice}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {anomalies.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-400">
          {t.noAnomaliesDetectedMsg}
        </div>
      )}
    </div>
  );
}
