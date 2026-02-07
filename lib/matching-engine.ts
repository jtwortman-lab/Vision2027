import type { AdvisorWithProfile, ClientNeed, AdvisorSkill, AssignmentRole } from '@/types/database';

interface MatchConfig {
  overSkillPenaltyFactor: number;
  underSkillPenaltyFactor: number;
  capacityPenaltyThreshold: number;
  capacityPenaltyFactor: number;
  importanceWeight: number;
  urgencyWeight: number;
}

const DEFAULT_CONFIG: MatchConfig = {
  overSkillPenaltyFactor: 0.5,
  underSkillPenaltyFactor: 2.0,
  capacityPenaltyThreshold: 0.8,
  capacityPenaltyFactor: 0.3,
  importanceWeight: 0.6,
  urgencyWeight: 0.4,
};

export interface MatchScore {
  advisorId: string;
  advisor: AdvisorWithProfile;
  leadScore: number;
  backupScore: number;
  supportScore: number;
  explanation: {
    top_drivers: string[];
    gaps: string[];
    why_not: string[];
  };
  skillMatches: SkillMatch[];
}

interface SkillMatch {
  subtopicId: string;
  subtopicName: string;
  domainName: string;
  required: number;
  actual: number;
  contribution: number;
  isGap: boolean;
  isOverskill: boolean;
}

export function calculateMatchScores(
  advisors: AdvisorWithProfile[],
  needs: ClientNeed[],
  config: Partial<MatchConfig> = {}
): MatchScore[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return advisors.map((advisor) => {
    const skillMatches = calculateSkillMatches(advisor, needs, cfg);
    const baseScore = calculateBaseScore(skillMatches);
    const capacityModifier = calculateCapacityModifier(advisor, cfg);

    const leadScore = Math.round(baseScore * capacityModifier * 100) / 100;
    const backupScore = Math.round(leadScore * 0.85 * 100) / 100;
    const supportScore = Math.round(leadScore * 0.7 * 100) / 100;

    const explanation = generateExplanation(advisor, skillMatches, capacityModifier);

    return {
      advisorId: advisor.id,
      advisor,
      leadScore,
      backupScore,
      supportScore,
      explanation,
      skillMatches,
    };
  }).sort((a, b) => b.leadScore - a.leadScore);
}

function calculateSkillMatches(
  advisor: AdvisorWithProfile,
  needs: ClientNeed[],
  config: MatchConfig
): SkillMatch[] {
  return needs.map((need) => {
    const skill = advisor.skills?.find((s) => s.subtopic_id === need.subtopic_id);
    const actual = skill?.skill_level ?? 0;
    const required = need.importance;
    const weight = (need.importance * config.importanceWeight) + (need.urgency * config.urgencyWeight);

    let contribution = 0;
    let isGap = false;
    let isOverskill = false;

    if (actual >= required) {
      // Overskill penalty
      const overSkill = actual - required;
      isOverskill = overSkill > 2;
      contribution = weight * (1 - (overSkill * config.overSkillPenaltyFactor * 0.1));
    } else {
      // Underskill penalty
      const underSkill = required - actual;
      isGap = underSkill > 2;
      contribution = weight * (1 - (underSkill * config.underSkillPenaltyFactor * 0.1));
    }

    contribution = Math.max(0, contribution);

    return {
      subtopicId: need.subtopic_id,
      subtopicName: need.subtopic?.name ?? 'Unknown',
      domainName: need.subtopic?.domain?.name ?? 'Unknown',
      required,
      actual,
      contribution,
      isGap,
      isOverskill,
    };
  });
}

function calculateBaseScore(skillMatches: SkillMatch[]): number {
  if (skillMatches.length === 0) return 50;

  const totalContribution = skillMatches.reduce((sum, m) => sum + m.contribution, 0);
  const maxContribution = skillMatches.reduce((sum, m) => sum + 10, 0);

  return Math.round((totalContribution / maxContribution) * 100);
}

function calculateCapacityModifier(advisor: AdvisorWithProfile, config: MatchConfig): number {
  const utilization = advisor.capacityPercentage / 100;

  if (utilization >= 1) {
    return 0.3; // Severely penalize at/over capacity
  }

  if (utilization >= config.capacityPenaltyThreshold) {
    const overThreshold = utilization - config.capacityPenaltyThreshold;
    return 1 - (overThreshold * config.capacityPenaltyFactor * 5);
  }

  return 1;
}

function generateExplanation(
  advisor: AdvisorWithProfile,
  skillMatches: SkillMatch[],
  capacityModifier: number
): { top_drivers: string[]; gaps: string[]; why_not: string[] } {
  const topDrivers: string[] = [];
  const gaps: string[] = [];
  const whyNot: string[] = [];

  // Sort by contribution
  const sorted = [...skillMatches].sort((a, b) => b.contribution - a.contribution);

  // Top 3 positive contributions
  sorted.slice(0, 3).forEach((m) => {
    if (m.actual >= m.required) {
      topDrivers.push(`Strong in ${m.subtopicName} (${m.actual}/10 vs ${m.required} required)`);
    }
  });

  // Gaps
  skillMatches
    .filter((m) => m.isGap)
    .slice(0, 3)
    .forEach((m) => {
      gaps.push(`Gap in ${m.subtopicName}: ${m.actual}/10 (needs ${m.required})`);
    });

  // Capacity issues
  if (capacityModifier < 0.7) {
    whyNot.push(`High capacity utilization (${advisor.capacityPercentage}%)`);
  }

  // Experience
  if (advisor.years_experience >= 10) {
    topDrivers.push(`${advisor.years_experience} years of experience`);
  }

  // Certifications
  if (advisor.certifications.length > 0) {
    topDrivers.push(`Certified: ${advisor.certifications.slice(0, 2).join(', ')}`);
  }

  return { top_drivers: topDrivers.slice(0, 5), gaps, why_not: whyNot };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  return 'poor';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Moderate Match';
  return 'Poor Match';
}
