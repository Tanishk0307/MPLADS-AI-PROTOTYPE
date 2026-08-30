import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  ShieldAlert,
  Printer,
  Copy,
  Check,
  FileText,
  ChevronRight,
  RefreshCw,
  Award,
  Lock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ExecutiveSummaryData, Project, User } from '@/types/database';
import { formatLakhs } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface ReportsCenterProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  user: User | null;
  onSwitchRole?: (role: User['role']) => void;
}

export function ReportsCenter({ projects, onSelectProject, user, onSwitchRole }: ReportsCenterProps) {
  const { t, isHindi } = useLanguage();
  const [summary, setSummary] = useState<ExecutiveSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedMemoProjectId, setSelectedMemoProjectId] = useState<string>(projects[0]?.id ?? '');

  const isExecutiveAuthorized =
    user?.role === 'MP' ||
    user?.role === 'SNA' ||
    user?.role === 'Ministry' ||
    user?.role === 'DM' ||
    user?.role === 'CDO';

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await api.getExecutiveSummary();
      setSummary(data);
    } catch (e) {
      console.warn('Failed to load executive summary from backend, calculating locally:', e);
      // Local fallback
      const totalSanctioned = projects.reduce((s, p) => s + p.sanctioned_amount_cr, 0);
      const totalSpent = projects.reduce((s, p) => s + p.spent_amount_cr, 0);
      setSummary({
        district: 'Ghaziabad',
        state: 'Uttar Pradesh',
        total_projects: projects.length,
        total_sanctioned_cr: totalSanctioned,
        total_spent_cr: totalSpent,
        utilization_percent: totalSanctioned ? (totalSpent / totalSanctioned) * 100 : 0,
        critical_risk_count: projects.filter((p) => p.status === 'flagged').length,
        flagged_projects_count: projects.filter((p) => p.status === 'flagged').length,
        top_risk_projects: projects
          .filter((p) => p.status === 'flagged')
          .slice(0, 5)
          .map((p) => ({
            project_id: p.id,
            name: p.name,
            agency: p.implementing_agency,
            severity: 'CRITICAL',
            risk_score: 92,
            reasons: ['Expenditure exceeds benchmark outlay', 'Ground progress lagging behind fund claims'],
          })),
        generated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [projects]);

  const selectedMemoProject = projects.find((p) => p.id === selectedMemoProjectId) || projects[0];

  const memoText = `OFFICE OF THE DISTRICT MAGISTRATE & NODAL OFFICER (MPLADS)
DISTRICT COLLECTORATE, GHAZIABAD, UTTAR PRADESH
--------------------------------------------------------------------------------
MEMORANDUM / STATUTORY SHOW-CAUSE NOTICE
Ref No: GZB/MPLADS/VIGILANCE/${new Date().getFullYear()}/${selectedMemoProject?.id.slice(0, 6).toUpperCase()}
Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

TO:
The Executive Head / Authorized Representative,
${selectedMemoProject?.implementing_agency || 'Implementing Agency / Contractor'}
Ghaziabad, Uttar Pradesh

SUBJECT: STATUTORY SHOW-CAUSE NOTICE & EXPLANATION FOR IRREGULARITIES DETECTED UNDER MPLADS AI SURVEILLANCE

1. Project Title: ${selectedMemoProject?.name}
2. Location: ${selectedMemoProject?.location || 'Ghaziabad, UP'}
3. Sanctioned Outlay: ₹${selectedMemoProject?.sanctioned_amount_cr.toFixed(2)} Lakhs / Cr
4. Recorded Expenditure: ₹${selectedMemoProject?.spent_amount_cr.toFixed(2)} Lakhs / Cr
5. Timeline Schedule: ${selectedMemoProject?.estimated_days || 180} Days (Recorded: ${selectedMemoProject?.actual_days || 240} Days)

FINDINGS:
AI Vigilance algorithms & Jan Sunwai ground photo audits have detected severe discrepancies between reported financial drawdowns and physical on-site progress. 

DIRECTIVE:
In accordance with Rule 4.2 of the MPLADS Operational Guidelines, you are hereby ordered to show cause within 7 (seven) days of receipt of this notice explaining why penal recovery and contractor blacklisting proceedings should not be initiated.

By Order,
Chief Development Officer (CDO) & District Magistrate (DM)
Ghaziabad, Uttar Pradesh`;

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Restrict Citizens (Guest) from viewing confidential vigilance audit reports
  if (user?.role === 'Guest') {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-xl mx-auto my-12 space-y-4 animate-fade-in-up">
        <div className="w-16 h-16 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="h-8 w-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          {isHindi ? '🔒 गोपनीय प्रशासनिक रिपोर्ट एवं ऑडिट - सीमित पहुंच' : '🔒 Confidential Vigilance Reports & Audits - Restricted Access'}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {isHindi
            ? 'सांविधिक सतर्कता नोटिस, ऑडिट मेमो एवं प्रशासनिक रिपोर्ट केवल अधिकृत प्रशासनिक अधिकारियों (सांसद, राज्य नोडल प्राधिकरण, MoSPI, जिलाधिकारी, एवं कार्यदायी संस्था) के लिए आरक्षित हैं। नागरिक जन सुनवाई साक्ष्य अनुभाग एवं सार्वजनिक डैशबोर्ड देख सकते हैं।'
            : 'Statutory vigilance notices, executive audit memos, and disciplinary reports are confidential and restricted to authorized administrative officials (MP, SNA, MoSPI, DM, CDO). Citizens can view public dashboards and submit Jan Sunwai ground photo proofs.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                {t.reportsTitle}
                <span className="text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold">
                  DM / CDO Clearance
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.reportsSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Download CSV Action */}
        <div className="flex items-center gap-2.5">
          <a
            href={api.getExportCsvUrl()}
            download
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" /> {t.exportCsvBtn}
          </a>
          <button
            onClick={loadSummary}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title={t.refreshData}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* District Key Metrics Overview */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.monitoredJurisdiction}</p>
            <p className="text-lg font-black text-slate-900 mt-1">
              {isHindi ? 'गाजियाबाद, उत्तर प्रदेश' : `${summary.district}, ${summary.state}`}
            </p>
            <span className="text-[10px] font-bold text-emerald-600">
              {summary.total_projects} {isHindi ? 'परियोजनाएं नामांकित' : 'Projects Enrolled'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.sanctionedOutlay}</p>
            <p className="text-lg font-black text-slate-900 mt-1">{formatLakhs(summary.total_sanctioned_cr)}</p>
            <span className="text-[10px] font-bold text-slate-500">
              {isHindi ? '100% जिला कोषागार आवंटित' : '100% District Treasury Allocated'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.fundUtilization}</p>
            <p className="text-lg font-black text-slate-900 mt-1">
              {summary.utilization_percent.toFixed(1)}% ({formatLakhs(summary.total_spent_cr)})
            </p>
            <span className={`text-[10px] font-bold ${summary.utilization_percent > 100 ? 'text-red-600' : 'text-emerald-600'}`}>
              {summary.utilization_percent > 100
                ? (isHindi ? 'बजट से अधिक अतिरिक्त व्यय दर्ज' : 'Budget Overrun Detected')
                : (isHindi ? 'स्वीकृत परिव्यय के भीतर' : 'Within Allocated Outlay')}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.criticalRiskProjects}</p>
            <p className="text-lg font-black text-red-600 mt-1">{summary.critical_risk_count}</p>
            <span className="text-[10px] font-bold text-red-600">
              {isHindi ? 'तकनीकी सतर्कता ऑडिट लंबित' : 'Pending Technical Vigilance Audit'}
            </span>
          </div>
        </div>
      )}

      {/* Top 5 High-Risk Project Case Dossiers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" /> {t.priorityVigilanceCases}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHindi
                ? 'लागत वृद्धि, अत्यधिक विलंब या धरातलीय विसंगतियों के कारण उच्चतम संयुक्त जोखिम स्कोर वाली परियोजनाएं।'
                : 'Projects flagged with highest composite risk scores due to cost overrun, delay, or ground discrepancies.'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {summary?.top_risk_projects.map((item, idx) => (
            <div
              key={item.project_id}
              onClick={() => onSelectProject(item.project_id)}
              className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-brand-500 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {isHindi ? 'जोखिम स्कोर:' : 'Risk Score:'} {item.risk_score}/100
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {item.project_id}</span>
                </div>
                <p className="text-xs text-slate-500">{isHindi ? 'कार्यदायी संस्था:' : 'Executing Agency:'} <strong className="text-slate-700">{item.agency || 'N/A'}</strong></p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.reasons.map((r, i) => (
                    <span key={i} className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md font-medium">
                      ⚠️ {r}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProject(item.project_id);
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-2xs"
              >
                {t.inspectAuditDossier} <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* STATUTORY NOTICE GENERATOR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              {t.statutoryMemoTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHindi
                ? 'डिफ़ॉल्टिंग कार्यदायी संस्थाओं के लिए एमपीलैड्स संचालन नियमावली नियम 4.2 के तहत आधिकारिक कारण बताओ ज्ञापन।'
                : 'Draft official show-cause memorandum citing MPLADS Operational Guidelines Rule 4.2 for defaulting executing agencies.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMemo}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              {copied ? t.memoCopiedBtn : t.copyMemoBtn}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="h-3.5 w-3.5" /> {t.printDirectiveBtn}
            </button>
          </div>
        </div>

        {/* Project Selector for Notice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.selectProjectForMemo}:</label>
            <select
              value={selectedMemoProjectId}
              onChange={(e) => setSelectedMemoProjectId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.implementing_agency || 'Agency'}) - {p.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs flex flex-col justify-center">
            <p className="text-slate-500">Notice Addressee Agency:</p>
            <p className="font-bold text-slate-900 mt-0.5">{selectedMemoProject?.implementing_agency || 'Executing Agency'}</p>
          </div>
        </div>

        {/* Formal Legal Memorandum Letterhead Box */}
        <div className="bg-slate-950 text-slate-100 p-6 rounded-2xl font-mono text-xs leading-relaxed border border-slate-800 shadow-inner overflow-x-auto whitespace-pre-wrap">
          {memoText}
        </div>
      </div>
    </div>
  );
}
