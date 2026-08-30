export type Language = 'en' | 'hi';

export interface Translations {
  // Brand & Header
  appTitle: string;
  appSubtitle: string;
  districtCommandCenter: string;
  ghaziabadUp: string;
  govOfUp: string;
  refreshData: string;
  switchRoleLogout: string;
  criticalCountBadge: string;
  starredCountBadge: string;
  footerText: string;

  // Language switcher
  languageLabel: string;
  english: string;
  hindi: string;
  changeLanguage: string;

  // Navigation Tabs
  navDashboard: string;
  navRisk: string;
  navAgencies: string;
  navProofs: string;
  navReports: string;
  governanceCommand: string;
  citizenTransparencyView: string;
  citizenTransparencySub: string;
  uploadGroundProof: string;

  // Roles
  roleMp: string;
  roleSna: string;
  roleDm: string;
  roleMinistry: string;
  roleAgency: string;
  roleCdo: string;
  roleEngineer: string;
  roleAdmin: string;
  roleGuest: string;
  roleMpDesc: string;
  roleSnaDesc: string;
  roleDmDesc: string;
  roleMinistryDesc: string;
  roleAgencyDesc: string;
  roleCdoDesc: string;
  roleEngineerDesc: string;
  roleAdminDesc: string;
  roleGuestDesc: string;

  // Higher Authority & DM Inspection Directives
  dmInspectionDirectiveTitle: string;
  dmInspectionDirectiveDesc: string;
  dmRecordInspectionBtn: string;
  dmInspectedBadge: string;
  dmInspectedNotice: string;
  mpPriorityStar: string;
  snaPriorityStar: string;
  starActionByAuthority: string;
  sendNoticeByAuthority: string;

  // Login Screen
  officialEmail: string;
  emailPlaceholder: string;
  selectRole: string;
  sendOtp: string;
  otpSentTo: string;
  demoOtpMsg: string;
  enterOtp: string;
  otpPlaceholder: string;
  verifyAndEnter: string;
  changeEmailOrRole: string;

  // Stats Cards
  sanctionedFund: string;
  released100: string;
  actualExpenditure: string;
  overrunDetected: string;
  utilized: string;
  sanctionedWorks: string;
  ghaziabadRegion: string;
  aiCriticalRiskFlags: string;
  immediateAuditReq: string;
  allClear: string;

  // Project Table
  projectsMonitoringTitle: string;
  projectsMonitoringCdoSub: string;
  projectsMonitoringGenSub: string;
  searchPlaceholder: string;
  filterAll: string;
  filterCdoStarred: string;
  filterFlagged: string;
  filterOngoing: string;
  filterCompleted: string;
  filterStalled: string;
  colStar: string;
  colProject: string;
  colSector: string;
  colSanctioned: string;
  colSpent: string;
  colStatus: string;
  noProjectsMatch: string;

  // High Risk Center & Anomaly Flags
  riskCenterTitle: string;
  riskCenterSub: string;
  criticalThreatProjects: string;
  flaggedCountBadge: string;
  aiFlaggedAnomaliesTitle: string;
  executiveActiveNoticeNote: string;
  viewOnlyNoticeNote: string;
  cdoStarVigilance: string;
  statutoryNoticeActive: string;
  putCdoStar: string;
  starFlagged: string;
  sendNotice: string;
  noticeIssued: string;
  detailsBtn: string;
  spatialGisTitle: string;
  spatialGisSub: string;
  goTo4kMap: string;
  noAnomaliesDetectedMsg: string;

  // Project Drawer
  locationLabel: string;
  sectorLabel: string;
  implementingAgencyLabel: string;
  timelineLabel: string;
  createdLabel: string;
  coordinatesLabel: string;
  budgetBreakdown: string;
  sanctionedLabel: string;
  spentLabel: string;
  utilizationLabel: string;
  projectDetailsTitle: string;
  timelineAnalysisTitle: string;
  aiRiskAssessmentTitle: string;
  scoreLabel: string;
  statutoryExecutiveOrdersTitle: string;
  viewOnlyBadge: string;
  dispatchShowCauseNotice: string;
  noticeDispatched: string;
  cdoExecutiveAuthority: string;
  cdoStarDescActive: string;
  cdoStarDescInactive: string;
  removeStarBtn: string;
  addCdoStarBtn: string;
  citizenProofsForProject: string;
  submittedByLabel: string;
  progressLabel: string;
  overEstimatedTimeline: string;
  underEstimatedTimeline: string;

  // Agency Scorecard
  agenciesTitle: string;
  agenciesSubtitle: string;
  totalAgenciesMonitored: string;
  highDefaultWatch: string;
  totalSanctionedCr: string;
  totalSpentCr: string;
  avgOverrunPct: string;
  avgDelayDays: string;
  daysOverdueLabel: string;
  performanceGradeLabel: string;
  riskLevelLabel: string;
  projectsCountLabel: string;
  citizenReportsCountLabel: string;
  viewProjectsBtn: string;
  agencySearchPlaceholder: string;
  agencyTabAll: string;
  agencyTabCritical: string;
  agencyTabMedium: string;
  agencyTabLow: string;
  agencyProjectsMonitored: string;
  agencyPhotoAudits: string;
  agencySanctioned: string;
  agencySpent: string;
  agencyUtilization: string;
  agencyAvgExecutionDelay: string;
  agencyDaysOverdue: string;
  agencyOnSchedule: string;
  agencyAvgCostOverrun: string;
  agencyOverBudget: string;
  agencyWithinBudget: string;
  agencyVigilanceFlags: string;
  agencyFlagged: string;
  agencyStalled: string;
  agencyCompleted: string;
  agencyAssignedWorks: string;
  agencyClickToOpenDossier: string;
  agencyNoMatches: string;
  gradeCriticalRisk: string;
  gradeModerateWatch: string;
  gradeSatisfactory: string;
  gradeExemplary: string;

  // Citizen Proofs
  citizenProofsTitle: string;
  citizenProofsSubtitle: string;
  submitGroundProofBtn: string;
  totalFieldProofs: string;
  cdoEndorsedCount: string;
  filterAllProofs: string;
  filterStalledSites: string;
  filterSlowProgress: string;
  filterOnTrackSites: string;
  filterPoorQualitySites: string;
  filterCompletedSites: string;
  upvoteBtn: string;
  endorseCdoBtn: string;
  endorsedByCdoBadge: string;
  submitPhotoFormTitle: string;
  selectProjectLabel: string;
  yourNameLabel: string;
  submitAnonymouslyLabel: string;
  observedStatusLabel: string;
  estimatedProgressLabel: string;
  photoUrlLabel: string;
  remarksLabel: string;
  submitReportBtn: string;
  cancelBtn: string;
  takeLivePhoto: string;
  takeLivePhotoSub: string;
  snapLivePhoto: string;
  cameraSourceLive: string;
  cameraSourceUpload: string;
  sampleSiteProof: string;
  observedPhysicalCompletion: string;
  currentGroundStatus: string;
  specificLandmark: string;
  detailedObservations: string;
  submitAsAnonymous: string;
  yourNamePlaceholder: string;
  uploadingToServer: string;
  clickToZoom: string;
  physicalProgress: string;
  citizenVerifiedCompletion: string;
  evidenceReportsCount: string;
  photoSourceMode: string;
  selectSite: string;
  cdoVerifiedBadge: string;

  // Reports Center
  reportsTitle: string;
  reportsSubtitle: string;
  statutoryMemoTitle: string;
  selectProjectForMemo: string;
  copyMemoBtn: string;
  memoCopiedBtn: string;
  printDirectiveBtn: string;
  exportCsvBtn: string;
  monitoredJurisdiction: string;
  sanctionedOutlay: string;
  fundUtilization: string;
  criticalRiskProjects: string;
  priorityVigilanceCases: string;
  inspectAuditDossier: string;
  showCauseGenerator: string;
  showCauseSub: string;
  officialSeal: string;
  copyStatutoryMemo: string;
  copiedToClipboard: string;
  downloadCsv: string;

  // AI Assistant Modal
  aiAssistantTitle: string;
  aiAssistantSubtitle: string;
  aiInputPlaceholder: string;
  askAiBtn: string;
  suggestedQueriesTitle: string;
  keyFindingsTitle: string;
  recommendedActionTitle: string;
  matchedProjectsTitle: string;
  floatingAiBtnText: string;

  // Sector Distribution & General Loading
  sectorDistributionTitle: string;
  loadingScores: string;

  // Status & Severity
  statusOngoing: string;
  statusCompleted: string;
  statusStalled: string;
  statusFlagged: string;
  severityCritical: string;
  severityMedium: string;
  severityLow: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'MPLADS AI Surveillance Portal',
    appSubtitle: 'District Nodal Command Center · Ghaziabad, UP',
    districtCommandCenter: 'District Command Center:',
    ghaziabadUp: 'Ghaziabad, UP',
    govOfUp: 'Government of Uttar Pradesh · MPLADS Fund Surveillance System',
    refreshData: 'Refresh data',
    switchRoleLogout: 'Switch Role / Logout',
    criticalCountBadge: 'Critical',
    starredCountBadge: 'Starred',
    footerText: 'MPLADS AI Surveillance Portal · Ghaziabad, UP · AI Engine v2.0',

    languageLabel: 'Language',
    english: 'English',
    hindi: 'हिंदी (Hindi)',
    changeLanguage: 'Change Language',

    navDashboard: 'Dashboard',
    navRisk: 'High Risk Center',
    navAgencies: 'Contractors',
    navProofs: 'Citizen Proofs',
    navReports: 'Reports & Audit',
    governanceCommand: 'Governance Command',
    citizenTransparencyView: 'Citizen Transparency View',
    citizenTransparencySub: 'Public can submit real on-site photo proofs & inspect expenditure records.',
    uploadGroundProof: 'Upload Ground Proof',

    roleMp: 'Member of Parliament (MP)',
    roleSna: 'State Nodal Authority / Nodal District Authority',
    roleDm: 'District Authority (District Collector / DM Office)',
    roleMinistry: 'Ministry (MoSPI - Ministry of Statistics & Programme Implementation)',
    roleAgency: 'Implementing Agency (PWD, Jal Nigam, Panchayat, etc.)',
    roleCdo: 'Chief Development Officer (CDO)',
    roleEngineer: 'Project Engineer (Technical)',
    roleAdmin: 'System Administrator',
    roleGuest: 'Citizen Transparency View',
    roleMpDesc: 'Track & review recommended development works · Assign priority vigilance star & issue statutory directives',
    roleSnaDesc: 'State-level monitoring · Assign vigilance star & statutory directives to District Authorities',
    roleDmDesc: 'District-level implementation & execution · Mandated on-site inspection as per Higher Authority orders',
    roleMinistryDesc: 'Top-level central oversight regulating MPLADS national guidelines, statutory audits & central clearance',
    roleAgencyDesc: 'Executing agencies managing ground execution, expenditure records & progress compliance',
    roleCdoDesc: 'Executive administration, physical verification & citizen proof endorsement',
    roleEngineerDesc: 'Technical site measurements & engineering inspection',
    roleAdminDesc: 'Complete system control & portal settings',
    roleGuestDesc: 'Public transparency view · Submit on-site photo proofs & view expenditure records',

    dmInspectionDirectiveTitle: 'Higher Authority Inspection Directive',
    dmInspectionDirectiveDesc: 'District Magistrate (DM) mandated to conduct physical on-site inspection as per order of Higher Authority (Member of Parliament / State Nodal Authority / Ministry).',
    dmRecordInspectionBtn: 'Record On-Site Inspection by DM',
    dmInspectedBadge: 'Inspected On-Site by District Magistrate (DM)',
    dmInspectedNotice: 'Site inspected by District Magistrate as per Higher Authority order. Compliance verified.',
    mpPriorityStar: '⭐ MP Priority Vigilance Star',
    snaPriorityStar: '⭐ State Nodal Authority Directive',
    starActionByAuthority: 'Assign Priority Vigilance Star',
    sendNoticeByAuthority: 'Dispatch Statutory Notice to DM & Agency',

    officialEmail: 'Official Email',
    emailPlaceholder: 'dm.ghaziabad@up.gov.in',
    selectRole: 'Select Administrative Role',
    sendOtp: 'Send Secure OTP',
    otpSentTo: 'OTP Sent to:',
    demoOtpMsg: 'Demo OTP code:',
    enterOtp: 'Enter 6-digit OTP',
    otpPlaceholder: '6-digit code',
    verifyAndEnter: 'Verify & Enter Portal',
    changeEmailOrRole: 'Change Email / Role',

    sanctionedFund: 'Sanctioned Fund',
    released100: '100% Released',
    actualExpenditure: 'Actual Expenditure',
    overrunDetected: 'Cost Overrun Detected',
    utilized: 'Utilized',
    sanctionedWorks: 'Sanctioned Works',
    ghaziabadRegion: 'Ghaziabad Region',
    aiCriticalRiskFlags: 'AI Critical Risk Flags',
    immediateAuditReq: 'Immediate Audit Required',
    allClear: 'All Clear',

    projectsMonitoringTitle: 'Active MPLADS Development Projects · Ghaziabad',
    projectsMonitoringCdoSub: 'Click the star icon to order priority vigilance or on-site inspections.',
    projectsMonitoringGenSub: 'Golden stars indicate Inspection from MP and priority vigilance.',
    searchPlaceholder: 'Search project name, agency, location...',
    filterAll: 'All',
    filterCdoStarred: '⭐ Inspection from MP',
    filterFlagged: 'Flagged',
    filterOngoing: 'Ongoing',
    filterCompleted: 'Completed',
    filterStalled: 'Stalled',
    colStar: '⭐',
    colProject: 'Project Name',
    colSector: 'Sector',
    colSanctioned: 'Sanctioned',
    colSpent: 'Spent',
    colStatus: 'Status',
    noProjectsMatch: 'No development projects match your filter.',

    riskCenterTitle: 'AI High Risk & Anomaly Center',
    riskCenterSub: 'Priority vigilance alerts for budget overruns, acute delays, and spatial ground discrepancies.',
    criticalThreatProjects: 'Critical Risk Projects',
    flaggedCountBadge: 'Flagged',
    aiFlaggedAnomaliesTitle: 'AI Flagged Irregularities',
    executiveActiveNoticeNote: 'Executive Authority Active: MP, SNA, and District Authorities can issue statutory notices directly.',
    viewOnlyNoticeNote: 'View Only Mode: Only authorized administrative officials can issue notices.',
    cdoStarVigilance: 'Inspection from MP',
    statutoryNoticeActive: 'Statutory Notice Active',
    putCdoStar: '⭐ Inspection from MP',
    starFlagged: 'Inspection from MP ⭐',
    sendNotice: 'Send Show-Cause Notice',
    noticeIssued: 'Notice Issued 📩',
    detailsBtn: 'Details',
    spatialGisTitle: 'Looking for the Spatial GIS Map?',
    spatialGisSub: 'Switch to the real-time GIS map to see site pin distribution and geographic context.',
    goTo4kMap: 'Go to 4K GIS Map',
    noAnomaliesDetectedMsg: 'No anomalies detected. All monitored projects are within benchmark thresholds.',

    locationLabel: 'Location',
    sectorLabel: 'Sector',
    implementingAgencyLabel: 'Implementing Agency / Contractor',
    timelineLabel: 'Timeline',
    createdLabel: 'Sanction Date',
    coordinatesLabel: 'GPS Coordinates',
    budgetBreakdown: 'Budget Breakdown',
    sanctionedLabel: 'Sanctioned',
    spentLabel: 'Spent',
    utilizationLabel: 'Utilization',
    projectDetailsTitle: 'Project Dossier',
    timelineAnalysisTitle: 'Timeline Analysis',
    aiRiskAssessmentTitle: 'AI Risk Assessment',
    scoreLabel: 'Risk Score',
    statutoryExecutiveOrdersTitle: 'Statutory Executive Orders',
    viewOnlyBadge: 'View Only',
    dispatchShowCauseNotice: 'Dispatch Show-Cause Notice',
    noticeDispatched: 'Notice Dispatched 📩',
    cdoExecutiveAuthority: 'Executive Authority Directive',
    cdoStarDescActive: 'Marked for Inspection from MP: Statutory vigilance notice dispatched to implementing agency.',
    cdoStarDescInactive: 'Mark with star to order Inspection from MP and issue statutory notice.',
    removeStarBtn: 'Remove Star',
    addCdoStarBtn: 'Inspection from MP ⭐',
    citizenProofsForProject: 'Citizen Ground Truth Proofs',
    submittedByLabel: 'Submitted by:',
    progressLabel: 'Progress',
    overEstimatedTimeline: 'over estimated timeline',
    underEstimatedTimeline: 'ahead of schedule',

    agenciesTitle: 'Contractor & Implementing Agency Scorecards',
    agenciesSubtitle: 'Audit performance, fund utilization, and citizen ground truth records for all contractors in Ghaziabad.',
    totalAgenciesMonitored: 'Agencies Monitored',
    highDefaultWatch: 'High Default Watch',
    totalSanctionedCr: 'Total Sanctioned Outlay',
    totalSpentCr: 'Total Disbursed Spent',
    avgOverrunPct: 'Avg Cost Overrun',
    avgDelayDays: 'Avg Execution Delay',
    daysOverdueLabel: 'days overdue',
    performanceGradeLabel: 'Performance Grade',
    riskLevelLabel: 'Risk Level',
    projectsCountLabel: 'Projects',
    citizenReportsCountLabel: 'Citizen Reports',
    viewProjectsBtn: 'View Projects',
    agencySearchPlaceholder: 'Search contractor or agency...',
    agencyTabAll: 'All Agencies',
    agencyTabCritical: 'Critical Risk',
    agencyTabMedium: 'Moderate Watch',
    agencyTabLow: 'Satisfactory',
    agencyProjectsMonitored: 'Projects Monitored',
    agencyPhotoAudits: 'Citizen Photo Audits',
    agencySanctioned: 'SANCTIONED',
    agencySpent: 'SPENT',
    agencyUtilization: 'UTILIZATION',
    agencyAvgExecutionDelay: 'Avg Execution Delay:',
    agencyDaysOverdue: 'days overdue',
    agencyOnSchedule: 'On Schedule',
    agencyAvgCostOverrun: 'Avg Cost Overrun:',
    agencyOverBudget: 'over budget',
    agencyWithinBudget: 'Within Budget',
    agencyVigilanceFlags: 'Vigilance Flags:',
    agencyFlagged: 'Flagged',
    agencyStalled: 'Stalled',
    agencyCompleted: 'Completed',
    agencyAssignedWorks: 'ASSIGNED PROJECT WORKS',
    agencyClickToOpenDossier: 'Click to open dossier',
    agencyNoMatches: 'No executing agencies match your search criteria.',
    gradeCriticalRisk: 'CRITICAL RISK (F)',
    gradeModerateWatch: 'MODERATE WATCH (C)',
    gradeSatisfactory: 'SATISFACTORY (B)',
    gradeExemplary: 'EXEMPLARY (A+)',

    citizenProofsTitle: 'Citizen Ground Truth & Live Photo Audits',
    citizenProofsSubtitle: 'Direct public oversight platform with GPS-tagged site photos and physical progress inspections.',
    submitGroundProofBtn: 'Submit Ground Proof',
    totalFieldProofs: 'Total Field Proofs',
    cdoEndorsedCount: 'CDO Endorsed',
    filterAllProofs: 'All Proofs',
    filterStalledSites: 'Stalled Sites',
    filterSlowProgress: 'Slow Progress',
    filterOnTrackSites: 'On-Track Sites',
    filterPoorQualitySites: 'Poor Quality',
    filterCompletedSites: 'Completed',
    upvoteBtn: 'Upvote',
    endorseCdoBtn: 'CDO Endorsement',
    endorsedByCdoBadge: 'CDO Verified ✔️',
    submitPhotoFormTitle: 'Submit On-Site Ground Proof',
    selectProjectLabel: 'Select Project',
    yourNameLabel: 'Your Name',
    submitAnonymouslyLabel: 'Submit Anonymously',
    observedStatusLabel: 'Observed Ground Status',
    estimatedProgressLabel: 'Estimated Progress (%)',
    photoUrlLabel: 'Site Photo URL',
    remarksLabel: 'Observations & Remarks',
    submitReportBtn: 'Submit Verification Report',
    cancelBtn: 'Cancel',
    takeLivePhoto: 'Live On-Site Camera Proof',
    takeLivePhotoSub: 'Take a live photo from your device camera at the construction site in Ghaziabad.',
    snapLivePhoto: '📸 SNAP LIVE PHOTO',
    cameraSourceLive: '📸 Live Camera',
    cameraSourceUpload: '📁 Upload File',
    sampleSiteProof: 'Or choose sample site proof:',
    observedPhysicalCompletion: 'Observed Physical Completion (%)',
    currentGroundStatus: 'Current Ground Status *',
    specificLandmark: 'Specific Landmark Location',
    detailedObservations: 'Detailed Field Observations & Remarks *',
    submitAsAnonymous: 'Submit as Anonymous Citizen',
    yourNamePlaceholder: 'Your Name (e.g. Sunil Kumar)',
    uploadingToServer: 'Uploading photo to server...',
    clickToZoom: 'Click to Zoom',
    physicalProgress: 'Physical Progress:',
    citizenVerifiedCompletion: 'Citizen Verified Completion',
    evidenceReportsCount: 'evidence reports in Ghaziabad',
    photoSourceMode: 'Photo Source Mode:',
    selectSite: 'Select Construction Project Site *',
    cdoVerifiedBadge: 'CDO Verified',

    reportsTitle: 'District Vigilance & Statutory Audit Reports',
    reportsSubtitle: 'Official executive memoranda, statutory show-cause notices, and district financial audit exports.',
    statutoryMemoTitle: 'Statutory Executive Show-Cause Memorandum',
    selectProjectForMemo: 'Select Project for Formal Notice Issuance',
    copyMemoBtn: 'Copy Official Memorandum',
    memoCopiedBtn: 'Copied to Clipboard!',
    printDirectiveBtn: 'Print Executive Directive',
    exportCsvBtn: 'Download District Audit CSV',
    monitoredJurisdiction: 'Monitored Jurisdiction',
    sanctionedOutlay: 'Sanctioned Outlay',
    fundUtilization: 'Fund Drawdown / Util',
    criticalRiskProjects: 'Critical Risk Projects',
    priorityVigilanceCases: 'Priority Vigilance Audit Cases',
    inspectAuditDossier: 'Inspect Audit Dossier',
    showCauseGenerator: 'Statutory Executive Show-Cause Legal Memorandum',
    showCauseSub: 'Generated under Uttar Pradesh District Administrative Vigilance Directives',
    officialSeal: 'OFFICE OF DISTRICT MAGISTRATE & CDO · GHAZIABAD COLLECTORATE',
    copyStatutoryMemo: 'Copy Statutory Memo',
    copiedToClipboard: 'Copied to Clipboard!',
    downloadCsv: 'Download Financial & Vigilance Audit CSV',

    aiAssistantTitle: 'MPLADS Vigilance AI Assistant',
    aiAssistantSubtitle: 'Ask natural language questions about projects, contractor delays, cost overruns, and anomalies.',
    aiInputPlaceholder: "Ask AI: 'Which projects exceed budget?' or 'Show Loni site status'...",
    askAiBtn: 'Ask AI Engine',
    suggestedQueriesTitle: 'Suggested Queries',
    keyFindingsTitle: 'Key Findings',
    recommendedActionTitle: 'Recommended Administrative Action',
    matchedProjectsTitle: 'Matched Projects',
    floatingAiBtnText: 'Vigilance AI',

    sectorDistributionTitle: 'Sector Budget Allocation & Utilization',
    loadingScores: 'Loading contractor scores & records...',

    statusOngoing: 'Ongoing',
    statusCompleted: 'Completed',
    statusStalled: 'Stalled',
    statusFlagged: 'Flagged',
    severityCritical: 'CRITICAL',
    severityMedium: 'MEDIUM',
    severityLow: 'LOW',
  },
  hi: {
    appTitle: 'सांसद स्थानीय क्षेत्र विकास योजना (MPLADS) एआई निगरानी पोर्टल',
    appSubtitle: 'जिला नोडल कमान एवं सतर्कता केंद्र · गाजियाबाद, उत्तर प्रदेश',
    districtCommandCenter: 'जिला कमान केंद्र:',
    ghaziabadUp: 'गाजियाबाद, उत्तर प्रदेश',
    govOfUp: 'उत्तर प्रदेश सरकार · एमपीलैड्स निधि निगरानी एवं पारदर्शिता प्रणाली',
    refreshData: 'डेटा रीफ़्रेश करें',
    switchRoleLogout: 'भूमिका बदलें / लॉग आउट',
    criticalCountBadge: 'अति गंभीर',
    starredCountBadge: 'तारांकित',
    footerText: 'सांसद निधि (MPLADS) एआई निगरानी पोर्टल · गाजियाबाद, उ.प्र. · एआई इंजन v2.0',

    languageLabel: 'भाषा',
    english: 'English',
    hindi: 'हिंदी (Hindi)',
    changeLanguage: 'भाषा बदलें',

    navDashboard: 'डैशबोर्ड',
    navRisk: 'उच्च जोखिम केंद्र',
    navAgencies: 'ठेकेदार स्कोरकार्ड',
    navProofs: 'नागरिक साक्ष्य',
    navReports: 'सतर्कता एवं ऑडिट',
    governanceCommand: 'प्रशासनिक कमान',
    citizenTransparencyView: 'नागरिक पारदर्शिता मंच',
    citizenTransparencySub: 'नागरिक वास्तविक ऑन-साइट फोटो प्रमाण प्रस्तुत कर सकते हैं और व्यय विवरण की जांच कर सकते हैं।',
    uploadGroundProof: 'धरातलीय साक्ष्य अपलोड करें',

    roleMp: 'सांसद (Member of Parliament)',
    roleSna: 'राज्य नोडल प्राधिकरण / नोडल जिला प्राधिकरण',
    roleDm: 'जिला प्राधिकरण (जिलाधिकारी / कलेक्ट्रेट कार्यालय)',
    roleMinistry: 'केंद्रीय मंत्रालय (MoSPI - सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय)',
    roleAgency: 'कार्यदायी संस्था (PWD, जल निगम, ग्राम पंचायत आदि)',
    roleCdo: 'मुख्य विकास अधिकारी (CDO)',
    roleEngineer: 'परियोजना अभियंता (तकनीकी)',
    roleAdmin: 'सिस्टम प्रशासक',
    roleGuest: 'नागरिक पारदर्शिता मंच (सार्वजनिक दृश्य)',
    roleMpDesc: 'अपने अनुशंसित विकास कार्यों की निगरानी, प्राथमिकता सतर्कता स्टार लगाने एवं नोटिस जारी करने हेतु',
    roleSnaDesc: 'राज्य स्तरीय निगरानी, सतर्कता स्टार एवं जिला प्राधिकारियों को सांविधिक निर्देश जारी करने हेतु',
    roleDmDesc: 'जिला स्तरीय क्रियान्वयन, निष्पादन एवं उच्च प्राधिकारी (सांसद/राज्य नोडल) के निर्देशानुसार स्थल निरीक्षण',
    roleMinistryDesc: 'शीर्ष स्तरीय केंद्रीय निगरानी, राष्ट्रीय एमपीलैड्स नीतिगत नियमन एवं केंद्रीय सतर्कता ऑडिट',
    roleAgencyDesc: 'धरातलीय निर्माण कार्य निष्पादन, व्यय विवरण एवं प्रगति रिपोर्ट अद्यतन करने हेतु',
    roleCdoDesc: 'कार्यपालक प्रशासन, भौतिक सत्यापन एवं नागरिक साक्ष्य प्रमाणीकरण',
    roleEngineerDesc: 'तकनीकी पर्यवेक्षण एवं निर्माण माप',
    roleAdminDesc: 'संपूर्ण प्रणाली प्रबंधन एवं पोर्टल सेटिंग्स',
    roleGuestDesc: 'सार्वजनिक पारदर्शिता मंच · ऑन-साइट फोटो प्रमाण अपलोड करें एवं व्यय देखें',

    dmInspectionDirectiveTitle: 'उच्च प्राधिकारी स्थल निरीक्षण निर्देश',
    dmInspectionDirectiveDesc: 'सांसद (MP) / राज्य नोडल प्राधिकरण (SNA) / मंत्रालय के आदेशानुसार जिलाधिकारी (DM) को अनिवार्य धरातलीय स्थल निरीक्षण करने का निर्देश।',
    dmRecordInspectionBtn: 'जिलाधिकारी द्वारा स्थल निरीक्षण दर्ज करें',
    dmInspectedBadge: 'जिलाधिकारी (DM) द्वारा स्थल निरीक्षण संपन्न ✔️',
    dmInspectedNotice: 'उच्च प्राधिकारी के निर्देशानुसार जिलाधिकारी द्वारा स्थल निरीक्षण संपन्न। अनुपालन सत्यापित।',
    mpPriorityStar: '⭐ सांसद प्राथमिकता सतर्कता स्टार',
    snaPriorityStar: '⭐ राज्य नोडल प्राधिकरण निर्देश',
    starActionByAuthority: 'प्राथमिकता सतर्कता स्टार लगाएं',
    sendNoticeByAuthority: 'जिलाधिकारी एवं कार्यदायी संस्था को सांविधिक नोटिस भेजें',

    officialEmail: 'आधिकारिक ईमेल आईडी',
    emailPlaceholder: 'dm.ghaziabad@up.gov.in',
    selectRole: 'पद / प्रशासनिक भूमिका चुनें',
    sendOtp: 'ओटीपी (OTP) भेजें',
    otpSentTo: 'ओटीपी प्रेषित किया गया:',
    demoOtpMsg: 'डेमो कोड:',
    enterOtp: 'ओटीपी दर्ज करें',
    otpPlaceholder: '6-अंकों का कोड',
    verifyAndEnter: 'सत्यापित करें और पोर्टल में प्रवेश करें',
    changeEmailOrRole: 'ईमेल या भूमिका बदलें',

    sanctionedFund: 'कुल स्वीकृत धनराशि',
    released100: '100% जारी',
    actualExpenditure: 'वास्तविक व्यय धनराशि',
    overrunDetected: 'अतिरिक्त लागत दर्ज',
    utilized: 'उपयोगित',
    sanctionedWorks: 'स्वीकृत विकास कार्य',
    ghaziabadRegion: 'गाजियाबाद जनपद',
    aiCriticalRiskFlags: 'एआई गंभीर जोखिम अलर्ट',
    immediateAuditReq: 'तत्काल ऑडिट आवश्यक',
    allClear: 'सभी कार्य सामान्य',

    projectsMonitoringTitle: 'सक्रिय निगरानी में विकास परियोजनाएं · गाजियाबाद',
    projectsMonitoringCdoSub: 'प्राथमिकता सतर्कता या सांसद निरीक्षण आदेश हेतु स्टार आइकन पर क्लिक करें।',
    projectsMonitoringGenSub: 'स्वर्ण सितारे सांसद द्वारा निरीक्षण एवं उच्च प्राथमिकता सतर्कता दर्शाते हैं।',
    searchPlaceholder: 'परियोजना का नाम, एजेंसी, स्थान खोजें...',
    filterAll: 'सभी',
    filterCdoStarred: '⭐ सांसद द्वारा निरीक्षण',
    filterFlagged: 'चिह्नित',
    filterOngoing: 'प्रगति पर',
    filterCompleted: 'पूर्ण कार्य',
    filterStalled: 'अवरुद्ध / रुका हुआ',
    colStar: '⭐',
    colProject: 'परियोजना का नाम',
    colSector: 'विभाग / क्षेत्र',
    colSanctioned: 'स्वीकृत राशि',
    colSpent: 'व्यय राशि',
    colStatus: 'स्थिति',
    noProjectsMatch: 'आपकी खोज से कोई परियोजना मेल नहीं खाती।',

    riskCenterTitle: 'एआई उच्च जोखिम एवं विसंगति केंद्र',
    riskCenterSub: 'बजट वृद्धि, अत्यधिक विलंब और भौतिक प्रगति में विसंगतियों के लिए उच्च प्राथमिकता सतर्कता चेतावनी।',
    criticalThreatProjects: 'अति गंभीर जोखिम परियोजनाएं',
    flaggedCountBadge: 'चिह्नित',
    aiFlaggedAnomaliesTitle: 'एआई इंजन द्वारा चिह्नित विसंगतियां',
    executiveActiveNoticeNote: 'कार्यकारी अधिकार सक्रिय: सांसद, नोडल प्राधिकरण एवं जिला मजिस्ट्रेट सीधे नोटिस व निरीक्षण आदेश जारी कर सकते हैं।',
    viewOnlyNoticeNote: 'केवल-देखने योग्य मोड: केवल अधिकृत प्रशासनिक अधिकारी ही नोटिस जारी कर सकते हैं।',
    cdoStarVigilance: 'सांसद द्वारा निरीक्षण',
    statutoryNoticeActive: 'सांविधिक नोटिस जारी',
    putCdoStar: '⭐ सांसद द्वारा निरीक्षण',
    starFlagged: 'सांसद द्वारा निरीक्षण ⭐',
    sendNotice: 'कारण बताओ नोटिस भेजें',
    noticeIssued: 'नोटिस जारी 📩',
    detailsBtn: 'विस्तृत विवरण',
    spatialGisTitle: 'क्या स्थानिक जीआईएस (GIS) मानचित्र देखना चाहते हैं?',
    spatialGisSub: 'साइट पिन वितरण और भौगोलिक स्थिति देखने के लिए रीयल-टाइम जीआईएस मानचित्र पर जाएं।',
    goTo4kMap: '4K जीआईएस मानचित्र पर जाएं',
    noAnomaliesDetectedMsg: 'कोई विसंगति नहीं मिली। सभी परियोजनाएं निर्धारित मानकों के अनुरूप हैं।',

    locationLabel: 'स्थान',
    sectorLabel: 'क्षेत्र / विभाग',
    implementingAgencyLabel: 'कार्यदायी संस्था / ठेकेदार',
    timelineLabel: 'समय-सीमा',
    createdLabel: 'स्वीकृति तिथि',
    coordinatesLabel: 'जीपीएस निर्देशांक',
    budgetBreakdown: 'बजट एवं व्यय विवरण',
    sanctionedLabel: 'स्वीकृत राशि',
    spentLabel: 'व्यय राशि',
    utilizationLabel: 'उपयोगिता दर',
    projectDetailsTitle: 'परियोजना का विवरण',
    timelineAnalysisTitle: 'समय-सीमा एवं विलंब विश्लेषण',
    aiRiskAssessmentTitle: 'एआई जोखिम मूल्यांकन',
    scoreLabel: 'जोखिम स्कोर',
    statutoryExecutiveOrdersTitle: 'सांविधिक कार्यकारी आदेश',
    viewOnlyBadge: 'केवल दृश्य',
    dispatchShowCauseNotice: 'कारण बताओ नोटिस प्रेषित करें',
    noticeDispatched: 'नोटिस प्रेषित 📩',
    cdoExecutiveAuthority: 'प्राधिकारी निरीक्षण निर्देश',
    cdoStarDescActive: 'सांसद द्वारा निरीक्षण हेतु चिह्नित: कार्यदायी संस्था को सांविधिक नोटिस प्रेषित।',
    cdoStarDescInactive: 'सांसद द्वारा निरीक्षण का आदेश देने एवं नोटिस जारी करने के लिए स्टार लगाएं।',
    removeStarBtn: 'स्टार हटाएं',
    addCdoStarBtn: 'सांसद द्वारा निरीक्षण ⭐',
    citizenProofsForProject: 'जन सुनवाई नागरिक धरातलीय साक्ष्य',
    submittedByLabel: 'प्रस्तुतकर्ता:',
    progressLabel: 'भौतिक प्रगति',
    overEstimatedTimeline: 'अनुमानित समय से अधिक विलंब',
    underEstimatedTimeline: 'समय से पूर्व प्रगति पर',

    agenciesTitle: 'कार्यदायी संस्था एवं ठेकेदार स्कोरकार्ड',
    agenciesSubtitle: 'गाजियाबाद के सभी ठेकेदारों और कार्यदायी संस्थाओं का ऑडिट प्रदर्शन, निधि उपयोग और धरातलीय रिकॉर्ड।',
    totalAgenciesMonitored: 'कुल संस्थाएं / ठेकेदार',
    highDefaultWatch: 'उच्च डिफ़ॉल्ट निगरानी',
    totalSanctionedCr: 'कुल स्वीकृत धनराशि',
    totalSpentCr: 'कुल व्यय धनराशि',
    avgOverrunPct: 'औसत अतिरिक्त लागत',
    avgDelayDays: 'औसत विलंब (दिन)',
    daysOverdueLabel: 'दिन का विलंब',
    performanceGradeLabel: 'प्रदर्शन ग्रेड',
    riskLevelLabel: 'जोखिम स्तर',
    projectsCountLabel: 'परियोजनाएं',
    citizenReportsCountLabel: 'नागरिक रिपोर्टें',
    viewProjectsBtn: 'परियोजनाएं देखें',
    agencySearchPlaceholder: 'ठेकेदार या कार्यदायी संस्था खोजें...',
    agencyTabAll: 'सभी संस्थाएं',
    agencyTabCritical: 'अति गंभीर जोखिम',
    agencyTabMedium: 'मध्यम निगरानी',
    agencyTabLow: 'संतोषजनक',
    agencyProjectsMonitored: 'परियोजनाएं निगरानीधीन',
    agencyPhotoAudits: 'नागरिक फोटो ऑडिट',
    agencySanctioned: 'स्वीकृत',
    agencySpent: 'व्यय',
    agencyUtilization: 'उपयोगिता',
    agencyAvgExecutionDelay: 'औसत कार्य विलंब:',
    agencyDaysOverdue: 'दिन विलंबित',
    agencyOnSchedule: 'समय पर',
    agencyAvgCostOverrun: 'औसत अतिरिक्त लागत:',
    agencyOverBudget: 'बजट से अधिक',
    agencyWithinBudget: 'बजट के भीतर',
    agencyVigilanceFlags: 'सतर्कता फ्लैग्स:',
    agencyFlagged: 'चिह्नित',
    agencyStalled: 'अवरुद्ध',
    agencyCompleted: 'पूर्ण',
    agencyAssignedWorks: 'आवंटित परियोजना कार्य',
    agencyClickToOpenDossier: 'डोजियर खोलने के लिए क्लिक करें',
    agencyNoMatches: 'आपकी खोज से कोई कार्यदायी संस्था मेल नहीं खाती।',
    gradeCriticalRisk: 'अति गंभीर जोखिम (F)',
    gradeModerateWatch: 'मध्यम निगरानी (C)',
    gradeSatisfactory: 'संतोषजनक (B)',
    gradeExemplary: 'उत्कृष्ट (A+)',

    citizenProofsTitle: 'जन सुनवाई धरातलीय फोटो सत्यापन',
    citizenProofsSubtitle: 'जीपीएस-टैग युक्त साइट तस्वीरों और भौतिक प्रगति निरीक्षणों के साथ सीधा जन निगरानी मंच।',
    submitGroundProofBtn: 'नया धरातलीय साक्ष्य दर्ज करें',
    totalFieldProofs: 'कुल धरातलीय साक्ष्य',
    cdoEndorsedCount: 'सीडीओ द्वारा प्रमाणित',
    filterAllProofs: 'सभी साक्ष्य',
    filterStalledSites: 'अवरुद्ध कार्य स्थल',
    filterSlowProgress: 'धीमी प्रगति',
    filterOnTrackSites: 'समय पर प्रगति',
    filterPoorQualitySites: 'खराब गुणवत्ता',
    filterCompletedSites: 'पूर्ण कार्य',
    upvoteBtn: 'उपयोगी / समर्थन',
    endorseCdoBtn: 'आधिकारिक प्रमाणीकरण (CDO)',
    endorsedByCdoBadge: 'सीडीओ प्रमाणित ✔️',
    submitPhotoFormTitle: 'धरातलीय सत्यापन फोटो प्रस्तुत करें',
    selectProjectLabel: 'परियोजना का चयन करें',
    yourNameLabel: 'आपका नाम / पद',
    submitAnonymouslyLabel: 'गुमनाम रूप से प्रस्तुत करें',
    observedStatusLabel: 'धरातल पर देखी गई वास्तविक स्थिति',
    estimatedProgressLabel: 'अनुमानित भौतिक प्रगति (%)',
    photoUrlLabel: 'साइट फोटो यूआरएल (URL)',
    remarksLabel: 'धरातलीय अवलोकन एवं विस्तृत विवरण',
    submitReportBtn: 'सत्यापन रिपोर्ट जमा करें',
    cancelBtn: 'रद्द करें',
    takeLivePhoto: 'लाइव ऑन-साइट कैमरा साक्ष्य',
    takeLivePhotoSub: 'गाजियाबाद में निर्माण स्थल से अपने डिवाइस कैमरे से लाइव फोटो लें।',
    snapLivePhoto: '📸 लाइव फोटो खींचे',
    cameraSourceLive: '📸 लाइव कैमरा',
    cameraSourceUpload: '📁 फाइल अपलोड करें',
    sampleSiteProof: 'या नमूना साइट साक्ष्य चुनें:',
    observedPhysicalCompletion: 'धरातलीय भौतिक पूर्णता (%)',
    currentGroundStatus: 'वर्तमान धरातलीय स्थिति *',
    specificLandmark: 'विशिष्ट स्थल / लैंडमार्क',
    detailedObservations: 'धरातलीय विस्तृत अवलोकन एवं टिप्पणी *',
    submitAsAnonymous: 'गुमनाम नागरिक के रूप में प्रस्तुत करें',
    yourNamePlaceholder: 'आपका नाम (उदा. सुनील कुमार)',
    uploadingToServer: 'सर्वर पर फोटो अपलोड हो रही है...',
    clickToZoom: 'बड़ा करके देखें',
    physicalProgress: 'भौतिक प्रगति:',
    citizenVerifiedCompletion: 'नागरिक सत्यापित पूर्णता',
    evidenceReportsCount: 'साक्ष्य रिपोर्टें (गाजियाबाद)',
    photoSourceMode: 'फोटो स्रोत मोड:',
    selectSite: 'निर्माण परियोजना स्थल चुनें *',
    cdoVerifiedBadge: 'सीडीओ सत्यापित',

    reportsTitle: 'आधिकारिक सतर्कता एवं ऑडिट रिपोर्ट्स',
    reportsSubtitle: 'कार्यकारी कारण बताओ ज्ञापन निर्माण, निर्यात लॉग और सांविधिक ऑडिट दस्तावेज।',
    statutoryMemoTitle: 'सांविधिक कार्यकारी कारण बताओ ज्ञापन',
    selectProjectForMemo: 'ज्ञापन जारी करने हेतु परियोजना चुनें',
    copyMemoBtn: 'ज्ञापन कॉपी करें',
    memoCopiedBtn: 'क्लिपबोर्ड पर कॉपी किया गया!',
    printDirectiveBtn: 'आदेश प्रिंट करें',
    exportCsvBtn: 'सीएसवी (CSV) ऑडिट लॉग डाउनलोड करें',
    monitoredJurisdiction: 'निगरानी क्षेत्र',
    sanctionedOutlay: 'कुल स्वीकृत बजट',
    fundUtilization: 'निधि आहरण एवं उपयोग',
    criticalRiskProjects: 'अति गंभीर जोखिम परियोजनाएं',
    priorityVigilanceCases: 'प्राथमिकता सतर्कता मामले',
    inspectAuditDossier: 'ऑडिट डोजियर की जांच करें',
    showCauseGenerator: 'सांविधिक कार्यकारी कारण बताओ कानूनी ज्ञापन',
    showCauseSub: 'उत्तर प्रदेश जिला प्रशासनिक सतर्कता निर्देशों के तहत निर्मित',
    officialSeal: 'कार्यालय जिलाधिकारी एवं मुख्य विकास अधिकारी · गाजियाबाद कलेक्ट्रेट',
    copyStatutoryMemo: 'सांविधिक ज्ञापन कॉपी करें',
    copiedToClipboard: 'क्लिपबोर्ड पर कॉपी किया गया!',
    downloadCsv: 'वित्तीय एवं सतर्कता ऑडिट सीएसवी (CSV) डाउनलोड करें',

    aiAssistantTitle: 'एमपीलैड्स सतर्कता एआई सहायक',
    aiAssistantSubtitle: 'परियोजनाओं, विसंगति दरों, अतिरिक्त लागत और ठेकेदारों के बारे में सरल हिंदी या अंग्रेजी में प्रश्न पूछें।',
    aiInputPlaceholder: "एआई से पूछें: 'किस साइट पर सबसे ज्यादा विसंगति है?' या 'लोनी प्रोजेक्ट की स्थिति'...",
    askAiBtn: 'एआई से पूछें',
    suggestedQueriesTitle: 'सुझाए गए प्रश्न',
    keyFindingsTitle: 'मुख्य निष्कर्ष',
    recommendedActionTitle: 'अनुशंसित प्रशासनिक कार्रवाई',
    matchedProjectsTitle: 'संबंधित परियोजनाएं',
    floatingAiBtnText: 'सतर्कता एआई',

    sectorDistributionTitle: 'क्षेत्रवार बजट आवंटन एवं उपयोगिता',
    loadingScores: 'ठेकेदार स्कोरकार्ड एवं रिकॉर्ड लोड हो रहे हैं...',

    statusOngoing: 'प्रगति पर',
    statusCompleted: 'पूर्ण',
    statusStalled: 'अवरुद्ध',
    statusFlagged: 'चिह्नित',
    severityCritical: 'अति गंभीर (CRITICAL)',
    severityMedium: 'मध्यम (MEDIUM)',
    severityLow: 'निम्न (LOW)',
  },
};
