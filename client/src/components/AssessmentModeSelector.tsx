import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Gauge, Microscope, Check } from "lucide-react";

export type AssessmentMode = "quick" | "standard" | "deep-dive";

interface AssessmentModeSelectorProps {
  selectedMode: AssessmentMode;
  onSelectMode: (mode: AssessmentMode) => void;
  onContinue: () => void;
}

const modes = [
  {
    id: "quick" as AssessmentMode,
    name: "Quick Assessment",
    icon: Zap,
    duration: "~15 minutes",
    description: "Essential questions only. Perfect for initial scoping and rapid opportunity qualification.",
    features: [
      "Company basics and industry",
      "Device count and types",
      "Primary infrastructure vendors",
      "Deployment preference",
      "High-level requirements"
    ],
    color: "bg-green-50 border-green-200 hover:border-green-400",
    iconColor: "text-green-600",
    badge: "bg-green-100 text-green-700"
  },
  {
    id: "standard" as AssessmentMode,
    name: "Standard Assessment",
    icon: Gauge,
    duration: "~30 minutes",
    description: "Comprehensive discovery covering all major areas. Recommended for most deployments.",
    features: [
      "All Quick Assessment items",
      "Identity providers and authentication",
      "Security stack integration",
      "Guest and BYOD policies",
      "Compliance requirements",
      "Network infrastructure details"
    ],
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
    iconColor: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    recommended: true
  },
  {
    id: "deep-dive" as AssessmentMode,
    name: "Deep-Dive Assessment",
    icon: Microscope,
    duration: "~60+ minutes",
    description: "Technical deep-dive with advanced configurations. For complex enterprise deployments.",
    features: [
      "All Standard Assessment items",
      "Detailed vendor configurations",
      "Advanced authentication methods",
      "Certificate authority details",
      "TACACS+ administration",
      "Migration planning",
      "Timeline and resource planning"
    ],
    color: "bg-purple-50 border-purple-200 hover:border-purple-400",
    iconColor: "text-purple-600",
    badge: "bg-purple-100 text-purple-700"
  }
];

export function AssessmentModeSelector({ selectedMode, onSelectMode, onContinue }: AssessmentModeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Choose Your Assessment Path</h2>
        <p className="text-muted-foreground mt-2">
          Select the level of detail that best fits your needs. You can switch modes at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all ${mode.color} ${
                isSelected ? "ring-2 ring-primary shadow-lg" : ""
              }`}
              onClick={() => onSelectMode(mode.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${mode.iconColor}`} />
                      {mode.name}
                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                    </CardTitle>
                    <Badge className={mode.badge} variant="secondary">
                      {mode.duration}
                    </Badge>
                  </div>
                  {mode.recommended && (
                    <Badge variant="default" className="ml-2">
                      Recommended
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {mode.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${mode.iconColor}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onContinue} disabled={!selectedMode}>
          Continue with {modes.find(m => m.id === selectedMode)?.name || "Selected Mode"}
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm text-center">
            <strong>Note:</strong> You can switch between assessment modes at any time during the questionnaire.
            Questions already answered will be preserved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
