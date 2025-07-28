// Types for Creditflex Loan Products view
export interface LoanProduct {
  id: string;
  title: string;
  loanProductType: string;
  amountFrom: number;
  amountTo: number;
  interestRate: number;
  moratoriumPeriod: number;
  status: string;
  description?: string;
  bankChargeType?: string;
  bankCharge?: number;
  loanTenure?: number;
  interestRateType?: string;
  productImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanProductApiResponse {
  data: LoanProduct[];
}

// Search filter options
export const searchFilterOptions = [
  { label: "All Fields", value: "all" },
  { label: "Product Name", value: "title" },
  { label: "Product Type", value: "product-type" },
  { label: "Interest Rate", value: "interest-rate" },
  { label: "Amount Range", value: "amount-range" },
  { label: "Moratorium Period", value: "moratorium" },
];

// Status options
export const statusOptions = [
  { name: "All Status", uid: "all" },
  { name: "Active", uid: "active" },
  { name: "Draft", uid: "draft" },
  { name: "Inactive", uid: "inactive" },
  { name: "Suspended", uid: "suspended" },
];

// Status color mapping
export const statusColorMap: Record<string, any> = {
  active: "success",
  draft: "warning",
  inactive: "danger",
  suspended: "danger",
} as const;

// Loan product type options
export const loanProductTypeOptions = [
  { value: "monetary-lending", label: "Monetary Lending Loan Product" },
  { value: "product-lending", label: "Product Lending Loan Product" },
];

// Interest rate type options
export const interestRateTypeOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// Bank charge type options
export const bankChargeTypeOptions = [
  { value: "amount", label: "Amount" },
  { value: "percentage", label: "Percentage" },
  { value: "combo", label: "Combo (Amount + Percentage)" },
];
