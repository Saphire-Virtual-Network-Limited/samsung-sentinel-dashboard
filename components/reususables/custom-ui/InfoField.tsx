"use client";

import React from "react";
import { Snippet } from "@heroui/react";

interface InfoFieldProps {
  label: string;
  value?: string | number | null;
  endComponent?: React.ReactNode;
  copyable?: boolean;
  className?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  endComponent,
  copyable = false,
  className = "",
}) => (
  <div className={`bg-default-50 rounded-lg p-4 ${className}`}>
    <div className="flex items-center justify-between mb-1">
      <div className="text-sm text-default-500">{label}</div>
      {endComponent}
    </div>
    <div className="font-medium text-default-900 flex items-center gap-2">
      {value || "N/A"}
      {copyable && value && (
        <Snippet
          codeString={String(value)}
          className="p-0"
          size="sm"
          hideSymbol
          hideCopyButton={false}
        />
      )}
    </div>
  </div>
);

export default InfoField;
