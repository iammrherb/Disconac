import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Calendar, Building2 } from "lucide-react";
import { Link } from "wouter";
import { CustomerSelectionDialog } from "@/components/CustomerSelectionDialog";
import type { ScopingSession } from "@shared/schema";

export default function ScopingSessions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const { data: sessions, isLoading } = useQuery<ScopingSession[]>({
    queryKey: ["/api/sessions"],
    enabled: isAuthenticated,
  });

  const createSessionMutation = useMutation<ScopingSession, Error, string>({
    mutationFn: async (customerId: string) => {
      const res = await apiRequest("POST", "/api/sessions", {
        customerId,
        sessionName: `Scoping Session - ${new Date().toLocaleDateString()}`,
        status: "draft",
      });
      return await res.json();
    },
    onSuccess: (session: ScopingSession) => {
      if (!session?.id) {
        toast({
          title: "Error",
          description: "Session created but missing ID",
          variant: "destructive",
        });
        setDialogOpen(false);
        return;
      }
      
      toast({
        title: "Success",
        description: "Scoping session created successfully",
      });
      setLocation(`/scoping/${session.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create scoping session",
        variant: "destructive",
      });
      setDialogOpen(false);
    },
  });

  const handleCustomerSelected = (customerId: string) => {
    createSessionMutation.mutate(customerId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Scoping Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your Portnox scoping and assessment sessions
          </p>
        </div>
        <Button 
          size="lg" 
          className="gap-2" 
          onClick={() => setDialogOpen(true)}
          data-testid="button-new-session"
        >
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No scoping sessions yet</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
              Create your first scoping session to start assessing customer environments
            </p>
            <Button 
              onClick={() => setDialogOpen(true)} 
              data-testid="button-create-first-session"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <Link key={session.id} href={`/scoping/${session.id}`}>
              <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer" data-testid={`session-${session.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">{session.sessionName}</CardTitle>
                        <CardDescription className="mt-1">
                          Version {session.version}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(session.createdAt!).toLocaleDateString()}</span>
                  </div>
                  {session.completedAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Completed {new Date(session.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CustomerSelectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCustomerSelected={handleCustomerSelected}
      />
    </div>
  );
}
