import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, DollarSign, Target, ChevronDown, UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SEED_ADVISORS } from '@/lib/seed-data';
import { getAdvisorClientBook, type ClientAssignment } from '@/lib/client-assignments';
import { formatSegment } from '@/types/database';
import { StatCard } from '@/components/ui/stat-card';

export default function MyClients() {
  const navigate = useNavigate();
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string | null>(null);

  const selectedAdvisor = selectedAdvisorId 
    ? SEED_ADVISORS.find(a => a.id === selectedAdvisorId) 
    : null;

  // Get all clients from all advisors using the same source as AdvisorClientBook
  const allClientAssignments = useMemo(() => {
    const assignments: (ClientAssignment & { advisorId: string; advisorName: string })[] = [];
    SEED_ADVISORS.forEach(advisor => {
      const book = getAdvisorClientBook(advisor.id);
      book.forEach(assignment => {
        assignments.push({ 
          ...assignment, 
          advisorId: advisor.id,
          advisorName: advisor.profile.full_name 
        });
      });
    });
    return assignments;
  }, []);

  // Filter clients based on selected advisor
  const filteredAssignments = useMemo(() => {
    if (!selectedAdvisorId) return allClientAssignments;
    return allClientAssignments.filter(a => a.advisorId === selectedAdvisorId);
  }, [selectedAdvisorId, allClientAssignments]);

  // Overall totals
  const totals = useMemo(() => {
    return filteredAssignments.reduce((acc, assignment) => {
      return {
        clients: acc.clients + 1,
        totalFees: acc.totalFees + (assignment.annualFee || 0),
        totalFitScore: acc.totalFitScore + assignment.fitScore,
      };
    }, { clients: 0, totalFees: 0, totalFitScore: 0 });
  }, [filteredAssignments]);

  const averageFitScore = totals.clients > 0 ? Math.round(totals.totalFitScore / totals.clients) : 0;
  const averageFee = totals.clients > 0 ? totals.totalFees / totals.clients : 0;

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (absValue >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header with Advisor Selector */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Clients</h1>
          <p className="text-muted-foreground">
            View and manage client relationships and fit scores
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg" className="gap-2 min-w-[200px] justify-between">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {selectedAdvisor ? selectedAdvisor.profile.full_name : 'All Advisors'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px] bg-popover z-50">
            <DropdownMenuItem 
              onClick={() => setSelectedAdvisorId(null)}
              className={cn(!selectedAdvisorId && 'bg-accent')}
            >
              <UserCircle className="h-4 w-4 mr-2" />
              All Advisors
            </DropdownMenuItem>
            {SEED_ADVISORS.map((advisor) => (
              <DropdownMenuItem
                key={advisor.id}
                onClick={() => setSelectedAdvisorId(advisor.id)}
                className={cn(selectedAdvisorId === advisor.id && 'bg-accent')}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                {advisor.profile.full_name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Clients"
          value={totals.clients}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Avg Fit Score"
          value={`${averageFitScore}%`}
          icon={Target}
          variant={averageFitScore >= 80 ? 'success' : averageFitScore >= 60 ? 'default' : 'destructive'}
        />
        <StatCard
          title="Total Fees"
          value={formatCurrency(totals.totalFees)}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Avg Fee"
          value={formatCurrency(averageFee)}
          icon={TrendingUp}
          variant="default"
        />
      </div>

      {/* Client List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Client Book</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fit Score</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Net Worth</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Valeo Client Since</TableHead>
                <TableHead>My Client Since</TableHead>
                {!selectedAdvisorId && <TableHead>Lead Advisor</TableHead>}
                <TableHead className="text-right">Annual Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow
                  key={`${assignment.advisorId}-${assignment.client.id}`}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/my-clients/${assignment.client.id}`)}
                >
                  <TableCell>
                    <span className={cn('font-semibold', getScoreColor(assignment.fitScore))}>
                      {assignment.fitScore}%
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{assignment.client.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {formatSegment(assignment.client.segment)}
                    </Badge>
                  </TableCell>
                  <TableCell>{assignment.client.net_worth_band || '-'}</TableCell>
                  <TableCell>{assignment.client.city || '-'}</TableCell>
                  <TableCell>{assignment.client.state || '-'}</TableCell>
                  <TableCell>{formatDate(assignment.client.valeo_client_since)}</TableCell>
                  <TableCell>{formatDate(assignment.client.my_client_since)}</TableCell>
                  {!selectedAdvisorId && <TableCell>{assignment.advisorName}</TableCell>}
                  <TableCell className="text-right">
                    {formatCurrency(assignment.annualFee || 0)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-muted/50 font-semibold border-t-2">
                <TableCell>
                  <span className={cn('font-bold', getScoreColor(averageFitScore))}>
                    {averageFitScore}% avg
                  </span>
                </TableCell>
                <TableCell>{totals.clients} Clients</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                {!selectedAdvisorId && <TableCell>-</TableCell>}
                <TableCell className="text-right">{formatCurrency(totals.totalFees)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
