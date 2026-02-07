import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SEED_DOMAINS, SEED_SUBTOPICS } from '@/lib/seed-data';

interface NeedValue {
  importance: number;
  urgency: number;
  horizon: string;
}

interface ClientNeedsEditorProps {
  needs: Record<string, NeedValue>;
  onNeedsChange: (needs: Record<string, NeedValue>) => void;
}

const numericOptions = Array.from({ length: 11 }, (_, i) => i);

export function ClientNeedsEditor({ needs, onNeedsChange }: ClientNeedsEditorProps) {
  const [expandedDomains, setExpandedDomains] = useState<string[]>([SEED_DOMAINS[0]?.id || '']);

  const updateNeed = (subtopicId: string, field: keyof NeedValue, value: number | string) => {
    const updated = {
      ...needs,
      [subtopicId]: {
        importance: needs[subtopicId]?.importance ?? 5,
        urgency: needs[subtopicId]?.urgency ?? 5,
        horizon: needs[subtopicId]?.horizon ?? 'now',
        [field]: value,
      },
    };
    onNeedsChange(updated);
  };

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId]
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Client Needs Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
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
              <div className="border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                      />
                      <span className="font-medium text-sm">{domain.name}</span>
                      {filledCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {filledCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t bg-muted/20">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left p-2 font-medium">Topic</th>
                          <th className="text-center p-2 font-medium w-20">Imp.</th>
                          <th className="text-center p-2 font-medium w-20">Urg.</th>
                          <th className="text-center p-2 font-medium w-24">Horizon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {domainSubtopics.map((subtopic) => (
                          <tr key={subtopic.id} className="border-b last:border-0">
                            <td className="p-2 text-sm">{subtopic.name}</td>
                            <td className="p-2">
                              <Select
                                value={String(needs[subtopic.id]?.importance ?? 5)}
                                onValueChange={(value) => updateNeed(subtopic.id, 'importance', parseInt(value))}
                              >
                                <SelectTrigger className="h-8 w-16 text-center bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                  {numericOptions.map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">
                              <Select
                                value={String(needs[subtopic.id]?.urgency ?? 5)}
                                onValueChange={(value) => updateNeed(subtopic.id, 'urgency', parseInt(value))}
                              >
                                <SelectTrigger className="h-8 w-16 text-center bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                  {numericOptions.map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">
                              <Select
                                value={needs[subtopic.id]?.horizon || 'now'}
                                onValueChange={(value) => updateNeed(subtopic.id, 'horizon', value)}
                              >
                                <SelectTrigger className="h-8 w-20 bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                  <SelectItem value="now">Now</SelectItem>
                                  <SelectItem value="1yr">1 Yr</SelectItem>
                                  <SelectItem value="3yr">3 Yr</SelectItem>
                                  <SelectItem value="5yr">5 Yr</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}
