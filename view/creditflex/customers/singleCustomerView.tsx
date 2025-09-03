"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Button, Chip, Spinner } from "@heroui/react";
import {
	ArrowLeft,
	User,
	CreditCard,
	Phone,
	Mail,
	MapPin,
	Calendar,
	Building,
	Banknote,
	Clock,
	TrendingUp,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";
import { usePaydayCustomerById } from "@/hooks/creditflex";
import { useAuth } from "@/lib/globalContext";
import { showToast } from "@/lib";
import Link from "next/link";
import InfoCard from "@/components/reususables/custom-ui/InfoCard";
import InfoField from "@/components/reususables/custom-ui/InfoField";

const CreditflexSingleCustomerView = () => {
	const params = useParams();
	const router = useRouter();
	const pathname = usePathname();
	const { userResponse } = useAuth();

	const wacsCustomerId = params.customerId as string;

	// Determine the user's access path based on their role
	const userAccessPath = React.useMemo(() => {
		const userRole = userResponse?.data?.role;
		switch (userRole) {
			case "SUPER_ADMIN":
				return "/access/admin";
			case "ADMIN":
				return "/access/sub-admin";
			case "DEVELOPER":
				return "/access/dev";
			case "FINANCE":
				return "/access/finance";
			case "AUDIT":
				return "/access/audit";
			case "VERIFICATION":
			case "VERIFICATION_OFFICER":
				return "/access/verify";
			case "SUPPORT":
				return "/access/support";
			case "HUMAN_RESOURCE":
				return "/access/hr";
			case "INVENTORY_MANAGER":
				return "/access/inventory";
			case "SALES":
				return "/access/sales";
			case "COLLECTION_ADMIN":
				return "/access/collection-admin";
			case "COLLECTION_OFFICER":
				return "/access/collection-officer";
			case "SCAN_PARTNER":
				return "/access/scan-partner";
			default:
				return "/access/admin"; // fallback
		}
	}, [userResponse?.data?.role]);

	const {
		data: customerRes,
		error,
		isLoading,
	} = usePaydayCustomerById(wacsCustomerId);

	const customer = customerRes?.data;

	const formatDate = (date: string | null | undefined) => {
		if (!date) return "N/A";
		return new Date(date).toLocaleDateString("en-GB", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatCurrency = (amount: number | null | undefined) => {
		if (!amount && amount !== 0) return "N/A";
		return `₦${Number(amount).toLocaleString("en-GB")}`;
	};

	// Handle loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<Spinner size="lg" />
					<p className="mt-4 text-gray-600 dark:text-gray-400">
						Loading customer information...
					</p>
				</div>
			</div>
		);
	}

	// Handle error state
	if (error || !customer) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
					<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
						Customer Not Found
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						The requested customer information could not be found.
					</p>
					<Button
						variant="flat"
						color="primary"
						startContent={<ArrowLeft className="w-4 h-4" />}
						onPress={() => router.back()}
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	// Calculate metrics from customer data
	const metrics = {
		totalLoans: customer.loans?.length || 0,
		activeLoans:
			customer.loans?.filter((loan: any) => loan.status === "active")?.length ||
			0,
		totalBorrowed:
			customer.loans?.reduce(
				(sum: number, loan: any) => sum + (loan.loanAmount || 0),
				0
			) || 0,
		totalRepaid:
			customer.repayments?.reduce(
				(sum: number, repay: any) => sum + (repay.paidAmount || 0),
				0
			) || 0,
	};

	return (
		<div className="p-6 max-w-7xl mx-auto">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center gap-4 mb-4">
					<Button variant="light" isIconOnly onPress={() => router.back()}>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<div>
						<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
							Customer Profile
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Detailed view of customer information and loan history
						</p>
					</div>
				</div>

				{/* Customer Summary Bar */}
				<div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-xl font-semibold">
								{customer.firstName} {customer.middleName} {customer.surname}
							</h2>
							<p className="text-blue-100">
								Customer ID:{" "}
								{customer.wacsCustomerId || customer.id || wacsCustomerId}
							</p>
							<p className="text-blue-100">
								IPPIS: {customer.ippisNumber || "N/A"}
							</p>
						</div>
						<div className="text-right">
							<Chip
								color={
									customer.status === "active"
										? "success"
										: customer.status === "inactive"
										? "danger"
										: "default"
								}
								size="sm"
							>
								{customer.status || "active"}
							</Chip>
							<p className="text-blue-100 text-sm mt-2">
								Member since {formatDate(customer.createdAt)}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Key Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
							<CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Total Loans
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{metrics.totalLoans}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
							<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Active Loans
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{metrics.activeLoans}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
							<Banknote className="w-5 h-5 text-orange-600 dark:text-orange-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Total Borrowed
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatCurrency(metrics.totalBorrowed)}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
							<TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Total Repaid
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatCurrency(metrics.totalRepaid)}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column - Personal Information */}
				<div className="lg:col-span-1 space-y-6">
					{/* Personal Information */}
					<InfoCard
						title="Personal Information"
						icon={<User className="w-5 h-5 text-blue-600" />}
						collapsible={true}
						defaultExpanded={true}
					>
						<div className="p-6 space-y-4">
							<InfoField
								label="Customer ID"
								value={customer.wacsCustomerId || customer.id || wacsCustomerId}
								copyable
							/>
							<InfoField
								label="Full Name"
								value={`${customer.firstName || ""} ${
									customer.middleName || ""
								} ${customer.surname || ""}`.trim()}
							/>
							<InfoField
								label="IPPIS Number"
								value={customer.ippisNumber}
								copyable
							/>
							<InfoField
								label="Email Address"
								value={customer.emailAddress}
								copyable
							/>
							<InfoField
								label="Mobile Number"
								value={customer.mobileNumber}
								copyable
							/>
							<InfoField
								label="Date of Birth"
								value={formatDate(customer.dateOfBirth)}
							/>
							<InfoField label="Gender" value={customer.gender} />
							<InfoField
								label="Marital Status"
								value={customer.maritalStatus}
							/>
						</div>
					</InfoCard>

					{/* Employment Information */}
					<InfoCard
						title="Employment Information"
						icon={<Building className="w-5 h-5 text-green-600" />}
						collapsible={true}
						defaultExpanded={true}
					>
						<div className="p-6 space-y-4">
							<InfoField label="MDA" value={customer.mda} />
							<InfoField label="Rank" value={customer.rank} />
							<InfoField label="Cadre" value={customer.cadre} />
							<InfoField label="Grade Level" value={customer.gradeLevel} />
							<InfoField label="Grade Step" value={customer.gradeStep} />
							<InfoField label="Department" value={customer.department} />
							<InfoField
								label="Monthly Salary"
								value={formatCurrency(customer.monthlySalary)}
							/>
						</div>
					</InfoCard>

					{/* Contact Information */}
					<InfoCard
						title="Contact & Address"
						icon={<MapPin className="w-5 h-5 text-purple-600" />}
						collapsible={true}
						defaultExpanded={true}
					>
						<div className="p-6 space-y-4">
							<InfoField
								label="Residential Address"
								value={customer.residentialAddress}
							/>
							<InfoField
								label="State of Origin"
								value={customer.stateOfOrigin}
							/>
							<InfoField label="LGA of Origin" value={customer.lgaOfOrigin} />
							<InfoField
								label="State of Residence"
								value={customer.stateOfResidence}
							/>
							<InfoField
								label="LGA of Residence"
								value={customer.lgaOfResidence}
							/>
							<InfoField
								label="Office Address"
								value={customer.officeAddress}
							/>
						</div>
					</InfoCard>
				</div>

				{/* Right Column - Loans and Financial Information */}
				<div className="lg:col-span-2 space-y-6">
					{/* Bank Information */}
					<InfoCard
						title="Bank Information"
						icon={<CreditCard className="w-5 h-5 text-blue-600" />}
						collapsible={true}
						defaultExpanded={true}
					>
						<div className="p-6 space-y-4">
							<InfoField label="Bank Name" value={customer.bankName} />
							<InfoField
								label="Account Number"
								value={customer.accountNumber}
								copyable
							/>
							<InfoField label="Account Name" value={customer.accountName} />
							<InfoField label="BVN" value={customer.bvn} copyable />
						</div>
					</InfoCard>

					{/* Telemarketer Information */}
					{customer.teleMarketer && (
						<InfoCard
							title="Assigned Telemarketer"
							icon={<Phone className="w-5 h-5 text-orange-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-6 space-y-4">
								<InfoField
									label="Telemarketer"
									value={`${customer.teleMarketer.firstname || ""} ${
										customer.teleMarketer.lastname || ""
									}`.trim()}
									endComponent={
										customer.teleMarketer.id && (
											<Link
												href={`${userAccessPath}/creditflex/telesales-agents/${customer.teleMarketer.id}`}
												className="text-blue-600 hover:underline text-sm"
											>
												View Profile
											</Link>
										)
									}
								/>
								<InfoField
									label="Email"
									value={customer.teleMarketer.email}
									copyable
								/>
								<InfoField
									label="Phone"
									value={customer.teleMarketer.phone}
									copyable
								/>
								<InfoField
									label="Status"
									value={customer.teleMarketer.status}
								/>
							</div>
						</InfoCard>
					)}

					{/* Loan History */}
					<InfoCard
						title="Loan History"
						icon={<Banknote className="w-5 h-5 text-green-600" />}
						collapsible={true}
						defaultExpanded={true}
					>
						<div className="p-6">
							{customer.loans && customer.loans.length > 0 ? (
								<div className="space-y-4">
									{customer.loans.map((loan: any, index: number) => (
										<div
											key={loan.id || index}
											className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
										>
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-2">
													<span className="font-medium text-gray-900 dark:text-white">
														Loan #{loan.loanId || loan.id}
													</span>
													<Chip
														color={
															loan.status === "active"
																? "success"
																: loan.status === "completed"
																? "primary"
																: loan.status === "defaulted"
																? "danger"
																: "default"
														}
														size="sm"
													>
														{loan.status}
													</Chip>
												</div>
												<span className="text-sm text-gray-500">
													{formatDate(loan.createdAt)}
												</span>
											</div>
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
												<div>
													<span className="text-gray-500">Amount:</span>
													<div className="font-medium">
														{formatCurrency(loan.loanAmount)}
													</div>
												</div>
												<div>
													<span className="text-gray-500">
														Monthly Repayment:
													</span>
													<div className="font-medium">
														{formatCurrency(loan.monthlyWACSRepaymentAmount)}
													</div>
												</div>
												<div>
													<span className="text-gray-500">Tenure:</span>
													<div className="font-medium">
														{loan.loanTenure} months
													</div>
												</div>
												<div>
													<span className="text-gray-500">Balance:</span>
													<div className="font-medium">
														{formatCurrency(loan.balance)}
													</div>
												</div>
											</div>
											{loan.loanId && (
												<div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
													<Link
														href={`${userAccessPath}/creditflex/loans/${loan.loanId}`}
														className="text-blue-600 hover:underline text-sm"
													>
														View Loan Details →
													</Link>
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-gray-500">
									<Banknote className="w-12 h-12 mx-auto mb-3 opacity-50" />
									<p>No loan history available</p>
								</div>
							)}
						</div>
					</InfoCard>

					{/* Recent Repayments */}
					<InfoCard
						title="Recent Repayments"
						icon={<Clock className="w-5 h-5 text-blue-600" />}
						collapsible={true}
						defaultExpanded={true}
					>
						<div className="p-6">
							{customer.repayments && customer.repayments.length > 0 ? (
								<div className="space-y-3">
									{customer.repayments
										.slice(0, 5)
										.map((repayment: any, index: number) => (
											<div
												key={repayment.id || index}
												className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
											>
												<div className="flex items-center gap-3">
													<Chip
														color={
															repayment.status === "completed"
																? "success"
																: repayment.status === "pending"
																? "warning"
																: repayment.status === "failed"
																? "danger"
																: "default"
														}
														size="sm"
													>
														{repayment.status}
													</Chip>
													<div>
														<div className="font-medium text-gray-900 dark:text-white">
															{formatCurrency(repayment.paidAmount)}
														</div>
														<div className="text-sm text-gray-500">
															{formatDate(repayment.paidAt)}
														</div>
													</div>
												</div>
												<div className="text-right">
													<div className="text-sm text-gray-500">
														For Loan: {repayment.loanId}
													</div>
												</div>
											</div>
										))}
									<div className="pt-3 border-t border-gray-200 dark:border-gray-700">
										<Link
											href={`${userAccessPath}/creditflex/repayments?customerId=${
												customer.wacsCustomerId || customer.id
											}`}
											className="text-blue-600 hover:underline text-sm"
										>
											View All Repayments →
										</Link>
									</div>
								</div>
							) : (
								<div className="text-center py-8 text-gray-500">
									<Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
									<p>No repayment history available</p>
								</div>
							)}
						</div>
					</InfoCard>

					{/* System Information */}
					<InfoCard
						title="System Information"
						icon={<Calendar className="w-5 h-5 text-gray-600" />}
						collapsible={true}
						defaultExpanded={false}
					>
						<div className="p-6 space-y-4">
							<InfoField
								label="Customer Created"
								value={formatDate(customer.createdAt)}
							/>
							<InfoField
								label="Last Updated"
								value={formatDate(customer.updatedAt)}
							/>
							<InfoField label="Status" value={customer.status} />
							<InfoField
								label="Customer Type"
								value={customer.customerType || "Standard"}
							/>
						</div>
					</InfoCard>
				</div>
			</div>
		</div>
	);
};

export default CreditflexSingleCustomerView;
