import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { ChipProps } from "@heroui/react";
import { AccountStatus } from "./types";

// Status options for scan partners
export const statusOptions = [
  { name: "KYC 1", uid: "KYC_1" },
  { name: "KYC 2", uid: "KYC_2" },
  { name: "Active", uid: "ACTIVE" },
  { name: "Pending", uid: "PENDING" },
  { name: "Verified", uid: "VERIFIED" },
  { name: "Approved", uid: "APPROVED" },
  { name: "Rejected", uid: "REJECTED" },
];

// Status color mapping
export const statusColorMap: Record<string, ChipProps["color"]> = {
  KYC_1: "warning",
  KYC_2: "warning",
  ACTIVE: "primary",
  PENDING: "warning",
  VERIFIED: "success",
  APPROVED: "success",
  REJECTED: "danger",
};

// Column definitions for scan partners
export const columns: ColumnDef[] = [
  { name: "Full Name", uid: "fullName", sortable: true },
  { name: "Email", uid: "email", sortable: true },
  { name: "Phone", uid: "telephoneNumber", sortable: true },
  { name: "Account Type", uid: "accountType", sortable: true },

  { name: "Status", uid: "accountStatus", sortable: true },
  { name: "Active", uid: "isActive", sortable: true },
  { name: "Created", uid: "createdAt", sortable: true },
  { name: "Actions", uid: "actions" },
];
