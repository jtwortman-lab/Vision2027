import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, AlertTriangle, ChevronRight, User } from 'lucide-react';
import { SEED_SUBTOPICS, SEED_DOMAINS } from '@/lib/seed-data';
import { getAdvisorClientBook } from '@/lib/client-assignments';
import { cn } from '@/lib/utils';
import type { AdvisorWithProfile } from '@/types/database';

interface SkillDevelopmentProps {
  advisor: AdvisorWithProfile;
}

interface SkillGap {
  subtopicId: string;
  subtopicName: string;
  domainName: string;
  currentSkill: number;
  requiredSkill: number;
  gap: number;
  clientCount: number;
  potentialFitImprovement: number;
  urgency: number;
  clientImpacts: ClientImpact[];
}

interface ClientImpact {
  clientId: string;
  clientName: string;
  currentFit: number;
  projectedFit: number;
  improvement: number;
  needImportance: number;
}

// Simple fit score calculation based on skill vs need
function calculateFitScore(skillLevel: number, needImportance: number): number {
  // Base fit from skill coverage of need
  const coverage = Math.min(skillLevel / Math.max(needImportance, 1), 1.5);
  // Penalty for under-skilling, diminishing returns for over-skilling
  if (skillLevel < needImportance) {
    return Math.round(coverage * 70); // Under-skilled: max 70%
  }
  return Math.round(70 + (coverage - 1) * 60); // Over-skilled: 70-100%
}

export function SkillDevelopment({ advisor }: SkillDevelopmentProps) {
  const [selectedGap, setSelectedGap] = useState<SkillGap | null>(null);
  const clientBook = useMemo(() => getAdvisorClientBook(advisor.id), [advisor.id]);

  // Analyze skill gaps based on client needs
  const skillGaps = useMemo(() => {
    const gapMap = new Map<string, {
      requiredLevels: number[];
      urgencies: number[];
      importances: number[];
      clientDetails: { clientId: string; clientName: string; importance: number }[];
    }>();

    // Collect all needs from clients
    clientBook.forEach(({ client, needs }) => {
      needs.forEach((need) => {
        const existing = gapMap.get(need.subtopic_id) || {
          requiredLevels: [],
          urgencies: [],
          importances: [],
          clientDetails: [],
        };
        existing.requiredLevels.push(need.importance);
        existing.urgencies.push(need.urgency);
        existing.importances.push(need.importance);
        existing.clientDetails.push({
          clientId: client.id,
          clientName: client.name,
          importance: need.importance,
        });
        gapMap.set(need.subtopic_id, existing);
      });
    });

    // Calculate gaps
    const gaps: SkillGap[] = [];

    gapMap.forEach((data, subtopicId) => {
      const subtopic = SEED_SUBTOPICS.find(st => st.id === subtopicId);
      const domain = SEED_DOMAINS.find(d => d.id === subtopic?.domain_id);
      const skill = advisor.skills?.find(s => s.subtopic_id === subtopicId);
      const currentSkill = skill?.skill_level ?? 0;
      
      // Calculate weighted required skill (higher importance needs count more)
      const avgRequired = Math.round(
        data.requiredLevels.reduce((a, b) => a + b, 0) / data.requiredLevels.length
      );
      const avgUrgency = Math.round(
        data.urgencies.reduce((a, b) => a + b, 0) / data.urgencies.length
      );
      
      const gap = avgRequired - currentSkill;
      
      if (gap > 0 && subtopic) {
        // Calculate per-client impact
        const clientImpacts: ClientImpact[] = data.clientDetails.map(cd => {
          const currentFit = calculateFitScore(currentSkill, cd.importance);
          const projectedFit = calculateFitScore(avgRequired, cd.importance);
          return {
            clientId: cd.clientId,
            clientName: cd.clientName,
            currentFit,
            projectedFit,
            improvement: projectedFit - currentFit,
            needImportance: cd.importance,
          };
        });

        // Estimate potential fit improvement
        const potentialImprovement = Math.round(
          clientImpacts.reduce((sum, ci) => sum + ci.improvement, 0) / clientImpacts.length
        );
        
        gaps.push({
          subtopicId,
          subtopicName: subtopic.name,
          domainName: domain?.name || 'Unknown',
          currentSkill,
          requiredSkill: avgRequired,
          gap,
          clientCount: data.requiredLevels.length,
          potentialFitImprovement: Math.min(potentialImprovement, 25), // Cap at 25%
          urgency: avgUrgency,
          clientImpacts: clientImpacts.sort((a, b) => b.improvement - a.improvement),
        });
      }
    });

    // Sort by potential fit improvement (highest first)
    return gaps.sort((a, b) => b.potentialFitImprovement - a.potentialFitImprovement);
  }, [advisor, clientBook]);

  // Group by domain for overview
  const domainSummary = useMemo(() => {
    const summary = new Map<string, { gapCount: number; totalImprovement: number }>();
    
    skillGaps.forEach(gap => {
      const existing = summary.get(gap.domainName) || { gapCount: 0, totalImprovement: 0 };
      existing.gapCount += 1;
      existing.totalImprovement += gap.potentialFitImprovement;
      summary.set(gap.domainName, existing);
    });

    return Array.from(summary.entries())
      .map(([domain, data]) => ({ domain, ...data }))
      .sort((a, b) => b.totalImprovement - a.totalImprovement);
  }, [skillGaps]);

  const totalPotentialImprovement = skillGaps.reduce((sum, g) => sum + g.potentialFitImprovement, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skills to Develop</p>
                <p className="text-2xl font-bold">{skillGaps.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potential Fit Boost</p>
                <p className="text-2xl font-bold text-success">+{Math.min(totalPotentialImprovement, 40)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority Gaps</p>
                <p className="text-2xl font-bold text-warning">
                  {skillGaps.filter(g => g.urgency >= 7).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Gap List with Click-to-Expand */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Development Priorities</CardTitle>
          <p className="text-sm text-muted-foreground">Click a skill to see client fit score impacts</p>
        </CardHeader>
        <CardContent>
          {skillGaps.length > 0 ? (
            <div className="space-y-3">
              {skillGaps.slice(0, 8).map((gap, index) => (
                <div key={gap.subtopicId}>
                  <div 
                    onClick={() => setSelectedGap(selectedGap?.subtopicId === gap.subtopicId ? null : gap)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                      selectedGap?.subtopicId === gap.subtopicId 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                        index === 0 ? 'bg-success/20 text-success' :
                        index < 3 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{gap.subtopicName}</div>
                        <div className="text-xs text-muted-foreground">{gap.domainName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="text-destructive font-medium">{gap.currentSkill}</span>
                          <span className="text-muted-foreground mx-1">→</span>
                          <span className="text-success font-medium">{gap.requiredSkill}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{gap.clientCount} client{gap.clientCount > 1 ? 's' : ''}</div>
                      </div>
                      <Badge 
                        variant={gap.urgency >= 7 ? 'destructive' : gap.urgency >= 5 ? 'default' : 'secondary'}
                        className="w-16 justify-center"
                      >
                        +{gap.potentialFitImprovement}%
                      </Badge>
                      <ChevronRight className={cn(
                        'h-5 w-5 text-muted-foreground transition-transform',
                        selectedGap?.subtopicId === gap.subtopicId && 'rotate-90'
                      )} />
                    </div>
                  </div>
                  
                  {/* Expanded Client Impact Details */}
                  {selectedGap?.subtopicId === gap.subtopicId && (
                    <div className="mt-2 ml-11 p-4 rounded-lg bg-background border border-primary/20">
                      <div className="text-sm font-medium mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Client Fit Score Changes
                      </div>
                      <div className="space-y-2">
                        {gap.clientImpacts.map((impact) => (
                          <div 
                            key={impact.clientId}
                            className="flex items-center justify-between p-2 rounded bg-muted/30"
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{impact.clientName}</span>
                              <Badge variant="outline" className="text-xs">
                                Need: {impact.needImportance}/10
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm">
                                <span className={cn(
                                  'font-medium',
                                  impact.currentFit < 60 ? 'text-destructive' : 
                                  impact.currentFit < 80 ? 'text-warning' : 'text-success'
                                )}>
                                  {impact.currentFit}%
                                </span>
                                <span className="text-muted-foreground mx-2">→</span>
                                <span className="text-success font-medium">{impact.projectedFit}%</span>
                              </div>
                              <Badge variant="secondary" className="text-success">
                                +{impact.improvement}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                        <span className="text-muted-foreground">Average Improvement</span>
                        <span className="font-medium text-success">
                          +{Math.round(gap.clientImpacts.reduce((sum, ci) => sum + ci.improvement, 0) / gap.clientImpacts.length)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No development priorities identified.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Summary */}
      {domainSummary.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Focus Areas by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {domainSummary.map(({ domain, gapCount, totalImprovement }) => (
                <div 
                  key={domain}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30"
                >
                  <span className="font-medium">{domain}</span>
                  <Badge variant="outline">{gapCount} gap{gapCount > 1 ? 's' : ''}</Badge>
                  <Badge variant="secondary" className="text-success">+{totalImprovement}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}