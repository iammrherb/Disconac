// Reusable section renderer for configuration-driven questionnaire

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { QuestionField } from "@/constants/questionnaireConfig";

interface SectionRendererProps {
  fields: QuestionField[];
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
}

export function SectionRenderer({ fields, formData, onFieldChange }: SectionRendererProps) {
  const renderField = (field: QuestionField) => {
    const value = formData[field.id] || (field.type === 'checkbox-group' ? [] : '');

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => onFieldChange(field.id, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              data-testid={`input-${field.id}`}
            />
            {field.unit && (
              <p className="text-xs text-muted-foreground">Unit: {field.unit}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              data-testid={`textarea-${field.id}`}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Select 
              value={value} 
              onValueChange={(newValue) => onFieldChange(field.id, newValue)}
            >
              <SelectTrigger id={field.id} data-testid={`select-${field.id}`}>
                <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox-group':
        const selectedOptions = Array.isArray(value) ? value : [];
        return (
          <div key={field.id} className="space-y-3">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border rounded-md">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={selectedOptions.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFieldChange(field.id, [...selectedOptions, option]);
                      } else {
                        onFieldChange(field.id, selectedOptions.filter((o: string) => o !== option));
                      }
                    }}
                    data-testid={`checkbox-${field.id}-${option.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
                  />
                  <Label 
                    htmlFor={`${field.id}-${option}`} 
                    className="font-normal cursor-pointer text-sm"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'multiselect':
        // For future implementation if needed
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {fields.map((field) => renderField(field))}
    </div>
  );
}
