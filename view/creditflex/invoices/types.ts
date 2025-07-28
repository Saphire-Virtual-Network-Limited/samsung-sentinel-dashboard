// Types for Creditflex Invoices view
export interface Invoice {
  id: string;
  loanId: string | number;
  telesalesAgent?: string;
  telesalesAgentName?: string;
  customerName?: string;
  employeeName?: string;
  debtor?: string;
  wacsCustomer?: {
    fullName?: string;
    firstName?: string;
    middleName?: string;
    surname?: string;
  };
  wacsCustomerLoanId?: string | null;
  wacsCustomerLoan?: {
    wacsCustomerLoanId: string;
    debtor: string;
    loanId: string;
    loanProduct: string;
    loanProductCategory: string;
    loanProductId: number;
    interestRate: number;
    interestRateType: string;
    status: string;
    amountRequested: number;
    amountOffered: number;
    disbursedAmount: number;
    repaymentAmount: number;
    repaymentMFBAmount: number;
    repaymentWACsAmount: number;
    startDate: string;
    monthlyRepaymentAmount: number;
    monthlyWACSRepaymentAmount: number;
    balance: number;
    amountPaidSoFar: number;
    loanTenure: number;
    creditor: string;
    moratorium: number;
    customerIppis: string;
    employeeName: string;
    createdAt: string;
    updatedAt: string;
    mda: string;
    wacsCustomerId: string;
    loanRecordId: string;
    wacsCustomer?: {
      id: string;
      fullName: string;
      firstName: string;
      middleName: string;
      surname: string;
      mobileNumber: string;
      emailAddress: string;
      residentialAddress: string;
      mda: string;
      rank: string;
      cadre: string;
      gradeLevel: string;
      gradeStep: number;
      bankName: string;
      accountNumber: string;
      accountName: string | null;
      // ... other customer fields
    };
  };
  primaryAmount?: number;
  amountRequested?: number;
  amount?: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  status: string;
  reference?: string;
  isPaid?: boolean;
  paymentCompletedAt?: string | null;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional loan details for modal
  mda?: string;
  ippisNumber?: string;
  interestRate?: string;
  loanTenure?: number;
  loanProduct?: string;
  moratoriumPeriod?: number;
  repaymentAmount?: number;
  startDate?: string;
}

export interface InvoiceApiResponse {
  data: Invoice[] | { invoices: Invoice[] };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Search filter options
export const searchFilterOptions = [
  { label: "All Fields", value: "all" },
  { label: "Customer Name", value: "customer-name" },
  { label: "Telesales Agent", value: "telesales-agent" },
  { label: "Loan ID", value: "loan-id" },
  { label: "Bank Name", value: "bank-name" },
  { label: "Account Number", value: "account-number" },
  { label: "Amount", value: "amount" },
];

// Status options
export const statusOptions = [
  { name: "All Status", uid: "all" },
  { name: "Paid", uid: "paid" },
  { name: "Pending", uid: "pending" },
];

// Status color mapping
export const statusColorMap: Record<string, any> = {
  paid: "success",
  pending: "warning",
  all: "default",
} as const;
