import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreBar } from '@/components/ui/score-bar';
import { ArrowRight } from 'lucide-react';
import { SEED_ADVISORS } from '@/lib/seed-data';
import { cn } from '@/lib/utils';

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

interface CapacityOverviewProps {
  selectedADM?: string | null;
}

export function CapacityOverview({ selectedADM }: CapacityOverviewProps) {
  const advisors = useMemo(() => {
    const filtered = selectedADM
      ? SEED_ADVISORS.filter((a) => ADVISOR_ADM_MAP[a.id] === selectedADM)
      : SEED_ADVISORS;
    
    return filtered
      .sort((a, b) => b.capacityPercentage - a.capacityPercentage)
      .slice(0, 6);
  }, [selectedADM]);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  };

  const getStatusLabel = (percentage: number) => {
    if (percentage >= 90) return 'At Capacity';
    if (percentage >= 75) return 'Limited';
    return 'Available';
  };

  return (
    <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Advisor Capacity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/advisors" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {advisors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No advisors found for this manager.
          </p>
        ) : (
          advisors.map((advisor) => (
            <Link
              key={advisor.id}
              to={`/advisor-dashboard/${advisor.id}`}
              className="block space-y-2 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                      {advisor.profile.full_name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{advisor.profile.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {advisor.current_families}/{advisor.max_families} clients
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    advisor.capacityPercentage >= 90
                      ? 'border-destructive/30 bg-destructive/10 text-destructive'
                      : advisor.capacityPercentage >= 75
                      ? 'border-warning/30 bg-warning/10 text-warning'
                      : 'border-success/30 bg-success/10 text-success'
                  )}
                >
                  {getStatusLabel(advisor.capacityPercentage)}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <ScoreBar score={advisor.capacityPercentage} size="sm" className="flex-1" />
                <span className={cn('text-sm font-medium tabular-nums', getStatusColor(advisor.capacityPercentage))}>
                  {advisor.capacityPercentage}%
                </span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
