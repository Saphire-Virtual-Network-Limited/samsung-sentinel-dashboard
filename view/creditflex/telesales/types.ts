// Types for Creditflex Telesales Agents view
export interface TeleMarketer {
  teleMarketerId: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  emailVerified: boolean;
  resetOtp: string | null;
  resetOtpExpiry: string | null;
  createdAt: string;
  updatedAt: string;
  accountStatus: string;
  channel: string;
  address?: string;
}

export interface TelemarketerApiResponse {
  success?: boolean;
  message?: string;
  data?:
    | TeleMarketer[]
    | {
        telemarketer?: TeleMarketer[];
        telemarketers?: TeleMarketer[];
        pagination?: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
}

export type TelemarketerStatus =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING"
  | "APPROVED"
  | "FRAUD"
  | "ARCHIVED"
  | "REJECTED"
  | "FULFILLED"
  | "ACCEPTED"
  | "KYC_1"
  | "KYC_2"
  | "KYC_3";

export interface TelemarketerDataFilters {
  status?: TelemarketerStatus;
  search?: string;
  offset?: number;
}

// Search filter options
export const searchFilterOptions = [
  { label: "All Fields", value: "all" },
  { label: "Full Name", value: "full-name" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Agent ID", value: "agent-id" },
  { label: "Address", value: "address" },
];

// Status options
export const statusOptions = [
  { name: "All Status", uid: "all" },
  { name: "Active", uid: "ACTIVE" },
  { name: "Pending", uid: "PENDING" },
  { name: "Approved", uid: "APPROVED" },
  { name: "Suspended", uid: "SUSPENDED" },
  { name: "Inactive", uid: "INACTIVE" },
  { name: "Fraud", uid: "FRAUD" },
  { name: "Archived", uid: "ARCHIVED" },
  { name: "Rejected", uid: "REJECTED" },
  { name: "Fulfilled", uid: "FULFILLED" },
  { name: "Accepted", uid: "ACCEPTED" },
  { name: "KYC Level 1", uid: "KYC_1" },
  { name: "KYC Level 2", uid: "KYC_2" },
  { name: "KYC Level 3", uid: "KYC_3" },
];

// Status color mapping
export const statusColorMap: Record<string, any> = {
  ACTIVE: "success",
  PENDING: "warning",
  APPROVED: "success",
  SUSPENDED: "danger",
  INACTIVE: "default",
  FRAUD: "danger",
  ARCHIVED: "default",
  REJECTED: "danger",
  FULFILLED: "success",
  ACCEPTED: "success",
  KYC_1: "primary",
  KYC_2: "primary",
  KYC_3: "primary",
  all: "default",
} as const;
