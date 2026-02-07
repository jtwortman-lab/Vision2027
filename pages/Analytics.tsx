import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Target, Clock } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

// Mock analytics data
const matchQualityData = [
  { month: 'Jul', avgScore: 72, matches: 45 },
  { month: 'Aug', avgScore: 74, matches: 52 },
  { month: 'Sep', avgScore: 76, matches: 48 },
  { month: 'Oct', avgScore: 78, matches: 61 },
  { month: 'Nov', avgScore: 81, matches: 55 },
  { month: 'Dec', avgScore: 79, matches: 42 },
];

const utilizationData = [
  { name: 'New York', utilization: 82 },
  { name: 'San Francisco', utilization: 75 },
  { name: 'Chicago', utilization: 68 },
  { name: 'Miami', utilization: 71 },
  { name: 'Boston', utilization: 65 },
  { name: 'Los Angeles', utilization: 78 },
];

const segmentDistribution = [
  { name: 'Mass Affluent', value: 25, color: 'hsl(215 75% 30%)' },
  { name: 'High Net Worth', value: 45, color: 'hsl(185 60% 45%)' },
  { name: 'Ultra HNW', value: 22, color: 'hsl(145 65% 40%)' },
  { name: 'Institutional', value: 8, color: 'hsl(38 92% 50%)' },
];

const skillGapTrends = [
  { month: 'Jul', insurance: 6.2, tax: 7.1, investments: 7.8, estate: 5.9 },
  { month: 'Aug', insurance: 6.4, tax: 7.0, investments: 7.9, estate: 6.1 },
  { month: 'Sep', insurance: 6.5, tax: 7.2, investments: 8.0, estate: 6.3 },
  { month: 'Oct', insurance: 6.8, tax: 7.3, investments: 7.8, estate: 6.5 },
  { month: 'Nov', insurance: 7.0, tax: 7.4, investments: 8.1, estate: 6.7 },
  { month: 'Dec', insurance: 7.2, tax: 7.5, investments: 8.2, estate: 6.9 },
];

export default function Analytics() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Match quality metrics, utilization trends, and skill gap analysis.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Avg Match Score"
          value="79"
          subtitle="Last 30 days"
          icon={Target}
          variant="primary"
          trend={{ value: 4, label: 'vs prior month', positive: true }}
        />
        <StatCard
          title="Total Matches"
          value="263"
          subtitle="This quarter"
          icon={Users}
          variant="success"
          trend={{ value: 12, label: 'vs prior quarter', positive: true }}
        />
        <StatCard
          title="Avg Time to Match"
          value="3.2m"
          subtitle="Minutes per prospect"
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="Override Rate"
          value="8%"
          subtitle="Manual overrides"
          icon={TrendingUp}
          variant="warning"
          trend={{ value: 2, label: 'vs prior month', positive: false }}
        />
      </div>

      <Tabs defaultValue="quality" className="space-y-6">
        <TabsList>
          <TabsTrigger value="quality">Match Quality</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="skills">Skill Trends</TabsTrigger>
        </TabsList>

        {/* Match Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Match Score Trend</CardTitle>
                <CardDescription>Average match scores over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={matchQualityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis domain={[60, 100]} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgScore"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Segment Distribution</CardTitle>
                <CardDescription>Matches by client segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segmentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {segmentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {segmentDistribution.map((segment) => (
                    <div key={segment.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
                      <span className="text-sm text-muted-foreground">{segment.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Utilization Tab */}
        <TabsContent value="utilization">
          <Card>
            <CardHeader>
              <CardTitle>Advisor Utilization by Office</CardTitle>
              <CardDescription>Average capacity utilization across offices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={utilizationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value}%`, 'Utilization']}
                    />
                    <Bar
                      dataKey="utilization"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Team Skill Levels Over Time</CardTitle>
              <CardDescription>Average skill levels by domain across all advisors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={skillGapTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis domain={[5, 10]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line type="monotone" dataKey="insurance" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    <Line type="monotone" dataKey="tax" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="investments" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                    <Line type="monotone" dataKey="estate" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-1" />
                  <span className="text-sm text-muted-foreground">Insurance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-2" />
                  <span className="text-sm text-muted-foreground">Tax</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-3" />
                  <span className="text-sm text-muted-foreground">Investments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-4" />
                  <span className="text-sm text-muted-foreground">Estate</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
