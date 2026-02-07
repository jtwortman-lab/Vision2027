import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, DollarSign, TrendingUp, Target, Award, ArrowLeft, ChevronDown, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEED_ADVISORS, SEED_DOMAINS, SEED_SUBTOPICS } from '@/lib/seed-data';
import { AdvisorClientBook } from '@/components/advisor/AdvisorClientBook';
import { SkillDevelopment } from '@/components/advisor/SkillDevelopment';
import { IncomeTrajectoryChart } from '@/components/advisor/IncomeTrajectoryChart';
import { SkillHistoryChart } from '@/components/advisor/SkillHistoryChart';
import { ClientSchedulingGrid } from '@/components/advisor/ClientSchedulingGrid';
import { getBookStats } from '@/lib/client-assignments';

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export default function AdvisorDashboard() {
  const { advisorId } = useParams<{ advisorId: string }>();
  const navigate = useNavigate();
  
  // Use the advisorId from URL if provided, otherwise default to first advisor
  const advisor = useMemo(() => {
    if (advisorId) {
      return SEED_ADVISORS.find((a) => a.id === advisorId) || SEED_ADVISORS[0];
    }
    return SEED_ADVISORS[0];
  }, [advisorId]);
  
  const bookStats = useMemo(() => getBookStats(advisor.id), [advisor.id]);

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  };

  const handleAdvisorChange = (newAdvisorId: string) => {
    navigate(`/advisor-dashboard/${newAdvisorId}`);
  };

  return (
    <div className="p-6">
      {/* Header with Back Button, Advisor Info, and Advisor Selector */}
      <div className="flex items-center gap-4 mb-6">
        {/* Back Button */}
        <Button variant="ghost" size="icon" asChild>
          <Link to="/firm">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
            {advisor.profile.full_name.split(' ').map((n) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{advisor.profile.full_name}</h1>
            {advisor.certifications.slice(0, 3).map((cert) => (
              <Badge key={cert} variant="secondary" className="text-xs">
                {cert}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground">
            {advisor.profile.office} • {advisor.profile.team} • {advisor.years_experience} years experience
          </p>
        </div>

        {/* Advisor Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg" className="gap-2 min-w-[220px] justify-between">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{advisor.profile.full_name}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px] bg-popover z-50">
            {SEED_ADVISORS.map((adv) => (
              <DropdownMenuItem
                key={adv.id}
                onClick={() => handleAdvisorChange(adv.id)}
                className={cn(advisor.id === adv.id && 'bg-accent')}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                <div className="flex-1">
                  <div className="font-medium">{adv.profile.full_name}</div>
                  <div className="text-xs text-muted-foreground">{adv.profile.office}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{bookStats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Book Fit Score</p>
                <p className={cn('text-2xl font-bold',
                  bookStats.averageScore >= 80 ? 'text-success' :
                  bookStats.averageScore >= 60 ? 'text-warning' : 'text-destructive'
                )}>
                  {bookStats.averageScore}%
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
                  bookStats.feeWeightedScore >= 80 ? 'text-success' :
                  bookStats.feeWeightedScore >= 60 ? 'text-warning' : 'text-destructive'
                )}>
                  {bookStats.feeWeightedScore}%
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
                <p className="text-sm text-muted-foreground">Annual Fees</p>
                <p className="text-2xl font-bold">{formatCurrency(bookStats.totalAnnualFees)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className={cn('text-2xl font-bold', getCapacityColor(advisor.capacityPercentage))}>
                  {advisor.capacityPercentage}%
                </p>
              </div>
              <Award className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
          <TabsTrigger value="development">Skill Development</TabsTrigger>
          <TabsTrigger value="income">Income History</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <AdvisorClientBook advisor={advisor} />
        </TabsContent>

        <TabsContent value="scheduling">
          <ClientSchedulingGrid advisorId={advisor.id} />
        </TabsContent>

        <TabsContent value="skills">
          <div className="space-y-6">
            <SkillHistoryChart advisorId={advisor.id} skills={advisor.skills || []} />
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

        <TabsContent value="development">
          <SkillDevelopment advisor={advisor} />
        </TabsContent>

        <TabsContent value="income">
          <IncomeTrajectoryChart advisorId={advisor.id} advisorName={advisor.profile.full_name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
