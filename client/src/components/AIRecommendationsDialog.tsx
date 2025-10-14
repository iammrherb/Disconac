import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, CheckCircle, BookOpen, AlertTriangle, Sparkles } from "lucide-react";

interface AIRecommendationsDialogProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIRecommendation {
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
  }>;
}

interface BestPractices {
  practices: Array<{
    title: string;
    description: string;
    category: string;
    compliance?: string[];
  }>;
}

interface ImplementationGuide {
  phases: Array<{
    name: string;
    description: string;
    duration: string;
    tasks: string[];
  }>;
  risks: Array<{
    risk: string;
    mitigation: string;
    severity: "high" | "medium" | "low";
  }>;
}

const priorityColors = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

const severityColors = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

export function AIRecommendationsDialog({ sessionId, open, onOpenChange }: AIRecommendationsDialogProps) {
  const [activeTab, setActiveTab] = useState("recommendations");

  const { data: recommendations, isLoading: recLoading } = useQuery<AIRecommendation>({
    queryKey: [`/api/sessions/${sessionId}/ai-recommendations`],
    enabled: open,
  });

  const { data: bestPractices, isLoading: bpLoading } = useQuery<BestPractices>({
    queryKey: [`/api/sessions/${sessionId}/best-practices`],
    enabled: open,
  });

  const { data: implementationGuide, isLoading: igLoading } = useQuery<ImplementationGuide>({
    queryKey: [`/api/sessions/${sessionId}/implementation-guide`],
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="dialog-ai-recommendations">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="title-ai-recommendations">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Deployment Insights
          </DialogTitle>
          <DialogDescription data-testid="description-ai-recommendations">
            Intelligent recommendations generated from your questionnaire responses
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations" data-testid="tab-recommendations">
              <Lightbulb className="h-4 w-4 mr-2" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="best-practices" data-testid="tab-best-practices">
              <CheckCircle className="h-4 w-4 mr-2" />
              Best Practices
            </TabsTrigger>
            <TabsTrigger value="implementation" data-testid="tab-implementation">
              <BookOpen className="h-4 w-4 mr-2" />
              Implementation Guide
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="recommendations" className="mt-0">
              {recLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendations?.recommendations.length ? (
                <div className="space-y-4" data-testid="list-ai-recommendations">
                  {recommendations.recommendations.map((rec, idx) => (
                    <Card key={idx} data-testid={`card-recommendation-${idx}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-lg" data-testid={`title-recommendation-${idx}`}>
                            {rec.title}
                          </CardTitle>
                          <Badge variant={priorityColors[rec.priority]} data-testid={`badge-priority-${idx}`}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <CardDescription data-testid={`category-recommendation-${idx}`}>
                          {rec.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground" data-testid={`description-recommendation-${idx}`}>
                          {rec.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground" data-testid="text-no-recommendations">
                      No recommendations available. Please ensure questionnaire is completed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="best-practices" className="mt-0">
              {bpLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : bestPractices?.practices.length ? (
                <div className="space-y-4" data-testid="list-best-practices">
                  {bestPractices.practices.map((practice, idx) => (
                    <Card key={idx} data-testid={`card-practice-${idx}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-lg" data-testid={`title-practice-${idx}`}>
                            {practice.title}
                          </CardTitle>
                          {practice.compliance && practice.compliance.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {practice.compliance.map((comp, i) => (
                                <Badge key={i} variant="outline" data-testid={`badge-compliance-${idx}-${i}`}>
                                  {comp}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <CardDescription data-testid={`category-practice-${idx}`}>
                          {practice.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground" data-testid={`description-practice-${idx}`}>
                          {practice.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground" data-testid="text-no-practices">
                      No best practices available. Please ensure questionnaire is completed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="implementation" className="mt-0">
              {igLoading ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                </div>
              ) : implementationGuide ? (
                <div className="space-y-6">
                  {/* Implementation Phases */}
                  {implementationGuide.phases && implementationGuide.phases.length > 0 && (
                    <div data-testid="section-implementation-phases">
                      <h3 className="text-lg font-semibold mb-4">Implementation Phases</h3>
                      <div className="space-y-4">
                        {implementationGuide.phases.map((phase, idx) => (
                          <Card key={idx} data-testid={`card-phase-${idx}`}>
                            <CardHeader>
                              <div className="flex items-start justify-between gap-4">
                                <CardTitle className="text-lg" data-testid={`title-phase-${idx}`}>
                                  Phase {idx + 1}: {phase.name}
                                </CardTitle>
                                <Badge variant="outline" data-testid={`badge-duration-${idx}`}>
                                  {phase.duration}
                                </Badge>
                              </div>
                              <CardDescription data-testid={`description-phase-${idx}`}>
                                {phase.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <h4 className="font-medium mb-2">Key Tasks:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {phase.tasks.map((task, taskIdx) => (
                                  <li key={taskIdx} className="text-sm text-muted-foreground" data-testid={`task-phase-${idx}-${taskIdx}`}>
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Assessment */}
                  {implementationGuide.risks && implementationGuide.risks.length > 0 && (
                    <div data-testid="section-risk-assessment">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Risk Assessment & Mitigation
                      </h3>
                      <div className="space-y-3">
                        {implementationGuide.risks.map((risk, idx) => (
                          <Card key={idx} data-testid={`card-risk-${idx}`}>
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <Badge variant={severityColors[risk.severity]} data-testid={`badge-severity-${idx}`}>
                                  {risk.severity}
                                </Badge>
                                <div className="flex-1">
                                  <p className="font-medium mb-2" data-testid={`risk-description-${idx}`}>
                                    {risk.risk}
                                  </p>
                                  <p className="text-sm text-muted-foreground" data-testid={`risk-mitigation-${idx}`}>
                                    <strong>Mitigation:</strong> {risk.mitigation}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground" data-testid="text-no-implementation-guide">
                      No implementation guide available. Please ensure questionnaire is completed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-ai-dialog">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
