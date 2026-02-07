import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, Briefcase, MapPin, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { SEED_ADVISORS, SEED_DOMAINS, SEED_SUBTOPICS } from '@/lib/seed-data';
import { AdvisorClientBook } from '@/components/advisor/AdvisorClientBook';
import { IncomeTrajectoryChart } from '@/components/advisor/IncomeTrajectoryChart';
import { SkillHistoryChart } from '@/components/advisor/SkillHistoryChart';
import { SkillDevelopment } from '@/components/advisor/SkillDevelopment';
import { getBookStats } from '@/lib/client-assignments';

export default function AdvisorDetail() {
  const { advisorId } = useParams<{ advisorId: string }>();

  const advisor = useMemo(() => {
    return SEED_ADVISORS.find((a) => a.id === advisorId);
  }, [advisorId]);

  const bookStats = useMemo(() => {
    if (!advisor) return null;
    return getBookStats(advisor.id);
  }, [advisor]);

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  if (!advisor) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Advisor Not Found</h2>
          <p className="text-muted-foreground mb-4">The advisor you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/advisors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Advisors
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link to="/firm">
            <ArrowLeft className="h-4 w-4" />
            Back to Firm Dashboard
          </Link>
        </Button>
      </div>

      {/* Advisor Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {advisor.profile.full_name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{advisor.profile.full_name}</h1>
                {advisor.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="gap-1">
                    <Award className="h-3 w-3" />
                    {cert}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {advisor.profile.office}
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {advisor.profile.team}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {advisor.years_experience} years experience
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {advisor.profile.email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Advisor Client Fit</p>
                <p className={cn('text-3xl font-bold', getScoreColor(bookStats?.averageScore || 0))}>
                  {bookStats?.averageScore || 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Fee Weighted Fit</p>
                <p className={cn('text-3xl font-bold', getScoreColor(bookStats?.feeWeightedScore || 0))}>
                  {bookStats?.feeWeightedScore || 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className={cn('text-3xl font-bold', getCapacityColor(advisor.capacityPercentage))}>
                  {advisor.capacityPercentage}%
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="clients">
        <TabsList className="mb-4">
          <TabsTrigger value="clients">Client Book</TabsTrigger>
          <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
          <TabsTrigger value="development">Skill Development</TabsTrigger>
          <TabsTrigger value="income">Income History</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <Card>
            <CardContent className="pt-6">
              <AdvisorClientBook advisor={advisor} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardContent className="pt-6 space-y-6">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development">
          <Card>
            <CardContent className="pt-6">
              <SkillDevelopment advisor={advisor} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardContent className="pt-6">
              <IncomeTrajectoryChart advisorId={advisor.id} advisorName={advisor.profile.full_name} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
