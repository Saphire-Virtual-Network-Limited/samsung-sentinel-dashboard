import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { ChipProps } from "@heroui/react";

export const columns: ColumnDef[] = [ 
  { name: "Name", uid: "fullName", sortable: true },
  { name: "Contact No.", uid: "phone" },
  { name: "Channel", uid: "channel" },
  { name: "MBE Old ID", uid: "mbe_old_id" },
  { name: "State", uid: "state", sortable: true },
  { name: "Region", uid: "region", sortable: true },
  { name: "No. of Customers", uid: "customers", sortable: true },
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
