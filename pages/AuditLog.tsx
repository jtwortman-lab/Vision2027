import { useState } from 'react';
import { Search, Download, Filter, Eye, User, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SEED_PROSPECTS, SEED_ADVISORS } from '@/lib/seed-data';

// Mock audit log entries
const auditEntries = [
  {
    id: 'audit-1',
    action: 'match_created',
    entityType: 'prospect',
    entityName: SEED_PROSPECTS[0]?.name,
    user: 'John Manager',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    details: {
      advisorAssigned: SEED_ADVISORS[0]?.profile.full_name,
      role: 'lead',
      score: 87,
      configVersion: '1.0',
    },
  },
  {
    id: 'audit-2',
    action: 'assignment_override',
    entityType: 'prospect',
    entityName: SEED_PROSPECTS[1]?.name,
    user: 'Sarah Director',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    details: {
      originalAdvisor: SEED_ADVISORS[1]?.profile.full_name,
      newAdvisor: SEED_ADVISORS[2]?.profile.full_name,
      reason: 'Client requested specific advisor based on prior relationship',
      role: 'lead',
    },
  },
  {
    id: 'audit-3',
    action: 'config_updated',
    entityType: 'config',
    entityName: 'Scoring Weights',
    user: 'Admin User',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    details: {
      changes: ['overSkillPenalty: 0.4 → 0.5', 'underSkillPenalty: 1.8 → 2.0'],
      newVersion: '1.1',
    },
  },
  {
    id: 'audit-4',
    action: 'match_created',
    entityType: 'prospect',
    entityName: SEED_PROSPECTS[2]?.name,
    user: 'John Manager',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    details: {
      advisorAssigned: SEED_ADVISORS[4]?.profile.full_name,
      role: 'lead',
      score: 75,
      configVersion: '1.0',
    },
  },
  {
    id: 'audit-5',
    action: 'review_completed',
    entityType: 'client',
    entityName: SEED_PROSPECTS[3]?.name,
    user: 'Maria Lead',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    details: {
      result: 'optimal_fit',
      leadAdvisor: SEED_ADVISORS[2]?.profile.full_name,
      fitScore: 82,
    },
  },
];

const actionLabels: Record<string, string> = {
  match_created: 'Match Created',
  assignment_override: 'Override',
  config_updated: 'Config Updated',
  review_completed: 'Review Completed',
};

const actionColors: Record<string, string> = {
  match_created: 'bg-success/10 text-success border-success/20',
  assignment_override: 'bg-warning/10 text-warning border-warning/20',
  config_updated: 'bg-primary/10 text-primary border-primary/20',
  review_completed: 'bg-accent/10 text-accent border-accent/20',
};

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<typeof auditEntries[0] | null>(null);

  const filteredEntries = auditEntries.filter((entry) => {
    const matchesSearch =
      entry.entityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Action', 'Entity Type', 'Entity Name', 'User', 'Timestamp', 'Details'],
      ...filteredEntries.map((e) => [
        e.id,
        e.action,
        e.entityType,
        e.entityName,
        e.user,
        e.timestamp,
        JSON.stringify(e.details),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            Complete history of matching decisions, overrides, and configuration changes.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by entity or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="match_created">Match Created</SelectItem>
                <SelectItem value="assignment_override">Override</SelectItem>
                <SelectItem value="config_updated">Config Updated</SelectItem>
                <SelectItem value="review_completed">Review Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>{filteredEntries.length} entries found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Badge variant="outline" className={actionColors[entry.action]}>
                      {actionLabels[entry.action]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.entityName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{entry.entityType}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {entry.user}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDate(entry.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(entry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Audit Entry Details</DialogTitle>
                          <DialogDescription>
                            {actionLabels[entry.action]} - {formatDate(entry.timestamp)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Entity</p>
                            <p className="font-medium">{entry.entityName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Performed By</p>
                            <p>{entry.user}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Details</p>
                            <pre className="p-3 rounded-lg bg-muted text-sm overflow-auto">
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
