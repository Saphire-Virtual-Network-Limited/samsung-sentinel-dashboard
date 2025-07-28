import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { statusOptions, statusColorMap } from "./types";

// Table columns configuration
export const columns: ColumnDef[] = [
  { name: "Agent ID", uid: "teleMarketerId", sortable: true },
  { name: "Full Name", uid: "fullName", sortable: true },
  { name: "Email", uid: "email", sortable: true },
  { name: "Phone", uid: "phone", sortable: true },
  { name: "Address", uid: "address", sortable: true },
  { name: "Status", uid: "accountStatus", sortable: true },
  { name: "Created At", uid: "createdAt", sortable: true },
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
