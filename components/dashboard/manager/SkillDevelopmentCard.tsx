import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEED_ADVISORS, SEED_DOMAINS, SEED_SUBTOPICS } from '@/lib/seed-data';
import { ADVISOR_ADM_MAP } from './TeamOverviewStats';

interface DomainProgress {
  domain: typeof SEED_DOMAINS[0];
  avgScore: number;
  advisorsImproving: number;
  advisorsNeedingWork: number;
}

interface SkillDevelopmentCardProps {
  selectedADM: string | null;
}

export function SkillDevelopmentCard({ selectedADM }: SkillDevelopmentCardProps) {
  const domainProgress: DomainProgress[] = useMemo(() => {
    const filteredAdvisors = selectedADM
      ? SEED_ADVISORS.filter((a) => ADVISOR_ADM_MAP[a.id] === selectedADM)
      : SEED_ADVISORS;

    return SEED_DOMAINS.map((domain) => {
      const domainSubtopics = SEED_SUBTOPICS.filter((s) => s.domain_id === domain.id);
      
      let totalScore = 0;
      let skillCount = 0;
      let improving = 0;
      let needingWork = 0;

      filteredAdvisors.forEach((advisor, index) => {
        const skills = advisor.skills?.filter((s) =>
          domainSubtopics.some((st) => st.id === s.subtopic_id)
        ) || [];
        
        const avgSkill = skills.length > 0
          ? skills.reduce((sum, s) => sum + s.skill_level, 0) / skills.length
          : 0;
        
        totalScore += avgSkill;
        skillCount++;
        
        // Mock trend data - in production from historical
        if (index % 3 === 0) improving++;
        if (avgSkill < 5) needingWork++;
      });

      return {
        domain,
        avgScore: skillCount > 0 ? Math.round((totalScore / skillCount) * 10) / 10 : 0,
        advisorsImproving: improving,
        advisorsNeedingWork: needingWork,
      };
    });
  }, [selectedADM]);

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-success';
    if (score >= 5) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 7) return 'bg-success';
    if (score >= 5) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Team Skill Development
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/taxonomy" className="gap-1">
            Manage
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {domainProgress.slice(0, 5).map(({ domain, avgScore, advisorsImproving, advisorsNeedingWork }) => (
          <div key={domain.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Link 
                to={`/admin/taxonomy?domain=${domain.id}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {domain.name}
              </Link>
              <div className="flex items-center gap-2">
                {advisorsImproving > 0 && (
                  <Badge variant="outline" className="text-xs border-success/30 bg-success/10 text-success">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {advisorsImproving}
                  </Badge>
                )}
                {advisorsNeedingWork > 0 && (
                  <Badge variant="outline" className="text-xs border-warning/30 bg-warning/10 text-warning">
                    <Target className="h-3 w-3 mr-1" />
                    {advisorsNeedingWork}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full transition-all', getProgressColor(avgScore))}
                  style={{ width: `${(avgScore / 10) * 100}%` }}
                />
              </div>
              <span className={cn('text-sm font-bold tabular-nums w-10', getScoreColor(avgScore))}>
                {avgScore}/10
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
