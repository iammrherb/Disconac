import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Building2, Plus, Search } from "lucide-react";
import type { CustomerProfile, InsertCustomerProfile } from "@shared/schema";

const industries = [
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Retail",
  "Education (K-12)",
  "Higher Education",
  "Government - Federal",
  "Government - State/Local",
  "Technology",
  "Telecommunications",
  "Energy & Utilities",
  "Transportation & Logistics",
  "Media & Entertainment",
  "Legal Services",
  "Real Estate",
  "Hospitality",
  "Non-Profit",
  "Other",
];

const companySizes = [
  "1-100 (Small)",
  "101-500 (SMB)",
  "501-1,000 (Mid-Market)",
  "1,001-5,000 (Enterprise)",
  "5,001-10,000 (Large Enterprise)",
  "10,000+ (Global Enterprise)",
];

interface CustomerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerSelected: (customerId: string) => void;
}

export function CustomerSelectionDialog({
  open,
  onOpenChange,
  onCustomerSelected,
}: CustomerSelectionDialogProps) {
  const { toast } = useToast();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newCustomerData, setNewCustomerData] = useState<Partial<InsertCustomerProfile>>({
    companyName: "",
    contactName: "",
    contactEmail: "",
    industry: "",
    companySize: "",
  });

  const { data: customers, isLoading } = useQuery<CustomerProfile[]>({
    queryKey: ["/api/customers"],
    enabled: open,
  });

  const createCustomerMutation = useMutation<CustomerProfile, Error, Omit<InsertCustomerProfile, "userId">>({
    mutationFn: async (data: Omit<InsertCustomerProfile, "userId">) => {
      const res = await apiRequest("POST", "/api/customers", data);
      return await res.json();
    },
    onSuccess: (newCustomer: CustomerProfile) => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setNewCustomerData({
        companyName: "",
        contactName: "",
        contactEmail: "",
        industry: "",
        companySize: "",
      });
      toast({
        title: "Success",
        description: "Customer profile created successfully",
      });
      onCustomerSelected(newCustomer.id);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const handleSelectExisting = () => {
    if (!selectedCustomerId) {
      toast({
        title: "Validation Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }
    onCustomerSelected(selectedCustomerId);
    onOpenChange(false);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerData.companyName || !newCustomerData.contactName || !newCustomerData.contactEmail) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createCustomerMutation.mutate(newCustomerData as Omit<InsertCustomerProfile, "userId">);
  };

  const filteredCustomers = customers?.filter((customer) =>
    customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Customer for Scoping Session</DialogTitle>
          <DialogDescription>
            Choose an existing customer or create a new customer profile
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="select" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select" data-testid="tab-select-customer">
              Select Existing
            </TabsTrigger>
            <TabsTrigger value="create" data-testid="tab-create-customer">
              Create New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-customers"
                />
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading customers...</div>
              ) : !filteredCustomers || filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No customers found matching your search" : "No customers available. Create one first."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <Card
                      key={customer.id}
                      className={`cursor-pointer transition-all hover-elevate ${
                        selectedCustomerId === customer.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      data-testid={`customer-option-${customer.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{customer.companyName}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {customer.contactName} • {customer.industry || "No industry"}
                            </CardDescription>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleSelectExisting}
                disabled={!selectedCustomerId}
                data-testid="button-confirm-customer"
              >
                Continue with Selected Customer
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <form onSubmit={handleCreateNew} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-companyName">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-companyName"
                  value={newCustomerData.companyName}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, companyName: e.target.value })}
                  placeholder="Acme Corporation"
                  required
                  data-testid="input-new-company-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-contactName">
                  Contact Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-contactName"
                  value={newCustomerData.contactName}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, contactName: e.target.value })}
                  placeholder="John Doe"
                  required
                  data-testid="input-new-contact-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-contactEmail">
                  Contact Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-contactEmail"
                  type="email"
                  value={newCustomerData.contactEmail}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, contactEmail: e.target.value })}
                  placeholder="john@acme.com"
                  required
                  data-testid="input-new-contact-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-industry">Industry</Label>
                <Select
                  value={newCustomerData.industry || undefined}
                  onValueChange={(value) => setNewCustomerData({ ...newCustomerData, industry: value })}
                >
                  <SelectTrigger id="new-industry" data-testid="select-new-industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-companySize">Company Size</Label>
                <Select
                  value={newCustomerData.companySize || undefined}
                  onValueChange={(value) => setNewCustomerData({ ...newCustomerData, companySize: value })}
                >
                  <SelectTrigger id="new-companySize" data-testid="select-new-company-size">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createCustomerMutation.isPending}
                data-testid="button-create-and-continue"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createCustomerMutation.isPending ? "Creating..." : "Create Customer & Continue"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
