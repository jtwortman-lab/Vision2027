import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SEED_SUBTOPICS, SEED_DOMAINS } from '@/lib/seed-data';
import type { MatchScore } from '@/lib/matching-engine';
import type { ClientNeed } from '@/types/database';

interface AdvisorMatchCardProps {
  score: MatchScore;
  rank: number;
  needs: ClientNeed[];
  selectedRole: 'lead' | 'backup' | 'support';
}

interface DomainComparison {
  domainId: string;
  domainName: string;
  advisorScore: number;
  clientNeed: number;
  weight: number;
}

// Get PI profile label (simulated based on predictive index)
function getPIProfile(predictiveIndex: Record<string, number>): string {
  const profiles = ['Analyzer', 'Controller', 'Specialist', 'Strategist', 'Venturer', 'Guardian', 'Operator', 'Maverick', 'Scholar', 'Altruist', 'Captain'];
  const sum = Object.values(predictiveIndex).reduce((a, b) => a + b, 0);
  return profiles[Math.floor(sum) % profiles.length];
}

export function AdvisorMatchCard({ score, rank, needs, selectedRole }: AdvisorMatchCardProps) {
  const roleScore = selectedRole === 'lead' 
    ? score.leadScore 
    : selectedRole === 'backup' 
    ? score.backupScore 
    : score.supportScore;

  // Calculate domain-level comparisons (aggregate by domain)
  const domainComparisons = useMemo<DomainComparison[]>(() => {
    const domainMap = new Map<string, { totalAdvisor: number; totalNeed: number; totalWeight: number; count: number; name: string }>();
    
    needs.forEach((need) => {
      const subtopic = SEED_SUBTOPICS.find((s) => s.id === need.subtopic_id);
      if (!subtopic) return;
      
      const domain = SEED_DOMAINS.find((d) => d.id === subtopic.domain_id);
      if (!domain) return;
      
      const advisorSkill = score.advisor.skills?.find((s) => s.subtopic_id === need.subtopic_id);
      const advisorScore = advisorSkill?.skill_level ?? 0;
      const weight = (need.importance + need.urgency) / 20;
      
      const existing = domainMap.get(domain.id);
      if (existing) {
        existing.totalAdvisor += advisorScore;
        existing.totalNeed += need.importance;
        existing.totalWeight += weight;
        existing.count += 1;
      } else {
        domainMap.set(domain.id, {
          totalAdvisor: advisorScore,
          totalNeed: need.importance,
          totalWeight: weight,
          count: 1,
          name: domain.name,
        });
      }
    });
    
    const comparisons: DomainComparison[] = [];
    domainMap.forEach((data, domainId) => {
      comparisons.push({
        domainId,
        domainName: data.name,
        advisorScore: Math.round(data.totalAdvisor / data.count),
        clientNeed: Math.round(data.totalNeed / data.count),
        weight: Math.round((data.totalWeight / data.count) * 100) / 100,
      });
    });
    
    return comparisons.sort((a, b) => b.weight - a.weight);
  }, [needs, score.advisor.skills]);

  const piProfile = getPIProfile(score.advisor.predictive_index);
  const overallScore = (roleScore / 100).toFixed(3);

  return (
    <Card className="h-full border-0 shadow-md bg-card">
      <CardContent className="p-5">
        {/* Header with rank and overall score */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Overall</p>
            <p className="text-3xl font-bold text-primary tabular-nums">{overallScore}</p>
          </div>
        </div>

        {/* Advisor name and PI profile */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {score.advisor.profile.full_name}{' '}
            <span className="font-normal text-primary">({piProfile})</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            PI factor: 1.00 | w: 1.00 | Base fit: {overallScore}
          </p>
        </div>

        {/* Domain Skills breakdown */}
        <div className="space-y-3">
          {domainComparisons.map((domain) => (
            <DomainSkillBar key={domain.domainId} domain={domain} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface DomainSkillBarProps {
  domain: DomainComparison;
}

function DomainSkillBar({ domain }: DomainSkillBarProps) {
  const { domainName, advisorScore, clientNeed, weight } = domain;
  
  const maxScale = 10;
  const clientNeedPercent = (clientNeed / maxScale) * 100;
  const advisorScorePercent = (advisorScore / maxScale) * 100;
  
  const meetsNeed = advisorScore >= clientNeed;
  const isOverskilled = advisorScore > clientNeed;
  
  // The "meeting need" portion width (capped at client need)
  const greenWidth = meetsNeed ? clientNeedPercent : advisorScorePercent;
  
  // Excess skill width (light green, beyond client need)
  const excessWidth = isOverskilled ? ((advisorScore - clientNeed) / maxScale) * 100 : 0;
  
  // Get color based on how well advisor meets need
  const getBarColor = () => {
    if (meetsNeed) return 'skill-bar-meets'; // Green when meeting need
    const ratio = advisorScore / clientNeed;
    if (ratio >= 0.5) return 'skill-bar-partial'; // Yellow when 50-99%
    return 'skill-bar-gap'; // Red when under 50%
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">
          {domainName}{' '}
          <span className="text-muted-foreground">({advisorScore}/{clientNeed})</span>
        </span>
        <span className="text-xs text-muted-foreground font-medium">w {weight.toFixed(2)}</span>
      </div>
      <div className="relative h-6 bg-muted rounded overflow-hidden">
        {/* Main skill bar (green/yellow/red based on meeting need) */}
        <div
          className={cn('absolute left-0 top-0 h-full rounded-l transition-all duration-300', getBarColor())}
          style={{ width: `${greenWidth}%` }}
        />
        
        {/* Excess skill (light green) */}
        {excessWidth > 0 && (
          <div
            className="absolute top-0 h-full skill-bar-excess transition-all duration-300"
            style={{ 
              left: `${clientNeedPercent}%`, 
              width: `${excessWidth}%`,
            }}
          />
        )}
        
        {/* Client need marker (dashed vertical line) */}
        <div 
          className="absolute top-0 h-full w-0 border-r-2 border-dashed border-foreground/40 z-10"
          style={{ left: `${clientNeedPercent}%` }}
        />
      </div>
    </div>
  );
}
