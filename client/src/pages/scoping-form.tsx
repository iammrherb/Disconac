import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, Download, CheckCircle, List } from "lucide-react";
import { Link } from "wouter";
import type { ScopingSession, DeploymentChecklist, QuestionnaireResponse } from "@shared/schema";
import { questionnaireConfig } from "@/constants/questionnaireConfig";
import { SectionRenderer } from "@/components/SectionRenderer";
import { DocumentationReviewDialog } from "@/components/DocumentationReviewDialog";

export default function ScopingForm() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(questionnaireConfig[0].id);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  // Initialize form data with all field IDs from configuration
  const initializeFormData = () => {
    const data: Record<string, any> = {};
    questionnaireConfig.forEach(tab => {
      tab.sections.forEach(section => {
        section.fields.forEach(field => {
          data[field.id] = field.type === 'checkbox-group' ? [] : '';
        });
      });
    });
    return data;
  };

  const [formData, setFormData] = useState(initializeFormData());

  // Redirect to sessions page if trying to access /scoping/new directly
  useEffect(() => {
    if (id === "new") {
      toast({
        title: "Invalid Access",
        description: "Please create a scoping session from the Scoping Sessions page",
        variant: "destructive",
      });
      setLocation("/scoping");
    }
  }, [id, toast, setLocation]);

  const { data: session, isLoading: sessionLoading } = useQuery<ScopingSession>({
    queryKey: [`/api/sessions/${id}`],
    enabled: !!id && id !== "new",
  });

  const { data: checklist } = useQuery<DeploymentChecklist[]>({
    queryKey: [`/api/sessions/${id}/checklist`],
    enabled: !!id && id !== "new",
  });

  const { data: responses } = useQuery<QuestionnaireResponse[]>({
    queryKey: [`/api/sessions/${id}/responses`],
    enabled: !!id && id !== "new",
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/sessions/${id}/responses`, data);
    },
    onSuccess: () => {
      // Invalidate responses cache to ensure fresh data for documentation recommendations
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${id}/responses`] });
      toast({
        title: "Success",
        description: "Scoping data saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save scoping data",
        variant: "destructive",
      });
    },
  });

  const generateChecklistMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/sessions/${id}/generate-checklist`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deployment checklist generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${id}/checklist`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate checklist",
        variant: "destructive",
      });
    },
  });

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleGenerateChecklist = () => {
    // First save, then show review dialog
    saveMutation.mutate(formData, {
      onSuccess: () => {
        setShowReviewDialog(true);
      }
    });
  };

  const handleApprovalComplete = () => {
    setShowReviewDialog(false);
    generateChecklistMutation.mutate(formData);
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session && id !== "new") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <List className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Session not found</h3>
            <p className="text-sm text-muted-foreground">This scoping session does not exist</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {id === "new" ? "New Scoping Session" : session?.sessionName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete the comprehensive discovery questionnaire to assess customer environment
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Progress"}
          </Button>
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:w-auto">
          {questionnaireConfig.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} data-testid={`tab-${tab.id}`}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {questionnaireConfig.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <Accordion type="multiple" className="space-y-4" defaultValue={tab.sections.map(s => s.id)}>
              {tab.sections.map((section) => (
                <AccordionItem key={section.id} value={section.id} className="border rounded-lg">
                  <Card>
                    <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b">
                      <div className="text-left">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription className="mt-1">{section.description}</CardDescription>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="pt-6">
                        <SectionRenderer
                          fields={section.fields}
                          formData={formData}
                          onFieldChange={handleFieldChange}
                        />
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-6">
          <CheckCircle className="h-8 w-8 text-primary flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold">Auto-Generated Deployment Checklist</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your responses, a comprehensive deployment prerequisites checklist will be automatically generated with best practices, guides, firewall requirements, and relevant documentation links.
            </p>
            {checklist && checklist.length > 0 && (
              <p className="text-sm font-medium text-primary mt-2">
                ✓ {checklist.length} checklist items generated
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {checklist && checklist.length > 0 && id !== "new" && (
              <Link href={`/checklist/${id}`}>
                <Button variant="outline" data-testid="button-view-checklist">
                  <List className="h-4 w-4 mr-2" />
                  View Checklist
                </Button>
              </Link>
            )}
            <Button 
              onClick={handleGenerateChecklist} 
              disabled={generateChecklistMutation.isPending}
              data-testid="button-generate-checklist"
            >
              {generateChecklistMutation.isPending ? "Generating..." : checklist && checklist.length > 0 ? "Regenerate" : "Generate Checklist"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DocumentationReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        sessionId={id || ""}
        responses={responses}
        onApprovalComplete={handleApprovalComplete}
      />
    </div>
  );
}
