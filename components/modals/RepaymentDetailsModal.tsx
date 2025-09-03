"use client";

import React, { useMemo, useState } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	Card,
	CardBody,
	Button,
	Chip,
	Input,
	Textarea,
	Progress,
} from "@heroui/react";
import { useRepaymentById, usePaydayCustomerById } from "@/hooks/creditflex";
import { recordCDFRepayment } from "@/lib/api";
import { showToast } from "@/lib";
import { Calendar, User, CreditCard, Clock } from "lucide-react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	repaymentId?: string | null;
}

const RepaymentDetailsModal: React.FC<Props> = ({
	isOpen,
	onClose,
	repaymentId,
}) => {
	const {
		data: repaymentRes,
		error: repaymentError,
		isLoading: repaymentLoading,
	} = useRepaymentById(repaymentId || undefined);
	const repayment = repaymentRes?.data || null;

	const customerId =
		repayment?.wacsCustomerLoan?.wacsCustomer?.wacsCustomerId ||
		repayment?.wacsCustomerId ||
		repayment?.customer?.wacsCustomerId ||
		repayment?.customer?.id ||
		repayment?.customerId;
	const { data: customerRes } = usePaydayCustomerById(customerId);
	const customer = customerRes?.data || null;

	// Calculate derived data - Enhanced for WACS structure
	const isWacsData = !!repayment?.wacsCustomerLoanId;

	let expectedAmount, paidAmount, balance, collectionProgress;

	if (isWacsData) {
		// WACS data structure
		expectedAmount = repayment?.amount || 0;
		paidAmount = repayment?.isRepaid ? expectedAmount : 0;
		balance = expectedAmount - paidAmount;
		collectionProgress =
			expectedAmount > 0 ? (paidAmount / expectedAmount) * 100 : 0;
	} else {
		// Traditional Creditflex data structure
		expectedAmount =
			repayment?.expectedAmount ||
			repayment?.expected ||
			repayment?.amount_expected ||
			0;
		paidAmount =
			repayment?.paidAmount || repayment?.paid || repayment?.amount_paid || 0;
		balance = expectedAmount - paidAmount;
		collectionProgress =
			expectedAmount > 0 ? (paidAmount / expectedAmount) * 100 : 0;
	}

	const dueDate = new Date(
		repayment?.dueDate ||
			repayment?.expectedDate ||
			repayment?.repaymentDate ||
			repayment?.due_date ||
			repayment?.date // WACS field
	);

	const status = isWacsData
		? repayment?.isRepaid
			? "paid"
			: "pending"
		: repayment?.status ||
		  repayment?.paymentStatus ||
		  repayment?.statusType ||
		  "pending";

	const isOverdue = dueDate < new Date() && status !== "paid";
	const daysOverdue = isOverdue
		? Math.floor(
				(new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
		  )
		: 0;

	const [amount, setAmount] = useState<number | string>(balance || "");
	const [note, setNote] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	React.useEffect(() => {
		if (repayment) {
			// Default to the remaining balance for easy payment recording
			setAmount(balance > 0 ? balance : "");
		}
	}, [repayment, balance]);

	const handleRecord = async () => {
		if (!repaymentId)
			return showToast({ message: "Missing repayment id", type: "error" });
		if (!amount || Number(amount) <= 0)
			return showToast({ message: "Enter a valid amount", type: "error" });

		setIsSubmitting(true);
		try {
			const payload = { amount: Number(amount), note };
			await recordCDFRepayment(repaymentId, payload);
			showToast({ message: "Repayment recorded", type: "success" });
			onClose();
		} catch (err: any) {
			console.error(err);
			showToast({
				message: err?.message || "Failed to record repayment",
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!repayment) return null;

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={() => {}}
			onClose={onClose}
			size="4xl"
			backdrop="opaque"
			scrollBehavior="inside"
		>
			<ModalContent className="p-4 py-6">
				<ModalHeader className="flex justify-between items-start">
					<div>
						<h2 className="text-xl font-bold">Repayment Details</h2>
						<div className="text-sm text-gray-600 flex items-center gap-4 mt-2">
							<span>
								Repayment ID:{" "}
								<span className="font-mono font-semibold">
									{repayment.repaymentId || repayment.id || repayment._id}
								</span>
							</span>
							<span>
								Loan ID:{" "}
								<span className="font-mono font-semibold">
									{repayment.loanId ||
										repayment.loan?.loanId ||
										repayment.loan_reference}
								</span>
							</span>
						</div>
					</div>
					<div className="flex flex-col items-end gap-2">
						<Chip
							size="lg"
							variant="flat"
							className="capitalize"
							color={
								status === "paid"
									? "success"
									: status === "overdue" || isOverdue
									? "danger"
									: status === "partial"
									? "primary"
									: "warning"
							}
						>
							{status}
						</Chip>
						{isOverdue && (
							<Chip size="sm" color="danger" variant="flat">
								{daysOverdue} days overdue
							</Chip>
						)}
					</div>
				</ModalHeader>

				<ModalBody className="space-y-6">
					{/* Customer Information */}
					<Card>
						<CardBody>
							<div className="flex items-start gap-3 mb-4">
								<User className="w-5 h-5 mt-1 text-blue-600" />
								<div>
									<h3 className="font-semibold text-lg">
										Customer Information
									</h3>
									<p className="text-gray-600">Details about the borrower</p>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div className="text-sm text-gray-500">Full Name</div>
									<div className="font-medium">
										{customer?.fullName ||
											repayment?.customer?.fullName ||
											repayment?.customer_name ||
											repayment?.wacsCustomerLoan?.debtor ||
											"N/A"}
									</div>
								</div>
								<div>
									<div className="text-sm text-gray-500">IPPIS Number</div>
									<div className="font-medium font-mono">
										{customer?.ippisNumber ||
											repayment?.customer?.ippisNumber ||
											repayment?.customerIppis ||
											repayment?.customerIPPIS ||
											"N/A"}
									</div>
								</div>
								{/* WACS-specific customer fields */}
								{repayment?.wacsCustomerLoan?.wacsCustomer && (
									<>
										<div>
											<div className="text-sm text-gray-500">MDA</div>
											<div
												className="font-medium text-sm"
												title={repayment.wacsCustomerLoan.wacsCustomer.mda}
											>
												{repayment.wacsCustomerLoan.wacsCustomer.mda || "N/A"}
											</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Rank & Grade</div>
											<div className="font-medium">
												{repayment.wacsCustomerLoan.wacsCustomer.rank || "N/A"}{" "}
												-{" "}
												{repayment.wacsCustomerLoan.wacsCustomer.gradeLevel ||
													"N/A"}
											</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Email</div>
											<div className="font-medium">
												{repayment.wacsCustomerLoan.wacsCustomer.emailAddress ||
													"N/A"}
											</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Phone</div>
											<div className="font-medium">
												{repayment.wacsCustomerLoan.wacsCustomer.mobileNumber ||
													"N/A"}
											</div>
										</div>
										{repayment.wacsCustomerLoan.wacsCustomer.bankName && (
											<>
												<div>
													<div className="text-sm text-gray-500">Bank</div>
													<div className="font-medium">
														{repayment.wacsCustomerLoan.wacsCustomer.bankName}
													</div>
												</div>
												<div>
													<div className="text-sm text-gray-500">
														Account Number
													</div>
													<div className="font-medium font-mono">
														{repayment.wacsCustomerLoan.wacsCustomer
															.accountNumber || "N/A"}
													</div>
												</div>
											</>
										)}
									</>
								)}
							</div>
						</CardBody>
					</Card>

					{/* Loan Information - Enhanced for WACS */}
					{repayment?.wacsCustomerLoan && (
						<Card>
							<CardBody>
								<div className="flex items-start gap-3 mb-4">
									<CreditCard className="w-5 h-5 mt-1 text-purple-600" />
									<div>
										<h3 className="font-semibold text-lg">Loan Information</h3>
										<p className="text-gray-600">
											Details about the loan product and terms
										</p>
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									<div>
										<div className="text-sm text-gray-500">Loan Product</div>
										<div className="font-medium">
											{repayment.wacsCustomerLoan.loanProduct || "N/A"}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Category</div>
										<div className="font-medium">
											{repayment.wacsCustomerLoan.loanProductCategory || "N/A"}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Interest Rate</div>
										<div className="font-medium">
											{repayment.wacsCustomerLoan.interestRate}%{" "}
											{repayment.wacsCustomerLoan.interestRateType || "yearly"}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">
											Disbursed Amount
										</div>
										<div className="font-medium">
											₦
											{repayment.wacsCustomerLoan.disbursedAmount?.toLocaleString(
												"en-GB"
											) || "0"}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Total Repayment</div>
										<div className="font-medium">
											₦
											{repayment.wacsCustomerLoan.repaymentAmount?.toLocaleString(
												"en-GB"
											) || "0"}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">
											Monthly Repayment
										</div>
										<div className="font-medium">
											₦
											{repayment.wacsCustomerLoan.monthlyRepaymentAmount?.toLocaleString(
												"en-GB"
											) || "0"}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Loan Tenure</div>
										<div className="font-medium">
											{repayment.wacsCustomerLoan.loanTenure} months
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Current Balance</div>
										<div className="font-medium">
											₦
											{repayment.wacsCustomerLoan.balance?.toLocaleString(
												"en-GB"
											) || "0"}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">
											Amount Paid So Far
										</div>
										<div className="font-medium">
											₦
											{repayment.wacsCustomerLoan.amountPaidSoFar?.toLocaleString(
												"en-GB"
											) || "0"}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Start Date</div>
										<div className="font-medium">
											{repayment.wacsCustomerLoan.startDate
												? new Date(
														repayment.wacsCustomerLoan.startDate
												  ).toLocaleDateString("en-US", {
														year: "numeric",
														month: "short",
														day: "numeric",
												  })
												: "N/A"}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Loan Status</div>
										<div className="font-medium">
											<Chip
												size="sm"
												variant="flat"
												color={
													repayment.wacsCustomerLoan.status === "Active"
														? "success"
														: "default"
												}
											>
												{repayment.wacsCustomerLoan.status || "N/A"}
											</Chip>
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Creditor</div>
										<div className="font-medium">
											{repayment.wacsCustomerLoan.creditor || "N/A"}
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					)}

					{/* Payment Information */}
					<Card>
						<CardBody>
							<div className="flex items-start gap-3 mb-4">
								<CreditCard className="w-5 h-5 mt-1 text-green-600" />
								<div>
									<h3 className="font-semibold text-lg">Payment Information</h3>
									<p className="text-gray-600">
										Repayment amounts and progress
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center">
									<div className="text-sm text-gray-500">Expected Amount</div>
									<div className="text-2xl font-bold text-blue-600">
										₦{expectedAmount.toLocaleString("en-GB")}
									</div>
								</div>
								<div className="text-center">
									<div className="text-sm text-gray-500">Paid Amount</div>
									<div className="text-2xl font-bold text-green-600">
										₦{paidAmount.toLocaleString("en-GB")}
									</div>
								</div>
								<div className="text-center">
									<div className="text-sm text-gray-500">Balance</div>
									<div
										className={`text-2xl font-bold ${
											balance > 0 ? "text-red-600" : "text-green-600"
										}`}
									>
										₦{balance.toLocaleString("en-GB")}
									</div>
								</div>
							</div>

							<div className="mt-6">
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm text-gray-500">
										Collection Progress
									</span>
									<span className="text-sm font-medium">
										{collectionProgress.toFixed(1)}%
									</span>
								</div>
								<Progress
									value={collectionProgress}
									className="h-3"
									color={
										collectionProgress >= 100
											? "success"
											: collectionProgress >= 50
											? "primary"
											: "warning"
									}
								/>
							</div>
						</CardBody>
					</Card>

					{/* Due Date Information */}
					<Card>
						<CardBody>
							<div className="flex items-start gap-3 mb-4">
								<Calendar className="w-5 h-5 mt-1 text-orange-600" />
								<div>
									<h3 className="font-semibold text-lg">
										Due Date Information
									</h3>
									<p className="text-gray-600">Payment timeline and status</p>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div className="text-sm text-gray-500">Due Date</div>
									<div
										className={`font-medium ${isOverdue ? "text-red-600" : ""}`}
									>
										{dueDate.toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</div>
								</div>
								<div>
									<div className="text-sm text-gray-500">Status</div>
									<div
										className={`font-medium ${
											isOverdue ? "text-red-600" : "text-green-600"
										}`}
									>
										{isOverdue ? `${daysOverdue} days overdue` : "On time"}
									</div>
								</div>
							</div>
						</CardBody>
					</Card>

					{/* Record Payment Section */}
					{balance > 0 && (
						<Card>
							<CardBody>
								<div className="flex items-start gap-3 mb-4">
									<Clock className="w-5 h-5 mt-1 text-purple-600" />
									<div>
										<h3 className="font-semibold text-lg">Record Payment</h3>
										<p className="text-gray-600">Enter payment details</p>
									</div>
								</div>

								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<Input
											label="Payment Amount"
											value={String(amount)}
											onValueChange={(v: any) => setAmount(v)}
											placeholder="Enter amount"
											startContent="₦"
											type="number"
											min="0"
											max={balance}
											description={`Outstanding balance: ₦${balance.toLocaleString(
												"en-GB"
											)}`}
										/>
										<div className="flex items-end">
											<Button
												color="primary"
												size="lg"
												isLoading={isSubmitting}
												onPress={handleRecord}
												className="w-full"
												isDisabled={!amount || Number(amount) <= 0}
											>
												Record Payment
											</Button>
										</div>
									</div>

									<Textarea
										label="Payment Note (Optional)"
										value={note}
										onValueChange={(v: any) => setNote(v)}
										placeholder="Add any additional notes about this payment..."
										minRows={2}
									/>
								</div>
							</CardBody>
						</Card>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default RepaymentDetailsModal;
