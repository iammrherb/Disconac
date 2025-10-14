import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, FileCheck, FileX, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DocumentationLink, QuestionnaireResponse } from "@shared/schema";

interface DocumentationReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  responses?: QuestionnaireResponse[];
  onApprovalComplete: () => void;
}

export function DocumentationReviewDialog({
  open,
  onOpenChange,
  sessionId,
  responses,
  onApprovalComplete,
}: DocumentationReviewDialogProps) {
  const { toast } = useToast();
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const { data: recommendedDocs, isLoading: docsLoading } = useQuery<DocumentationLink[]>({
    queryKey: [`/api/documentation/recommendations`, responses],
    queryFn: async () => {
      if (!responses || responses.length === 0) return [];
      
      const responsesObj = responses.reduce((acc, r) => {
        acc[r.question] = r.response;
        return acc;
      }, {} as Record<string, any>);
      
      const result = await apiRequest("POST", "/api/documentation/recommendations", responsesObj);
      return await result.json();
    },
    enabled: open && !!responses && responses.length > 0,
  });

  const { data: approvedDocs } = useQuery<any[]>({
    queryKey: [`/api/sessions/${sessionId}/approved-docs`],
    enabled: open && !!sessionId,
  });

  useEffect(() => {
    if (approvedDocs && recommendedDocs) {
      const approvedIds = new Set(approvedDocs.map(ad => ad.documentationId));
      setSelectedDocs(approvedIds);
    } else if (recommendedDocs) {
      setSelectedDocs(new Set(recommendedDocs.map(doc => doc.id)));
    }
  }, [approvedDocs, recommendedDocs]);

  const approveMutation = useMutation({
    mutationFn: async (docId: string) => {
      return await apiRequest("POST", `/api/sessions/${sessionId}/approved-docs`, {
        documentationId: docId,
        approved: true,
        reviewNotes: reviewNotes[docId] || null,
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (docId: string) => {
      return await apiRequest("DELETE", `/api/sessions/${sessionId}/approved-docs/${docId}`);
    },
  });

  const handleToggleDoc = (docId: string) => {
    setSelectedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const handleSaveAndContinue = async () => {
    try {
      for (const docId of Array.from(selectedDocs)) {
        await approveMutation.mutateAsync(docId);
      }
      
      if (recommendedDocs) {
        for (const doc of recommendedDocs) {
          if (!selectedDocs.has(doc.id) && approvedDocs?.some(ad => ad.documentationId === doc.id)) {
            await removeMutation.mutateAsync(doc.id);
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}/approved-docs`] });
      
      toast({
        title: "Documentation Approved",
        description: `${selectedDocs.size} documentation items approved for deployment checklist`,
      });
      
      onApprovalComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save documentation approvals",
        variant: "destructive",
      });
    }
  };

  if (docsLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!recommendedDocs || recommendedDocs.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Documentation Recommendations</DialogTitle>
            <DialogDescription>
              No documentation recommendations found based on your scoping responses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} variant="outline" data-testid="button-close-review">Close</Button>
            <Button onClick={onApprovalComplete} data-testid="button-continue-anyway">
              Continue Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Review Documentation for Deployment
          </DialogTitle>
          <DialogDescription>
            Review and approve documentation that will be included in your deployment checklist.
            Select the items most relevant to your deployment.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-3">
            {(recommendedDocs || []).map((doc) => (
              <div
                key={doc.id}
                className={`p-4 rounded-lg border transition-all ${
                  selectedDocs.has(doc.id)
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover-elevate"
                }`}
                data-testid={`review-doc-${doc.id}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={doc.id}
                    checked={selectedDocs.has(doc.id)}
                    onCheckedChange={() => handleToggleDoc(doc.id)}
                    className="mt-1"
                    data-testid={`checkbox-approve-${doc.id}`}
                  />
                  <div className="flex-1 space-y-2">
                    <Label
                      htmlFor={doc.id}
                      className="text-sm font-medium cursor-pointer flex items-start gap-2"
                    >
                      <span className="flex-1">{doc.title}</span>
                      {doc.category && (
                        <Badge variant="secondary" className="text-xs">
                          {doc.category}
                        </Badge>
                      )}
                    </Label>
                    
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 5).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      data-testid={`link-doc-${doc.id}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Documentation
                    </a>

                    {selectedDocs.has(doc.id) && (
                      <Textarea
                        placeholder="Add review notes (optional)"
                        value={reviewNotes[doc.id] || ""}
                        onChange={(e) =>
                          setReviewNotes({ ...reviewNotes, [doc.id]: e.target.value })
                        }
                        className="mt-2 text-sm"
                        rows={2}
                        data-testid={`input-notes-${doc.id}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {selectedDocs.size} of {recommendedDocs.length} documentation items selected
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button onClick={() => onOpenChange(false)} variant="outline" data-testid="button-cancel-review">
            Cancel
          </Button>
          <Button
            onClick={handleSaveAndContinue}
            disabled={approveMutation.isPending || removeMutation.isPending}
            data-testid="button-save-approvals"
          >
            {approveMutation.isPending || removeMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 mr-2" />
                Save & Continue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
