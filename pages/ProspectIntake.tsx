import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Building2, Target, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SEED_DOMAINS, SEED_SUBTOPICS } from '@/lib/seed-data';
import { formatSegment, type SegmentType } from '@/types/database';

const steps = [
  { id: 'client', label: 'Client Info', icon: Building2 },
  { id: 'needs', label: 'Planning Needs', icon: Target },
  { id: 'notes', label: 'Notes & Constraints', icon: FileText },
  { id: 'match', label: 'Find Matches', icon: Sparkles },
];

const segments = [
  { value: 'essentials', label: 'Essentials' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'private_client', label: 'Private Client' },
  { value: 'ultra_hnw', label: 'Ultra HNW' },
];

const complexityTiers = [
  { value: 'standard', label: 'Standard' },
  { value: 'complex', label: 'Complex' },
  { value: 'highly_complex', label: 'Highly Complex' },
];

const aumBands = ['< $500K', '$500K-$1M', '$1M-$2M', '$2M-$5M', '$5M-$10M', '$10M-$25M', '$25M+'];

interface NeedValue {
  importance: number;
  urgency: number;
  horizon: string;
}

export default function ProspectIntake() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedDomains, setExpandedDomains] = useState<string[]>([SEED_DOMAINS[0]?.id || '']);

  // Form state
  const [clientInfo, setClientInfo] = useState({
    name: '',
    segment: '',
    complexity: '',
    aum: '',
    netWorth: '',
    office: '',
  });

  const [needs, setNeeds] = useState<Record<string, NeedValue>>({});
  const [notes, setNotes] = useState('');

  const updateNeed = (subtopicId: string, field: keyof NeedValue, value: number | string) => {
    setNeeds((prev) => ({
      ...prev,
      [subtopicId]: {
        ...prev[subtopicId],
        importance: prev[subtopicId]?.importance ?? 5,
        urgency: prev[subtopicId]?.urgency ?? 5,
        horizon: prev[subtopicId]?.horizon ?? 'now',
        [field]: value,
      },
    }));
  };

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to match results with state
      navigate('/matches', { state: { clientInfo, needs, notes } });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Client/Prospect Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Williams Family Trust"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="office">Office Location</Label>
                <Select
                  value={clientInfo.office}
                  onValueChange={(value) => setClientInfo({ ...clientInfo, office: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select office" />
                  </SelectTrigger>
                  <SelectContent>
                    {['New York', 'San Francisco', 'Chicago', 'Miami', 'Boston', 'Los Angeles', 'Seattle', 'Dallas', 'Denver', 'Atlanta'].map((office) => (
                      <SelectItem key={office} value={office}>{office}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Client Segment</Label>
                <Select
                  value={clientInfo.segment}
                  onValueChange={(value) => setClientInfo({ ...clientInfo, segment: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((seg) => (
                      <SelectItem key={seg.value} value={seg.value}>{seg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Complexity Tier</Label>
                <Select
                  value={clientInfo.complexity}
                  onValueChange={(value) => setClientInfo({ ...clientInfo, complexity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    {complexityTiers.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>AUM Band</Label>
                <Select
                  value={clientInfo.aum}
                  onValueChange={(value) => setClientInfo({ ...clientInfo, aum: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AUM range" />
                  </SelectTrigger>
                  <SelectContent>
                    {aumBands.map((band) => (
                      <SelectItem key={band} value={band}>{band}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Net Worth Band</Label>
                <Select
                  value={clientInfo.netWorth}
                  onValueChange={(value) => setClientInfo({ ...clientInfo, netWorth: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select net worth range" />
                  </SelectTrigger>
                  <SelectContent>
                    {aumBands.map((band) => (
                      <SelectItem key={band} value={band}>{band}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            {SEED_DOMAINS.map((domain) => {
              const domainSubtopics = SEED_SUBTOPICS.filter((s) => s.domain_id === domain.id);
              const isExpanded = expandedDomains.includes(domain.id);
              const filledCount = domainSubtopics.filter((s) => needs[s.id]?.importance > 0).length;

              return (
                <Collapsible
                  key={domain.id}
                  open={isExpanded}
                  onOpenChange={() => toggleDomain(domain.id)}
                >
                  <div className="domain-section">
                    <CollapsibleTrigger asChild>
                      <div className="domain-header">
                        <div className="flex items-center gap-3">
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isExpanded && 'rotate-90'
                            )}
                          />
                          <span className="font-medium">{domain.name}</span>
                          {filledCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {filledCount} configured
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {domainSubtopics.length} topics
                        </span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 space-y-6 border-t">
                        {domainSubtopics.map((subtopic) => (
                          <div key={subtopic.id} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">{subtopic.name}</Label>
                              <Select
                                value={needs[subtopic.id]?.horizon || 'now'}
                                onValueChange={(value) => updateNeed(subtopic.id, 'horizon', value)}
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="now">Now</SelectItem>
                                  <SelectItem value="1yr">1 Year</SelectItem>
                                  <SelectItem value="3yr">3 Years</SelectItem>
                                  <SelectItem value="5yr">5 Years</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Importance</span>
                                  <span className="font-medium">{needs[subtopic.id]?.importance ?? 5}/10</span>
                                </div>
                                <Slider
                                  value={[needs[subtopic.id]?.importance ?? 5]}
                                  min={0}
                                  max={10}
                                  step={1}
                                  onValueChange={([value]) => updateNeed(subtopic.id, 'importance', value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Urgency</span>
                                  <span className="font-medium">{needs[subtopic.id]?.urgency ?? 5}/10</span>
                                </div>
                                <Slider
                                  value={[needs[subtopic.id]?.urgency ?? 5]}
                                  min={0}
                                  max={10}
                                  step={1}
                                  onValueChange={([value]) => updateNeed(subtopic.id, 'urgency', value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional context about the client, special circumstances, or preferences..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{clientInfo.name || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Segment:</span>
                  <span className="font-medium">{clientInfo.segment ? formatSegment(clientInfo.segment as SegmentType) : 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Complexity:</span>
                  <span className="font-medium capitalize">{clientInfo.complexity?.replace('_', ' ') || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Needs Configured:</span>
                  <span className="font-medium">{Object.keys(needs).length} topics</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center py-12 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Ready to Find Matches</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Click "Find Matches" to run the matching engine and see the best-fit advisors for{' '}
              <span className="font-medium text-foreground">{clientInfo.name || 'this prospect'}</span>.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Route a Prospect</h1>
        <p className="text-muted-foreground">
          Enter client information and planning needs to find the best-fit advisory team.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  isActive && 'bg-primary text-primary-foreground',
                  isComplete && 'bg-success/10 text-success',
                  !isActive && !isComplete && 'text-muted-foreground'
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="font-medium hidden md:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{steps[currentStep].label}</CardTitle>
          <CardDescription>
            {currentStep === 0 && 'Basic client information and classification'}
            {currentStep === 1 && 'Rate importance and urgency for each planning domain'}
            {currentStep === 2 && 'Add any additional notes or constraints'}
            {currentStep === 3 && 'Review and run the matching engine'}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Find Matches
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
