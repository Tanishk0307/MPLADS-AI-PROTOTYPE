export type ProjectStatus = 'ongoing' | 'completed' | 'stalled' | 'flagged';

export type AnomalyType =
  | 'cost_overrun'
  | 'geo_duplicate'
  | 'timeline_delay'
  | 'vendor_irregular'
  | 'fund_diversion';

export type Severity = 'LOW' | 'MEDIUM' | 'CRITICAL';

export interface Sector {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

export interface Constituency {
  id: string;
  name: string;
  state: string;
  mp_name: string | null;
  district: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  sector_id: string | null;
  constituency_id: string | null;
  sanctioned_amount_cr: number; // stored as lakhs
  spent_amount_cr: number; // stored as lakhs
  status: ProjectStatus;
  latitude: number | null;
  longitude: number | null;
  benchmark_amount_cr: number | null;
  estimated_days: number | null;
  actual_days: number | null;
  implementing_agency: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  sector?: Sector;
  constituency?: Constituency;
}

export interface AnomalyResult {
  projectId: string;
  title: string;
  location: string;
  sector: string;
  sanctioned: number;
  spent: number;
  riskScore: number;
  severity: Severity;
  reasons: string[];
  coords: [number, number] | null;
  implementingAgency: string | null;
}

export type CitizenWorkStatus = 'on_track' | 'stalled' | 'slow' | 'poor_quality' | 'completed';

export interface CitizenProofReport {
  id: string;
  projectId: string;
  projectName: string;
  location: string;
  citizenName: string;
  isAnonymous: boolean;
  imageUrl: string;
  progressPercentage: number;
  workStatus: CitizenWorkStatus;
  remarks: string;
  upvotes: number;
  verifiedByCdo: boolean;
  submittedAt: string;
  geoLat?: number;
  geoLng?: number;
}

export type UserRole = 'MP' | 'SNA' | 'DM' | 'Ministry' | 'Agency' | 'CDO' | 'Engineer' | 'Admin' | 'Guest';

export interface User {
  email: string;
  role: UserRole;
}

export interface AgencyScorecardItem {
  agency_name: string;
  total_projects: number;
  total_sanctioned_cr: number;
  total_spent_cr: number;
  utilization_percent: number;
  avg_delay_days: number;
  avg_cost_overrun_pct: number;
  flagged_count: number;
  stalled_count: number;
  completed_count: number;
  citizen_proofs_count: number;
  performance_grade: string; // 'Exemplary (A+)' | 'Satisfactory (B)' | 'Moderate Watch (C)' | 'Critical Risk (F)'
  risk_level: 'LOW' | 'MEDIUM' | 'CRITICAL';
}

export interface ExecutiveSummaryData {
  district: string;
  state: string;
  total_projects: number;
  total_sanctioned_cr: number;
  total_spent_cr: number;
  utilization_percent: number;
  critical_risk_count: number;
  flagged_projects_count: number;
  top_risk_projects: {
    project_id: string;
    name: string;
    agency: string | null;
    severity: string;
    risk_score: number;
    reasons: string[];
  }[];
  generated_at: string;
}

export interface MatchedProject {
  id: string;
  name: string;
  location: string | null;
  sector: string | null;
  sanctioned_amount_cr: number;
  spent_amount_cr: number;
  status: string;
  agency: string | null;
  risk_level: string | null;
  risk_score?: number;
  overrun_pct?: number;
  delay_days?: number;
}

export interface AIQueryResult {
  answer: string;
  key_findings: string[];
  matched_projects: MatchedProject[];
  recommended_action: string | null;
}
