import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, User, Bell, Palette, Key, Save } from "lucide-react";
import type { AppSetting } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [firecrawlApiKey, setFirecrawlApiKey] = useState("");

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

  const { data: settings, isLoading: settingsLoading } = useQuery<AppSetting[]>({
    queryKey: ["/api/settings"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (settings) {
      const apiKeySetting = settings.find(s => s.key === 'firecrawl_api_key');
      if (apiKeySetting) {
        setFirecrawlApiKey(apiKeySetting.value);
      }
    }
  }, [settings]);

  const saveApiKeyMutation = useMutation<AppSetting, Error, { key: string; value: string; description?: string }>({
    mutationFn: async (data) => {
      const res = await apiRequest("PUT", `/api/settings/${data.key}`, {
        value: data.value,
        description: data.description,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save API key",
        variant: "destructive",
      });
    },
  });

  const handleSaveApiKey = () => {
    if (!firecrawlApiKey.trim()) {
      toast({
        title: "Validation Error",
        description: "API key cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    saveApiKeyMutation.mutate({
      key: 'firecrawl_api_key',
      value: firecrawlApiKey.trim(),
      description: 'Firecrawl API key for web crawling and documentation scraping',
    });
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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>API Keys</CardTitle>
            </div>
            <CardDescription>Configure API keys for external services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firecrawl-key">Firecrawl API Key</Label>
              <p className="text-sm text-muted-foreground">
                Required for web crawling and documentation scraping. Get your key from{" "}
                <a 
                  href="https://www.firecrawl.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  firecrawl.dev
                </a>
              </p>
              <div className="flex gap-2">
                <Input
                  id="firecrawl-key"
                  type="password"
                  placeholder="fc-YOUR_API_KEY"
                  value={firecrawlApiKey}
                  onChange={(e) => setFirecrawlApiKey(e.target.value)}
                  data-testid="input-firecrawl-api-key"
                />
                <Button 
                  onClick={handleSaveApiKey}
                  disabled={saveApiKeyMutation.isPending}
                  data-testid="button-save-api-key"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveApiKeyMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Your account details from authentication provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <p className="text-sm" data-testid="text-user-name">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : "Not provided"}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm" data-testid="text-user-email">{user?.email || "Not provided"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about scoping sessions
                </p>
              </div>
              <Switch id="email-notifications" data-testid="switch-email-notifications" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="session-reminders">Session Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders for incomplete scoping sessions
                </p>
              </div>
              <Switch id="session-reminders" data-testid="switch-session-reminders" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the application appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use a more compact layout for forms and lists
                </p>
              </div>
              <Switch id="compact-mode" data-testid="switch-compact-mode" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
