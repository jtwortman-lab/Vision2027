import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Minus, PlusCircle } from 'lucide-react';
import { SEED_DOMAINS, SEED_SUBTOPICS } from '@/lib/seed-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SkillHistoryChartProps {
  advisorId: string;
  skills: Array<{
    id: string;
    subtopic_id: string;
    skill_level: number;
  }>;
}

// Get current quarter
const getCurrentQuarter = () => {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return { quarter, year: now.getFullYear() };
};

// Format quarter label
const formatQuarter = (quarter: number, year: number) => `Q${quarter} ${year}`;

// Generate quarterly skill history data
const generateQuarterlySkillHistory = (advisorId: string, subtopicId: string, currentLevel: number) => {
  const seed = (advisorId + subtopicId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min) + min);
  };

  const { quarter: currentQ, year: currentYear } = getCurrentQuarter();
  const data = [];
  
  // Generate 8 quarters of data (2 years)
  const quartersOfData = 8;
  const startingLevel = Math.max(1, currentLevel - random(2, 4));

  for (let i = quartersOfData - 1; i >= 0; i--) {
    let q = currentQ - i;
    let y = currentYear;
    
    while (q <= 0) {
      q += 4;
      y -= 1;
    }
    while (q > 4) {
      q -= 4;
      y += 1;
    }
    
    const progress = (quartersOfData - 1 - i) / (quartersOfData - 1);
    const targetLevel = startingLevel + (currentLevel - startingLevel) * progress;
    const variation = (random(-8, 8, i) / 100);
    const level = Math.min(10, Math.max(1, Math.round(targetLevel * (1 + variation))));
    
    data.push({
      quarter: q,
      year: y,
      label: formatQuarter(q, y),
      level,
    });
  }

  return data;
};

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(217, 91%, 60%)',
  'hsl(280, 65%, 60%)',
];

export function SkillHistoryChart({ advisorId, skills }: SkillHistoryChartProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>(SEED_DOMAINS[0]?.id || '');
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackScores, setFeedbackScores] = useState<Record<string, number>>({});

  const { quarter: currentQ, year: currentYear } = getCurrentQuarter();

  // Get skills for selected domain
  const domainSkills = useMemo(() => {
    return skills.filter(skill => {
      const subtopic = SEED_SUBTOPICS.find(st => st.id === skill.subtopic_id);
      return subtopic?.domain_id === selectedDomain;
    });
  }, [skills, selectedDomain]);

  // Initialize selected skills when domain changes
  useMemo(() => {
    if (domainSkills.length > 0 && selectedSkills.size === 0) {
      setSelectedSkills(new Set(domainSkills.slice(0, 3).map(s => s.subtopic_id)));
    }
  }, [domainSkills]);

  // Initialize feedback scores with ALL subtopic skills (not just selected domain)
  const initializeFeedbackScores = () => {
    const scores: Record<string, number> = {};
    skills.forEach(skill => {
      // Use current skill level as the "prior quarter" baseline
      scores[skill.subtopic_id] = skill.skill_level;
    });
    setFeedbackScores(scores);
    setFeedbackDialogOpen(true);
  };

  // Group all skills by domain for the feedback dialog
  const skillsByDomain = useMemo(() => {
    const grouped = new Map<string, Array<{ skill: typeof skills[0]; subtopic: typeof SEED_SUBTOPICS[0] }>>();
    
    skills.forEach(skill => {
      const subtopic = SEED_SUBTOPICS.find(st => st.id === skill.subtopic_id);
      if (subtopic) {
        const domain = SEED_DOMAINS.find(d => d.id === subtopic.domain_id);
        const domainName = domain?.name || 'Other';
        const existing = grouped.get(domainName) || [];
        existing.push({ skill, subtopic });
        grouped.set(domainName, existing);
      }
    });
    
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [skills]);

  const adjustScore = (subtopicId: string, delta: number) => {
    setFeedbackScores(prev => ({
      ...prev,
      [subtopicId]: Math.min(10, Math.max(1, (prev[subtopicId] || 5) + delta)),
    }));
  };

  const handleSaveFeedback = () => {
    // In a real app, this would save to the database
    toast.success(`Skill feedback saved for ${formatQuarter(currentQ, currentYear)}`);
    setFeedbackDialogOpen(false);
  };

  // Generate chart data combining all selected skills
  const chartData = useMemo(() => {
    const { quarter: currentQ, year: currentYear } = getCurrentQuarter();
    const quarters: string[] = [];
    
    // Generate 8 quarters
    for (let i = 7; i >= 0; i--) {
      let q = currentQ - i;
      let y = currentYear;
      while (q <= 0) {
        q += 4;
        y -= 1;
      }
      quarters.push(formatQuarter(q, y));
    }
    
    return quarters.map(quarterLabel => {
      const dataPoint: Record<string, string | number> = { quarter: quarterLabel };
      
      domainSkills.forEach(skill => {
        if (selectedSkills.has(skill.subtopic_id)) {
          const history = generateQuarterlySkillHistory(advisorId, skill.subtopic_id, skill.skill_level);
          const quarterData = history.find(h => h.label === quarterLabel);
          const subtopic = SEED_SUBTOPICS.find(st => st.id === skill.subtopic_id);
          if (quarterData && subtopic) {
            dataPoint[subtopic.name] = quarterData.level;
          }
        }
      });
      
      return dataPoint;
    });
  }, [advisorId, domainSkills, selectedSkills]);

  const toggleSkill = (subtopicId: string) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subtopicId)) {
        newSet.delete(subtopicId);
      } else {
        newSet.add(subtopicId);
      }
      return newSet;
    });
  };

  const handleDomainChange = (domainId: string) => {
    setSelectedDomain(domainId);
    // Reset selected skills when domain changes
    const newDomainSkills = skills.filter(skill => {
      const subtopic = SEED_SUBTOPICS.find(st => st.id === skill.subtopic_id);
      return subtopic?.domain_id === domainId;
    });
    setSelectedSkills(new Set(newDomainSkills.slice(0, 3).map(s => s.subtopic_id)));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Skill Progression Over Time</CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={initializeFeedbackScores}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add {formatQuarter(currentQ, currentYear)} Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Add Skill Feedback for {formatQuarter(currentQ, currentYear)}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Adjust skill scores for the current quarter. Scores are prepopulated from prior assessments.
                  </p>
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {skillsByDomain.map(([domainName, domainSkillList]) => (
                      <div key={domainName}>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                          {domainName}
                        </h4>
                        <div className="space-y-2">
                          {domainSkillList.map(({ skill, subtopic }) => {
                            const score = feedbackScores[skill.subtopic_id] ?? skill.skill_level;
                            
                            return (
                              <div key={skill.subtopic_id} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30">
                                <span className="text-sm font-medium flex-1 truncate pr-4">
                                  {subtopic.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => adjustScore(skill.subtopic_id, -1)}
                                    className="p-1.5 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                                    disabled={score <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className={cn(
                                    'w-8 text-center font-bold text-lg tabular-nums',
                                    score >= 7 ? 'text-success' : 
                                    score >= 5 ? 'text-warning' : 'text-destructive'
                                  )}>
                                    {score}
                                  </span>
                                  <button
                                    onClick={() => adjustScore(skill.subtopic_id, 1)}
                                    className="p-1.5 rounded-full hover:bg-success/10 text-success transition-colors"
                                    disabled={score >= 10}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveFeedback}>
                    Save Feedback
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Select value={selectedDomain} onValueChange={handleDomainChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {SEED_DOMAINS.map(domain => (
                  <SelectItem key={domain.id} value={domain.id}>
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Skill selection badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {domainSkills.map((skill) => {
            const subtopic = SEED_SUBTOPICS.find(st => st.id === skill.subtopic_id);
            const isSelected = selectedSkills.has(skill.subtopic_id);
            const colorIndex = Array.from(selectedSkills).indexOf(skill.subtopic_id);
            
            return (
              <button
                key={skill.subtopic_id}
                onClick={() => toggleSkill(skill.subtopic_id)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                  isSelected 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'
                )}
              >
                {isSelected && (
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: CHART_COLORS[colorIndex % CHART_COLORS.length] }}
                  />
                )}
                {subtopic?.name}
                <span className={cn(
                  'ml-1 font-bold',
                  skill.skill_level >= 7 ? 'text-success' : 
                  skill.skill_level >= 5 ? 'text-warning' : 'text-destructive'
                )}>
                  {skill.skill_level}
                </span>
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="quarter" 
                tick={{ fontSize: 11 }} 
                className="text-muted-foreground"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis 
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              {Array.from(selectedSkills).map((subtopicId, index) => {
                const subtopic = SEED_SUBTOPICS.find(st => st.id === subtopicId);
                if (!subtopic) return null;
                
                return (
                  <Line
                    key={subtopicId}
                    type="monotone"
                    dataKey={subtopic.name}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {selectedSkills.size === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Click on skills above to view their progression over time
          </div>
        )}
      </CardContent>
    </Card>
  );
}