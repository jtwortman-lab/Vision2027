import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Save, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { SEED_DOMAINS, SEED_SUBTOPICS } from '@/lib/seed-data';

export default function AdminTaxonomy() {
  const [domains, setDomains] = useState(SEED_DOMAINS);
  const [subtopics, setSubtopics] = useState(SEED_SUBTOPICS);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(SEED_DOMAINS[0]?.id || null);
  const [isAddingDomain, setIsAddingDomain] = useState(false);

  // Scoring config state
  const [overSkillPenalty, setOverSkillPenalty] = useState(0.5);
  const [underSkillPenalty, setUnderSkillPenalty] = useState(2.0);
  const [capacityThreshold, setCapacityThreshold] = useState(0.8);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin: Taxonomy & Weights</h1>
          <p className="text-muted-foreground">
            Manage domains, subtopics, and matching algorithm configuration.
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Version 1.0
        </Badge>
      </div>

      <Tabs defaultValue="taxonomy" className="space-y-6">
        <TabsList>
          <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Curves</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
        </TabsList>

        {/* Taxonomy Tab */}
        <TabsContent value="taxonomy">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Domains & Subtopics</CardTitle>
                <CardDescription>
                  Manage the taxonomy of planning domains and their subtopics.
                </CardDescription>
              </div>
              <Dialog open={isAddingDomain} onOpenChange={setIsAddingDomain}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Domain
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Domain</DialogTitle>
                    <DialogDescription>
                      Create a new planning domain for the taxonomy.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain-name">Domain Name</Label>
                      <Input id="domain-name" placeholder="e.g., Risk Management" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain-desc">Description</Label>
                      <Textarea id="domain-desc" placeholder="Brief description of this domain..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingDomain(false)}>Cancel</Button>
                    <Button onClick={() => setIsAddingDomain(false)}>Create Domain</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {domains.map((domain, idx) => {
                  const domainSubtopics = subtopics.filter((s) => s.domain_id === domain.id);
                  const isExpanded = expandedDomain === domain.id;

                  return (
                    <Collapsible
                      key={domain.id}
                      open={isExpanded}
                      onOpenChange={() => setExpandedDomain(isExpanded ? null : domain.id)}
                    >
                      <div className="border rounded-lg">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <ChevronRight
                              className={cn(
                                'h-4 w-4 transition-transform',
                                isExpanded && 'rotate-90'
                              )}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{domain.name}</p>
                              <p className="text-sm text-muted-foreground">{domain.description}</p>
                            </div>
                            <Badge variant="secondary">{domainSubtopics.length} subtopics</Badge>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t p-4 space-y-3 bg-muted/30">
                            {domainSubtopics.map((subtopic) => (
                              <div
                                key={subtopic.id}
                                className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{subtopic.name}</p>
                                  <p className="text-xs text-muted-foreground">{subtopic.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Default Weight</p>
                                  <p className="font-medium">{subtopic.default_weight}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Subtopic
                            </Button>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Curves Tab */}
        <TabsContent value="scoring">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Over-Skill Penalty</CardTitle>
                <CardDescription>
                  Reduce score when advisor skills exceed client needs (prevents overskilling).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Penalty Factor</span>
                    <span className="font-medium">{overSkillPenalty.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[overSkillPenalty]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([value]) => setOverSkillPenalty(value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values = stronger penalty for over-qualified advisors.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Effect Preview</p>
                  <p className="text-sm text-muted-foreground">
                    If advisor skill is 8 and client needs 5, score reduction: {((8 - 5) * overSkillPenalty * 10).toFixed(0)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Under-Skill Penalty</CardTitle>
                <CardDescription>
                  Reduce score when advisor skills are below client needs (prevents underskilling).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Penalty Factor</span>
                    <span className="font-medium">{underSkillPenalty.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[underSkillPenalty]}
                    min={1}
                    max={5}
                    step={0.1}
                    onValueChange={([value]) => setUnderSkillPenalty(value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values = stronger penalty for under-qualified advisors.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Effect Preview</p>
                  <p className="text-sm text-muted-foreground">
                    If advisor skill is 4 and client needs 7, score reduction: {((7 - 4) * underSkillPenalty * 10).toFixed(0)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle>Capacity Thresholds</CardTitle>
              <CardDescription>
                Configure when capacity-based penalties apply to advisor matching.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Capacity Warning Threshold</span>
                    <span className="font-medium">{(capacityThreshold * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[capacityThreshold]}
                    min={0.5}
                    max={1}
                    step={0.05}
                    onValueChange={([value]) => setCapacityThreshold(value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Advisors above this threshold receive reduced match scores.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <p className="text-sm font-medium">Capacity Zones</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-success" />
                        Available
                      </span>
                      <span className="text-muted-foreground">0% - {(capacityThreshold * 100 - 15).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-warning" />
                        Limited
                      </span>
                      <span className="text-muted-foreground">{(capacityThreshold * 100 - 15).toFixed(0)}% - {(capacityThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-destructive" />
                        At Capacity
                      </span>
                      <span className="text-muted-foreground">{(capacityThreshold * 100).toFixed(0)}%+</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
