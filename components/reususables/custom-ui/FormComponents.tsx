"use client";

import React from "react";
import { SelectField } from "@/components/reususables";
import { Textarea } from "@heroui/react";

interface SelectionWithPreviewProps {
  // Selection field props
  label: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  selectedValue?: string;
  onSelectionChange: (value: string) => void;
  isDisabled?: boolean;

  // Preview section props
  previewData?: any;
  renderPreview?: (data: any) => React.ReactNode;

  // Warning section
  warning?: {
    message: string;
    currentValue?: string;
  };
}

const SelectionWithPreview: React.FC<SelectionWithPreviewProps> = ({
  label,
  placeholder,
  options,
  selectedValue,
  onSelectionChange,
  isDisabled = false,
  previewData,
  renderPreview,
  warning,
}) => {
  return (
    <>
      {warning && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <p className="text-sm text-warning-700">
            <strong>Current:</strong> {warning.currentValue || "Not assigned"}
          </p>
          {warning.message && (
            <p className="text-sm text-warning-700 mt-1">{warning.message}</p>
          )}
        </div>
      )}

      <SelectField
        label={label}
        htmlFor="selection"
        id="selection"
        placeholder={placeholder}
        defaultSelectedKeys={selectedValue ? [selectedValue] : []}
        onChange={(value) =>
          onSelectionChange(Array.isArray(value) ? value[0] : value)
        }
        options={options}
        disabled={isDisabled}
      />

      {previewData && renderPreview && (
        <div className="bg-default-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Selected Details</h4>
          {renderPreview(previewData)}
        </div>
      )}
    </>
  );
};

interface ConditionalFormProps {
  condition: boolean;
  children: React.ReactNode;
}

const ConditionalForm: React.FC<ConditionalFormProps> = ({
  condition,
  children,
}) => {
  if (!condition) return null;
  return <div className="space-y-3">{children}</div>;
};

interface ReasonSelectionProps {
  label: string;
  reasonOptions: string[];
  selectedReason: string;
  onReasonChange: (reason: string) => void;
  isOtherReason: boolean;
  onOtherReasonToggle: (isOther: boolean) => void;
  customComment: string;
  onCustomCommentChange: (comment: string) => void;
  customCommentLabel?: string;
  customCommentPlaceholder?: string;
}

const ReasonSelection: React.FC<ReasonSelectionProps> = ({
  label,
  reasonOptions,
  selectedReason,
  onReasonChange,
  isOtherReason,
  onOtherReasonToggle,
  customComment,
  onCustomCommentChange,
  customCommentLabel = "Please specify the reason",
  customCommentPlaceholder = "Enter your reason...",
}) => {
  return (
    <>
      <SelectField
        label={label}
        htmlFor="reasonSelect"
        id="reasonSelect"
        placeholder="Select a reason..."
        defaultSelectedKeys={
          selectedReason ? [isOtherReason ? "other" : selectedReason] : []
        }
        onChange={(value) => {
          const selectedValue = Array.isArray(value) ? value[0] : value;
          if (selectedValue === "other") {
            onOtherReasonToggle(true);
            onReasonChange("other");
          } else {
            onOtherReasonToggle(false);
            onReasonChange(selectedValue);
            onCustomCommentChange("");
          }
        }}
        options={reasonOptions.map((reason) => ({
          label: reason,
          value: reason === "Other" ? "other" : reason,
        }))}
      />

      {isOtherReason && (
        <Textarea
          label={customCommentLabel}
          placeholder={customCommentPlaceholder}
          value={customComment}
          onValueChange={onCustomCommentChange}
          minRows={3}
        />
      )}
    </>
  );
};

export { SelectionWithPreview, ConditionalForm, ReasonSelection };
