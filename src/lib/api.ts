import type {
  Project,
  Sector,
  Constituency,
  CitizenProofReport,
  CitizenWorkStatus,
} from '@/types/database';

export interface DashboardMetrics {
  total_projects: number;
  total_sanctioned_amount_cr: number;
  total_spent_amount_cr: number;
  utilization_percent: number;
  critical_risk_count: number;
  medium_risk_count: number;
  projects_by_status: {
    ongoing: number;
    completed: number;
    stalled: number;
    flagged: number;
  };
  last_updated_at: string;
}

export interface AlertItem {
  id: string;
  project_id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
  title: string;
  description: string;
  metric_value?: number;
  detected_at: string;
  resolved: boolean;
  risk_score: number;
  reasons: string[];
}

export interface NewCitizenProofPayload {
  projectId: string;
  projectName: string;
  location: string;
  citizenName: string;
  isAnonymous?: boolean;
  imageUrl: string;
  progressPercentage: number;
  workStatus: CitizenWorkStatus;
  remarks: string;
  geoLat?: number;
  geoLng?: number;
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
  performance_grade: string;
  risk_level: 'LOW' | 'MEDIUM' | 'CRITICAL';
}

export interface AIQueryResponse {
  answer: string;
  key_findings: string[];
  matched_projects: {
    id: string;
    name: string;
    location: string | null;
    sector: string | null;
    sanctioned_amount_cr: number;
    spent_amount_cr: number;
    status: string;
    agency: string | null;
    risk_level: string | null;
  }[];
  recommended_action: string | null;
}

export interface ExecutiveSummaryResponse {
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

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; service: string }>('/health'),

  // Projects
  getProjects: async (params?: { status?: string; search?: string }): Promise<Project[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    const queryString = searchParams.toString();
    const res = await request<{ data: Project[] }>(`/projects${queryString ? `?${queryString}` : ''}`);
    return res.data;
  },

  getProjectById: (id: string): Promise<Project> => request<Project>(`/projects/${id}`),

  starProject: (id: string, starred?: boolean) =>
    request<{ success: boolean; data: { project_id: string; is_starred: boolean } }>(`/projects/${id}/star`, {
      method: 'POST',
      body: JSON.stringify({ starred }),
    }),

  toggleProjectStar: (id: string, starred?: boolean) =>
    request<{ success: boolean; data: { project_id: string; is_starred: boolean } }>(`/projects/${id}/star`, {
      method: 'POST',
      body: JSON.stringify({ starred }),
    }),

  noticeProject: (id: string) =>
    request<{ success: boolean; data: { project_id: string; is_noticed: boolean; agency: string } }>(
      `/projects/${id}/notice`,
      { method: 'POST' }
    ),

  sendProjectNotice: (id: string) =>
    request<{ success: boolean; data: { project_id: string; is_noticed: boolean; agency: string } }>(
      `/projects/${id}/notice`,
      { method: 'POST' }
    ),

  // Sectors & Constituency
  getSectors: async (): Promise<Sector[]> => {
    const res = await request<{ data: Sector[] }>('/sectors');
    return res.data;
  },

  getConstituency: (): Promise<Constituency> => request<Constituency>('/constituency'),

  // Dashboard Metrics
  getDashboard: (): Promise<DashboardMetrics> => request<DashboardMetrics>('/dashboard'),

  // Alerts
  getAlerts: async (params?: { severity?: string; resolved?: boolean }): Promise<AlertItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.severity) searchParams.set('severity', params.severity);
    if (params?.resolved !== undefined) searchParams.set('resolved', String(params.resolved));
    const queryString = searchParams.toString();
    const res = await request<{ data: AlertItem[] }>(`/alerts${queryString ? `?${queryString}` : ''}`);
    return res.data;
  },

  // Citizen Proofs
  getCitizenProofs: async (projectId?: string): Promise<CitizenProofReport[]> => {
    const query = projectId ? `?project_id=${encodeURIComponent(projectId)}` : '';
    const res = await request<{ data: CitizenProofReport[] }>(`/citizen-proofs${query}`);
    return res.data;
  },

  createCitizenProof: (payload: NewCitizenProofPayload): Promise<CitizenProofReport> =>
    request<CitizenProofReport>('/citizen-proofs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  upvoteCitizenProof: (proofId: string): Promise<CitizenProofReport> =>
    request<CitizenProofReport>(`/citizen-proofs/${proofId}/upvote`, {
      method: 'POST',
    }),

  verifyCitizenProof: (proofId: string, verified = true): Promise<CitizenProofReport> =>
    request<CitizenProofReport>(`/citizen-proofs/${proofId}/verify?verified=${verified}`, {
      method: 'POST',
    }),

  // File Upload
  uploadFile: async (file: File): Promise<{ url: string; filename: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.text().catch(() => '');
      throw new Error(`Upload error (${response.status}): ${err || response.statusText}`);
    }
    return response.json();
  },

  // AI Natural Language Query
  queryAI: (query: string): Promise<AIQueryResponse> =>
    request<AIQueryResponse>('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // Reports & Export
  getExecutiveSummary: (): Promise<ExecutiveSummaryResponse> => request<ExecutiveSummaryResponse>('/reports/summary'),

  getExportCsvUrl: (): string => `${API_BASE}/reports/export`,

  // Agency Scorecards
  getAgencyScorecard: async (): Promise<AgencyScorecardItem[]> => {
    const res = await request<{ data: AgencyScorecardItem[]; count: number }>('/agencies/scorecard');
    return res.data;
  },
};
