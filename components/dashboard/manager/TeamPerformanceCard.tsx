import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEED_ADVISORS } from '@/lib/seed-data';
import { getBookStats } from '@/lib/client-assignments';
import { ADVISOR_ADM_MAP } from './TeamOverviewStats';

interface AdvisorPerformance {
  advisor: typeof SEED_ADVISORS[0];
  stats: ReturnType<typeof getBookStats>;
  trend: 'up' | 'down' | 'stable';
}

interface TeamPerformanceCardProps {
  selectedADM: string | null;
}

export function TeamPerformanceCard({ selectedADM }: TeamPerformanceCardProps) {
  const advisorPerformances: AdvisorPerformance[] = useMemo(() => {
    const filtered = selectedADM 
      ? SEED_ADVISORS.filter((a) => ADVISOR_ADM_MAP[a.id] === selectedADM)
      : SEED_ADVISORS;
    
    return filtered.map((advisor, index) => ({
      advisor,
      stats: getBookStats(advisor.id),
      trend: (index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
    }))
      .sort((a, b) => b.stats.feeWeightedScore - a.stats.feeWeightedScore)
      .slice(0, 5);
  }, [selectedADM]);

  const getFitColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-success" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Top Performers</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/firm" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {advisorPerformances.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No advisors found for this manager.
          </p>
        ) : (
          advisorPerformances.map(({ advisor, stats, trend }, index) => (
            <Link
              key={advisor.id}
              to={`/advisor-dashboard/${advisor.id}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
                {index + 1}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {advisor.profile.full_name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{advisor.profile.full_name}</p>
                <p className="text-xs text-muted-foreground">{stats.totalClients} clients</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendIcon trend={trend} />
                <span className={cn('text-sm font-bold tabular-nums', getFitColor(stats.feeWeightedScore))}>
                  {stats.feeWeightedScore}%
                </span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
