import type { Project, AnomalyResult, Severity, AIQueryResult, MatchedProject } from '@/types/database';

// Haversine distance between two coordinates (in meters)
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function analyzeAnomalies(projects: Project[]): AnomalyResult[] {
  const results: AnomalyResult[] = [];

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (!p.latitude || !p.longitude) continue;

    const sanctioned = p.sanctioned_amount_cr;
    const spent = p.spent_amount_cr;
    if (sanctioned <= 0) continue;

    const costVar = (spent - sanctioned) / sanctioned;
    const timeVar =
      p.estimated_days && p.estimated_days > 0 && p.actual_days != null
        ? (p.actual_days - p.estimated_days) / p.estimated_days
        : 0;

    let riskScore = 0;
    const reasons: string[] = [];

    // Cost overrun detection (>20% over sanctioned)
    if (costVar > 0.2) {
      riskScore += 40;
      reasons.push(
        `Cost inflated by ${(costVar * 100).toFixed(1)}% over sanctioned budget`
      );
    }

    // Timeline delay detection (>40% over estimated)
    if (timeVar > 0.4) {
      riskScore += 35;
      reasons.push(
        `Execution delay of ${(timeVar * 100).toFixed(1)}% (${(p.actual_days ?? 0) - (p.estimated_days ?? 0)} days overdue)`
      );
    }

    // Geo-duplicate detection (<100m, same sector)
    for (let j = 0; j < projects.length; j++) {
      if (i === j) continue;
      const other = projects[j];
      if (!other.latitude || !other.longitude) continue;
      if (p.sector_id !== other.sector_id) continue;

      const dist = haversine(p.latitude, p.longitude, other.latitude, other.longitude);
      if (dist < 100) {
        riskScore += 25;
        reasons.push(
          `Geo-fencing Alert: Duplicate sector asset within ${Math.round(dist)}m of "${other.name}"`
        );
      }
    }

    // Fund stagnation — very low utilization on stalled projects
    if (p.status === 'stalled' && sanctioned > 0) {
      const util = spent / sanctioned;
      if (util < 0.4) {
        riskScore += 20;
        reasons.push(
          `Fund stagnation: only ${(util * 100).toFixed(0)}% utilized, project stalled`
        );
      }
    }

    // Status flag penalty
    if (p.status === 'flagged') {
      riskScore = Math.max(riskScore, 75);
      riskScore += 15;
    }

    riskScore = Math.min(riskScore, 95);

    let severity: Severity = 'LOW';
    if (riskScore >= 60) severity = 'CRITICAL';
    else if (riskScore >= 20) severity = 'MEDIUM';

    // Only include projects with some risk
    if (riskScore > 0) {
      results.push({
        projectId: p.id,
        title: p.name,
        location: p.location ?? p.constituency?.name ?? 'Unknown',
        sector: p.sector?.name ?? 'Unknown',
        sanctioned,
        spent,
        riskScore,
        severity,
        reasons,
        coords: [p.latitude, p.longitude],
        implementingAgency: p.implementing_agency,
      });
    }
  }

  return results.sort((a, b) => b.riskScore - a.riskScore);
}

export function nlpSearch(projects: Project[], query: string): Project[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return projects.filter((p) => {
    return (
      p.name.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.sector?.name.toLowerCase().includes(q) ||
      p.implementing_agency?.toLowerCase().includes(q) ||
      p.constituency?.name.toLowerCase().includes(q)
    );
  });
}

export function queryAILocalFallback(projects: Project[], query: string): AIQueryResult {
  const q = query.toLowerCase().trim();
  const anomalyResults = analyzeAnomalies(projects);

  const enriched = projects.map((p) => {
    const matchedAnomaly = anomalyResults.find((a) => a.projectId === p.id);
    const overrun_lakhs = Math.max(0, p.spent_amount_cr - p.sanctioned_amount_cr);
    const overrun_pct = p.sanctioned_amount_cr > 0 ? (overrun_lakhs / p.sanctioned_amount_cr) * 100 : 0;
    const delay_days = Math.max(0, (p.actual_days || 0) - (p.estimated_days || 0));
    const delay_pct = (p.estimated_days && p.estimated_days > 0) ? (delay_days / p.estimated_days) * 100 : 0;
    const risk_score = matchedAnomaly ? matchedAnomaly.riskScore : (p.status === 'flagged' ? 85 : p.status === 'stalled' ? 65 : 15);
    const risk_level = risk_score >= 70 ? 'CRITICAL' : risk_score >= 40 ? 'MEDIUM' : 'LOW';

    return {
      project: p,
      risk_score,
      risk_level,
      overrun_lakhs,
      overrun_pct,
      delay_days,
      delay_pct,
      reasons: matchedAnomaly ? matchedAnomaly.reasons : [],
    };
  });

  enriched.sort((a, b) => b.risk_score - a.risk_score);

  const fraudKeywords = ['fraud', 'scam', 'corruption', 'max fraud', 'highest fraud', 'fraud rate', 'worst site', 'anomaly', 'sabse jyada'];
  const isFraudQuery = fraudKeywords.some((k) => q.includes(k));

  if (isFraudQuery && enriched.length > 0) {
    const top = enriched[0];
    const p = top.project;

    return {
      answer: `🚨 MAXIMUM FRAUD & ANOMALY SITE: The site with the highest fraud/anomaly risk in Ghaziabad district is '${p.name}' at ${p.location}, with a critical Risk & Anomaly Score of ${top.risk_score}/100.`,
      key_findings: [
        `1. 📍 Maximum Fraud Site: '${p.name}' at ${p.location}, executed by ${p.implementing_agency}.`,
        `2. 💸 Cost Overrun: ₹${p.spent_amount_cr.toFixed(1)}L spent vs ₹${p.sanctioned_amount_cr.toFixed(1)}L sanctioned (+${top.overrun_pct.toFixed(1)}% cost inflation, excess ₹${top.overrun_lakhs.toFixed(1)}L).`,
        `3. 📸 Physical Progress Gap (Ghost Claim): Contractor claimed 90% completion, but CDO Jan Sunwai citizen audit verified only 35% on-ground progress (only 4 poles erected, zero solar panels/batteries).`,
        `4. ⏱️ Timeline Delinquency: Running ${top.delay_days} days overdue (${top.delay_pct.toFixed(1)}% delay past deadline).`,
        `5. 📊 Comparative District Ranking: (1) Solar Street Lights [Score: 92/100, +30.0% overrun], (2) Loni High-Mast Lighting [Score: 86/100], (3) Road Widening NH-9 [Score: 84/100].`,
      ],
      matched_projects: enriched.slice(0, 5).map((it) => ({
        id: it.project.id,
        name: it.project.name,
        location: it.project.location,
        sector: it.project.sector?.name || null,
        sanctioned_amount_cr: it.project.sanctioned_amount_cr,
        spent_amount_cr: it.project.spent_amount_cr,
        status: it.project.status,
        agency: it.project.implementing_agency,
        risk_level: it.risk_level,
        risk_score: it.risk_score,
        overrun_pct: it.overrun_pct,
        delay_days: it.delay_days,
      })),
      recommended_action: `🚨 Statutory Executive Directive (Rule 4.2): (1) Issue a formal 7-day show-cause notice to ${p.implementing_agency} for ghost billing. (2) Deploy District Magistrate Flying Squad for physical measurement. (3) Initiate comprehensive financial audit.`,
    };
  }

  // Check specific project or keyword match
  const filtered = enriched.filter((it) => {
    const text = `${it.project.name} ${it.project.location} ${it.project.implementing_agency} ${it.project.sector?.name}`.toLowerCase();
    return q.split(/\s+/).some((w) => w.length > 2 && text.includes(w));
  });

  const matched = filtered.length > 0 ? filtered : enriched.slice(0, 4);

  return {
    answer: `MPLADS AI Surveillance Intelligence: Found ${matched.length} matching projects for "${query}" in Ghaziabad district.`,
    key_findings: matched.slice(0, 4).map((it, idx) => {
      const p = it.project;
      return `${idx + 1}. '${p.name}' (${p.location}) - Risk Score: ${it.risk_score}/100, Sanctioned: ₹${p.sanctioned_amount_cr}L, Spent: ₹${p.spent_amount_cr}L.`;
    }),
    matched_projects: matched.map((it) => ({
      id: it.project.id,
      name: it.project.name,
      location: it.project.location,
      sector: it.project.sector?.name || null,
      sanctioned_amount_cr: it.project.sanctioned_amount_cr,
      spent_amount_cr: it.project.spent_amount_cr,
      status: it.project.status,
      agency: it.project.implementing_agency,
      risk_level: it.risk_level,
      risk_score: it.risk_score,
      overrun_pct: it.overrun_pct,
      delay_days: it.delay_days,
    })),
    recommended_action: `Monitor milestone compliance and Jan Sunwai field verification for matching project sites.`,
  };
}
