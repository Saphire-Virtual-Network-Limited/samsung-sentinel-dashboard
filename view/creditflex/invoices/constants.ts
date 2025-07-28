import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { statusOptions, statusColorMap } from "./types";

// Table columns configuration
export const columns: ColumnDef[] = [
  { name: "Telesales Agent", uid: "telesalesAgent", sortable: true },
  { name: "Customer Name", uid: "customerName", sortable: true },
  { name: "Loan ID", uid: "loanId", sortable: true },
  { name: "Primary Amount", uid: "primaryAmount", sortable: true },
  { name: "Amount", uid: "amountRequested", sortable: true },
  { name: "Bank Name", uid: "bankName", sortable: true },
  { name: "Account Number", uid: "accountNumber", sortable: true },
  { name: "Status", uid: "status", sortable: true },
  { name: "Actions", uid: "actions" },
];

// Export status options and color map
export { statusOptions, statusColorMap };

// Default filters
export const defaultFilters = {
  status: "all",
  search: "",
  filterBy: "",
  page: 1,
  limit: 10,
};
