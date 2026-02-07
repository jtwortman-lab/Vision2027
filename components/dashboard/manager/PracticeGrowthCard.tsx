import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEED_ADVISORS } from '@/lib/seed-data';
import { getBookStats } from '@/lib/client-assignments';
import { ADVISOR_ADM_MAP } from './TeamOverviewStats';

interface PracticeGrowthCardProps {
  selectedADM: string | null;
}

export function PracticeGrowthCard({ selectedADM }: PracticeGrowthCardProps) {
  const { aggregateStats, topGrowers, needingSupport } = useMemo(() => {
    const filteredAdvisors = selectedADM
      ? SEED_ADVISORS.filter((a) => ADVISOR_ADM_MAP[a.id] === selectedADM)
      : SEED_ADVISORS;

    // Calculate aggregate stats
    let totalClients = 0;
    let totalAnnualFees = 0;

    filteredAdvisors.forEach((advisor) => {
      const stats = getBookStats(advisor.id);
      totalClients += stats.totalClients;
      totalAnnualFees += stats.totalAnnualFees;
    });

    // Calculate growth metrics for each advisor
    const advisorGrowth = filteredAdvisors.map((advisor, index) => {
      const stats = getBookStats(advisor.id);
      // Mock growth data - in production from historical
      const feeGrowth = (index % 5) * 3 - 6; // -6% to +12%
      const clientGrowth = (index % 4) - 1; // -1 to +2 clients
      return {
        advisor,
        stats,
        feeGrowth,
        clientGrowth,
      };
    });

    return {
      aggregateStats: { totalClients, totalAnnualFees },
      topGrowers: advisorGrowth
        .sort((a, b) => b.feeGrowth - a.feeGrowth)
        .slice(0, 3),
      needingSupport: advisorGrowth
        .filter((a) => a.feeGrowth < 0 || a.stats.averageScore < 70)
        .slice(0, 3),
    };
  }, [selectedADM]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Practice Growth
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/analytics" className="gap-1">
            Analytics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total Fees</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(aggregateStats.totalAnnualFees)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total Clients</span>
            </div>
            <p className="text-xl font-bold">{aggregateStats.totalClients}</p>
          </div>
        </div>

        {/* Top Growers */}
        {topGrowers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Top Growers</h4>
            <div className="space-y-2">
              {topGrowers.map(({ advisor, feeGrowth, stats }) => (
                <Link
                  key={advisor.id}
                  to={`/advisor-dashboard/${advisor.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{advisor.profile.full_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(stats.totalAnnualFees)}
                    </span>
                    <span className={cn(
                      'text-sm font-bold',
                      feeGrowth >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {feeGrowth >= 0 ? '+' : ''}{feeGrowth}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Needing Support */}
        {needingSupport.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">May Need Support</h4>
            <div className="space-y-2">
              {needingSupport.map(({ advisor, feeGrowth, stats }) => (
                <Link
                  key={advisor.id}
                  to={`/advisor-dashboard/${advisor.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors border border-warning/20 bg-warning/5"
                >
                  <span className="text-sm font-medium">{advisor.profile.full_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      Fit: {stats.averageScore}%
                    </span>
                    <span className={cn(
                      'text-sm font-bold',
                      feeGrowth >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {feeGrowth >= 0 ? '+' : ''}{feeGrowth}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
