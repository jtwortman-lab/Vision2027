import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAdvisorClientBook } from '@/lib/client-assignments';
import { differenceInDays, format, subMonths, addDays } from 'date-fns';

interface ClientSchedulingGridProps {
  advisorId: string;
}

interface ClientMeeting {
  clientId: string;
  clientName: string;
  city: string;
  state: string;
  zipCode: string;
  lastMeeting: Date;
  nextMeeting: Date | null;
  targetMonth: string;
  daysSinceLast: number;
  daysBetweenMeetings: number;
  meetingsByYear: Record<number, number>;
  status: 'past_due' | 'due_soon' | 'scheduled' | 'on_track';
}

// Generate mock meeting data for clients
function generateMeetingData(clientId: string, clientName: string): ClientMeeting {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Random last meeting date between 1 month and 2 years ago
  const monthsAgo = Math.floor(Math.random() * 24) + 1;
  const lastMeeting = subMonths(now, monthsAgo);
  
  // Some clients have scheduled next meetings
  const hasNextMeeting = Math.random() > 0.4;
  const nextMeeting = hasNextMeeting 
    ? addDays(now, Math.floor(Math.random() * 90) - 30) // -30 to +60 days
    : null;
  
  const daysSinceLast = differenceInDays(now, lastMeeting);
  
  // Target meeting frequency (every X days)
  const targetFrequency = [90, 180, 365][Math.floor(Math.random() * 3)];
  const targetDate = addDays(lastMeeting, targetFrequency);
  const targetMonth = format(targetDate, 'yyyy-MM');
  
  // Generate meeting counts per year
  const meetingsByYear: Record<number, number> = {};
  for (let year = currentYear; year >= currentYear - 4; year--) {
    meetingsByYear[year] = Math.floor(Math.random() * 6);
  }
  
  // Determine status
  let status: ClientMeeting['status'];
  if (nextMeeting && nextMeeting > now) {
    status = 'scheduled';
  } else if (daysSinceLast > targetFrequency + 30) {
    status = 'past_due';
  } else if (daysSinceLast > targetFrequency - 30) {
    status = 'due_soon';
  } else {
    status = 'on_track';
  }
  
  // Mock location data
  const cities = [
    { city: 'Indianapolis', state: 'IN', zip: '46204' },
    { city: 'Carmel', state: 'IN', zip: '46032' },
    { city: 'Fishers', state: 'IN', zip: '46040' },
    { city: 'Zionsville', state: 'IN', zip: '46077' },
    { city: 'Westfield', state: 'IN', zip: '46074' },
    { city: 'Brownsburg', state: 'IN', zip: '46112' },
    { city: 'Noblesville', state: 'IN', zip: '46060' },
    { city: 'Greenwood', state: 'IN', zip: '46142' },
  ];
  const location = cities[Math.floor(Math.random() * cities.length)];
  
  return {
    clientId,
    clientName,
    city: location.city,
    state: location.state,
    zipCode: location.zip,
    lastMeeting,
    nextMeeting,
    targetMonth,
    daysSinceLast,
    daysBetweenMeetings: targetFrequency,
    meetingsByYear,
    status,
  };
}

export function ClientSchedulingGrid({ advisorId }: ClientSchedulingGridProps) {
  const clientBook = useMemo(() => getAdvisorClientBook(advisorId), [advisorId]);
  
  const meetingData = useMemo(() => {
    return clientBook.map(({ client }) => 
      generateMeetingData(client.id, client.name)
    ).sort((a, b) => {
      // Sort by status priority: past_due > due_soon > on_track > scheduled
      const statusOrder = { past_due: 0, due_soon: 1, on_track: 2, scheduled: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [clientBook]);

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

  const statusCounts = useMemo(() => ({
    past_due: meetingData.filter(m => m.status === 'past_due').length,
    due_soon: meetingData.filter(m => m.status === 'due_soon').length,
    scheduled: meetingData.filter(m => m.status === 'scheduled').length,
    on_track: meetingData.filter(m => m.status === 'on_track').length,
  }), [meetingData]);

  const getStatusColor = (status: ClientMeeting['status']) => {
    switch (status) {
      case 'past_due': return 'bg-destructive text-destructive-foreground';
      case 'due_soon': return 'bg-warning text-warning-foreground';
      case 'scheduled': return 'bg-success text-success-foreground';
      case 'on_track': return 'bg-muted text-muted-foreground';
    }
  };

  const getRowBackground = (status: ClientMeeting['status']) => {
    switch (status) {
      case 'past_due': return 'bg-destructive/10';
      case 'due_soon': return 'bg-warning/10';
      case 'scheduled': return 'bg-success/10';
      case 'on_track': return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Past Due</p>
                <p className="text-2xl font-bold text-destructive">{statusCounts.past_due}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due This Month</p>
                <p className="text-2xl font-bold text-warning">{statusCounts.due_soon}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-success">{statusCounts.scheduled}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-muted-foreground">{statusCounts.on_track}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Status:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive" />
          <span>Past Due</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning" />
          <span>Due This Month</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted border" />
          <span>On Track</span>
        </div>
      </div>

      {/* Meeting Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Client Meeting Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Client</TableHead>
                  <TableHead>Last Meeting</TableHead>
                  <TableHead>Days Since</TableHead>
                  <TableHead>Next Meeting</TableHead>
                  <TableHead>Target Month</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                  </TableHead>
                  {years.map(year => (
                    <TableHead key={year} className="text-center w-16">{year}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetingData.map((meeting) => (
                  <TableRow 
                    key={meeting.clientId}
                    className={cn(getRowBackground(meeting.status))}
                  >
                    <TableCell className="font-medium">{meeting.clientName}</TableCell>
                    <TableCell>{format(meeting.lastMeeting, 'MM/dd/yyyy')}</TableCell>
                    <TableCell>
                      <span className={cn(
                        'font-semibold',
                        meeting.status === 'past_due' && 'text-destructive',
                        meeting.status === 'due_soon' && 'text-warning'
                      )}>
                        {meeting.daysSinceLast}
                      </span>
                    </TableCell>
                    <TableCell>
                      {meeting.nextMeeting ? (
                        <span className={cn(
                          meeting.nextMeeting > new Date() ? 'text-success' : 'text-destructive'
                        )}>
                          {format(meeting.nextMeeting, 'MM/dd/yyyy')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{meeting.targetMonth}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{meeting.city}, {meeting.state}</div>
                        <div className="text-muted-foreground text-xs">{meeting.zipCode}</div>
                      </div>
                    </TableCell>
                    {years.map(year => (
                      <TableCell key={year} className="text-center">
                        {meeting.meetingsByYear[year] > 0 ? (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'min-w-[24px]',
                              meeting.meetingsByYear[year] >= 4 && 'bg-success/20 text-success border-success/30',
                              meeting.meetingsByYear[year] >= 2 && meeting.meetingsByYear[year] < 4 && 'bg-primary/20 text-primary border-primary/30',
                              meeting.meetingsByYear[year] < 2 && 'bg-warning/20 text-warning border-warning/30'
                            )}
                          >
                            {meeting.meetingsByYear[year]}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Location Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Clients by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              meetingData.reduce((acc, m) => {
                const key = `${m.city}, ${m.state}`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => b[1] - a[1]).map(([location, count]) => (
              <Badge key={location} variant="outline" className="text-sm py-1 px-3">
                {location} <span className="ml-2 font-bold">{count}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
