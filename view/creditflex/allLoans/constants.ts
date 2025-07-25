import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { CreditflexLoan, statusOptions, statusColorMap } from "./types";

// Table columns configuration
export const columns: ColumnDef[] = [
  { name: "Loan ID", uid: "loanId", sortable: true },
  { name: "Customer", uid: "customerName", sortable: true },
  { name: "Telesales Agent", uid: "telesalesAgent", sortable: true },
  { name: "IPPIS Number", uid: "ippisNumber", sortable: true },
  { name: "Loan Product", uid: "loanProduct", sortable: true },
  { name: "Principal Amount", uid: "principalAmount", sortable: true },
  { name: "Total Amount", uid: "totalAmount", sortable: true },
  { name: "Tenure", uid: "tenure", sortable: true },
  { name: "Date Applied", uid: "dateOfApplication", sortable: true },
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
