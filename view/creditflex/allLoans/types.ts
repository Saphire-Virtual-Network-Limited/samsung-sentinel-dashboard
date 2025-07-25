// Types for Creditflex All Loans view
export interface CreditflexLoan {
  id: string;
  loanId: string;
  wacsCustomerLoanId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerIppis?: string;
  ippisNumber?: string; // Keep for backward compatibility
  telesalesAgent: string;
  dateOfApplication: string;
  rawDate: string;
  tenure?: number;
  loanTenure: number;
  loanProduct: string;
  loanProductId: string;
  amountRequested: number;
  disbursedAmount: number;
  amountPaidSoFar: number;
  balance: number;
  principalAmount?: number; // Keep for backward compatibility
  interestAmount?: number;
  totalAmount?: number;
  status: string;
  disbursalDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  // Invoice object for disbursement logic
  Invoice?: {
    reference: string;
    isPaid: boolean;
  };
  // WACS Customer data
  wacsCustomer?: {
    firstName?: string;
    middleName?: string;
    surname?: string;
    teleMarketer?: {
      firstname?: string;
      lastname?: string;
    };
  };
  // Additional fields from API
  employeeName?: string;
  debtor?: string;
}

export interface CreditflexLoanFilters {
  status?: string;
  search?: string;
  filterBy?: string;
  customerName?: string;
  telemarketerName?: string;
  loanId?: string;
  loanProductId?: string;
  ippisNumber?: string;
  customerIppis?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreditflexLoanApiResponse {
  data: CreditflexLoan[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  status: boolean;
}

// Search filter options
export const searchFilterOptions = [
  { label: "Telesales Agent", value: "telesales-agent" },
  { label: "IPPIS", value: "ippis" },
  { label: "Date of Application", value: "date-of-application" },
  { label: "Tenure", value: "tenure" },
  { label: "Loan Product", value: "loan-product" },
];

// Status options
export const statusOptions = [
  { name: "All Status", uid: "all" },
  { name: "Active", uid: "Active" },
  { name: "Disbursed", uid: "Paid" },
  { name: "Awaiting Disbursal", uid: "Awaiting Disbursal" },
  { name: "Disbursed to WACS", uid: "Disbursed To Wacs" },
  {
    name: "Pending/Awaiting Bank Approval",
    uid: "Pending/Awaiting Bank Approval",
  },
  { name: "Loan Repaid", uid: "Loan Repaid" },
  { name: "Rejected", uid: "Rejected" },
];

// Status color mapping
export const statusColorMap: Record<string, any> = {
  Active: "primary",
  Paid: "success",
  "Awaiting Disbursal": "warning",
  "Disbursed To Wacs": "secondary",
  "Pending/Awaiting Bank Approval": "warning",
  "Loan Repaid": "success",
  Rejected: "danger",
} as const;
