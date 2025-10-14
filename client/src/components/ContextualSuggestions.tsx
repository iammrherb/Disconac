import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Info, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface ContextualSuggestion {
  type: "recommendation" | "warning" | "tip" | "best_practice";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  relatedFields?: string[];
  actionable?: {
    label: string;
    value: string;
  };
}

interface ContextualSuggestionsProps {
  currentField: string;
  currentValue: any;
  allResponses: Record<string, any>;
  onApplyActionable?: (fieldId: string, value: any) => void;
}

const iconMap = {
  recommendation: CheckCircle2,
  warning: AlertTriangle,
  tip: Lightbulb,
  best_practice: Info,
};

const colorMap = {
  recommendation: "bg-blue-50 border-blue-200 text-blue-900",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  tip: "bg-green-50 border-green-200 text-green-900",
  best_practice: "bg-purple-50 border-purple-200 text-purple-900",
};

const iconColorMap = {
  recommendation: "text-blue-600",
  warning: "text-yellow-600",
  tip: "text-green-600",
  best_practice: "text-purple-600",
};

export function ContextualSuggestions({ 
  currentField, 
  currentValue, 
  allResponses,
  onApplyActionable 
}: ContextualSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentField) return;

      setLoading(true);
      try {
        const response = await apiRequest("POST", "/api/contextual-suggestions", {
          currentField,
          currentValue,
          allResponses,
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }
        
        const result = await response.json() as ContextualSuggestion[];

        const filteredSuggestions = result.filter((s: ContextualSuggestion) => !dismissed.has(`${s.type}-${s.title}`));
        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error("Failed to fetch contextual suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [currentField, currentValue, allResponses, dismissed]);

  const handleDismiss = (suggestion: ContextualSuggestion) => {
    const key = `${suggestion.type}-${suggestion.title}`;
    setDismissed(new Set(dismissed).add(key));
    setSuggestions(suggestions.filter(s => `${s.type}-${s.title}` !== key));
  };

  const handleApplyActionable = (suggestion: ContextualSuggestion) => {
    if (suggestion.actionable && onApplyActionable) {
      const fieldId = suggestion.relatedFields?.[0] || currentField;
      onApplyActionable(fieldId, suggestion.actionable.value);
    }
  };

  if (loading && suggestions.length === 0) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Loading suggestions...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Smart Suggestions
            <Badge variant="secondary" className="ml-2">
              {suggestions.length}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-6 w-6 p-0"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription className="text-xs">
          Recommendations based on your responses
        </CardDescription>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-3">
          {sortedSuggestions.map((suggestion, index) => {
            const Icon = iconMap[suggestion.type];
            return (
              <Alert 
                key={index} 
                className={cn(
                  "relative",
                  colorMap[suggestion.type]
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-5 w-5 p-0 hover:bg-transparent"
                  onClick={() => handleDismiss(suggestion)}
                >
                  <X className="h-3 w-3" />
                </Button>

                <Icon className={cn("h-4 w-4 mt-0.5", iconColorMap[suggestion.type])} />
                
                <div className="ml-2 pr-6">
                  <AlertTitle className="text-sm font-semibold mb-1 flex items-center gap-2">
                    {suggestion.title}
                    <Badge 
                      variant={suggestion.priority === "high" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {suggestion.priority}
                    </Badge>
                  </AlertTitle>
                  
                  <AlertDescription className="text-xs leading-relaxed">
                    {suggestion.message}
                  </AlertDescription>

                  {suggestion.actionable && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 h-7 text-xs"
                      onClick={() => handleApplyActionable(suggestion)}
                    >
                      {suggestion.actionable.label}
                    </Button>
                  )}

                  {suggestion.relatedFields && suggestion.relatedFields.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {suggestion.relatedFields.map((field, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Alert>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
