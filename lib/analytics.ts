import type { AdvisorWithProfile, ClientWithNeeds, AdvisorSkill } from '@/types/database';

// ============================================================================
// CAPACITY ANALYTICS
// ============================================================================

export interface CapacityInsights {
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  advisorsAtCapacity: number;
  advisorsNearCapacity: number;
  projectedCapacityIn30Days: number;
  projectedCapacityIn90Days: number;
  recommendations: string[];
}

export function analyzeTeamCapacity(
  advisors: AdvisorWithProfile[],
  historicalGrowthRate = 0.05 // 5% monthly growth default
): CapacityInsights {
  const totalCapacity = advisors.reduce((sum, a) => sum + a.max_families, 0);
  const usedCapacity = advisors.reduce((sum, a) => sum + a.current_families, 0);
  const availableCapacity = totalCapacity - usedCapacity;
  const utilizationRate = (usedCapacity / totalCapacity) * 100;
  
  const advisorsAtCapacity = advisors.filter(
    a => a.capacityPercentage >= 100
  ).length;
  
  const advisorsNearCapacity = advisors.filter(
    a => a.capacityPercentage >= 80 && a.capacityPercentage < 100
  ).length;
  
  // Project capacity assuming linear growth
  const monthlyGrowth = usedCapacity * historicalGrowthRate;
  const projectedCapacityIn30Days = Math.max(0, availableCapacity - monthlyGrowth);
  const projectedCapacityIn90Days = Math.max(0, availableCapacity - (monthlyGrowth * 3));
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (utilizationRate >= 90) {
    recommendations.push('URGENT: Team is at very high capacity. Consider hiring immediately.');
  } else if (utilizationRate >= 80) {
    recommendations.push('Team approaching capacity. Begin recruitment process.');
  }
  
  if (advisorsAtCapacity > 0) {
    recommendations.push(`${advisorsAtCapacity} advisor(s) at full capacity. Redistribute workload.`);
  }
  
  if (projectedCapacityIn90Days <= 5) {
    recommendations.push('Projected capacity will be critical in 90 days. Plan for expansion.');
  }
  
  if (availableCapacity > totalCapacity * 0.4) {
    recommendations.push('Good capacity buffer. Continue current growth trajectory.');
  }
  
  return {
    totalCapacity,
    usedCapacity,
    availableCapacity,
    utilizationRate: Math.round(utilizationRate * 10) / 10,
    advisorsAtCapacity,
    advisorsNearCapacity,
    projectedCapacityIn30Days: Math.round(projectedCapacityIn30Days),
    projectedCapacityIn90Days: Math.round(projectedCapacityIn90Days),
    recommendations,
  };
}

// ============================================================================
// SKILL GAP ANALYSIS
// ============================================================================

export interface SkillGap {
  subtopicId: string;
  subtopicName: string;
  domainName: string;
  totalDemand: number;
  totalSupply: number;
  gap: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedClients: number;
  recommendations: string[];
}

export function analyzeSkillGaps(
  advisors: AdvisorWithProfile[],
  clients: ClientWithNeeds[]
): SkillGap[] {
  const skillMap = new Map<string, {
    subtopicId: string;
    subtopicName: string;
    domainName: string;
    demand: number[];
    supply: number[];
    clientCount: number;
  }>();
  
  // Aggregate demand from clients
  clients.forEach(client => {
    client.needs.forEach(need => {
      const key = need.subtopic_id;
      if (!skillMap.has(key)) {
        skillMap.set(key, {
          subtopicId: need.subtopic_id,
          subtopicName: need.subtopic?.name ?? 'Unknown',
          domainName: need.subtopic?.domain?.name ?? 'Unknown',
          demand: [],
          supply: [],
          clientCount: 0,
        });
      }
      const entry = skillMap.get(key)!;
      entry.demand.push(need.importance);
      entry.clientCount++;
    });
  });
  
  // Aggregate supply from advisors
  advisors.forEach(advisor => {
    advisor.skills?.forEach(skill => {
      const key = skill.subtopic_id;
      if (!skillMap.has(key)) {
        skillMap.set(key, {
          subtopicId: skill.subtopic_id,
          subtopicName: skill.subtopic?.name ?? 'Unknown',
          domainName: skill.subtopic?.domain?.name ?? 'Unknown',
          demand: [],
          supply: [],
          clientCount: 0,
        });
      }
      const entry = skillMap.get(key)!;
      entry.supply.push(skill.skill_level);
    });
  });
  
  // Calculate gaps
  const gaps: SkillGap[] = [];
  
  skillMap.forEach(data => {
    const avgDemand = data.demand.length > 0
      ? data.demand.reduce((a, b) => a + b, 0) / data.demand.length
      : 0;
      
    const avgSupply = data.supply.length > 0
      ? data.supply.reduce((a, b) => a + b, 0) / data.supply.length
      : 0;
      
    const gap = avgDemand - avgSupply;
    
    // Only include actual gaps
    if (gap > 0) {
      const severity = 
        gap >= 4 ? 'critical' :
        gap >= 3 ? 'high' :
        gap >= 2 ? 'medium' : 'low';
      
      const recommendations: string[] = [];
      
      if (severity === 'critical') {
        recommendations.push(`CRITICAL: Hire specialist in ${data.subtopicName}`);
        recommendations.push(`Provide intensive training for existing advisors`);
      } else if (severity === 'high') {
        recommendations.push(`High priority training needed in ${data.subtopicName}`);
        recommendations.push(`Consider hiring or upskilling`);
      } else if (severity === 'medium') {
        recommendations.push(`Moderate gap - consider targeted training`);
      }
      
      gaps.push({
        subtopicId: data.subtopicId,
        subtopicName: data.subtopicName,
        domainName: data.domainName,
        totalDemand: Math.round(avgDemand * 10) / 10,
        totalSupply: Math.round(avgSupply * 10) / 10,
        gap: Math.round(gap * 10) / 10,
        severity,
        affectedClients: data.clientCount,
        recommendations,
      });
    }
  });
  
  // Sort by severity and gap size
  return gaps.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.gap - a.gap;
  });
}

// ============================================================================
// ADVISOR PERFORMANCE METRICS
// ============================================================================

export interface AdvisorPerformance {
  advisorId: string;
  advisorName: string;
  utilizationRate: number;
  skillDiversity: number; // Number of distinct skills
  avgSkillLevel: number;
  specializations: string[]; // Top skills
  recentAssessments: number; // Skills assessed in last 6 months
  dataQuality: 'excellent' | 'good' | 'needs_update';
  recommendations: string[];
}

export function analyzeAdvisorPerformance(
  advisor: AdvisorWithProfile
): AdvisorPerformance {
  const skills = advisor.skills ?? [];
  const skillDiversity = skills.length;
  
  const avgSkillLevel = skills.length > 0
    ? skills.reduce((sum, s) => sum + s.skill_level, 0) / skills.length
    : 0;
  
  // Find top 3 skills
  const topSkills = [...skills]
    .sort((a, b) => b.skill_level - a.skill_level)
    .slice(0, 3)
    .map(s => s.subtopic?.name ?? 'Unknown');
  
  // Check assessment freshness
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const recentAssessments = skills.filter(s => 
    s.last_assessed_at && new Date(s.last_assessed_at) > sixMonthsAgo
  ).length;
  
  const assessmentRate = skills.length > 0 
    ? (recentAssessments / skills.length) * 100 
    : 0;
  
  const dataQuality: 'excellent' | 'good' | 'needs_update' = 
    assessmentRate >= 80 ? 'excellent' :
    assessmentRate >= 50 ? 'good' : 'needs_update';
  
  const recommendations: string[] = [];
  
  if (advisor.capacityPercentage >= 95) {
    recommendations.push('At capacity - no new assignments recommended');
  } else if (advisor.capacityPercentage >= 80) {
    recommendations.push('Near capacity - carefully select new assignments');
  } else if (advisor.capacityPercentage < 50) {
    recommendations.push('Has good capacity - ready for new clients');
  }
  
  if (dataQuality === 'needs_update') {
    recommendations.push('Skill assessments need updating');
  }
  
  if (avgSkillLevel < 6) {
    recommendations.push('Consider additional training and development');
  }
  
  if (skillDiversity < 5) {
    recommendations.push('Limited skill diversity - consider broadening expertise');
  }
  
  return {
    advisorId: advisor.id,
    advisorName: advisor.profile?.full_name ?? 'Unknown',
    utilizationRate: advisor.capacityPercentage,
    skillDiversity,
    avgSkillLevel: Math.round(avgSkillLevel * 10) / 10,
    specializations: topSkills,
    recentAssessments,
    dataQuality,
    recommendations,
  };
}

// ============================================================================
// CLIENT COMPLEXITY SCORING
// ============================================================================

export interface ClientComplexityScore {
  clientId: string;
  clientName: string;
  complexityScore: number; // 0-100
  needsCount: number;
  highPriorityNeeds: number;
  avgImportance: number;
  avgUrgency: number;
  requiredExpertise: 'junior' | 'mid' | 'senior' | 'expert';
  recommendations: string[];
}

export function analyzeClientComplexity(
  client: ClientWithNeeds
): ClientComplexityScore {
  const needs = client.needs ?? [];
  const needsCount = needs.length;
  
  const highPriorityNeeds = needs.filter(
    n => n.importance >= 8 || n.urgency >= 8
  ).length;
  
  const avgImportance = needs.length > 0
    ? needs.reduce((sum, n) => sum + n.importance, 0) / needs.length
    : 0;
  
  const avgUrgency = needs.length > 0
    ? needs.reduce((sum, n) => sum + n.urgency, 0) / needs.length
    : 0;
  
  // Calculate complexity score (0-100)
  let complexityScore = 0;
  complexityScore += needsCount * 3; // More needs = more complex
  complexityScore += highPriorityNeeds * 8; // High priority needs increase complexity
  complexityScore += avgImportance * 2;
  complexityScore += avgUrgency * 2;
  
  // Segment and tier also affect complexity
  if (client.segment === 'ultra_hnw') complexityScore += 20;
  if (client.segment === 'private_client') complexityScore += 10;
  if (client.complexity_tier === 'highly_complex') complexityScore += 25;
  if (client.complexity_tier === 'complex') complexityScore += 15;
  
  complexityScore = Math.min(100, complexityScore);
  
  const requiredExpertise: 'junior' | 'mid' | 'senior' | 'expert' = 
    complexityScore >= 80 ? 'expert' :
    complexityScore >= 60 ? 'senior' :
    complexityScore >= 40 ? 'mid' : 'junior';
  
  const recommendations: string[] = [];
  
  if (complexityScore >= 80) {
    recommendations.push('Assign most experienced advisor');
    recommendations.push('Consider team-based approach');
  } else if (complexityScore >= 60) {
    recommendations.push('Requires senior advisor with relevant expertise');
  } else if (complexityScore >= 40) {
    recommendations.push('Suitable for mid-level advisor with supervision');
  } else {
    recommendations.push('Can be handled by any qualified advisor');
  }
  
  if (highPriorityNeeds > 3) {
    recommendations.push('Multiple urgent needs - prioritize quick matching');
  }
  
  return {
    clientId: client.id,
    clientName: client.name,
    complexityScore: Math.round(complexityScore),
    needsCount,
    highPriorityNeeds,
    avgImportance: Math.round(avgImportance * 10) / 10,
    avgUrgency: Math.round(avgUrgency * 10) / 10,
    requiredExpertise,
    recommendations,
  };
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

export interface TrendData {
  timestamp: Date;
  value: number;
}

export function calculateTrend(data: TrendData[]): {
  direction: 'up' | 'down' | 'stable';
  changePercent: number;
  prediction30Days: number;
} {
  if (data.length < 2) {
    return { direction: 'stable', changePercent: 0, prediction30Days: data[0]?.value ?? 0 };
  }
  
  // Simple linear regression for trend
  const xValues = data.map((_, i) => i);
  const yValues = data.map(d => d.value);
  
  const n = data.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Predict 30 days out (assuming each data point is ~1 day)
  const prediction30Days = slope * (n + 30) + intercept;
  
  // Calculate percent change from first to last
  const changePercent = ((yValues[n - 1] - yValues[0]) / yValues[0]) * 100;
  
  const direction = 
    Math.abs(changePercent) < 5 ? 'stable' :
    changePercent > 0 ? 'up' : 'down';
  
  return {
    direction,
    changePercent: Math.round(changePercent * 10) / 10,
    prediction30Days: Math.round(prediction30Days * 10) / 10,
  };
}
