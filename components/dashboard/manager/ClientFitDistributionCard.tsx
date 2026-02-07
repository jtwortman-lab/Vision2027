import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PieChart } from 'lucide-react';
import { SEED_ADVISORS } from '@/lib/seed-data';
import { getBookStats } from '@/lib/client-assignments';
import { ADVISOR_ADM_MAP } from './TeamOverviewStats';

interface ClientFitDistributionCardProps {
  selectedADM: string | null;
}

export function ClientFitDistributionCard({ selectedADM }: ClientFitDistributionCardProps) {
  const { excellent, good, poor, total, excellentPct, goodPct, poorPct } = useMemo(() => {
    const filteredAdvisors = selectedADM
      ? SEED_ADVISORS.filter((a) => ADVISOR_ADM_MAP[a.id] === selectedADM)
      : SEED_ADVISORS;

    let exc = 0;
    let gd = 0;
    let pr = 0;
    let tot = 0;

    filteredAdvisors.forEach((advisor) => {
      const stats = getBookStats(advisor.id);
      exc += stats.excellentMatches;
      gd += stats.goodMatches;
      pr += stats.poorMatches;
      tot += stats.totalClients;
    });

    return {
      excellent: exc,
      good: gd,
      poor: pr,
      total: tot,
      excellentPct: tot > 0 ? Math.round((exc / tot) * 100) : 0,
      goodPct: tot > 0 ? Math.round((gd / tot) * 100) : 0,
      poorPct: tot > 0 ? Math.round((pr / tot) * 100) : 0,
    };
  }, [selectedADM]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Client-Advisor Fit
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/clients" className="gap-1">
            Review
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Distribution Bar */}
        <div className="h-4 rounded-full overflow-hidden flex mb-4 bg-muted">
          {total > 0 && (
            <>
              <div 
                className="bg-success transition-all"
                style={{ width: `${excellentPct}%` }}
              />
              <div 
                className="bg-warning transition-all"
                style={{ width: `${goodPct}%` }}
              />
              <div 
                className="bg-destructive transition-all"
                style={{ width: `${poorPct}%` }}
              />
            </>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm font-medium">Excellent</span>
            </div>
            <p className="text-2xl font-bold text-success">{excellent}</p>
            <p className="text-xs text-muted-foreground">{excellentPct}% • 80%+ fit</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-sm font-medium">Good</span>
            </div>
            <p className="text-2xl font-bold text-warning">{good}</p>
            <p className="text-xs text-muted-foreground">{goodPct}% • 60-80% fit</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-sm font-medium">Poor</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{poor}</p>
            <p className="text-xs text-muted-foreground">{poorPct}% • &lt;60% fit</p>
          </div>
        </div>

        {poor > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              <strong>{poor} clients</strong> have poor fit scores and may benefit from reassignment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
