import { useMemo } from 'react';
import { Users, Target, DollarSign, TrendingUp, AlertTriangle, GraduationCap } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { SEED_ADVISORS, SEED_DOMAINS, SEED_SUBTOPICS } from '@/lib/seed-data';
import { getBookStats } from '@/lib/client-assignments';

// Mock ADM assignments for advisors
const ADVISOR_ADM_MAP: Record<string, string> = {
  'advisor-1': 'Michael Torres',
  'advisor-2': 'Jennifer Adams',
  'advisor-3': 'Michael Torres',
  'advisor-4': 'Robert Chen',
  'advisor-5': 'Jennifer Adams',
  'advisor-6': 'Michael Torres',
  'advisor-7': 'Robert Chen',
  'advisor-8': 'Jennifer Adams',
  'advisor-9': 'Michael Torres',
  'advisor-10': 'Robert Chen',
};

interface TeamOverviewStatsProps {
  selectedADM: string | null;
}

export function TeamOverviewStats({ selectedADM }: TeamOverviewStatsProps) {
  const filteredAdvisors = useMemo(() => {
    if (!selectedADM) return SEED_ADVISORS;
    return SEED_ADVISORS.filter((a) => ADVISOR_ADM_MAP[a.id] === selectedADM);
  }, [selectedADM]);

  const aggregateStats = useMemo(() => {
    let totalClients = 0;
    let totalFitScoreSum = 0;
    let totalFeeWeightedScoreSum = 0;
    let totalAnnualFees = 0;
    let advisorCount = 0;

    filteredAdvisors.forEach((advisor) => {
      const stats = getBookStats(advisor.id);
      totalClients += stats.totalClients;
      totalFitScoreSum += stats.averageScore;
      totalFeeWeightedScoreSum += stats.feeWeightedScore * stats.totalAnnualFees;
      totalAnnualFees += stats.totalAnnualFees;
      advisorCount++;
    });

    return {
      totalClients,
      avgFitScore: advisorCount > 0 ? Math.round(totalFitScoreSum / advisorCount) : 0,
      feeWeightedFitScore: totalAnnualFees > 0 ? Math.round(totalFeeWeightedScoreSum / totalAnnualFees) : 0,
      totalAnnualFees,
    };
  }, [filteredAdvisors]);

  const advisorsCount = filteredAdvisors.length;
  const atCapacityCount = filteredAdvisors.filter((a) => a.capacityPercentage >= 90).length;
  
  // Calculate team avg skill level
  let totalSkillSum = 0;
  let skillCount = 0;
  filteredAdvisors.forEach((advisor) => {
    advisor.skills?.forEach((skill) => {
      totalSkillSum += skill.skill_level;
      skillCount++;
    });
  });
  const avgTeamSkill = skillCount > 0 ? Math.round((totalSkillSum / skillCount) * 10) / 10 : 0;

  // Calculate advisors improving (mock - in production from historical)
  const advisorsImproving = Math.floor(filteredAdvisors.length * 0.6);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <StatCard
        title="Team Size"
        value={advisorsCount}
        subtitle="Active advisors"
        icon={Users}
        variant="primary"
        href="/firm"
      />
      <StatCard
        title="Total Clients"
        value={aggregateStats.totalClients}
        subtitle="Across all advisors"
        icon={Users}
        variant="default"
        href="/clients"
      />
      <StatCard
        title="Avg Fit Score"
        value={`${aggregateStats.avgFitScore}%`}
        subtitle="Team average"
        icon={Target}
        variant={aggregateStats.avgFitScore >= 75 ? 'success' : aggregateStats.avgFitScore >= 60 ? 'warning' : 'destructive'}
        trend={{ value: 3, label: 'vs last quarter', positive: true }}
        href="/firm"
      />
      <StatCard
        title="Total Fees"
        value={formatCurrency(aggregateStats.totalAnnualFees)}
        subtitle="Annual revenue"
        icon={DollarSign}
        variant="success"
        trend={{ value: 8, label: 'vs last year', positive: true }}
        href="/analytics"
      />
      <StatCard
        title="Avg Skill Level"
        value={`${avgTeamSkill}/10`}
        subtitle={`${advisorsImproving} improving`}
        icon={GraduationCap}
        variant={avgTeamSkill >= 7 ? 'success' : avgTeamSkill >= 5 ? 'warning' : 'destructive'}
        href="/admin/taxonomy"
      />
      <StatCard
        title="At Capacity"
        value={atCapacityCount}
        subtitle="Need attention"
        icon={AlertTriangle}
        variant={atCapacityCount > 2 ? 'warning' : 'success'}
        href="/firm?filter=at-capacity"
      />
    </div>
  );
}

export { ADVISOR_ADM_MAP };
