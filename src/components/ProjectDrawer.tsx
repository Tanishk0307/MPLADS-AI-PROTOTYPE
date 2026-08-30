import { useEffect } from 'react';
import {
  X,
  MapPin,
  Building2,
  Calendar,
  AlertTriangle,
  CircleDot,
  Clock,
  HardHat,
  IndianRupee,
  TrendingUp,
  Star,
  ShieldAlert,
  Camera,
  MailWarning,
  Lock,
  CheckCircle,
} from 'lucide-react';
import type { Project, AnomalyResult, ProjectStatus, CitizenProofReport, User } from '@/types/database';
import { formatLakhs, formatDate } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface ProjectDrawerProps {
  project: Project | null;
  anomaly: AnomalyResult | null;
  onClose: () => void;
  isCdoStarred?: boolean;
  onToggleCdoStar?: (projectId: string) => void;
  isCdoUser?: boolean;
  citizenProofs?: CitizenProofReport[];
  user?: User | null;
  isNoticed?: boolean;
  onSendNotice?: (projectId: string) => void;
  dmInspectedIds?: string[];
  onRecordDmInspection?: (projectId: string) => void;
}

export function ProjectDrawer({
  project,
  anomaly,
  onClose,
  isCdoStarred = false,
  onToggleCdoStar,
  citizenProofs = [],
  user,
  isNoticed = false,
  onSendNotice,
  dmInspectedIds = [],
  onRecordDmInspection,
}: ProjectDrawerProps) {
  const { t, isHindi } = useLanguage();

  const statusConfig: Record<ProjectStatus, { label: string; badge: string }> = {
    ongoing: { label: t.statusOngoing, badge: 'bg-blue-50 text-blue-700' },
    completed: { label: t.statusCompleted, badge: 'bg-emerald-50 text-emerald-700' },
    stalled: { label: t.statusStalled, badge: 'bg-amber-50 text-amber-700' },
    flagged: { label: t.statusFlagged, badge: 'bg-red-50 text-red-700' },
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!project) return null;

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
  const isInspected = dmInspectedIds.includes(project.id);
  const effectiveNoticed = isCdoStarred || isNoticed;

  const sc = statusConfig[project.status] ?? statusConfig.ongoing;
  const pct = project.sanctioned_amount_cr > 0 ? (project.spent_amount_cr / project.sanctioned_amount_cr) * 100 : 0;
  const timeVar =
    project.estimated_days && project.estimated_days > 0 && project.actual_days
      ? ((project.actual_days - project.estimated_days) / project.estimated_days) * 100
      : null;

  const projectCitizenProofs = citizenProofs.filter((p) => p.projectId === project.id);

  const fields = [
    { icon: MapPin, label: t.locationLabel, value: project.location ?? '—' },
    { icon: Building2, label: t.sectorLabel, value: project.sector?.name ?? '—' },
    { icon: HardHat, label: t.implementingAgencyLabel, value: project.implementing_agency ?? '—' },
    { icon: Clock, label: t.timelineLabel, value: project.estimated_days && project.actual_days ? `${project.estimated_days} → ${project.actual_days} days` : '—' },
    { icon: Calendar, label: t.createdLabel, value: formatDate(project.created_at) },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9998] animate-fade-in-up"
        style={{ animationDuration: '0.2s' }}
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-white shadow-2xl z-[99999] animate-slide-in overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between z-10">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{project.name}</h2>
              {isCdoStarred && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  <Star className="h-3 w-3 text-amber-500 fill-current" /> {isHindi ? 'सांसद द्वारा निरीक्षण' : 'Inspection from MP'}
                </span>
              )}
              {isInspected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle className="h-3 w-3 text-emerald-600" /> {isHindi ? 'DM निरीक्षण सत्यापित' : 'DM Inspected'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.badge}`}>
                <CircleDot className="h-2.5 w-2.5" />
                {sc.label}
              </span>
              <span className="text-xs text-slate-400">{project.constituency?.district}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Vigilance Star Action Authority Banner */}
          {canPutStar && onToggleCdoStar && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  {user?.role === 'MP'
                    ? 'Member of Parliament (MP) Priority Oversight'
                    : user?.role === 'SNA'
                    ? 'State Nodal Authority (SNA) Vigilance Directive'
                    : t.cdoExecutiveAuthority}
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  {isCdoStarred
                    ? t.cdoStarDescActive
                    : t.cdoStarDescInactive}
                </p>
              </div>
              <button
                onClick={() => onToggleCdoStar(project.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer whitespace-nowrap ${
                  isCdoStarred
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${isCdoStarred ? 'fill-current' : ''}`} />
                {isCdoStarred ? t.removeStarBtn : t.starActionByAuthority}
              </button>
            </div>
          )}

          {/* Statutory Orders (Notice Actions) */}
          <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                {t.statutoryExecutiveOrdersTitle}
              </h3>
              {!canSendNotice && (
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> {t.viewOnlyBadge}
                </span>
              )}
            </div>

            <div className="w-full">
              {/* Send Notice */}
              <button
                disabled={!canSendNotice || isCdoStarred}
                onClick={() => onSendNotice?.(project.id)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  !canSendNotice
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                    : effectiveNoticed
                    ? 'bg-amber-600 hover:bg-amber-700 text-white ring-1 ring-amber-400 cursor-pointer shadow-md'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-md'
                }`}
              >
                {effectiveNoticed ? (
                  <CheckCircle className="h-4 w-4 text-amber-200" />
                ) : (
                  <MailWarning className="h-4 w-4" />
                )}
                {effectiveNoticed ? t.noticeDispatched : t.dispatchShowCauseNotice}
              </button>
            </div>
          </div>

          {/* DM LOGIN EXCLUSIVE: Site Inspection Directive as per Higher Authority */}
          {isDmUser && (
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900">
                <ShieldAlert className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">{t.dmInspectionDirectiveTitle}</h4>
                  <p className="text-[11px] text-indigo-700 mt-0.5">{t.dmInspectionDirectiveDesc}</p>
                </div>
              </div>

              <button
                onClick={() => onRecordDmInspection?.(project.id)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                  isInspected
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {isInspected
                  ? (isHindi ? '✔️ स्थल निरीक्षण संपन्न (प्रमाणित)' : '✔️ Site Inspection Certified by DM')
                  : t.dmRecordInspectionBtn}
              </button>
            </div>
          )}

          {/* Budget Breakdown */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{t.budgetBreakdown}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" /> {t.sanctionedLabel}
                </p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{formatLakhs(project.sanctioned_amount_cr)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {t.spentLabel}
                </p>
                <p className={`text-xl font-bold mt-0.5 ${pct > 100 ? 'text-red-600' : 'text-brand-600'}`}>
                  {formatLakhs(project.spent_amount_cr)}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{t.utilizationLabel}</span>
                <span className="font-semibold">{pct.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-brand-600'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{t.projectDetailsTitle}</h3>
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <f.icon className="h-4 w-4 text-slate-400" />
                    {f.label}
                  </span>
                  <span className="text-sm font-medium text-slate-800 text-right">{f.value}</span>
                </div>
              ))}
              {project.latitude && project.longitude && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {t.coordinatesLabel}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Citizen Photo Proofs for this Project */}
          {projectCitizenProofs.length > 0 && (
            <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-emerald-600" />
                {t.citizenProofsForProject} ({projectCitizenProofs.length})
              </h3>
              <div className="space-y-3">
                {projectCitizenProofs.map((cp) => (
                  <div key={cp.id} className="bg-white p-3 rounded-lg border border-emerald-200/60 shadow-xs space-y-2">
                    <div className="relative h-32 rounded-lg overflow-hidden">
                      <img src={cp.imageUrl} alt="Ground Proof" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {t.progressLabel}: {cp.progressPercentage}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 italic">"{cp.remarks}"</p>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{t.submittedByLabel} {cp.citizenName}</span>
                      <span>{cp.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline analysis */}
          {timeVar !== null && (
            <div className={`rounded-xl p-4 border ${timeVar > 40 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{t.timelineAnalysisTitle}</h3>
              <p className={`text-sm font-medium ${timeVar > 40 ? 'text-amber-800' : 'text-emerald-800'}`}>
                {timeVar > 0
                  ? `${timeVar.toFixed(0)}% ${t.overEstimatedTimeline} (${project.actual_days! - (project.estimated_days ?? 0)} extra days)`
                  : `${Math.abs(timeVar).toFixed(0)}% ${t.underEstimatedTimeline}`}
              </p>
            </div>
          )}

          {/* AI anomaly for this project */}
          {anomaly && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                {t.aiRiskAssessmentTitle} — {t.scoreLabel}: {anomaly.riskScore}/100 ({anomaly.severity === 'CRITICAL' ? t.severityCritical : anomaly.severity})
              </h3>
              <div className="border border-red-200 rounded-lg p-3.5 bg-red-50/50">
                <div className="space-y-2">
                  {anomaly.reasons.map((reason, i) => (
                    <p key={i} className="text-xs text-red-700 font-medium flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {reason}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!anomaly && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-2">
              <CircleDot className="h-4 w-4" />
              {t.noAnomaliesDetectedMsg}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
