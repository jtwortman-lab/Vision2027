import { Link } from 'react-router-dom';
import { ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEED_PROSPECTS } from '@/lib/seed-data';
import { cn } from '@/lib/utils';

const complexityColors = {
  standard: 'bg-success/10 text-success border-success/20',
  complex: 'bg-warning/10 text-warning border-warning/20',
  highly_complex: 'bg-destructive/10 text-destructive border-destructive/20',
};

const complexityLabels = {
  standard: 'Standard',
  complex: 'Complex',
  highly_complex: 'Highly Complex',
};

export function ProspectQueue() {
  const prospects = SEED_PROSPECTS.filter((p) => p.is_prospect).slice(0, 5);

  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Prospects Awaiting Routing</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/intake" className="gap-1">
            Route New
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {prospects.map((prospect) => (
          <div
            key={prospect.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                {prospect.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{prospect.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{prospect.office}</span>
                  <span>•</span>
                  <span>{prospect.aum_band}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn('text-xs', complexityColors[prospect.complexity_tier])}
              >
                {complexityLabels[prospect.complexity_tier]}
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/matches?prospect=${prospect.id}`}>View Matches</Link>
              </Button>
            </div>
          </div>
        ))}

        {prospects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No prospects awaiting routing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
