import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, AlertCircle, Info } from "lucide-react";
import type { DeploymentChecklist, DocumentationLink, QuestionnaireResponse } from "@shared/schema";

export default function ChecklistView() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: checklist, isLoading } = useQuery<DeploymentChecklist[]>({
    queryKey: [`/api/sessions/${id}/checklist`],
    enabled: !!id && isAuthenticated,
  });

  const { data: responses } = useQuery<QuestionnaireResponse[]>({
    queryKey: [`/api/sessions/${id}/responses`],
    enabled: !!id && isAuthenticated,
  });

  const { data: recommendedDocs, isLoading: docsLoading } = useQuery<DocumentationLink[]>({
    queryKey: [`/api/documentation/recommendations`, responses],
    queryFn: async () => {
      if (!responses || responses.length === 0) return [];
      
      // Convert responses array to object format for API
      const responsesObj = responses.reduce((acc, r) => {
        try {
          acc[r.questionId] = JSON.parse(r.answer);
        } catch {
          acc[r.questionId] = r.answer;
        }
        return acc;
      }, {} as Record<string, any>);
      
      const result = await apiRequest("POST", "/api/documentation/recommendations", responsesObj);
      return result;
    },
    enabled: !!responses && responses.length > 0 && isAuthenticated,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      return await apiRequest("PUT", `/api/checklist/${itemId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${id}/checklist`] });
    },
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 gap-1"><AlertCircle className="h-3 w-3" />High</Badge>;
      case "medium":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1"><Info className="h-3 w-3" />Medium</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Info className="h-3 w-3" />Low</Badge>;
    }
  };

  const groupedChecklist = checklist?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DeploymentChecklist[]>);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!checklist || checklist.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No checklist generated yet</h3>
            <p className="text-sm text-muted-foreground">Complete the scoping questionnaire and generate a checklist</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Deployment Checklist</h1>
        <p className="text-muted-foreground mt-1">
          Prerequisites and tasks for successful Portnox deployment
        </p>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Overall Progress</h3>
            <span className="text-sm text-muted-foreground">{completedCount} of {totalCount} completed</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {recommendedDocs && recommendedDocs.length > 0 && (
        <Card className="border-chart-4/20 bg-chart-4/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-chart-4" />
              Recommended Documentation
            </CardTitle>
            <CardDescription>
              Based on your scoping responses, these documentation articles are most relevant to your deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendedDocs.slice(0, 6).map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg border hover-elevate active-elevate-2 transition-all"
                  data-testid={`recommended-doc-${doc.id}`}
                >
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-chart-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{doc.title}</h4>
                      {doc.category && (
                        <p className="text-xs text-muted-foreground mt-1">{doc.category}</p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {groupedChecklist && Object.entries(groupedChecklist).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category}
              <Badge variant="secondary">{items.length} {items.length === 1 ? 'task' : 'tasks'}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-4 rounded-lg border hover-elevate" data-testid={`checklist-item-${item.id}`}>
                <Checkbox
                  checked={item.completed || false}
                  onCheckedChange={(checked) => {
                    toggleMutation.mutate({ itemId: item.id, completed: checked as boolean });
                  }}
                  className="mt-1"
                  data-testid={`checkbox-checklist-${item.id}`}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.task}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    {getPriorityBadge(item.priority)}
                  </div>
                  {item.documentationLinks && item.documentationLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.documentationLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Documentation {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
