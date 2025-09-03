"use client";

import React from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Chip,
	Divider,
	Skeleton,
} from "@heroui/react";
import {
	X,
	ExternalLink,
	Copy,
	CreditCard,
	User,
	Building,
} from "lucide-react";
import { getCDFInvoiceById } from "@/lib/api";
import { showToast } from "@/lib";
import useSWR from "swr";

interface InvoiceDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	invoiceId: string | null;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
	isOpen,
	onClose,
	invoiceId,
}) => {
	const {
		data: invoiceRes,
		error,
		isLoading,
	} = useSWR(
		invoiceId ? ["invoice", invoiceId] : null,
		async () => {
			if (!invoiceId) return null;
			const response = await getCDFInvoiceById(invoiceId);
			return response;
		},
		{
			revalidateOnFocus: false,
			dedupingInterval: 300000,
		}
	);

	const invoice = invoiceRes?.data;

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		showToast({
			message: `${label} copied to clipboard!`,
			type: "success",
		});
	};

	const getStatusColor = (isPaid: boolean) => {
		return isPaid ? "success" : "warning";
	};

	if (error) {
		return (
			<Modal isOpen={isOpen} onClose={onClose} size="2xl">
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">
						<h2 className="text-xl font-semibold">Error Loading Invoice</h2>
					</ModalHeader>
					<ModalBody>
						<div className="text-center py-8">
							<p className="text-red-500">
								Failed to load invoice details. Please try again.
							</p>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button color="danger" variant="light" onPress={onClose}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		);
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
			<ModalContent>
				<ModalHeader className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<CreditCard className="w-6 h-6 text-blue-600" />
						<div>
							<h2 className="text-xl font-semibold">Invoice Details</h2>
							{invoice && (
								<p className="text-sm text-gray-500">
									Reference: {invoice.reference}
								</p>
							)}
						</div>
					</div>
					<Button
						isIconOnly
						variant="light"
						onPress={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="w-4 h-4" />
					</Button>
				</ModalHeader>

				<ModalBody className="space-y-6">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-32 w-full" />
						</div>
					) : invoice ? (
						<>
							{/* Invoice Summary */}
							<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<h3 className="font-semibold mb-2 flex items-center gap-2">
											<CreditCard className="w-4 h-4" />
											Invoice Information
										</h3>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-600 dark:text-gray-400">
													Amount:
												</span>
												<span className="font-medium">
													{formatCurrency(invoice.amount)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600 dark:text-gray-400">
													Status:
												</span>
												<Chip
													color={getStatusColor(invoice.isPaid)}
													size="sm"
													variant="flat"
												>
													{invoice.isPaid ? "Paid" : "Unpaid"}
												</Chip>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600 dark:text-gray-400">
													Loan ID:
												</span>
												<span className="font-mono text-xs">
													{invoice.loanId}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600 dark:text-gray-400">
													Created:
												</span>
												<span>{formatDate(invoice.createdAt)}</span>
											</div>
											{invoice.paymentCompletedAt && (
												<div className="flex justify-between">
													<span className="text-gray-600 dark:text-gray-400">
														Paid:
													</span>
													<span>{formatDate(invoice.paymentCompletedAt)}</span>
												</div>
											)}
										</div>
									</div>

									<div>
										<h3 className="font-semibold mb-2 flex items-center gap-2">
											<Building className="w-4 h-4" />
											Bank Information
										</h3>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-600 dark:text-gray-400">
													Account Name:
												</span>
												<span className="font-medium">
													{invoice.accountName}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-gray-600 dark:text-gray-400">
													Account Number:
												</span>
												<div className="flex items-center gap-1">
													<span className="font-mono text-xs">
														{invoice.accountNumber}
													</span>
													<Button
														isIconOnly
														size="sm"
														variant="light"
														onPress={() =>
															copyToClipboard(
																invoice.accountNumber,
																"Account number"
															)
														}
													>
														<Copy className="w-3 h-3" />
													</Button>
												</div>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600 dark:text-gray-400">
													Bank:
												</span>
												<span>{invoice.bankName}</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* WACS Customer Loan Information */}
							{invoice.wacsCustomerLoan && (
								<>
									<Divider />
									<div>
										<h3 className="font-semibold mb-4 flex items-center gap-2">
											<User className="w-4 h-4" />
											Customer & Loan Information
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{/* Customer Details */}
											<div className="space-y-3">
												<h4 className="font-medium text-gray-700 dark:text-gray-300">
													Customer Details
												</h4>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-gray-600 dark:text-gray-400">
															Name:
														</span>
														<span className="font-medium">
															{invoice.wacsCustomerLoan.debtor}
														</span>
													</div>
													{invoice.wacsCustomerLoan.wacsCustomer && (
														<>
															<div className="flex justify-between">
																<span className="text-gray-600 dark:text-gray-400">
																	IPPIS:
																</span>
																<span className="font-mono text-xs">
																	{invoice.wacsCustomerLoan.customerIppis}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-gray-600 dark:text-gray-400">
																	MDA:
																</span>
																<span className="text-xs">
																	{invoice.wacsCustomerLoan.mda}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-gray-600 dark:text-gray-400">
																	Grade Level:
																</span>
																<span>
																	{invoice.wacsCustomerLoan.wacsCustomer
																		.gradeLevel || "N/A"}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-gray-600 dark:text-gray-400">
																	Rank:
																</span>
																<span>
																	{invoice.wacsCustomerLoan.wacsCustomer.rank ||
																		"N/A"}
																</span>
															</div>
														</>
													)}
												</div>
											</div>

											{/* Loan Details */}
											<div className="space-y-3">
												<h4 className="font-medium text-gray-700 dark:text-gray-300">
													Loan Details
												</h4>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-gray-600 dark:text-gray-400">
															Product:
														</span>
														<span className="text-xs">
															{invoice.wacsCustomerLoan.loanProduct}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600 dark:text-gray-400">
															Requested:
														</span>
														<span>
															{formatCurrency(
																invoice.wacsCustomerLoan.amountRequested
															)}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600 dark:text-gray-400">
															Disbursed:
														</span>
														<span>
															{formatCurrency(
																invoice.wacsCustomerLoan.disbursedAmount
															)}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600 dark:text-gray-400">
															Total Repayment:
														</span>
														<span>
															{formatCurrency(
																invoice.wacsCustomerLoan.repaymentAmount
															)}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600 dark:text-gray-400">
															Interest Rate:
														</span>
														<span>
															{invoice.wacsCustomerLoan.interestRate}%{" "}
															{invoice.wacsCustomerLoan.interestRateType}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600 dark:text-gray-400">
															Tenure:
														</span>
														<span>
															{invoice.wacsCustomerLoan.loanTenure} months
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600 dark:text-gray-400">
															Monthly Payment:
														</span>
														<span>
															{formatCurrency(
																invoice.wacsCustomerLoan
																	.monthlyWACSRepaymentAmount
															)}
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</>
							)}
						</>
					) : (
						<div className="text-center py-8">
							<p className="text-gray-500">No invoice data available.</p>
						</div>
					)}
				</ModalBody>

				<ModalFooter className="flex justify-between">
					<div className="flex gap-2">
						{invoice?.reference && (
							<Button
								color="primary"
								variant="light"
								startContent={<Copy className="w-4 h-4" />}
								onPress={() =>
									copyToClipboard(invoice.reference, "Invoice reference")
								}
							>
								Copy Reference
							</Button>
						)}
					</div>
					<Button color="danger" variant="light" onPress={onClose}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default InvoiceDetailsModal;
