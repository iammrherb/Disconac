import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AssessmentModeSelector, type AssessmentMode } from "@/components/AssessmentModeSelector";
import { CustomerSelectionDialog } from "@/components/CustomerSelectionDialog";
import { ArrowRight } from "lucide-react";

interface SessionCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionCreate: (customerId: string, assessmentMode: AssessmentMode) => void;
}

export function SessionCreationDialog({
  open,
  onOpenChange,
  onSessionCreate,
}: SessionCreationDialogProps) {
  const [step, setStep] = useState<"customer" | "mode">("customer");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<AssessmentMode>("standard");
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const handleCustomerSelected = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCustomerDialogOpen(false);
    setStep("mode");
  };

  const handleContinue = () => {
    if (selectedCustomerId && selectedMode) {
      onSessionCreate(selectedCustomerId, selectedMode);
      resetState();
      onOpenChange(false);
    }
  };

  const resetState = () => {
    setStep("customer");
    setSelectedCustomerId("");
    setSelectedMode("standard");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open && step === "mode"} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Assessment Path</DialogTitle>
            <DialogDescription>
              Select the level of detail for your scoping assessment
            </DialogDescription>
          </DialogHeader>

          <AssessmentModeSelector
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            onContinue={handleContinue}
          />

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setStep("customer");
                setCustomerDialogOpen(true);
              }}
            >
              Back to Customer Selection
            </Button>
            <Button onClick={handleContinue} disabled={!selectedMode}>
              Create Session
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CustomerSelectionDialog
        open={open && (step === "customer" || customerDialogOpen)}
        onOpenChange={(newOpen) => {
          if (!newOpen && step === "customer") {
            handleOpenChange(false);
          }
          setCustomerDialogOpen(newOpen);
        }}
        onCustomerSelected={handleCustomerSelected}
      />
    </>
  );
}
