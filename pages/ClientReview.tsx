import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, ArrowRight, Zap, Target, TrendingUp, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { SEED_ADVISORS, SEED_SUBTOPICS } from '@/lib/seed-data';
import { formatSegment } from '@/types/database';
import { getAdvisorClientBook, calculateClientFitScore } from '@/lib/client-assignments';
import type { ClientNeed } from '@/types/database';

interface ClientImprovement {
  clientId: string;
  clientName: string;
  segment: string;
  currentFitScore: number;
  currentAdvisorId: string;
  currentAdvisorName: string;
  betterAdvisor: {
    id: string;
    name: string;
    score: number;
    improvement: number;
  } | null;
  topSkillGap: {
    subtopicId: string;
    subtopicName: string;
    currentLevel: number;
    neededLevel: number;
    potentialImprovement: number;
  } | null;
  annualFee: number;
  needs: ClientNeed[];
}

// Calculate potential fit improvement if a specific skill improves
function calculateSkillImprovementPotential(
  advisorId: string,
  needs: ClientNeed[],
  subtopicId: string,
  newSkillLevel: number
): number {
  const advisor = SEED_ADVISORS.find(a => a.id === advisorId);
  if (!advisor) return 0;

  const modifiedSkills = advisor.skills?.map(s => 
    s.subtopic_id === subtopicId 
      ? { ...s, skill_level: newSkillLevel }
      : s
  ) || [];
  
  if (!modifiedSkills.find(s => s.subtopic_id === subtopicId)) {
    modifiedSkills.push({
      id: 'temp',
      advisor_id: advisor.id,
      subtopic_id: subtopicId,
      skill_level: newSkillLevel,
      case_count: 0,
      evidence: null,
      last_assessed_at: null,
      created_at: '',
      updated_at: '',
    });
  }

  const modifiedAdvisor = { ...advisor, skills: modifiedSkills };
  const newScore = calculateClientFitScore(modifiedAdvisor, needs);
  const currentScore = calculateClientFitScore(advisor, needs);
  
  return newScore - currentScore;
}

export default function ClientReview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [advisorFilter, setAdvisorFilter] = useState<string>('all');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  // Gather all clients from all advisors
  const allClientImprovements = useMemo(() => {
    const improvements: ClientImprovement[] = [];

    SEED_ADVISORS.forEach(advisor => {
      const clientBook = getAdvisorClientBook(advisor.id);
      
      clientBook.forEach(({ client, needs, fitScore, annualFee }) => {
        // Find the best alternative advisor
        let bestAlternative: ClientImprovement['betterAdvisor'] = null;
        
        SEED_ADVISORS
          .filter(a => a.id !== advisor.id && a.capacityPercentage < 90)
          .forEach(otherAdvisor => {
            const otherScore = calculateClientFitScore(otherAdvisor, needs);
            if (otherScore > fitScore) {
              if (!bestAlternative || otherScore > bestAlternative.score) {
                bestAlternative = {
                  id: otherAdvisor.id,
                  name: otherAdvisor.profile.full_name,
                  score: otherScore,
                  improvement: otherScore - fitScore,
                };
              }
            }
          });

        // Find the skill that would most improve fit if developed
        let topSkillGap: ClientImprovement['topSkillGap'] = null;
        
        needs.forEach(need => {
          const subtopic = SEED_SUBTOPICS.find(st => st.id === need.subtopic_id);
          if (!subtopic) return;
          
          const currentSkill = advisor.skills?.find(s => s.subtopic_id === need.subtopic_id);
          const currentLevel = currentSkill?.skill_level ?? 0;
          const neededLevel = need.importance;
          
          if (currentLevel < neededLevel) {
            const potentialImprovement = calculateSkillImprovementPotential(
              advisor.id,
              needs,
              need.subtopic_id,
              neededLevel
            );
            
            if (!topSkillGap || potentialImprovement > topSkillGap.potentialImprovement) {
              topSkillGap = {
                subtopicId: need.subtopic_id,
                subtopicName: subtopic.name,
                currentLevel,
                neededLevel,
                potentialImprovement,
              };
            }
          }
        });

        improvements.push({
          clientId: client.id,
          clientName: client.name,
          segment: formatSegment(client.segment),
          currentFitScore: fitScore,
          currentAdvisorId: advisor.id,
          currentAdvisorName: advisor.profile.full_name,
          betterAdvisor: bestAlternative,
          topSkillGap,
          annualFee: annualFee || 0,
          needs,
        });
      });
    });

    // Sort by potential improvement (highest first)
    return improvements.sort((a, b) => {
      const aImprovement = Math.max(
        a.betterAdvisor?.improvement || 0,
        a.topSkillGap?.potentialImprovement || 0
      );
      const bImprovement = Math.max(
        b.betterAdvisor?.improvement || 0,
        b.topSkillGap?.potentialImprovement || 0
      );
      return bImprovement - aImprovement;
    });
  }, []);

  // Filter clients
  const filteredClients = useMemo(() => {
    return allClientImprovements.filter(client => {
      const matchesSearch = client.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAdvisor = advisorFilter === 'all' || client.currentAdvisorId === advisorFilter;
      return matchesSearch && matchesAdvisor;
    });
  }, [allClientImprovements, searchQuery, advisorFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const transferable = allClientImprovements.filter(c => c.betterAdvisor && c.betterAdvisor.improvement >= 10);
    const improvableBySkill = allClientImprovements.filter(c => c.topSkillGap && c.topSkillGap.potentialImprovement >= 5);
    const avgScore = allClientImprovements.length > 0
      ? Math.round(allClientImprovements.reduce((sum, c) => sum + c.currentFitScore, 0) / allClientImprovements.length)
      : 0;
    
    return {
      total: allClientImprovements.length,
      avgScore,
      transferable: transferable.length,
      improvableBySkill: improvableBySkill.length,
    };
  }, [allClientImprovements]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            All clients ranked by potential fit score improvement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={advisorFilter} onValueChange={setAdvisorFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Advisors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Advisors</SelectItem>
              {SEED_ADVISORS.map(advisor => (
                <SelectItem key={advisor.id} value={advisor.id}>
                  {advisor.profile.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className={cn('text-2xl font-bold', getScoreColor(stats.avgScore))}>
                  {stats.avgScore}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Better Fit Elsewhere</p>
                <p className="text-2xl font-bold text-warning">{stats.transferable}</p>
              </div>
              <ArrowRight className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Improvable by Training</p>
                <p className="text-2xl font-bold text-success">{stats.improvableBySkill}</p>
              </div>
              <Zap className="h-8 w-8 text-success opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Clients Ranked by Improvement Potential
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click a row to see detailed improvement options
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Current Advisor</TableHead>
                <TableHead>Current Fit</TableHead>
                <TableHead>Better Advisor</TableHead>
                <TableHead>Top Skill to Develop</TableHead>
                <TableHead className="text-right">Annual Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                const isExpanded = expandedClient === client.clientId;
                const hasImprovement = client.betterAdvisor || client.topSkillGap;
                
                return (
                  <>
                    <TableRow 
                      key={client.clientId}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isExpanded && 'bg-muted/50',
                        !hasImprovement && 'opacity-60'
                      )}
                      onClick={() => setExpandedClient(isExpanded ? null : client.clientId)}
                    >
                      <TableCell>
                        {hasImprovement && (
                          isExpanded 
                            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{client.clientName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {client.segment}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.currentAdvisorName}</TableCell>
                      <TableCell>
                        <span className={cn('font-semibold', getScoreColor(client.currentFitScore))}>
                          {client.currentFitScore}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {client.betterAdvisor ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{client.betterAdvisor.name}</span>
                            <Badge variant="secondary" className="text-success">
                              +{client.betterAdvisor.improvement}%
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Best fit here</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.topSkillGap ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm truncate max-w-[150px]">
                              {client.topSkillGap.subtopicName}
                            </span>
                            <Badge variant="outline" className="text-success">
                              +{client.topSkillGap.potentialImprovement}%
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No gaps</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(client.annualFee)}
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Details */}
                    {isExpanded && hasImprovement && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={8} className="py-4">
                          <div className="grid gap-4 md:grid-cols-2 px-4">
                            {/* Transfer Option */}
                            {client.betterAdvisor && (
                              <div className="p-4 rounded-lg border bg-background">
                                <div className="flex items-center gap-2 mb-3">
                                  <ArrowRight className="h-5 w-5 text-warning" />
                                  <h4 className="font-semibold">Transfer to Better Fit</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current Advisor</span>
                                    <span className="font-medium">{client.currentAdvisorName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Recommended Advisor</span>
                                    <span className="font-medium text-primary">{client.betterAdvisor.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current Fit</span>
                                    <span className={cn('font-medium', getScoreColor(client.currentFitScore))}>
                                      {client.currentFitScore}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">New Fit</span>
                                    <span className={cn('font-medium', getScoreColor(client.betterAdvisor.score))}>
                                      {client.betterAdvisor.score}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t">
                                    <span className="font-medium">Improvement</span>
                                    <Badge variant="default" className="bg-success">
                                      +{client.betterAdvisor.improvement}%
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Skill Development Option */}
                            {client.topSkillGap && (
                              <div className="p-4 rounded-lg border bg-background">
                                <div className="flex items-center gap-2 mb-3">
                                  <Zap className="h-5 w-5 text-success" />
                                  <h4 className="font-semibold">Develop {client.currentAdvisorName}'s Skill</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Skill to Develop</span>
                                    <span className="font-medium">{client.topSkillGap.subtopicName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current Level</span>
                                    <span className="font-medium text-destructive">
                                      {client.topSkillGap.currentLevel}/10
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Needed Level</span>
                                    <span className="font-medium text-success">
                                      {client.topSkillGap.neededLevel}/10
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t">
                                    <span className="font-medium">Potential Improvement</span>
                                    <Badge variant="default" className="bg-success">
                                      +{client.topSkillGap.potentialImprovement}%
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
