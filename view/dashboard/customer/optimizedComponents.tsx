import React from "react";
import { Chip, Snippet } from "@heroui/react";
import { CustomerRecord } from "./types";

// Memoized Personal Information Section
export const PersonalInformationSection = React.memo(({ customer }: { customer: CustomerRecord }) => (
  <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
    <div className="p-3 border-b border-default-200">
      <h3 className="text-lg font-semibold text-default-900">
        Personal Information
      </h3>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
        <div>
          <div className="text-sm text-default-500 mb-1">
            Customer ID
          </div>
          <div className="font-medium text-default-900 flex items-center gap-2">
            {customer.customerId || "N/A"}
            <Snippet
              codeString={customer.customerId}
              classNames={{
                base: "p-0",
                content: "p-0",
              }}
              className="p-0"
              size="sm"
              hideSymbol
              hideCopyButton={false}
            />
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">
            Full Name
          </div>
          <div className="font-medium text-default-900">
            {customer.firstName && customer.lastName
              ? `${customer.firstName} ${customer.lastName}`
              : "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">Email</div>
          <div className="font-medium text-default-900">
            {customer.email || "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">BVN</div>
          <div className="font-medium text-default-900">
            {customer.bvn || "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">
            BVN Date of Birth
          </div>
          <div className="font-medium text-default-900">
            {customer.dob || "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">
            Inputted Date of Birth
          </div>
          <div className="font-medium text-default-900">
            {customer.inputtedDob || "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">
            BVN Phone
          </div>
          <div className="font-medium text-default-900">
            {customer.bvnPhoneNumber || "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">
            Main Phone
          </div>
          <div className="font-medium text-default-900">
            {customer.mainPhoneNumber || "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">MBE ID</div>
          <div className="font-medium text-default-900">
            {customer.mbeId || "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">
            Mono Customer Connected ID
          </div>
          <div className="font-medium text-default-900">
            {customer.monoCustomerConnectedCustomerId || "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">Channel</div>
          <div className="font-medium text-default-900">
            {customer.channel || "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">
            Created At
          </div>
          <div className="font-medium text-default-900">
            {customer.createdAt
              ? new Date(customer.createdAt).toLocaleString()
              : "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">
            Updated At
          </div>
          <div className="font-medium text-default-900">
            {customer.updatedAt
              ? new Date(customer.updatedAt).toLocaleString()
              : "N/A"}
          </div>
        </div>
        <div>
          <div className="text-sm text-default-500 mb-1">
            Customer Loan Disk ID
          </div>
          <div className="font-medium text-default-900">
            {customer.customerLoanDiskId || "N/A"}
          </div>
        </div>
      </div>
    </div>
  </div>
));

// Memoized Loan Information Section
export const LoanInformationSection = React.memo(({ 
  customer, 
  permissions, 
  onUpdateLastPoint, 
  onUpdateLoanStatus 
}: { 
  customer: CustomerRecord;
  permissions: any;
  onUpdateLastPoint: () => void;
  onUpdateLoanStatus: () => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
    <div className="p-3 border-b border-default-200">
      <h3 className="text-lg font-semibold text-default-900">
        Loan Information
      </h3>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Loan Amount
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.loanAmount !== undefined
              ? `₦${customer.LoanRecord[0].loanAmount.toLocaleString()}`
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Monthly Repayment
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.monthlyRepayment !== undefined
              ? `₦${customer.LoanRecord[0].monthlyRepayment.toLocaleString()}`
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Duration
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.duration !== undefined
              ? `${customer.LoanRecord[0].duration} months`
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Interest Amount
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.interestAmount !== undefined
              ? `₦${customer.LoanRecord[0].interestAmount.toLocaleString()}`
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Loan Status
          </div>
          <div className="font-medium">
            <Chip
              color={
                customer.LoanRecord?.[0]?.loanStatus === "APPROVED"
                  ? "success"
                  : customer.LoanRecord?.[0]?.loanStatus === "REJECTED"
                  ? "danger"
                  : "warning"
              }
              variant="flat"
              className="font-medium"
            >
              {customer.LoanRecord?.[0]?.loanStatus || "PENDING"}
            </Chip>
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Last Point
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.lastPoint || "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Down Payment
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.downPayment !== undefined
              ? `₦${customer.LoanRecord[0].downPayment.toLocaleString()}`
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Insurance Package
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.insurancePackage || "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Insurance Price
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.insurancePrice !== undefined
              ? `₦${customer.LoanRecord[0].insurancePrice.toLocaleString()}`
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            MBS Eligible Amount
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.mbsEligibleAmount !== undefined
              ? `₦${customer.LoanRecord[0].mbsEligibleAmount.toLocaleString()}`
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Pay Frequency
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.payFrequency || "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Device Name
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.deviceName || "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Device Price
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.devicePrice !== undefined
              ? `₦${customer.LoanRecord[0].devicePrice.toLocaleString()}`
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Device price with insurance
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.deviceAmount !== undefined
              ? `₦${customer.LoanRecord[0].deviceAmount.toLocaleString()}`
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Loan Created At
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.createdAt
              ? new Date(customer.LoanRecord[0].createdAt).toLocaleString()
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Loan Updated At
          </div>
          <div className="font-medium text-default-900">
            {customer.LoanRecord?.[0]?.updatedAt
              ? new Date(customer.LoanRecord[0].updatedAt).toLocaleString()
              : "N/A"}
          </div>
        </div>

        {permissions.canUpdateLastPoint && (
          <div className="bg-default-50 rounded-lg p-4">
            <button
              className="bg-primary text-white px-4 py-2 rounded-md"
              onClick={onUpdateLastPoint}
            >
              Update Last Point
            </button>
          </div>
        )}

        {permissions.canUpdateLoanStatus && (
          <div className="bg-default-50 rounded-lg p-4">
            <button
              className="bg-primary text-white px-4 py-2 rounded-md"
              onClick={onUpdateLoanStatus}
            >
              Update Loan Status
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
));

// Memoized Wallet Information Section
export const WalletInformationSection = React.memo(({ 
  customer, 
  permissions, 
  onUpdateWallet 
}: { 
  customer: CustomerRecord;
  permissions: any;
  onUpdateWallet: () => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
    <div className="p-3 border-b border-default-200">
      <h3 className="text-lg font-semibold text-default-900">
        Virtual Account Information
      </h3>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Wallet ID
          </div>
          <div className="font-medium text-default-900">
            {customer.Wallet?.wallet_id || "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Account Number
          </div>
          <div className="font-medium text-default-900">
            {customer.Wallet?.accountNumber || "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Bank Name
          </div>
          <div className="font-medium text-default-900">
            {customer.Wallet?.bankName || "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Account Name
          </div>
          <div className="font-medium text-default-900">
            {customer.Wallet?.accountName || "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Current Balance
          </div>
          <div className="font-medium text-default-900">
            {customer.WalletBalance?.balance !== undefined
              ? `₦${customer.WalletBalance.balance.toLocaleString()}`
              : "N/A"}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-4">
          <div className="text-sm text-default-500 mb-1">
            Last Balance
          </div>
          <div className="font-medium text-default-900">
            {customer.WalletBalance?.lastBalance !== undefined
              ? `₦${customer.WalletBalance.lastBalance.toLocaleString()}`
              : "N/A"}
          </div>
        </div>

        {permissions.canUpdateWalletBalance && (
          <div className="bg-default-50 rounded-lg p-4">
            <button
              className="bg-primary text-white px-4 py-2 rounded-md"
              onClick={onUpdateWallet}
            >
              Update Wallet Balance
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)); 