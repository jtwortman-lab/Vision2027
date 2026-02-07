import { useState, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Check, Info, AlertTriangle, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScoreBar } from '@/components/ui/score-bar';
import { cn } from '@/lib/utils';
import { calculateMatchScores, getScoreColor, getScoreLabel, type MatchScore } from '@/lib/matching-engine';
import { SEED_ADVISORS, SEED_SUBTOPICS, generateSampleNeeds, SEED_PROSPECTS } from '@/lib/seed-data';
import { AdvisorMatchCard } from '@/components/match/AdvisorMatchCard';
import { ClientNeedsEditor } from '@/components/match/ClientNeedsEditor';
import type { ClientNeed } from '@/types/database';

interface NeedValue {
  importance: number;
  urgency: number;
  horizon: string;
}

export default function MatchResults() {
  const location = useLocation();
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'lead' | 'backup' | 'support'>('lead');
  const [showNeedsPanel, setShowNeedsPanel] = useState(true);

  // Get initial data from navigation state
  const clientInfo = location.state?.clientInfo || { name: SEED_PROSPECTS[0]?.name || 'Sample Client' };
  const initialNeeds = location.state?.needs || {};

  // Editable needs state
  const [editableNeeds, setEditableNeeds] = useState<Record<string, NeedValue>>(() => {
    // If we have initial needs from navigation, use those
    if (Object.keys(initialNeeds).length > 0) {
      return initialNeeds;
    }
    // Otherwise, generate from sample needs
    const sampleNeeds = generateSampleNeeds(SEED_PROSPECTS[0]?.id || 'prospect-1');
    const needsMap: Record<string, NeedValue> = {};
    sampleNeeds.forEach((need) => {
      needsMap[need.subtopic_id] = {
        importance: need.importance,
        urgency: need.urgency,
        horizon: need.horizon,
      };
    });
    return needsMap;
  });

  // Convert editable needs to ClientNeed format for matching engine
  const needs: ClientNeed[] = useMemo(() => {
    return Object.entries(editableNeeds).map(([subtopicId, values]) => ({
      id: `need-${subtopicId}`,
      client_id: 'prospect-new',
      subtopic_id: subtopicId,
      importance: values.importance || 5,
      urgency: values.urgency || 5,
      horizon: values.horizon || 'now',
      notes: '',
      created_at: '',
      updated_at: '',
      subtopic: SEED_SUBTOPICS.find((s) => s.id === subtopicId),
    })) as ClientNeed[];
  }, [editableNeeds]);

  // Calculate match scores - updates dynamically when needs change
  const matchScores = useMemo(() => {
    return calculateMatchScores(SEED_ADVISORS, needs);
  }, [needs]);

  const handleNeedsChange = useCallback((newNeeds: Record<string, NeedValue>) => {
    setEditableNeeds(newNeeds);
  }, []);

  const getScoreForRole = (score: MatchScore, role: 'lead' | 'backup' | 'support') => {
    switch (role) {
      case 'lead':
        return score.leadScore;
      case 'backup':
        return score.backupScore;
      case 'support':
        return score.supportScore;
    }
  };

  const sortedScores = [...matchScores].sort(
    (a, b) => getScoreForRole(b, selectedRole) - getScoreForRole(a, selectedRole)
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/intake">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Top Matches</h1>
            <p className="text-muted-foreground">
              Client: <span className="font-medium text-foreground">{clientInfo.name}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Toggle Needs Panel */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowNeedsPanel(!showNeedsPanel)}
            className="gap-2"
          >
            {showNeedsPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            {showNeedsPanel ? 'Hide Needs' : 'Show Needs'}
          </Button>
          
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs bg-muted/50 px-3 py-2 rounded-lg">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-4 border-r-2 border-dashed border-foreground/50" />
              <span className="text-muted-foreground">Client need</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 rounded skill-bar-meets" />
              <span>Advisor ≥ 100%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 rounded skill-bar-partial" />
              <span>Advisor 50-99%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 rounded skill-bar-gap" />
              <span>Advisor &lt; 50%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 rounded skill-bar-excess" />
              <span>Excess skill</span>
            </span>
          </div>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="mb-6">
        <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
          <TabsList>
            <TabsTrigger value="lead">Lead</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content with optional Needs Panel */}
      <div className={cn('flex gap-6', !showNeedsPanel && 'flex-col')}>
        {/* Needs Editor Panel */}
        {showNeedsPanel && (
          <div className="w-[380px] flex-shrink-0">
            <ClientNeedsEditor 
              needs={editableNeeds} 
              onNeedsChange={handleNeedsChange} 
            />
          </div>
        )}

        {/* Match Results */}
        <div className="flex-1 min-w-0">
          {/* Match Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {sortedScores.slice(0, 6).map((score, idx) => (
              <AdvisorMatchCard
                key={score.advisorId}
                score={score}
                rank={idx + 1}
                needs={needs}
                selectedRole={selectedRole}
              />
            ))}
          </div>

      {/* All Matches List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>All Advisor Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedScores.slice(6).map((score, idx) => {
              const roleScore = getScoreForRole(score, selectedRole);
              const colorClass = getScoreColor(roleScore);
              const isExpanded = expandedAdvisor === score.advisorId;

              return (
                <Collapsible
                  key={score.advisorId}
                  open={isExpanded}
                  onOpenChange={() => setExpandedAdvisor(isExpanded ? null : score.advisorId)}
                >
                  <div className="border rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                        <span className="w-6 text-center font-medium text-muted-foreground">
                          #{idx + 7}
                        </span>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-sm bg-secondary">
                            {score.advisor.profile.full_name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{score.advisor.profile.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {score.advisor.profile.office} • {score.advisor.profile.team}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={cn('text-xl font-bold', `match-score-${colorClass}`)}>
                              {roleScore}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {score.advisor.capacityPercentage}% capacity
                            </p>
                          </div>
                          <ScoreBar score={roleScore} className="w-24" size="sm" />
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 border-t bg-muted/30">
                        <div className="grid gap-4 md:grid-cols-3 py-4">
                          {/* Drivers */}
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Check className="h-4 w-4 text-success" />
                              Strengths
                            </h4>
                            <ul className="space-y-1">
                              {score.explanation.top_drivers.map((driver, i) => (
                                <li key={i} className="text-sm text-muted-foreground">
                                  {driver}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Gaps */}
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-warning" />
                              Gaps
                            </h4>
                            <ul className="space-y-1">
                              {score.explanation.gaps.length > 0 ? (
                                score.explanation.gaps.map((gap, i) => (
                                  <li key={i} className="text-sm text-muted-foreground">
                                    {gap}
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground">No significant gaps</li>
                              )}
                            </ul>
                          </div>

                          {/* Profile */}
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Info className="h-4 w-4 text-primary" />
                              Profile
                            </h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Experience: {score.advisor.years_experience} years</p>
                              <p>Certifications: {score.advisor.certifications.join(', ') || 'None'}</p>
                              <p>Clients: {score.advisor.current_families}/{score.advisor.max_families}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/advisors?id=${score.advisorId}`}>View Profile</Link>
                          </Button>
                          <Button size="sm">
                            Assign as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
