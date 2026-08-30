import { useEffect, useState, useCallback } from 'react';
import { api, type DashboardMetrics } from '@/lib/api';
import type { Project, Sector, Constituency } from '@/types/database';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [constituency, setConstituency] = useState<Constituency | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [projData, secData, constData, metricsData] = await Promise.all([
        api.getProjects(),
        api.getSectors().catch(() => []),
        api.getConstituency().catch(() => null),
        api.getDashboard().catch(() => null),
      ]);

      setProjects(projData);
      setSectors(secData);
      setConstituency(constData);
      setMetrics(metricsData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to surveillance backend API';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, sectors, constituency, metrics, loading, error, refresh: load };
}
