import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { ChipProps } from "@heroui/react";

export const columns: ColumnDef[] = [
  { name: "Name", uid: "fullName", sortable: true },
  { name: "Contact No.", uid: "bvnPhoneNumber" },
  { name: "Age", uid: "age", sortable: true },
  { name: "State", uid: "state", sortable: true },
  { name: "City", uid: "city", sortable: true },
  { name: "Region", uid: "region", sortable: true },
  { name: "Loan Amount", uid: "loanAmount", sortable: true },

  { name: "Actions", uid: "actions" },
];

export const statusOptions = [
  { name: "Pending", uid: "pending" },
  { name: "Approved", uid: "approved" },
  { name: "Rejected", uid: "rejected" },
];

export const statusColorMap: Record<string, ChipProps["color"]> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};
