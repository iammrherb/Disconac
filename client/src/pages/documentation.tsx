import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BookOpen, Search, ExternalLink, Tag, Plus, Edit, Trash2, Globe, AlertTriangle } from "lucide-react";
import type { DocumentationLink } from "@shared/schema";

export default function Documentation() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCrawlDialogOpen, setIsCrawlDialogOpen] = useState(false);
  const [isDuplicatesDialogOpen, setIsDuplicatesDialogOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocumentationLink | null>(null);
  
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
  });
  const [tagsInput, setTagsInput] = useState("");
  const [crawlUrl, setCrawlUrl] = useState("");

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

  const { data: docs, isLoading } = useQuery<DocumentationLink[]>({
    queryKey: ["/api/documentation", searchQuery],
    enabled: isAuthenticated,
  });

  const { data: duplicates } = useQuery<{ url: string; count: number; ids: string[] }[]>({
    queryKey: ["/api/documentation/duplicates"],
    enabled: isAuthenticated && isDuplicatesDialogOpen,
  });

  const filteredDocs = docs?.filter((doc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query) ||
      doc.category?.toLowerCase().includes(query) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const createMutation = useMutation<DocumentationLink, Error, typeof formData>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/documentation", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documentation"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Documentation created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create documentation", variant: "destructive" });
    },
  });

  const updateMutation = useMutation<DocumentationLink, Error, { id: string; data: Partial<typeof formData> }>({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/documentation/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documentation"] });
      setIsEditDialogOpen(false);
      setEditingDoc(null);
      resetForm();
      toast({ title: "Success", description: "Documentation updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update documentation", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/documentation/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documentation"] });
      setDeleteDocId(null);
      toast({ title: "Success", description: "Documentation deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete documentation", variant: "destructive" });
    },
  });

  const crawlMutation = useMutation<DocumentationLink, Error, { url: string }>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/documentation/crawl", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documentation"] });
      setIsCrawlDialogOpen(false);
      setCrawlUrl("");
      toast({ title: "Success", description: "Documentation crawled successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to crawl documentation", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ url: "", title: "", content: "", category: "", tags: [] });
    setTagsInput("");
  };

  const handleCreate = () => {
    if (!formData.url || !formData.title || !formData.content) {
      toast({ title: "Validation Error", description: "URL, title, and content are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (doc: DocumentationLink) => {
    setEditingDoc(doc);
    setFormData({
      url: doc.url,
      title: doc.title,
      content: doc.content,
      category: doc.category || "",
      tags: doc.tags || [],
    });
    setTagsInput(doc.tags?.join(", ") || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingDoc) return;
    updateMutation.mutate({ id: editingDoc.id, data: formData });
  };

  const handleCrawl = () => {
    if (!crawlUrl.trim()) {
      toast({ title: "Validation Error", description: "URL is required", variant: "destructive" });
      return;
    }
    crawlMutation.mutate({ url: crawlUrl.trim() });
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    setFormData({ ...formData, tags: value.split(",").map(t => t.trim()).filter(Boolean) });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Browse, manage, and crawl Portnox technical documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsDuplicatesDialogOpen(true)} data-testid="button-view-duplicates">
            <AlertTriangle className="h-4 w-4 mr-2" />
            View Duplicates
          </Button>
          <Button variant="outline" onClick={() => setIsCrawlDialogOpen(true)} data-testid="button-crawl-url">
            <Globe className="h-4 w-4 mr-2" />
            Crawl URL
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-add-doc">
            <Plus className="h-4 w-4 mr-2" />
            Add Documentation
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-docs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !filteredDocs || filteredDocs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? "No documentation found" : "No documentation available"}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Get started by adding documentation or crawling a URL"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCrawlDialogOpen(true)}>
                <Globe className="h-4 w-4 mr-2" />
                Crawl URL
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="h-full" data-testid={`doc-${doc.id}`}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-chart-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2">{doc.title}</CardTitle>
                    {doc.category && (
                      <CardDescription className="mt-1">{doc.category}</CardDescription>
                    )}
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {doc.content.substring(0, 150)}...
                </p>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{doc.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(doc)} data-testid={`button-edit-${doc.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteDocId(doc.id)} data-testid={`button-delete-${doc.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Found {filteredDocs?.length || 0} documentation {filteredDocs?.length === 1 ? 'article' : 'articles'}
      </p>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingDoc(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDoc ? "Edit Documentation" : "Add New Documentation"}</DialogTitle>
            <DialogDescription>
              {editingDoc ? "Update the documentation details" : "Add a new documentation entry manually"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://docs.portnox.com/..."
                data-testid="input-doc-url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Documentation title"
                data-testid="input-doc-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Documentation content or description"
                rows={5}
                data-testid="input-doc-content"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., NAC, ZTNA, TACACS+"
                data-testid="input-doc-category"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="deployment, configuration, firewall"
                data-testid="input-doc-tags"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setEditingDoc(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingDoc ? handleUpdate : handleCreate}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-doc"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingDoc ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crawl Dialog */}
      <Dialog open={isCrawlDialogOpen} onOpenChange={setIsCrawlDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crawl Documentation URL</DialogTitle>
            <DialogDescription>
              Enter a URL to automatically scrape and import documentation using Firecrawl
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crawl-url">URL</Label>
              <Input
                id="crawl-url"
                value={crawlUrl}
                onChange={(e) => setCrawlUrl(e.target.value)}
                placeholder="https://docs.portnox.com/..."
                data-testid="input-crawl-url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCrawlDialogOpen(false);
              setCrawlUrl("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCrawl}
              disabled={crawlMutation.isPending}
              data-testid="button-start-crawl"
            >
              {crawlMutation.isPending ? "Crawling..." : "Crawl"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicates Dialog */}
      <Dialog open={isDuplicatesDialogOpen} onOpenChange={setIsDuplicatesDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Duplicate Documentation</DialogTitle>
            <DialogDescription>
              URLs with multiple entries. Click on a URL to view and manage duplicates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {!duplicates || duplicates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No duplicates found</p>
            ) : (
              duplicates.map((dup, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{dup.url}</p>
                        <p className="text-xs text-muted-foreground">
                          {dup.count} duplicates • IDs: {dup.ids.join(", ")}
                        </p>
                      </div>
                      <Badge variant="destructive">{dup.count}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDocId} onOpenChange={() => setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this documentation entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDocId && deleteMutation.mutate(deleteDocId)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
