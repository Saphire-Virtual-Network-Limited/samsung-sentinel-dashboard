import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { ChipProps } from "@heroui/react";
import { AccountStatus } from "./types";

export const columns: ColumnDef[] = [
  { name: "Name", uid: "fullName", sortable: true },
  { name: "Title", uid: "title", sortable: true },
  { name: "Status", uid: "accountStatus", sortable: true },
  { name: "Email", uid: "email", sortable: true },
  { name: "BVN", uid: "bvn", sortable: true },
  { name: "Contact No.", uid: "bvnPhoneNumber", sortable: true },
  { name: "Age", uid: "age", sortable: true },
  { name: "State", uid: "state", sortable: true },
  { name: "City", uid: "city", sortable: true },
  { name: "Actions", uid: "actions" },
];

export const statusOptions = [
  { name: "KYC 1", uid: AccountStatus.KYC_1 },
  { name: "KYC 2", uid: AccountStatus.KYC_2 },
  { name: "ACTIVE", uid: AccountStatus.ACTIVE },
  { name: "PENDING", uid: AccountStatus.PENDING },
  { name: "VERIFIED", uid: AccountStatus.VERIFIED },
    { name: "APPROVED", uid: AccountStatus.APPROVED },
      { name: "REJECTED", uid: AccountStatus.REJECTED },


];

export const statusColorMap: Record<string, ChipProps["color"]> = {
  KYC_1: "default",
  KYC_2: "primary",
  ACTIVE: "danger",
  PENDING: "warning",
  VERIFIED: "success",
  APPROVED: "success",
  REJECTED: "danger"
};
