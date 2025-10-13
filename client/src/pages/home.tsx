import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Users, BookOpen, Plus, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { Link } from "wouter";
import type { ScopingSession, CustomerProfile } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
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
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch recent sessions
  const { data: recentSessions, isLoading: sessionsLoading } = useQuery<ScopingSession[]>({
    queryKey: ["/api/sessions/recent"],
    enabled: isAuthenticated,
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalSessions: number;
    totalCustomers: number;
    completedSessions: number;
    draftSessions: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your Portnox scoping sessions and customer profiles
          </p>
        </div>
        <Link href="/scoping/new">
          <Button size="lg" className="gap-2" data-testid="button-new-session">
            <Plus className="h-4 w-4" />
            New Scoping Session
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-sessions">
                {stats?.totalSessions || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-customers">
                {stats?.totalCustomers || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-chart-2" data-testid="text-completed-sessions">
                {stats?.completedSessions || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-chart-3" data-testid="text-draft-sessions">
                {stats?.draftSessions || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Scoping Sessions</CardTitle>
              <CardDescription>Your most recent customer scoping activities</CardDescription>
            </div>
            <Link href="/scoping">
              <Button variant="ghost" size="sm" data-testid="button-view-all-sessions">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : !recentSessions || recentSessions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first scoping session to get started
              </p>
              <Link href="/scoping/new">
                <Button data-testid="button-create-first-session">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Scoping Session
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.slice(0, 5).map((session) => (
                <Link 
                  key={session.id} 
                  href={`/scoping/${session.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 p-3 rounded-lg hover-elevate active-elevate-2 transition-all" data-testid={`session-${session.id}`}>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{session.sessionName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'completed' 
                        ? 'bg-chart-2/10 text-chart-2' 
                        : session.status === 'in_progress'
                        ? 'bg-chart-3/10 text-chart-3'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {session.status === 'completed' ? 'Completed' : session.status === 'in_progress' ? 'In Progress' : 'Draft'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/scoping">
          <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer" data-testid="card-scoping-sessions">
            <CardHeader>
              <CardTitle className="text-lg">Scoping Sessions</CardTitle>
              <CardDescription>View and manage all scoping sessions</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/customers">
          <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer" data-testid="card-customers">
            <CardHeader>
              <CardTitle className="text-lg">Customers</CardTitle>
              <CardDescription>Manage customer profiles and contacts</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/documentation">
          <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer" data-testid="card-documentation">
            <CardHeader>
              <CardTitle className="text-lg">Documentation</CardTitle>
              <CardDescription>Browse Portnox technical documentation</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
