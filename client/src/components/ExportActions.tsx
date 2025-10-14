import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportActionsProps {
  sessionId: string;
  companyName?: string;
}

export function ExportActions({ sessionId, companyName }: ExportActionsProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'word') => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/export/${format}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`);
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Portnox-Deployment-Guide-${companyName?.replace(/[^a-zA-Z0-9]/g, '-') || 'Export'}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Your ${format.toUpperCase()} deployment guide has been downloaded.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : `Failed to export ${format.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isExporting}
          data-testid="button-export-dropdown"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Guide'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="menu-export-options">
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          data-testid="menu-item-export-pdf"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('word')}
          disabled={isExporting}
          data-testid="menu-item-export-word"
        >
          <File className="h-4 w-4 mr-2" />
          Export as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
