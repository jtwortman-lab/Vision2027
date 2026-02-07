import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { SEED_PROSPECTS, SEED_ADVISORS } from '@/lib/seed-data';
import { cn } from '@/lib/utils';
import { formatSegment } from '@/types/database';

// Mock recent matches
const recentMatches = [
  { prospectId: 'prospect-1', advisorId: 'advisor-1', role: 'lead' as const, score: 87, date: '2h ago' },
  { prospectId: 'prospect-2', advisorId: 'advisor-2', role: 'lead' as const, score: 82, date: '5h ago' },
  { prospectId: 'prospect-3', advisorId: 'advisor-5', role: 'lead' as const, score: 75, date: '1d ago' },
  { prospectId: 'prospect-4', advisorId: 'advisor-3', role: 'lead' as const, score: 91, date: '1d ago' },
];

export function RecentMatches() {
  const matches = recentMatches.map((match) => ({
    ...match,
    prospect: SEED_PROSPECTS.find((p) => p.id === match.prospectId),
    advisor: SEED_ADVISORS.find((a) => a.id === match.advisorId),
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Recent Matches</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/matches" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {matches.map((match, idx) => (
          <Link
            key={idx}
            to={`/matches?prospect=${match.prospectId}`}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                {match.prospect?.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{match.prospect?.name}</p>
                <p className="text-xs text-muted-foreground">{match.prospect ? formatSegment(match.prospect.segment) : ''}</p>
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-secondary">
                  {match.advisor?.profile.full_name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{match.advisor?.profile.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{match.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn('text-lg font-bold tabular-nums', getScoreColor(match.score))}>
                {match.score}
              </span>
              <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Assigned
              </Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
