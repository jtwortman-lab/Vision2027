import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, AlertTriangle, CheckCircle, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreBar } from '@/components/ui/score-bar';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { 
  getAdvisorClientBook, 
  getTransferRecommendations, 
  getBookStats,
  type ClientAssignment,
  type TransferRecommendation,
  type BookStats 
} from '@/lib/client-assignments';
import type { AdvisorWithProfile, SegmentType } from '@/types/database';
import { formatSegment } from '@/types/database';

interface AdvisorClientBookProps {
  advisor: AdvisorWithProfile;
}

type SortField = 'fitScore' | 'name' | 'segment' | 'netWorth' | 'city' | 'state' | 'valeoClientSince' | 'myClientSince' | 'backup' | 'support' | 'originator' | 'annualFee';
type SortDirection = 'asc' | 'desc';

export function AdvisorClientBook({ advisor }: AdvisorClientBookProps) {
  const [showTransfers, setShowTransfers] = useState(false);
  const [sortField, setSortField] = useState<SortField>('fitScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const clientBook = getAdvisorClientBook(advisor.id);
  const recommendations = getTransferRecommendations(advisor.id);
  const stats = getBookStats(advisor.id);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedClientBook = useMemo(() => {
    return [...clientBook].sort((a, b) => {
      let aValue: string | number | undefined;
      let bValue: string | number | undefined;

      switch (sortField) {
        case 'fitScore':
          aValue = a.fitScore;
          bValue = b.fitScore;
          break;
        case 'name':
          aValue = a.client.name;
          bValue = b.client.name;
          break;
        case 'segment':
          aValue = a.client.segment;
          bValue = b.client.segment;
          break;
        case 'netWorth':
          aValue = a.client.net_worth_band || '';
          bValue = b.client.net_worth_band || '';
          break;
        case 'city':
          aValue = a.client.city || '';
          bValue = b.client.city || '';
          break;
        case 'state':
          aValue = a.client.state || '';
          bValue = b.client.state || '';
          break;
        case 'valeoClientSince':
          aValue = a.client.valeo_client_since || '';
          bValue = b.client.valeo_client_since || '';
          break;
        case 'myClientSince':
          aValue = a.client.my_client_since || '';
          bValue = b.client.my_client_since || '';
          break;
        case 'backup':
          aValue = a.client.backup_advisor || '';
          bValue = b.client.backup_advisor || '';
          break;
        case 'support':
          aValue = a.client.support_advisor || '';
          bValue = b.client.support_advisor || '';
          break;
        case 'originator':
          aValue = a.client.originator || '';
          bValue = b.client.originator || '';
          break;
        case 'annualFee':
          aValue = a.annualFee || 0;
          bValue = b.annualFee || 0;
          break;
        default:
          aValue = a.fitScore;
          bValue = b.fitScore;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [clientBook, sortField, sortDirection]);

  const SortHeader = ({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={cn(
        'flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer whitespace-nowrap',
        sortField === field ? 'text-foreground font-medium' : 'text-muted-foreground',
        className
      )}
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 60) return { label: 'Good', variant: 'secondary' as const };
    return { label: 'Poor Fit', variant: 'destructive' as const };
  };

  return (
    <div className="space-y-6">
      {/* Book Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Fit Score</p>
                <p className={cn('text-2xl font-bold', getScoreColor(stats.averageScore))}>
                  {stats.averageScore}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Match Quality</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    {stats.excellentMatches}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    {stats.goodMatches}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    {stats.poorMatches}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">After Optimization</p>
                <div className="flex items-center gap-2">
                  <p className={cn('text-2xl font-bold', getScoreColor(stats.potentialScoreAfterOptimization))}>
                    {stats.potentialScoreAfterOptimization}%
                  </p>
                  {stats.potentialScoreAfterOptimization > stats.averageScore && (
                    <span className="text-xs text-success">
                      +{stats.potentialScoreAfterOptimization - stats.averageScore}%
                    </span>
                  )}
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Clients</CardTitle>
            {recommendations.length > 0 && (
              <Button
                variant={showTransfers ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTransfers(!showTransfers)}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                {recommendations.length} Transfer Suggestion{recommendations.length > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><SortHeader field="fitScore">Fit Score</SortHeader></TableHead>
                <TableHead><SortHeader field="name">Name</SortHeader></TableHead>
                <TableHead><SortHeader field="segment">Segment</SortHeader></TableHead>
                <TableHead><SortHeader field="netWorth">Net Worth</SortHeader></TableHead>
                <TableHead><SortHeader field="city">City</SortHeader></TableHead>
                <TableHead><SortHeader field="state">State</SortHeader></TableHead>
                <TableHead><SortHeader field="valeoClientSince">Valeo Client Since</SortHeader></TableHead>
                <TableHead><SortHeader field="myClientSince">My Client Since</SortHeader></TableHead>
                <TableHead><SortHeader field="backup">Backup</SortHeader></TableHead>
                <TableHead><SortHeader field="support">Support</SortHeader></TableHead>
                <TableHead><SortHeader field="originator">Originator</SortHeader></TableHead>
                <TableHead className="text-right"><SortHeader field="annualFee" className="justify-end">Annual Fee</SortHeader></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClientBook.map(({ client, fitScore, annualFee }) => {
                const hasRecommendation = recommendations.find((r) => r.client.id === client.id);
                
                const getSegmentDisplay = (segment: SegmentType) => formatSegment(segment);

                const formatDate = (dateStr?: string) => {
                  if (!dateStr) return '-';
                  const date = new Date(dateStr);
                  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                };

                const formatCurrency = (amount?: number) => {
                  if (!amount) return '-';
                  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
                };
                
                return (
                  <TableRow 
                    key={client.id}
                    className={cn(
                      'cursor-pointer hover:bg-muted/50 transition-colors',
                      hasRecommendation && showTransfers && 'bg-warning/10'
                    )}
                  >
                    <TableCell>
                      <Link to={`/my-clients/${client.id}`} className="block">
                        <span className={cn('font-semibold', getScoreColor(fitScore))}>
                          {fitScore}%
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/my-clients/${client.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        {client.name}
                        {hasRecommendation && showTransfers && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/my-clients/${client.id}`} className="block">
                        <Badge variant="outline" className="text-xs">
                          {getSegmentDisplay(client.segment)}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/my-clients/${client.id}`} className="block">
                        {client.net_worth_band || '-'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/my-clients/${client.id}`} className="block">
                        {client.city || '-'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/my-clients/${client.id}`} className="block">
                        {client.state || '-'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/my-clients/${client.id}`} className="block">
                        {formatDate(client.valeo_client_since)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/my-clients/${client.id}`} className="block">
                        {formatDate(client.my_client_since)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/my-clients/${client.id}`} className="block">
                        {client.backup_advisor || '-'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/my-clients/${client.id}`} className="block">
                        {client.support_advisor || '-'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/my-clients/${client.id}`} className="block">
                        {client.originator || '-'}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/my-clients/${client.id}`} className="block">
                        {formatCurrency(annualFee)}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Totals Row */}
              {clientBook.length > 0 && (
                <TableRow className="bg-muted/50 font-semibold border-t-2">
                  <TableCell>
                    <span className={cn('font-bold', getScoreColor(stats.averageScore))}>
                      {stats.averageScore}% avg
                    </span>
                  </TableCell>
                  <TableCell>{clientBook.length} Clients</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
                      clientBook.reduce((sum, { annualFee }) => sum + (annualFee || 0), 0)
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transfer Recommendations */}
      {showTransfers && recommendations.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Suggested Transfers for Book Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div key={rec.client.id}>
                {idx > 0 && <Separator className="my-4" />}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{rec.client.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-primary">
                        {rec.betterAdvisor.profile.full_name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Current:</span>
                        <span className={cn('font-medium', getScoreColor(rec.currentScore))}>
                          {rec.currentScore}%
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">New:</span>
                        <span className={cn('font-medium', getScoreColor(rec.newScore))}>
                          {rec.newScore}%
                        </span>
                      </div>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        +{rec.improvement}% improvement
                      </Badge>
                    </div>

                    {rec.reasons.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Why: </span>
                        {rec.reasons.join(' • ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                    <Button size="sm">
                      Propose Transfer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {clientBook.length === 0 && (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No clients assigned to this advisor yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
