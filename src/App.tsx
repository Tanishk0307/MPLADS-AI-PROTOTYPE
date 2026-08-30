import { useMemo, useState, useEffect } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { analyzeAnomalies } from '@/lib/aiEngine';
import { api } from '@/lib/api';
import { LoginScreen } from '@/components/LoginScreen';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { StatsCards } from '@/components/StatsCards';
import { SectorChart } from '@/components/SectorChart';
import { RiskMap } from '@/components/RiskMap';
import { AnomalyFlags } from '@/components/AnomalyFlags';
import { ProjectTable } from '@/components/ProjectTable';
import { ProjectDrawer } from '@/components/ProjectDrawer';
import { CitizenProofSection } from '@/components/CitizenProofSection';
import { AgencyScorecard } from '@/components/AgencyScorecard';
import { ReportsCenter } from '@/components/ReportsCenter';
import { AISearchModal, AIFloatingButton } from '@/components/AISearchModal';
import { ShieldAlert, MailWarning, LayoutDashboard } from 'lucide-react';
import type { User, CitizenProofReport, AgencyScorecardItem, Project } from '@/types/database';
import { useLanguage } from '@/context/LanguageContext';

const CDO_STAR_STORAGE_KEY = 'mplads_cdo_starred_ids';
const CITIZEN_PROOFS_STORAGE_KEY = 'mplads_citizen_proofs_v1';
const NOTICED_PROJECTS_STORAGE_KEY = 'mplads_noticed_project_ids';
const DM_INSPECTIONS_STORAGE_KEY = 'mplads_dm_inspections';

// Initial pre-seeded ground verification photo evidence across Ghaziabad sites
const INITIAL_CITIZEN_PROOFS: CitizenProofReport[] = [
  {
    id: 'proof-1',
    projectId: 'b2ed597a-20bb-47f9-a7f2-b275d0347e1b',
    projectName: 'Solar Street Lights Installation',
    location: 'Ward 8 Main Market Chowk, Vijay Nagar, Ghaziabad',
    citizenName: 'Amit Verma (Resident)',
    isAnonymous: false,
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
    progressPercentage: 35,
    workStatus: 'slow',
    remarks:
      'Only 4 poles erected on the main road. No solar panels, lithium batteries or LED luminaires have arrived yet. Contractor claimed work was 90% done.',
    upvotes: 18,
    verifiedByCdo: true,
    submittedAt: '2026-08-28T14:30:00Z',
    geoLat: 28.6412,
    geoLng: 77.4201,
  },
  {
    id: 'proof-2',
    projectId: '0785c3d5-30d1-49d5-8762-0d923689f89d',
    projectName: 'Deep Tube-Well Installation Ward 12',
    location: 'Sector 4 Community Park, Sahibabad, Ghaziabad',
    citizenName: 'Sunil Chaudhary (RWA Secretary)',
    isAnonymous: false,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    progressPercentage: 20,
    workStatus: 'stalled',
    remarks:
      'Drilling borewell pit was dug 2 months ago and left uncovered. No submersible motor or pipeline installed. Serious safety and waterlogging hazard.',
    upvotes: 27,
    verifiedByCdo: true,
    submittedAt: '2026-08-27T10:15:00Z',
    geoLat: 28.671,
    geoLng: 77.3705,
  },
  {
    id: 'proof-3',
    projectId: '7bae1436-8203-4815-88f1-43b5385f0ae6',
    projectName: 'School Digital Classroom Setup',
    location: 'Govt Inter College, Modinagar, Ghaziabad',
    citizenName: 'Anonymous Citizen',
    isAnonymous: true,
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
    progressPercentage: 90,
    workStatus: 'on_track',
    remarks:
      'Interactive smart touch panels and classroom furniture delivered and powered on. High-speed broadband router setup underway.',
    upvotes: 12,
    verifiedByCdo: false,
    submittedAt: '2026-08-29T09:00:00Z',
    geoLat: 28.832,
    geoLng: 77.5815,
  },
  {
    id: 'proof-4',
    projectId: '71d2a52a-3176-4806-9007-21c3b7ec7a17',
    projectName: 'Road Widening NH-9',
    location: 'Near Lal Kuan Flyover, Hapur Road, Ghaziabad',
    citizenName: 'Deepak Tyagi',
    isAnonymous: false,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8?w=800&auto=format&fit=crop&q=80',
    progressPercentage: 70,
    workStatus: 'on_track',
    remarks:
      'Service lane widening and bituminous resurfacing active with road rollers on site. Drain culverts completed.',
    upvotes: 9,
    verifiedByCdo: false,
    submittedAt: '2026-08-29T16:45:00Z',
    geoLat: 28.6692,
    geoLng: 77.4538,
  },
];

export default function App() {
  const { t, isHindi } = useLanguage();
  const { projects, sectors, loading, error, refresh } = useDashboardData();
  const [user, setUser] = useState<User | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'dashboard' | 'risk' | 'agencies' | 'proofs' | 'reports'>('dashboard');

  // CDO Star Mark IDs (persisted so all officers can view them regardless of role)
  const [cdoStarredIds, setCdoStarredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CDO_STAR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['b2ed597a-20bb-47f9-a7f2-b275d0347e1b'];
  });

  // Statutory Notices Dispatched State
  const [noticedProjectIds, setNoticedProjectIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(NOTICED_PROJECTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['b2ed597a-20bb-47f9-a7f2-b275d0347e1b'];
  });

  // Citizen Ground Proof Reports State
  const [citizenProofs, setCitizenProofs] = useState<CitizenProofReport[]>(() => {
    try {
      const saved = localStorage.getItem(CITIZEN_PROOFS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CITIZEN_PROOFS;
  });

  // DM On-Site Inspection Certifications State
  const [dmInspectedIds, setDmInspectedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DM_INSPECTIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['b2ed597a-20bb-47f9-a7f2-b275d0347e1b'];
  });

  // Contractor Scorecard State
  const [agencyScorecards, setAgencyScorecards] = useState<AgencyScorecardItem[]>([]);

  // Sync citizen proofs & agency scorecards from backend API
  useEffect(() => {
    api
      .getCitizenProofs()
      .then((data) => {
        if (data && data.length > 0) {
          setCitizenProofs(data);
        }
      })
      .catch(() => {
        // use local state fallback
      });

    api
      .getAgencyScorecard()
      .then((data) => {
        if (data && data.length > 0) {
          setAgencyScorecards(data);
        }
      })
      .catch(() => {
        // fallback calculated in useMemo if backend offline
      });
  }, [projects]);

  // Citizen Navigation Guard: Strictly restrict Reports & Audits from Citizen role
  useEffect(() => {
    if (user?.role === 'Guest' && activeNav === 'reports') {
      setActiveNav('dashboard');
    }
  }, [user?.role, activeNav]);

  // Compute fallback agency scorecards if backend is not running
  const effectiveScorecards = useMemo(() => {
    if (agencyScorecards.length > 0) return agencyScorecards;

    const map = new Map<string, Project[]>();
    projects.forEach((p) => {
      const agency = p.implementing_agency || 'Unassigned Contractor';
      const list = map.get(agency) ?? [];
      list.push(p);
      map.set(agency, list);
    });

    const items: AgencyScorecardItem[] = [];
    map.forEach((pList, agencyName) => {
      const totalSanctioned = pList.reduce((s, p) => s + p.sanctioned_amount_cr, 0);
      const totalSpent = pList.reduce((s, p) => s + p.spent_amount_cr, 0);
      const util = totalSanctioned ? (totalSpent / totalSanctioned) * 100 : 0;
      const flagged = pList.filter((p) => p.status === 'flagged').length;
      const stalled = pList.filter((p) => p.status === 'stalled').length;
      const completed = pList.filter((p) => p.status === 'completed').length;
      const pIds = new Set(pList.map((p) => p.id));
      const proofsCount = citizenProofs.filter((pr) => pIds.has(pr.projectId)).length;

      let grade = 'Satisfactory (B)';
      let risk: 'LOW' | 'MEDIUM' | 'CRITICAL' = 'LOW';
      if (flagged >= 2 || util > 125) {
        grade = 'Critical Risk (F)';
        risk = 'CRITICAL';
      } else if (flagged >= 1 || stalled >= 1 || util > 110) {
        grade = 'Moderate Watch (C)';
        risk = 'MEDIUM';
      } else if (completed === pList.length) {
        grade = 'Exemplary (A+)';
        risk = 'LOW';
      }

      items.push({
        agency_name: agencyName,
        total_projects: pList.length,
        total_sanctioned_cr: totalSanctioned,
        total_spent_cr: totalSpent,
        utilization_percent: util,
        avg_delay_days: flagged > 0 ? 95 : stalled > 0 ? 45 : 0,
        avg_cost_overrun_pct: util > 100 ? util - 100 : 0,
        flagged_count: flagged,
        stalled_count: stalled,
        completed_count: completed,
        citizen_proofs_count: proofsCount,
        performance_grade: grade,
        risk_level: risk,
      });
    });

    return items.sort((a, b) => (b.risk_level === 'CRITICAL' ? 1 : 0) - (a.risk_level === 'CRITICAL' ? 1 : 0));
  }, [agencyScorecards, projects, citizenProofs]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CDO_STAR_STORAGE_KEY, JSON.stringify(cdoStarredIds));
      localStorage.setItem(NOTICED_PROJECTS_STORAGE_KEY, JSON.stringify(noticedProjectIds));
      localStorage.setItem(CITIZEN_PROOFS_STORAGE_KEY, JSON.stringify(citizenProofs));
      localStorage.setItem(DM_INSPECTIONS_STORAGE_KEY, JSON.stringify(dmInspectedIds));
    } catch {
      // ignore
    }
  }, [cdoStarredIds, noticedProjectIds, citizenProofs, dmInspectedIds]);

  // Executive Authority: MP, State Nodal Authority (SNA), Ministry, DM, CDO can assign/remove stars
  // Automatic Action: When star is placed by Higher Authority, statutory notice and DM inspection order is triggered!
  const handleToggleCdoStar = async (projectId: string) => {
    const canPutStar =
      user?.role === 'MP' ||
      user?.role === 'SNA' ||
      user?.role === 'Ministry' ||
      user?.role === 'DM' ||
      user?.role === 'CDO';

    if (!canPutStar) {
      alert(
        'Permission Denied: Only the Member of Parliament (MP), State Nodal Authority (SNA), Ministry, and District Authorities have executive authority to assign or remove Vigilance Star marks.'
      );
      return;
    }

    const isAlreadyStarred = cdoStarredIds.includes(projectId);
    const nextVal = !isAlreadyStarred;

    setCdoStarredIds((prev) => {
      if (isAlreadyStarred) {
        return prev.filter((id) => id !== projectId);
      } else {
        // Automatically dispatch notice on star placement
        setNoticedProjectIds((n) => (n.includes(projectId) ? n : [...n, projectId]));
        return [...prev, projectId];
      }
    });

    try {
      await api.toggleProjectStar(projectId, nextVal);
    } catch (e) {
      console.warn('Backend sync for star failed, saved in browser:', e);
    }
  };

  // Send Statutory Notice Authority: MP, State Nodal Authority (SNA), Ministry, DM, CDO
  const handleSendNotice = async (projectId: string) => {
    const canSendNotice =
      user?.role === 'MP' ||
      user?.role === 'SNA' ||
      user?.role === 'Ministry' ||
      user?.role === 'DM' ||
      user?.role === 'CDO';

    if (!canSendNotice) {
      alert(
        'Permission Denied: Only the Member of Parliament (MP), State Nodal Authority (SNA), Ministry, and District Magistrates are authorized to issue statutory vigilance notices.'
      );
      return;
    }

    setNoticedProjectIds((prev) => {
      if (prev.includes(projectId)) {
        return prev;
      } else {
        return [...prev, projectId];
      }
    });

    try {
      await api.sendProjectNotice(projectId);
    } catch (e) {
      console.warn('Backend sync for dispatch notice failed:', e);
    }
  };

  // Record DM Site Inspection (Exclusive to DM login as per higher authority directive)
  const handleRecordDmInspection = (projectId: string) => {
    if (user?.role !== 'DM') {
      alert('Permission Denied: Only the District Magistrate (DM) can certify official on-site physical inspections.');
      return;
    }
    setDmInspectedIds((prev) => {
      const next = prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId];
      try {
        localStorage.setItem(DM_INSPECTIONS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Add new citizen proof report with backend sync
  const handleAddProof = async (newProofData: Omit<CitizenProofReport, 'id' | 'submittedAt' | 'upvotes' | 'verifiedByCdo'>) => {
    const tempId = `proof-${Date.now()}`;
    const newProof: CitizenProofReport = {
      ...newProofData,
      id: tempId,
      submittedAt: new Date().toISOString(),
      upvotes: 1,
      verifiedByCdo: user?.role === 'CDO',
    };
    setCitizenProofs((prev) => [newProof, ...prev]);

    try {
      const created = await api.createCitizenProof(newProofData);
      setCitizenProofs((prev) => prev.map((p) => (p.id === tempId ? created : p)));
    } catch (e) {
      console.warn('Backend sync failed, saved in browser:', e);
    }
  };

  // Upvote proof report with backend sync
  const handleUpvoteProof = async (proofId: string) => {
    setCitizenProofs((prev) =>
      prev.map((p) => (p.id === proofId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
    try {
      await api.upvoteCitizenProof(proofId);
    } catch (e) {
      console.warn('Upvote sync failed:', e);
    }
  };

  // CDO Endorsement for proof report with backend sync
  const handleVerifyProof = async (proofId: string) => {
    if (user?.role !== 'CDO') {
      alert('Only Chief Development Officer (CDO) can endorse ground truth proof reports.');
      return;
    }
    const current = citizenProofs.find((p) => p.id === proofId);
    const nextVal = !current?.verifiedByCdo;
    setCitizenProofs((prev) =>
      prev.map((p) => (p.id === proofId ? { ...p, verifiedByCdo: nextVal } : p))
    );
    try {
      await api.verifyCitizenProof(proofId, nextVal);
    } catch (e) {
      console.warn('Endorsement sync failed:', e);
    }
  };

  // Compute AI anomalies live
  const anomalies = useMemo(() => analyzeAnomalies(projects), [projects]);
  const criticalCount = anomalies.filter((a) => a.severity === 'CRITICAL').length;

  const stats = useMemo(() => {
    const totalSanctioned = projects.reduce((s, p) => s + p.sanctioned_amount_cr, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent_amount_cr, 0);
    return { totalSanctioned, totalSpent, totalProjects: projects.length };
  }, [projects]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const selectedAnomaly = useMemo(
    () => anomalies.find((a) => a.projectId === selectedProjectId) ?? null,
    [anomalies, selectedProjectId]
  );

  const isSelectedProjectStarred = useMemo(
    () => (selectedProjectId ? cdoStarredIds.includes(selectedProjectId) : false),
    [cdoStarredIds, selectedProjectId]
  );

  const isSelectedProjectNoticed = useMemo(
    () => (selectedProjectId ? isSelectedProjectStarred || noticedProjectIds.includes(selectedProjectId) : false),
    [isSelectedProjectStarred, noticedProjectIds, selectedProjectId]
  );

  const mapProjects = useMemo(
    () =>
      projects
        .filter((p) => p.latitude && p.longitude)
        .map((p) => ({
          id: p.id,
          name: p.name,
          latitude: p.latitude!,
          longitude: p.longitude!,
          coords: [p.latitude!, p.longitude!] as [number, number],
        })),
    [projects]
  );

  // Login gate
  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">{t.loadingSurveillanceData}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">Failed to load data</h2>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 cursor-pointer"
          >
            {t.refreshData}
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  const handleNavigate = (key: string) => {
    setActiveNav(key as 'dashboard' | 'risk' | 'agencies' | 'proofs' | 'reports');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header
        user={user}
        onLogout={() => setUser(null)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        highRiskCount={criticalCount}
        onRefresh={refresh}
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onOpenAiModal={() => setAiModalOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 w-full">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            active={activeNav}
            onNavigate={handleNavigate}
            riskCount={anomalies.length}
            proofsCount={citizenProofs.length}
            agenciesCount={effectiveScorecards.length}
            userRole={user?.role}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-40 p-4 overflow-y-auto lg:hidden animate-slide-in">
              <Sidebar
                active={activeNav}
                onNavigate={handleNavigate}
                onClose={() => setSidebarOpen(false)}
                riskCount={anomalies.length}
                proofsCount={citizenProofs.length}
                agenciesCount={effectiveScorecards.length}
                userRole={user?.role}
              />
            </div>
          </>
        )}

        {/* Dynamic Page Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* PAGE 1: REAL-TIME DASHBOARD (Map, Stats, Table, Budget) */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6 animate-fade-in-up">
              <StatsCards
                totalSanctioned={stats.totalSanctioned}
                totalSpent={stats.totalSpent}
                totalProjects={stats.totalProjects}
                criticalCount={criticalCount}
              />

              <RiskMap
                anomalies={anomalies}
                allProjects={mapProjects}
                onSelectProject={setSelectedProjectId}
                user={user}
                cdoStarredIds={cdoStarredIds}
                onToggleCdoStar={handleToggleCdoStar}
              />

              <div className="grid grid-cols-1 gap-6">
                <SectorChart projects={projects} sectors={sectors} />
              </div>

              <ProjectTable
                projects={projects}
                onSelectProject={setSelectedProjectId}
                cdoStarredIds={cdoStarredIds}
                onToggleCdoStar={handleToggleCdoStar}
                userRole={user?.role}
                dmInspectedIds={dmInspectedIds}
              />
            </div>
          )}

          {/* PAGE 2: AI HIGH RISK CENTER (Anomalies, Fraud Detection, Overruns) */}
          {activeNav === 'risk' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Page Hero Banner */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white p-6 rounded-2xl border border-red-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
                      <ShieldAlert className="h-6 w-6 animate-pulse" />
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        {t.aiHighRiskTitle}
                        <span className="text-xs bg-red-600 text-white px-2.5 py-0.5 rounded-full font-bold">
                          {anomalies.length} {t.flaggedCountBadge}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t.aiHighRiskSubtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-bold text-red-400">{t.severityCritical}</p>
                    <p className="text-2xl font-black text-red-200">{criticalCount}</p>
                  </div>
                </div>
              </div>

              {/* Anomaly Cards List with Executive Notice Handlers */}
              <AnomalyFlags
                anomalies={anomalies}
                onSelectProject={setSelectedProjectId}
                cdoStarredIds={cdoStarredIds}
                onToggleCdoStar={handleToggleCdoStar}
                user={user}
                noticedProjectIds={noticedProjectIds}
                onSendNotice={handleSendNotice}
                dmInspectedIds={dmInspectedIds}
                onRecordDmInspection={handleRecordDmInspection}
              />

              {/* Secondary Navigation to Dashboard */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{isHindi ? 'स्थानिक जीआईएस (GIS) अवलोकन चाहिए?' : 'Need spatial GIS overview?'}</h4>
                  <p className="text-[11px] text-slate-500">{isHindi ? 'साइट पिन वितरण देखने के लिए वास्तविक समय मानचित्र पर स्विच करें।' : 'Switch to the real-time GIS map to see site pin distribution.'}</p>
                </div>
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LayoutDashboard className="h-4 w-4 text-emerald-400" /> {t.navDashboard}
                </button>
              </div>
            </div>
          )}

          {/* PAGE 3: CONTRACTOR & AGENCY SCORECARD */}
          {activeNav === 'agencies' && (
            <div className="space-y-6 animate-fade-in-up">
              <AgencyScorecard
                scorecard={effectiveScorecards}
                projects={projects}
                onSelectProject={setSelectedProjectId}
                user={user}
              />
            </div>
          )}

          {/* PAGE 4: CITIZEN PHOTO PROOFS (Jan Sunwai Ground Truth Verification) */}
          {activeNav === 'proofs' && (
            <div className="space-y-6 animate-fade-in-up">
              <CitizenProofSection
                projects={projects}
                proofs={citizenProofs}
                onAddProof={handleAddProof}
                onUpvoteProof={handleUpvoteProof}
                onVerifyProof={handleVerifyProof}
                onSelectProject={setSelectedProjectId}
                user={user}
              />
            </div>
          )}

          {/* PAGE 5: VIGILANCE & AUDIT REPORTS (Strict DM / CDO Clearance Area) */}
          {activeNav === 'reports' && (
            <div className="space-y-6 animate-fade-in-up">
              <ReportsCenter
                projects={projects}
                onSelectProject={setSelectedProjectId}
                user={user}
                onSwitchRole={(role) => setUser({ email: `${role.toLowerCase()}@ghaziabad.nic.in`, role })}
              />
            </div>
          )}
        </main>
      </div>

      <footer className="max-w-7xl mx-auto px-4 py-6 text-center mt-auto">
        <p className="text-xs text-slate-400">
          {t.portalTitle} · {t.ghaziabadRegion} · {projects.length} {t.projectsCountLabel} · AI Engine v2.0
        </p>
      </footer>

      <ProjectDrawer
        project={selectedProject}
        anomaly={selectedAnomaly}
        onClose={() => setSelectedProjectId(null)}
        isCdoStarred={isSelectedProjectStarred}
        onToggleCdoStar={handleToggleCdoStar}
        citizenProofs={citizenProofs}
        user={user}
        isNoticed={isSelectedProjectNoticed}
        onSendNotice={handleSendNotice}
        dmInspectedIds={dmInspectedIds}
        onRecordDmInspection={handleRecordDmInspection}
      />

      <AIFloatingButton onClick={() => setAiModalOpen(true)} />
      <AISearchModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        projects={projects}
        onSelectProject={setSelectedProjectId}
      />
    </div>
  );
}
