import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { ChipProps } from "@heroui/react";

export const columns: ColumnDef[] = [
  { name: "Customer ID", uid: "customerId", sortable: true },
  { name: "Name", uid: "fullName", sortable: true },
  { name: "Contact No.", uid: "bvnPhoneNumber" },
  { name: "Age", uid: "age", sortable: true },
  { name: "Created At", uid: "createdAt", sortable: true },
  { name: "Channel", uid: "channel", sortable: true },
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
