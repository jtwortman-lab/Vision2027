import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Award, TrendingUp, Briefcase, ArrowUpDown, Users, DollarSign, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { SEED_ADVISORS, SEED_DOMAINS, SEED_SUBTOPICS } from '@/lib/seed-data';
import { AdvisorClientBook } from '@/components/advisor/AdvisorClientBook';
import { IncomeTrajectoryChart } from '@/components/advisor/IncomeTrajectoryChart';
import { SkillHistoryChart } from '@/components/advisor/SkillHistoryChart';
import { SkillDevelopment } from '@/components/advisor/SkillDevelopment';
import { getBookStats, getAggregateStats } from '@/lib/client-assignments';
import { formatSegment } from '@/types/database';


const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

type SortOption = 'name' | 'fitScore' | 'capacity';

export default function AdvisorBook() {
  const [searchQuery, setSearchQuery] = useState('');
  const [officeFilter, setOfficeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);

  const offices = [...new Set(SEED_ADVISORS.map((a) => a.profile.office))];
  const aggregateStats = useMemo(() => getAggregateStats(), []);

  const filteredAndSortedAdvisors = useMemo(() => {
    let advisors = SEED_ADVISORS.filter((advisor) => {
      const matchesSearch =
        advisor.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advisor.profile.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOffice = officeFilter === 'all' || advisor.profile.office === officeFilter;
      return matchesSearch && matchesOffice;
    });

    // Sort advisors
    switch (sortBy) {
      case 'fitScore':
        advisors = [...advisors].sort((a, b) => 
          getBookStats(b.id).averageScore - getBookStats(a.id).averageScore
        );
        break;
      case 'capacity':
        advisors = [...advisors].sort((a, b) => a.capacityPercentage - b.capacityPercentage);
        break;
      case 'name':
      default:
        advisors = [...advisors].sort((a, b) => 
          a.profile.full_name.localeCompare(b.profile.full_name)
        );
        break;
    }

    return advisors;
  }, [searchQuery, officeFilter, sortBy]);

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advisor Book</h1>
          <p className="text-muted-foreground">
            View and manage advisor profiles, skills, and capacity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search advisors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={officeFilter} onValueChange={setOfficeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Office" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offices</SelectItem>
              {offices.map((office) => (
                <SelectItem key={office} value={office}>{office}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-44">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="fitScore">Sort by Fit Score</SelectItem>
              <SelectItem value="capacity">Sort by Capacity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Advisors</p>
                <p className="text-2xl font-bold">{SEED_ADVISORS.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{aggregateStats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Fit Score</p>
                <p className={cn('text-2xl font-bold',
                  aggregateStats.avgFitScore >= 80 ? 'text-success' :
                  aggregateStats.avgFitScore >= 60 ? 'text-warning' : 'text-destructive'
                )}>
                  {aggregateStats.avgFitScore}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fee Weighted Fit</p>
                <p className={cn('text-2xl font-bold',
                  aggregateStats.feeWeightedFitScore >= 80 ? 'text-success' :
                  aggregateStats.feeWeightedFitScore >= 60 ? 'text-warning' : 'text-destructive'
                )}>
                  {aggregateStats.feeWeightedFitScore}%
                </p>
              </div>
              <Target className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Annual Fees</p>
                <p className="text-2xl font-bold">{formatCurrency(aggregateStats.totalAnnualFees)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advisor List */}
      <div className="space-y-3">
        {filteredAndSortedAdvisors.map((advisor) => {
          const isExpanded = expandedAdvisor === advisor.id;

          return (
            <Collapsible
              key={advisor.id}
              open={isExpanded}
              onOpenChange={() => setExpandedAdvisor(isExpanded ? null : advisor.id)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {advisor.profile.full_name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{advisor.profile.full_name}</h3>
                          {advisor.certifications.slice(0, 2).map((cert) => (
                            <Badge key={cert} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {advisor.profile.office} • {advisor.profile.team} • {advisor.years_experience} years
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Advisor Client Fit</p>
                          <p className={cn('text-lg font-bold', 
                            getBookStats(advisor.id).averageScore >= 80 ? 'text-success' :
                            getBookStats(advisor.id).averageScore >= 60 ? 'text-warning' : 'text-destructive'
                          )}>
                            {getBookStats(advisor.id).averageScore}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Fee Weighted Fit</p>
                          <p className={cn('text-lg font-bold', 
                            getBookStats(advisor.id).feeWeightedScore >= 80 ? 'text-success' :
                            getBookStats(advisor.id).feeWeightedScore >= 60 ? 'text-warning' : 'text-destructive'
                          )}>
                            {getBookStats(advisor.id).feeWeightedScore}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Capacity</p>
                          <p className={cn('text-lg font-bold', getCapacityColor(advisor.capacityPercentage))}>
                            {advisor.capacityPercentage}%
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="border-t pt-6">
                    <Tabs defaultValue="clients">
                      <TabsList>
                        <TabsTrigger value="clients">Client Book</TabsTrigger>
                        <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
                        <TabsTrigger value="development">Skill Development</TabsTrigger>
                        <TabsTrigger value="income">Income History</TabsTrigger>
                      </TabsList>

                      <TabsContent value="clients" className="mt-4">
                        <AdvisorClientBook advisor={advisor} />
                      </TabsContent>

                      <TabsContent value="skills" className="mt-4">
                        <div className="space-y-6">
                          {/* Skill History Chart */}
                          <SkillHistoryChart 
                            advisorId={advisor.id} 
                            skills={advisor.skills || []} 
                          />
                          
                          {/* Current Skills Grid */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {SEED_DOMAINS.map((domain) => {
                              const domainSkills = advisor.skills?.filter((s) =>
                                SEED_SUBTOPICS.find((st) => st.id === s.subtopic_id && st.domain_id === domain.id)
                              ) || [];
                              const avgSkill = domainSkills.length > 0
                                ? Math.round(domainSkills.reduce((sum, s) => sum + s.skill_level, 0) / domainSkills.length)
                                : 0;

                              return (
                                <div key={domain.id} className="p-4 rounded-lg border bg-muted/30">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium">{domain.name}</h4>
                                    <span className={cn(
                                      'text-lg font-bold',
                                      avgSkill >= 7 ? 'text-success' : avgSkill >= 5 ? 'text-warning' : 'text-destructive'
                                    )}>
                                      {avgSkill}/10
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    {domainSkills.slice(0, 3).map((skill) => {
                                      const subtopic = SEED_SUBTOPICS.find((s) => s.id === skill.subtopic_id);
                                      return (
                                        <div key={skill.id} className="flex items-center justify-between text-sm">
                                          <span className="text-muted-foreground truncate">{subtopic?.name}</span>
                                          <span className="font-medium">{skill.skill_level}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="development" className="mt-4">
                        <SkillDevelopment advisor={advisor} />
                      </TabsContent>

                      <TabsContent value="income" className="mt-4">
                        <IncomeTrajectoryChart advisorId={advisor.id} advisorName={advisor.profile.full_name} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
