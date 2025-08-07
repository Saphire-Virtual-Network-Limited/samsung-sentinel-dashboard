"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Card,
  CardBody,
  Chip,
  Divider,
} from "@heroui/react";
import { getColor } from "@/lib/utils";
import { CreditflexLoan } from "@/view/creditflex/allLoans/types";

interface LoanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: CreditflexLoan | null;
}

export const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({
  isOpen,
  onClose,
  loan,
}) => {
  if (!loan) return null;

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "₦0";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateRepayments = () => {
    if (!loan?.principalAmount || !loan?.loanTenure) return [];

    const repayments = [];
    const monthlyRepayment = loan.totalAmount
      ? loan.totalAmount / loan.loanTenure
      : (loan.principalAmount * 1.1) / loan.loanTenure; // Assume 10% interest if no totalAmount

    const startDate = new Date(loan.dateOfApplication || new Date());
    startDate.setMonth(startDate.getMonth() + 1); // Start next month

    for (let i = 0; i < loan.loanTenure; i++) {
      const repaymentDate = new Date(startDate);
      repaymentDate.setMonth(repaymentDate.getMonth() + i);

      repayments.push({
        date: repaymentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        amount: monthlyRepayment,
        isPaid: false,
      });
    }

    return repayments;
  };

  const repayments = calculateRepayments();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {}}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="opaque"
      classNames={{
        closeButton: "bg-[#3A3A3A] p-[0.376rem]  text-white hover:bg-[#2A2A2A]",
      }}
    >
      <ModalContent className="p-4 py-6">
        <ModalHeader className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[#0F52BA] font-bold text-[22px]">
              Loan Details
            </h2>
            <Chip
              className="capitalize"
              color={getColor(loan.status)}
              size="sm"
              variant="flat"
            >
              {loan.status}
            </Chip>
          </div>
          <div className="text-sm text-gray-600">
            Loan ID:{" "}
            <span className="font-mono font-semibold">{loan.loanId}</span>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-lg">
                <span className="text-[#0F52BA]">Customer:</span>{" "}
                <span className="text-gray-900">{loan.customerName}</span>
              </h4>
              <p className="text-sm text-gray-600">
                IPPIS: {loan.customerIppis}
              </p>
            </div>
            <div className="text-right">
              <h4 className="font-semibold text-lg">
                <span className="text-[#0F52BA]">Telesales Agent:</span>{" "}
                <span className="text-gray-900">{loan.telesalesAgent}</span>
              </h4>
              <p className="text-sm text-gray-600">
                Applied: {formatDate(loan.dateOfApplication)}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Two-column layout for main loan info */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Left Column - Loan Details */}
              <Card className="shadow-sm">
                <CardBody className="p-6">
                  <h3 className="text-[#0F52BA] font-semibold text-lg mb-4 border-b pb-2">
                    Loan Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[#0F52BA] font-semibold text-sm mb-1">
                          Principal Amount
                        </p>
                        <p className="text-gray-900 font-bold text-lg">
                          {formatCurrency(loan.principalAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#0F52BA] font-semibold text-sm mb-1">
                          Amount Requested
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {formatCurrency(loan.amountRequested)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#0F52BA] font-semibold text-sm mb-1">
                          Loan Product
                        </p>
                        <p className="text-gray-900">{loan.loanProduct}</p>
                      </div>

                      <div>
                        <p className="text-[#0F52BA] font-semibold text-sm mb-1">
                          Loan Tenure
                        </p>
                        <p className="text-gray-900">
                          {loan.loanTenure} Months
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[#0F52BA] font-semibold text-sm mb-1">
                          Total Amount (with Interest)
                        </p>
                        <p className="text-gray-900 font-bold text-lg">
                          {formatCurrency(loan.totalAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#0F52BA] font-semibold text-sm mb-1">
                          Amount Disbursed
                        </p>
                        <p className="text-green-600 font-semibold">
                          {formatCurrency(loan.disbursedAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#0F52BA] font-semibold text-sm mb-1">
                          Amount Paid So Far
                        </p>
                        <p className="text-blue-600 font-semibold">
                          {formatCurrency(loan.amountPaidSoFar)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#0F52BA] font-semibold text-sm mb-1">
                          Outstanding Balance
                        </p>
                        <p className="text-red-600 font-semibold">
                          {formatCurrency(loan.balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Payment Progress</span>
                      <span className="text-gray-600">
                        {(loan.totalAmount || 0) > 0
                          ? Math.round(
                              ((loan.amountPaidSoFar || 0) /
                                (loan.totalAmount || 1)) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (loan.totalAmount || 0) > 0
                              ? Math.min(
                                  ((loan.amountPaidSoFar || 0) /
                                    (loan.totalAmount || 1)) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Right Column - Repayment Schedule */}
              <Card className="shadow-sm">
                <CardBody className="p-6">
                  <h3 className="text-[#0F52BA] font-semibold text-lg mb-4 border-b pb-2">
                    Expected Repayment Schedule
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 pb-3 border-b border-gray-200">
                      <span className="text-[#0F52BA] font-semibold text-sm">
                        Month
                      </span>
                      <span className="text-[#0F52BA] font-semibold text-sm">
                        Due Date
                      </span>
                      <span className="text-[#0F52BA] font-semibold text-sm text-right">
                        Amount
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {repayments.map((repayment, index) => (
                        <div
                          key={index}
                          className={`grid grid-cols-3 gap-4 p-3 rounded-lg transition-colors ${
                            repayment.isPaid
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-gray-900 text-sm font-medium">
                              Month {index + 1}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-900 text-sm">
                              {repayment.date}
                            </span>
                          </div>
                          <div className="flex items-center justify-end">
                            <span className="text-gray-900 text-sm font-semibold">
                              {formatCurrency(repayment.amount)}
                            </span>
                            {repayment.isPaid && (
                              <Chip
                                size="sm"
                                color="success"
                                variant="flat"
                                className="ml-2"
                              >
                                Paid
                              </Chip>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <Divider />
                    <div className="grid grid-cols-3 gap-4 p-3 bg-blue-50 rounded-lg">
                      <div className="col-span-2">
                        <span className="text-[#0F52BA] font-bold text-sm">
                          Total Expected
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#0F52BA] font-bold text-sm">
                          {formatCurrency(loan.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Invoice Information - Full width section below the two columns */}
            {loan.Invoice && (
              <Card className="shadow-sm w-full">
                <CardBody className="p-6">
                  <h3 className="text-[#0F52BA] font-semibold text-lg mb-4 border-b pb-2">
                    Invoice Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-[#0F52BA] font-semibold text-sm">
                        Invoice Reference
                      </p>
                      <p className="text-gray-900 font-mono text-sm break-all">
                        {loan.Invoice.reference}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[#0F52BA] font-semibold text-sm">
                        Payment Status
                      </p>
                      <div>
                        <Chip
                          size="sm"
                          color={loan.Invoice.isPaid ? "success" : "warning"}
                          variant="flat"
                        >
                          {loan.Invoice.isPaid ? "Paid" : "Pending"}
                        </Chip>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[#0F52BA] font-semibold text-sm">
                        Disbursement Status
                      </p>
                      <div>
                        <Chip
                          size="sm"
                          color={
                            (loan.disbursedAmount || 0) > 0
                              ? "success"
                              : "default"
                          }
                          variant="flat"
                        >
                          {(loan.disbursedAmount || 0) > 0
                            ? "Disbursed"
                            : "Pending"}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
