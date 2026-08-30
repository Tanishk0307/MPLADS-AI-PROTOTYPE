import { useEffect, useState, useCallback } from 'react';
import { api, type DashboardMetrics } from '@/lib/api';
import type { Project, Sector, Constituency } from '@/types/database';
import { FALLBACK_PROJECTS, FALLBACK_SECTORS, FALLBACK_CONSTITUENCY } from '@/lib/fallbackData';

export interface DashboardData {
  projects: Project[];
  sectors: Sector[];
  constituency: Constituency | null;
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboardData(): DashboardData {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [sectors, setSectors] = useState<Sector[]>(FALLBACK_SECTORS);
  const [constituency, setConstituency] = useState<Constituency | null>(FALLBACK_CONSTITUENCY);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [projData, secData, constData, metricsData] = await Promise.all([
        api.getProjects().catch(() => FALLBACK_PROJECTS),
        api.getSectors().catch(() => FALLBACK_SECTORS),
        api.getConstituency().catch(() => FALLBACK_CONSTITUENCY),
        api.getDashboard().catch(() => null),
      ]);

      if (projData && projData.length > 0) setProjects(projData);
      if (secData && secData.length > 0) setSectors(secData);
      if (constData) setConstituency(constData);
      if (metricsData) setMetrics(metricsData);
    } catch {
      // Gracefully retain fallback datasets
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, sectors, constituency, metrics, loading, error, refresh: load };
}

