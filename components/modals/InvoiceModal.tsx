"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Invoice } from "@/view/creditflex/invoices/types";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  if (!invoice) return null;

  const calculateRepayments = () => {
    const loanData = invoice?.wacsCustomerLoan;
    if (!loanData || !loanData.loanTenure || !loanData.monthlyRepaymentAmount)
      return [];

    const repayments = [];
    const monthlyRepayment = loanData.monthlyRepaymentAmount;
    const startDate = new Date(loanData.startDate || new Date());

    // Account for moratorium period
    if (loanData.moratorium) {
      startDate.setMonth(startDate.getMonth() + loanData.moratorium);
    }

    for (let i = 0; i < loanData.loanTenure; i++) {
      const repaymentDate = new Date(startDate);
      repaymentDate.setMonth(repaymentDate.getMonth() + i);

      repayments.push({
        date: repaymentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        amount: formatCurrency(monthlyRepayment),
      });
    }

    return repayments;
  };

  const repayments = calculateRepayments();

  const customerName =
    invoice?.wacsCustomer?.fullName ||
    invoice?.wacsCustomerLoan?.wacsCustomer?.fullName ||
    invoice?.wacsCustomerLoan?.debtor ||
    invoice?.wacsCustomerLoan?.employeeName ||
    invoice?.employeeName ||
    invoice?.debtor ||
    invoice?.customerName ||
    invoice?.accountName ||
    `${invoice?.wacsCustomer?.firstName || ""} ${
      invoice?.wacsCustomer?.middleName || ""
    } ${invoice?.wacsCustomer?.surname || ""}`.trim() ||
    `${invoice?.wacsCustomerLoan?.wacsCustomer?.firstName || ""} ${
      invoice?.wacsCustomerLoan?.wacsCustomer?.middleName || ""
    } ${invoice?.wacsCustomerLoan?.wacsCustomer?.surname || ""}`.trim() ||
    "N/A";

  const loanData = invoice?.wacsCustomerLoan;
  const customerData = loanData?.wacsCustomer;

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "₦0";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {}}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      backdrop="opaque"
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center mt-4">
          <h2 className="text-blue-700 font-bold text-lg">{customerName}</h2>
          <span className="text-sm text-gray-600">
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                invoice.isPaid
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {invoice.isPaid ? "Paid" : "Pending"}
            </span>
          </span>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <p className="text-blue-700 font-semibold text-md">
            Reference:{" "}
            <span className="text-black font-normal">
              {invoice.reference || "N/A"}
            </span>
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Invoice & Customer Details */}
              <div className="space-y-4">
                <h3 className="text-blue-600 font-semibold text-lg mb-3">
                  Invoice Information
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600 font-semibold">Invoice ID</p>
                    <p className="text-gray-900">{invoice.id}</p>
                  </div>

                  <div>
                    <p className="text-blue-600 font-semibold">Loan ID</p>
                    <p className="text-gray-900">{invoice.loanId || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-blue-600 font-semibold">Reference</p>
                    <p className="text-gray-900 font-mono text-xs">
                      {invoice.reference || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-blue-600 font-semibold">Amount</p>
                    <p className="text-gray-900 font-semibold">
                      {formatCurrency(
                        invoice.amount ||
                          invoice.amountRequested ||
                          invoice.primaryAmount ||
                          0
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-blue-600 font-semibold">Account Name</p>
                    <p className="text-gray-900">
                      {invoice.accountName || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-blue-600 font-semibold">
                      Account Number
                    </p>
                    <p className="text-gray-900 font-mono">
                      {invoice.accountNumber || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-blue-600 font-semibold">Bank Name</p>
                    <p className="text-gray-900">{invoice.bankName || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-blue-600 font-semibold">
                      Payment Status
                    </p>
                    <p className="text-gray-900">
                      {invoice.isPaid ? "Completed" : "Pending"}
                    </p>
                  </div>

                  {invoice.paymentCompletedAt && (
                    <div className="col-span-2">
                      <p className="text-blue-600 font-semibold">
                        Payment Date
                      </p>
                      <p className="text-gray-900">
                        {new Date(
                          invoice.paymentCompletedAt
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}

                  <div className="col-span-2">
                    <p className="text-blue-600 font-semibold">Created Date</p>
                    <p className="text-gray-900">
                      {invoice.createdAt
                        ? new Date(invoice.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Loan Details Section */}
                {loanData && (
                  <div className="mt-6">
                    <h3 className="text-blue-600 font-semibold text-lg mb-3">
                      Loan Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-600 font-semibold">
                          Loan Product
                        </p>
                        <p className="text-gray-900">
                          {loanData.loanProduct || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">Category</p>
                        <p className="text-gray-900">
                          {loanData.loanProductCategory || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Amount Requested
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {formatCurrency(loanData.amountRequested || 0)}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Disbursed Amount
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {formatCurrency(loanData.disbursedAmount || 0)}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Repayment Amount
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {formatCurrency(loanData.repaymentAmount || 0)}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Monthly Repayment
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {formatCurrency(loanData.monthlyRepaymentAmount || 0)}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Interest Rate
                        </p>
                        <p className="text-gray-900">
                          {loanData.interestRate}% {loanData.interestRateType}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Loan Tenure
                        </p>
                        <p className="text-gray-900">
                          {loanData.loanTenure} Months
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Moratorium
                        </p>
                        <p className="text-gray-900">
                          {loanData.moratorium} Month(s)
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Loan Status
                        </p>
                        <p className="text-gray-900">{loanData.status}</p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">Balance</p>
                        <p className="text-gray-900 font-semibold">
                          {formatCurrency(loanData.balance || 0)}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Amount Paid
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {formatCurrency(loanData.amountPaidSoFar || 0)}
                        </p>
                      </div>

                      {loanData.startDate && (
                        <div className="col-span-2">
                          <p className="text-blue-600 font-semibold">
                            Start Date
                          </p>
                          <p className="text-gray-900">
                            {new Date(loanData.startDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Details Section */}
                {customerData && (
                  <div className="mt-6">
                    <h3 className="text-blue-600 font-semibold text-lg mb-3">
                      Customer Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-600 font-semibold">Full Name</p>
                        <p className="text-gray-900">{customerData.fullName}</p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          IPPIS Number
                        </p>
                        <p className="text-gray-900">
                          {loanData.customerIppis || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">MDA</p>
                        <p className="text-gray-900">
                          {loanData.mda || customerData.mda}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Mobile Number
                        </p>
                        <p className="text-gray-900">
                          {customerData.mobileNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">Email</p>
                        <p className="text-gray-900">
                          {customerData.emailAddress}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Rank/Cadre
                        </p>
                        <p className="text-gray-900">
                          {customerData.cadre} - {customerData.rank}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Grade Level
                        </p>
                        <p className="text-gray-900">
                          {customerData.gradeLevel} Step{" "}
                          {customerData.gradeStep}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-600 font-semibold">
                          Bank Details
                        </p>
                        <p className="text-gray-900">
                          {customerData.bankName}
                          <br />
                          <span className="font-mono text-xs">
                            {customerData.accountNumber}
                          </span>
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-blue-600 font-semibold">Address</p>
                        <p className="text-gray-900">
                          {customerData.residentialAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Repayment Schedule */}
              {repayments.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-blue-600 font-semibold text-sm">
                    Expected Loan Repayment
                  </h3>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 pb-2 border-b">
                      <span className="text-blue-600 font-semibold text-sm">
                        Repayment date
                      </span>
                      <span className="text-blue-600 font-semibold text-sm">
                        Repayment Amount
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {repayments.map((repayment, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4">
                          <span className="text-gray-900 text-sm">
                            {repayment.date}
                          </span>
                          <span className="text-gray-900 text-sm">
                            {repayment.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button color="primary" onPress={onClose}>
            Download
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
