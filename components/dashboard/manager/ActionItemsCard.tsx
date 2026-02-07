import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, Users, TrendingDown, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEED_ADVISORS } from '@/lib/seed-data';
import { getBookStats, getTransferRecommendations } from '@/lib/client-assignments';
import { ADVISOR_ADM_MAP } from './TeamOverviewStats';

interface ActionItem {
  id: string;
  type: 'capacity' | 'fit' | 'transfer' | 'skill';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  link: string;
  advisorName?: string;
}

interface ActionItemsCardProps {
  selectedADM: string | null;
}

export function ActionItemsCard({ selectedADM }: ActionItemsCardProps) {
  const sortedItems = useMemo(() => {
    const filteredAdvisors = selectedADM
      ? SEED_ADVISORS.filter((a) => ADVISOR_ADM_MAP[a.id] === selectedADM)
      : SEED_ADVISORS;

    const actionItems: ActionItem[] = [];

    // Check for capacity issues
    filteredAdvisors.forEach((advisor) => {
      if (advisor.capacityPercentage >= 90) {
        actionItems.push({
          id: `capacity-${advisor.id}`,
          type: 'capacity',
          priority: 'high',
          title: 'At Capacity',
          description: `${advisor.profile.full_name} is at ${advisor.capacityPercentage}% capacity`,
          link: `/advisor-dashboard/${advisor.id}`,
          advisorName: advisor.profile.full_name,
        });
      }
    });

    // Check for poor fit scores
    filteredAdvisors.forEach((advisor) => {
      const stats = getBookStats(advisor.id);
      if (stats.averageScore < 65 && stats.totalClients > 0) {
        actionItems.push({
          id: `fit-${advisor.id}`,
          type: 'fit',
          priority: stats.averageScore < 50 ? 'high' : 'medium',
          title: 'Low Client Fit',
          description: `${advisor.profile.full_name} has ${stats.averageScore}% avg fit score`,
          link: `/advisor-dashboard/${advisor.id}`,
          advisorName: advisor.profile.full_name,
        });
      }
    });

    // Check for transfer opportunities
    filteredAdvisors.slice(0, 3).forEach((advisor) => {
      const recommendations = getTransferRecommendations(advisor.id);
      if (recommendations.length > 0) {
        const topRec = recommendations[0];
        actionItems.push({
          id: `transfer-${advisor.id}-${topRec.client.id}`,
          type: 'transfer',
          priority: topRec.improvement > 15 ? 'medium' : 'low',
          title: 'Transfer Opportunity',
          description: `${topRec.client.name} could improve +${topRec.improvement}% fit`,
          link: `/advisor-dashboard/${advisor.id}`,
          advisorName: advisor.profile.full_name,
        });
      }
    });

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return actionItems
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 5);
  }, [selectedADM]);

  const getIcon = (type: ActionItem['type']) => {
    switch (type) {
      case 'capacity': return Users;
      case 'fit': return TrendingDown;
      case 'transfer': return Target;
      case 'skill': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const getPriorityColor = (priority: ActionItem['priority']) => {
    switch (priority) {
      case 'high': return 'border-destructive/30 bg-destructive/10 text-destructive';
      case 'medium': return 'border-warning/30 bg-warning/10 text-warning';
      case 'low': return 'border-muted-foreground/30 bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Action Items
          {sortedItems.filter((i) => i.priority === 'high').length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {sortedItems.filter((i) => i.priority === 'high').length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No action items - your team is doing great!
          </p>
        ) : (
          sortedItems.map((item) => {
            const Icon = getIcon(item.type);
            return (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className={cn('rounded-lg p-2', getPriorityColor(item.priority))}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <Badge variant="outline" className={cn('text-xs', getPriorityColor(item.priority))}>
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
