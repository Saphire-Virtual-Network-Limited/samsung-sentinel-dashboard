"use client";

import React from "react";
import { Chip } from "@heroui/react";

// Status color mapping utility
export const getStatusColor = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "primary";
    case "VERIFIED":
      return "success";
    case "APPROVED":
      return "success";
    case "KYC_2":
      return "warning";
    case "KYC_1":
      return "warning";
    case "PENDING":
      return "warning";
    case "REJECTED":
      return "danger";
    default:
      return "default";
  }
};

// Generic Status Chip Component
interface StatusChipProps {
  status?: string;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "solid" | "bordered" | "light" | "faded" | "shadow";
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = "md",
  variant = "flat",
  className = "",
}) => {
  return (
    <Chip
      color={getStatusColor(status)}
      variant={variant}
      size={size}
      className={`font-medium ${className}`}
    >
      {status || "PENDING"}
    </Chip>
  );
};

// Guarantor Status Chip
interface GuarantorStatusChipProps {
  status: string;
  className?: string;
}

export const GuarantorStatusChip: React.FC<GuarantorStatusChipProps> = ({
  status,
  className = "",
}) => {
  return (
    <Chip
      color={getStatusColor(status)}
      variant="flat"
      size="sm"
      className={className}
    >
      {status}
    </Chip>
  );
};

// Address Status Chip
interface AddressStatusChipProps {
  status: string;
  className?: string;
}

export const AddressStatusChip: React.FC<AddressStatusChipProps> = ({
  status,
  className = "",
}) => {
  return (
    <Chip
      color={getStatusColor(status)}
      variant="flat"
      size="sm"
      className={className}
    >
      {status}
    </Chip>
  );
};
