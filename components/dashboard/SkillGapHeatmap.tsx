import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { SEED_DOMAINS, SEED_SUBTOPICS, SEED_ADVISORS } from '@/lib/seed-data';
import { cn } from '@/lib/utils';

export function SkillGapHeatmap() {
  // Calculate average skill level per subtopic across all advisors
  const subtopicAverages = SEED_SUBTOPICS.map((subtopic) => {
    const skills = SEED_ADVISORS.flatMap((a) => a.skills || []).filter(
      (s) => s.subtopic_id === subtopic.id
    );
    const avg = skills.length > 0
      ? skills.reduce((sum, s) => sum + s.skill_level, 0) / skills.length
      : 0;
    return {
      ...subtopic,
      avgSkillLevel: Math.round(avg * 10) / 10,
      domain: SEED_DOMAINS.find((d) => d.id === subtopic.domain_id),
    };
  });

  // Group by domain and get top 3 gaps per domain (lowest skill levels)
  const domainGaps = SEED_DOMAINS.slice(0, 4).map((domain) => {
    const domainSubtopics = subtopicAverages
      .filter((s) => s.domain_id === domain.id)
      .sort((a, b) => a.avgSkillLevel - b.avgSkillLevel)
      .slice(0, 3);
    return { domain, gaps: domainSubtopics };
  });

  const getCellColor = (level: number) => {
    if (level >= 7) return 'bg-success/20 text-success hover:bg-success/30';
    if (level >= 5) return 'bg-warning/20 text-warning hover:bg-warning/30';
    return 'bg-destructive/20 text-destructive hover:bg-destructive/30';
  };

  return (
    <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Team Skill Gaps</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/taxonomy" className="gap-1">
            Manage
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {domainGaps.map(({ domain, gaps }) => (
            <div key={domain.id}>
              <Link 
                to={`/admin/taxonomy?domain=${domain.id}`}
                className="text-sm font-medium mb-2 block hover:text-primary transition-colors"
              >
                {domain.name}
              </Link>
              <div className="grid grid-cols-3 gap-2">
                {gaps.map((gap) => (
                  <Link
                    key={gap.id}
                    to={`/advisors?skill=${gap.id}`}
                    className={cn(
                      'rounded-lg px-3 py-2 text-center transition-colors cursor-pointer',
                      getCellColor(gap.avgSkillLevel)
                    )}
                  >
                    <p className="text-xs font-medium truncate">{gap.name}</p>
                    <p className="text-lg font-bold">{gap.avgSkillLevel}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-destructive/20" />
            <span className="text-muted-foreground">Gap (&lt;5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-warning/20" />
            <span className="text-muted-foreground">Moderate (5-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-success/20" />
            <span className="text-muted-foreground">Strong (7+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
