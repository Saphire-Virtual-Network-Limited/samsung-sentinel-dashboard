import { Ambassador, Lead, ConversionRate } from "../../../lib/api";
import { LEAD_STATUSES } from "./constants";

// Re-export API types
export type { Ambassador, Lead, ConversionRate };

// Component-specific types
export interface AmbassadorTableData extends Ambassador {
  leadsCount: number;
  conversionRate: number;
  status: "active" | "inactive";
}

export interface LeadTableData extends Lead {
  ambassadorName?: string;
  teleMarketerName?: string;
}

export interface ConversionTableData {
  ambassadorId: string;
  ambassadorName: string;
  phoneNumber: string;
  state: string;
  totalLeads: number;
  convertedLeads: number;
  disbursedLeads: number;
  rejectedLeads: number;
  conversionRate: number;
  teleMarketerName?: string;
}

export type LeadStatus = (typeof LEAD_STATUSES)[number]["uid"];
