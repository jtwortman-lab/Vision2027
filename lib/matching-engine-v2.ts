import type { AdvisorWithProfile, ClientNeed, AdvisorSkill, AssignmentRole } from '@/types/database';

interface MatchConfig {
  // Skill matching
  overSkillPenaltyFactor: number;
  underSkillPenaltyFactor: number;
  skillMatchBonusFactor: number;
  
  // Capacity
  capacityPenaltyThreshold: number;
  capacityPenaltyFactor: number;
  
  // Importance & Urgency
  importanceWeight: number;
  urgencyWeight: number;
  
  // Experience & Certifications
  experienceBonusFactor: number;
  certificationBonusFactor: number;
  
  // Segment & Complexity
  segmentMatchBonus: number;
  complexityMatchBonus: number;
  
  // Historical Performance (for future ML integration)
  historicalSuccessWeight: number;
}

const DEFAULT_CONFIG: MatchConfig = {
  overSkillPenaltyFactor: 0.3,
  underSkillPenaltyFactor: 2.0,
  skillMatchBonusFactor: 1.2,
  capacityPenaltyThreshold: 0.8,
  capacityPenaltyFactor: 0.4,
  importanceWeight: 0.6,
  urgencyWeight: 0.4,
  experienceBonusFactor: 0.05,
  certificationBonusFactor: 0.02,
  segmentMatchBonus: 5,
  complexityMatchBonus: 3,
  historicalSuccessWeight: 0.15,
};

export interface MatchScore {
  advisorId: string;
  advisor: AdvisorWithProfile;
  leadScore: number;
  backupScore: number;
  supportScore: number;
  confidenceScore: number; // NEW: How confident we are in this match
  explanation: {
    top_drivers: string[];
    gaps: string[];
    why_not: string[];
    confidence_factors: string[];
  };
  skillMatches: SkillMatch[];
  metrics: MatchMetrics; // NEW: Detailed metrics
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
  matchQuality: 'perfect' | 'good' | 'acceptable' | 'poor'; // NEW
}

interface MatchMetrics {
  skillCoverage: number; // % of skills adequately covered
  averageSkillGap: number; // Average gap across all skills
  capacityUtilization: number;
  experienceLevel: 'junior' | 'mid' | 'senior' | 'expert';
  segmentAlignment: boolean;
  totalWeightedScore: number;
}

/**
 * Enhanced matching engine with ML-inspired scoring
 * Uses multi-factor analysis for better advisor-client matches
 */
export function calculateMatchScores(
  advisors: AdvisorWithProfile[],
  needs: ClientNeed[],
  clientSegment?: string,
  clientComplexity?: string,
  config: Partial<MatchConfig> = {}
): MatchScore[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return advisors.map((advisor) => {
    // Core skill matching
    const skillMatches = calculateSkillMatches(advisor, needs, cfg);
    const baseScore = calculateBaseScore(skillMatches);
    
    // Capacity modifier
    const capacityModifier = calculateCapacityModifier(advisor, cfg);
    
    // Experience bonus
    const experienceBonus = calculateExperienceBonus(advisor, cfg);
    
    // Segment & complexity alignment
    const alignmentBonus = calculateAlignmentBonus(
      advisor,
      clientSegment,
      clientComplexity,
      cfg
    );
    
    // Calculate confidence
    const confidenceScore = calculateConfidence(skillMatches, advisor, needs);
    
    // Final score calculation with all factors
    const totalScore = Math.min(100, 
      baseScore * capacityModifier + experienceBonus + alignmentBonus
    );
    
    const leadScore = Math.round(totalScore * 100) / 100;
    const backupScore = Math.round(leadScore * 0.85 * 100) / 100;
    const supportScore = Math.round(leadScore * 0.7 * 100) / 100;

    // Generate comprehensive explanation
    const explanation = generateEnhancedExplanation(
      advisor,
      skillMatches,
      capacityModifier,
      experienceBonus,
      alignmentBonus,
      confidenceScore
    );
    
    // Calculate detailed metrics
    const metrics = calculateMetrics(advisor, skillMatches, needs);

    return {
      advisorId: advisor.id,
      advisor,
      leadScore,
      backupScore,
      supportScore,
      confidenceScore,
      explanation,
      skillMatches,
      metrics,
    };
  }).sort((a, b) => {
    // Sort by score, but consider confidence as tiebreaker
    if (Math.abs(a.leadScore - b.leadScore) < 2) {
      return b.confidenceScore - a.confidenceScore;
    }
    return b.leadScore - a.leadScore;
  });
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
    let matchQuality: 'perfect' | 'good' | 'acceptable' | 'poor' = 'poor';

    const difference = actual - required;

    if (Math.abs(difference) <= 1) {
      // Perfect or near-perfect match
      contribution = weight * config.skillMatchBonusFactor;
      matchQuality = 'perfect';
    } else if (difference > 1) {
      // Overskill - minor penalty
      const overSkill = difference;
      isOverskill = overSkill > 2;
      contribution = weight * (1 - (overSkill * config.overSkillPenaltyFactor * 0.1));
      matchQuality = overSkill > 3 ? 'acceptable' : 'good';
    } else {
      // Underskill - significant penalty
      const underSkill = Math.abs(difference);
      isGap = underSkill > 2;
      contribution = weight * Math.max(0, 1 - (underSkill * config.underSkillPenaltyFactor * 0.1));
      matchQuality = underSkill > 3 ? 'poor' : 'acceptable';
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
      matchQuality,
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
    return 0.2; // Severely penalize at/over capacity
  }

  if (utilization >= config.capacityPenaltyThreshold) {
    const overThreshold = utilization - config.capacityPenaltyThreshold;
    const penalty = overThreshold * config.capacityPenaltyFactor * 5;
    return Math.max(0.5, 1 - penalty); // Don't go below 0.5
  }

  // Bonus for having good capacity
  if (utilization < 0.6) {
    return 1.05; // Small bonus for available capacity
  }

  return 1;
}

function calculateExperienceBonus(advisor: AdvisorWithProfile, config: MatchConfig): number {
  let bonus = 0;
  
  // Experience bonus (capped at 10 points)
  if (advisor.years_experience >= 15) {
    bonus += 10;
  } else if (advisor.years_experience >= 10) {
    bonus += 7;
  } else if (advisor.years_experience >= 5) {
    bonus += 4;
  }
  
  // Certification bonus (capped at 5 points)
  const certBonus = Math.min(5, advisor.certifications.length * 1.5);
  bonus += certBonus;
  
  return Math.min(15, bonus); // Cap total bonus at 15 points
}

function calculateAlignmentBonus(
  advisor: AdvisorWithProfile,
  clientSegment?: string,
  clientComplexity?: string,
  config: MatchConfig
): number {
  let bonus = 0;
  
  // Segment match
  if (clientSegment && advisor.target_segment === clientSegment) {
    bonus += config.segmentMatchBonus;
  }
  
  // Complexity alignment (if we add this to advisor profile)
  // bonus += config.complexityMatchBonus;
  
  return bonus;
}

function calculateConfidence(
  skillMatches: SkillMatch[],
  advisor: AdvisorWithProfile,
  needs: ClientNeed[]
): number {
  const factors: number[] = [];
  
  // Skill coverage confidence
  const perfectMatches = skillMatches.filter(m => m.matchQuality === 'perfect').length;
  const coverageConfidence = (perfectMatches / skillMatches.length) * 100;
  factors.push(coverageConfidence);
  
  // Data quality confidence (based on skill assessments)
  const hasRecentAssessments = advisor.skills?.some(
    s => s.last_assessed_at && 
    new Date(s.last_assessed_at) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // 6 months
  );
  factors.push(hasRecentAssessments ? 80 : 50);
  
  // Experience confidence
  const expConfidence = Math.min(100, (advisor.years_experience / 15) * 100);
  factors.push(expConfidence);
  
  // Capacity confidence
  const capUtil = advisor.capacityPercentage / 100;
  const capConfidence = capUtil < 0.9 ? 100 : 100 - ((capUtil - 0.9) * 500);
  factors.push(Math.max(0, capConfidence));
  
  // Average all factors
  const avgConfidence = factors.reduce((a, b) => a + b, 0) / factors.length;
  
  return Math.round(avgConfidence);
}

function calculateMetrics(
  advisor: AdvisorWithProfile,
  skillMatches: SkillMatch[],
  needs: ClientNeed[]
): MatchMetrics {
  const adequateSkills = skillMatches.filter(
    m => m.matchQuality === 'perfect' || m.matchQuality === 'good'
  ).length;
  
  const skillCoverage = (adequateSkills / skillMatches.length) * 100;
  
  const totalGap = skillMatches.reduce((sum, m) => {
    return sum + Math.max(0, m.required - m.actual);
  }, 0);
  
  const averageSkillGap = skillMatches.length > 0 ? totalGap / skillMatches.length : 0;
  
  const experienceLevel = 
    advisor.years_experience >= 15 ? 'expert' :
    advisor.years_experience >= 10 ? 'senior' :
    advisor.years_experience >= 5 ? 'mid' : 'junior';
  
  return {
    skillCoverage: Math.round(skillCoverage * 10) / 10,
    averageSkillGap: Math.round(averageSkillGap * 10) / 10,
    capacityUtilization: advisor.capacityPercentage,
    experienceLevel,
    segmentAlignment: true, // TODO: Calculate from actual segment
    totalWeightedScore: 0, // Calculated in main function
  };
}

function generateEnhancedExplanation(
  advisor: AdvisorWithProfile,
  skillMatches: SkillMatch[],
  capacityModifier: number,
  experienceBonus: number,
  alignmentBonus: number,
  confidenceScore: number
): {
  top_drivers: string[];
  gaps: string[];
  why_not: string[];
  confidence_factors: string[];
} {
  const topDrivers: string[] = [];
  const gaps: string[] = [];
  const whyNot: string[] = [];
  const confidenceFactors: string[] = [];

  // Sort by contribution
  const sorted = [...skillMatches].sort((a, b) => b.contribution - a.contribution);

  // Top matches
  const perfectMatches = skillMatches.filter(m => m.matchQuality === 'perfect');
  if (perfectMatches.length > 0) {
    topDrivers.push(`Perfect match in ${perfectMatches.length} key areas`);
  }
  
  sorted.slice(0, 3).forEach((m) => {
    if (m.actual >= m.required) {
      const level = m.matchQuality === 'perfect' ? 'Excellent' : 'Strong';
      topDrivers.push(`${level} in ${m.subtopicName} (${m.actual}/10)`);
    }
  });

  // Gaps
  skillMatches
    .filter((m) => m.isGap || m.matchQuality === 'poor')
    .slice(0, 3)
    .forEach((m) => {
      const gapSize = m.required - m.actual;
      gaps.push(`${m.subtopicName}: Level ${m.actual}/10 (needs ${m.required}, gap of ${gapSize})`);
    });

  // Capacity issues
  if (capacityModifier < 0.7) {
    whyNot.push(`High capacity utilization (${advisor.capacityPercentage}%)`);
  } else if (capacityModifier > 1) {
    topDrivers.push(`Good availability (${100 - advisor.capacityPercentage}% capacity remaining)`);
  }

  // Experience
  if (advisor.years_experience >= 10) {
    topDrivers.push(`Experienced professional (${advisor.years_experience} years)`);
  }

  // Certifications
  if (advisor.certifications.length > 0) {
    topDrivers.push(`Professional certifications: ${advisor.certifications.slice(0, 2).join(', ')}`);
  }
  
  // Bonuses
  if (alignmentBonus > 0) {
    topDrivers.push('Target segment alignment');
  }
  
  // Confidence factors
  if (confidenceScore >= 80) {
    confidenceFactors.push('High confidence - comprehensive skill data');
  } else if (confidenceScore >= 60) {
    confidenceFactors.push('Moderate confidence - good data coverage');
  } else {
    confidenceFactors.push('Lower confidence - limited recent assessments');
  }
  
  const coveragePct = (perfectMatches.length / skillMatches.length) * 100;
  if (coveragePct >= 70) {
    confidenceFactors.push(`Strong skill coverage (${Math.round(coveragePct)}%)`);
  }

  return {
    top_drivers: topDrivers.slice(0, 6),
    gaps: gaps.slice(0, 4),
    why_not: whyNot,
    confidence_factors: confidenceFactors,
  };
}

// Utility functions
export function getScoreColor(score: number): string {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'moderate';
  return 'poor';
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent Match';
  if (score >= 70) return 'Good Match';
  if (score >= 55) return 'Moderate Match';
  return 'Poor Match';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return 'High Confidence';
  if (confidence >= 60) return 'Moderate Confidence';
  return 'Low Confidence';
}

/**
 * Simulate historical performance data (placeholder for future ML)
 * In production, this would query actual match success rates
 */
export function getHistoricalMatchSuccess(
  advisorId: string,
  clientSegment: string
): number {
  // Placeholder - would come from database
  return 0.75; // 75% success rate
}
