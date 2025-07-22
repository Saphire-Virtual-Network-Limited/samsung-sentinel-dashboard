import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { ChipProps } from "@heroui/react";
import { AccountStatus } from "./types";

export const columns: ColumnDef[] = [
  { name: "Name", uid: "fullName", sortable: true },
  { name: "Role", uid: "role", sortable: true },
  { name: "Status", uid: "accountStatus", sortable: true },
  { name: "Email", uid: "email", sortable: true },
  { name: "Phone", uid: "telephoneNumber", sortable: true },
  { name: "Company", uid: "companyName", sortable: true },
  { name: "State", uid: "companyState", sortable: true },
  { name: "City", uid: "companyCity", sortable: true },
  { name: "Active", uid: "isActive", sortable: true },
  { name: "Actions", uid: "actions" },
];

export const statusOptions = [
  { name: "ACTIVE", uid: AccountStatus.ACTIVE },
  { name: "PENDING", uid: AccountStatus.PENDING },
  { name: "SUSPENDED", uid: AccountStatus.SUSPENDED },
  { name: "APPROVED", uid: AccountStatus.APPROVED },
];

export const statusColorMap: Record<string, ChipProps["color"]> = {
  ACTIVE: "success",
  PENDING: "warning", 
  SUSPENDED: "danger",
  APPROVED: "success",
};
