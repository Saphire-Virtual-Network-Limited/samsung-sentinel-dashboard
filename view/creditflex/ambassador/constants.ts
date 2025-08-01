// Ambassador Management Constants

export const AMBASSADOR_ROUTES = {
  LIST: "/creditflex/ambassadors",
  DETAIL: "/creditflex/ambassadors/[id]",
  LEADS: "/creditflex/ambassadors/leads",
  CONVERSION_RATES: "/creditflex/ambassadors/conversion-rates",
} as const;

export const API_ENDPOINTS = {
  AMBASSADORS: "/admin/ambassador/",
  AMBASSADOR_BY_ID: "/admin/ambassador/{id}",
  AMBASSADOR_LEADS: "/admin/ambassador/leads-with-details",
  CONVERSION_RATES: "/admin/ambassador/conversion-rate",
  UPDATE_LEAD_STATUS: "/admin/ambassador/{ambassadorId}/lead/{leadId}/status",
  ASSIGN_TELEMARKETER:
    "/admin/ambassador/{ambassadorId}/{leadId}/assign-telemarketer",
} as const;

export const PAGINATION_DEFAULTS = {
  ROWS_PER_PAGE: 10,
  INITIAL_PAGE: 1,
} as const;

export const REFRESH_INTERVALS = {
  AMBASSADORS: 60000, // 1 minute
  LEADS: 30000, // 30 seconds
  CONVERSION_RATES: 60000, // 1 minute
} as const;

// Status options
export const LEAD_STATUSES = [
  { name: "Initiated", uid: "INITIATED", color: "warning" },
  { name: "Converted", uid: "CONVERTED", color: "success" },
  { name: "Disbursed", uid: "DISBURSED", color: "primary" },
  { name: "Rejected", uid: "REJECTED", color: "danger" },
] as const;

// Performance tiers
export const PERFORMANCE_TIERS = [
  { min: 70, color: "success", label: "Excellent" },
  { min: 50, color: "primary", label: "Good" },
  { min: 30, color: "warning", label: "Average" },
  { min: 0, color: "danger", label: "Needs Improvement" },
] as const;
