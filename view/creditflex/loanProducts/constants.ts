import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { LoanProduct, statusOptions, statusColorMap } from "./types";

// Table columns configuration
export const columns: ColumnDef[] = [
  { name: "Product Name", uid: "title", sortable: true },
  { name: "Product Type", uid: "loanProductType", sortable: true },
  { name: "Min Amount", uid: "amountFrom", sortable: true },
  { name: "Max Amount", uid: "amountTo", sortable: true },
  { name: "Interest Rate (%)", uid: "interestRate", sortable: true },
  { name: "Moratorium (months)", uid: "moratoriumPeriod", sortable: true },
  { name: "Tenure", uid: "loanTenure", sortable: true },
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
