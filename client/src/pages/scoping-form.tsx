import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Download, FileText, CheckCircle, List } from "lucide-react";
import { Link } from "wouter";
import type { ScopingSession, CustomerProfile, DeploymentChecklist } from "@shared/schema";

const industries = ["Healthcare", "Financial Services", "Manufacturing", "Retail", "Education (K-12)", "Higher Education", "Government - Federal", "Government - State/Local", "Technology", "Telecommunications", "Energy & Utilities", "Other"];
const companySizes = ["1-100 (Small)", "101-500 (SMB)", "501-1,000 (Mid-Market)", "1,001-5,000 (Enterprise)", "5,001-10,000 (Large Enterprise)", "10,000+ (Global Enterprise)"];
const deploymentTypes = ["Portnox CLEAR (Cloud-Native)", "Portnox On-Premises", "Hybrid (CLEAR + Local Components)"];

export default function ScopingForm() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  const [formData, setFormData] = useState({
    // Company Profile
    industry: "",
    companySize: "",
    regions: [] as string[],
    
    // Deployment
    deploymentType: "",
    deviceCount: "",
    locationCount: "",
    
    // Identity
    activeDirectory: "",
    azureAD: "",
    
    // Infrastructure
    switchVendors: [] as string[],
    wlanVendors: [] as string[],
  });

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

  const { data: session, isLoading: sessionLoading } = useQuery<ScopingSession>({
    queryKey: ["/api/sessions", id],
    enabled: !!id && isAuthenticated,
  });

  const { data: checklist } = useQuery<DeploymentChecklist[]>({
    queryKey: [`/api/sessions/${id}/checklist`],
    enabled: !!id && id !== "new" && isAuthenticated,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/sessions/${id}/responses`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scoping data saved successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to generate checklist",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleGenerateChecklist = () => {
    // First save, then generate
    saveMutation.mutate(formData, {
      onSuccess: () => {
        generateChecklistMutation.mutate(formData);
      }
    });
  };

  if (authLoading || sessionLoading) {
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
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
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
            Complete the questionnaire to assess customer environment
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
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" data-testid="tab-profile">Company Profile</TabsTrigger>
          <TabsTrigger value="deployment" data-testid="tab-deployment">Deployment</TabsTrigger>
          <TabsTrigger value="identity" data-testid="tab-identity">Identity</TabsTrigger>
          <TabsTrigger value="infrastructure" data-testid="tab-infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile & Industry</CardTitle>
              <CardDescription>Basic company information and industry classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Primary Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                    <SelectTrigger id="industry" data-testid="select-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                    <SelectTrigger id="companySize" data-testid="select-company-size">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Operating Regions</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["North America", "EMEA", "APAC", "LATAM"].map((region) => (
                    <div key={region} className="flex items-center gap-2">
                      <Checkbox
                        id={`region-${region}`}
                        checked={formData.regions.includes(region)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, regions: [...formData.regions, region] });
                          } else {
                            setFormData({ ...formData, regions: formData.regions.filter(r => r !== region) });
                          }
                        }}
                        data-testid={`checkbox-region-${region.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <Label htmlFor={`region-${region}`} className="font-normal cursor-pointer">{region}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portnox Deployment</CardTitle>
              <CardDescription>Platform selection and deployment scope</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deploymentType">Deployment Type</Label>
                <Select value={formData.deploymentType} onValueChange={(value) => setFormData({ ...formData, deploymentType: value })}>
                  <SelectTrigger id="deploymentType" data-testid="select-deployment-type">
                    <SelectValue placeholder="Select deployment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deploymentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deviceCount">Total Devices to License</Label>
                  <Input
                    id="deviceCount"
                    type="number"
                    placeholder="Enter device count"
                    value={formData.deviceCount}
                    onChange={(e) => setFormData({ ...formData, deviceCount: e.target.value })}
                    data-testid="input-device-count"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationCount">Number of Sites</Label>
                  <Input
                    id="locationCount"
                    type="number"
                    placeholder="Enter location count"
                    value={formData.locationCount}
                    onChange={(e) => setFormData({ ...formData, locationCount: e.target.value })}
                    data-testid="input-location-count"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identity Providers & Directories</CardTitle>
              <CardDescription>Configure identity sources and authentication providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activeDirectory">Active Directory</Label>
                  <Select value={formData.activeDirectory} onValueChange={(value) => setFormData({ ...formData, activeDirectory: value })}>
                    <SelectTrigger id="activeDirectory" data-testid="select-active-directory">
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2022">Windows Server 2022</SelectItem>
                      <SelectItem value="2019">Windows Server 2019</SelectItem>
                      <SelectItem value="2016">Windows Server 2016</SelectItem>
                      <SelectItem value="na">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azureAD">Azure AD / Entra ID</Label>
                  <Select value={formData.azureAD} onValueChange={(value) => setFormData({ ...formData, azureAD: value })}>
                    <SelectTrigger id="azureAD" data-testid="select-azure-ad">
                      <SelectValue placeholder="Select license" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Entra ID Free</SelectItem>
                      <SelectItem value="p1">Entra ID P1</SelectItem>
                      <SelectItem value="p2">Entra ID P2</SelectItem>
                      <SelectItem value="na">Not Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Infrastructure</CardTitle>
              <CardDescription>Wired and wireless infrastructure details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Wired Switch Vendors</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Cisco Catalyst", "Cisco Meraki", "Aruba CX", "HPE ProCurve", "Juniper EX", "Fortinet"].map((vendor) => (
                    <div key={vendor} className="flex items-center gap-2">
                      <Checkbox
                        id={`switch-${vendor}`}
                        checked={formData.switchVendors.includes(vendor)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, switchVendors: [...formData.switchVendors, vendor] });
                          } else {
                            setFormData({ ...formData, switchVendors: formData.switchVendors.filter(v => v !== vendor) });
                          }
                        }}
                        data-testid={`checkbox-switch-${vendor.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <Label htmlFor={`switch-${vendor}`} className="font-normal cursor-pointer">{vendor}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label>Wireless WLAN Vendors</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Cisco 9800", "Cisco Meraki", "Aruba Controller", "Aruba Central", "Juniper Mist", "Ruckus"].map((vendor) => (
                    <div key={vendor} className="flex items-center gap-2">
                      <Checkbox
                        id={`wlan-${vendor}`}
                        checked={formData.wlanVendors.includes(vendor)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, wlanVendors: [...formData.wlanVendors, vendor] });
                          } else {
                            setFormData({ ...formData, wlanVendors: formData.wlanVendors.filter(v => v !== vendor) });
                          }
                        }}
                        data-testid={`checkbox-wlan-${vendor.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <Label htmlFor={`wlan-${vendor}`} className="font-normal cursor-pointer">{vendor}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-6">
          <CheckCircle className="h-8 w-8 text-primary flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold">Auto-Generated Deployment Checklist</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your responses, a comprehensive deployment prerequisites checklist will be automatically generated with relevant documentation links.
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
    </div>
  );
}
