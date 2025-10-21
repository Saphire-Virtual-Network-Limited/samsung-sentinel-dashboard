"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Card,
	CardBody,
	Tabs,
	Tab,
	Button,
	Modal,
	ModalContent,
	ModalBody,
	useDisclosure,
} from "@heroui/react";
import {
	Clock,
	CheckCircle,
	XCircle,
	Settings,
	CheckCheck,
	ListChecks,
} from "lucide-react";
import ClaimsRepairsTable, {
	ClaimRepairRole,
	ClaimRepairItem,
} from "@/components/shared/ClaimsRepairsTable";
import UnifiedClaimRepairDetailView from "@/components/shared/UnifiedClaimRepairDetailView";
import { useClaimsData } from "@/hooks/shared/useClaimsData";

export interface UnifiedClaimsViewProps {
	role: ClaimRepairRole;
	showPaymentTabs?: boolean;
}

const UnifiedClaimsView: React.FC<UnifiedClaimsViewProps> = ({
	role,
	showPaymentTabs = false,
}) => {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Read from URL search params or use defaults
	const [activeTab, setActiveTab] = useState(
		searchParams.get("status") || "all"
	);
	const [paymentFilter, setPaymentFilter] = useState(
		searchParams.get("payment") || "all"
	);
	const [startDate, setStartDate] = useState<string | undefined>(
		searchParams.get("startDate") || undefined
	);
	const [endDate, setEndDate] = useState<string | undefined>(
		searchParams.get("endDate") || undefined
	);
	const [selectedClaim, setSelectedClaim] = useState<ClaimRepairItem | null>(
		null
	);
	const { isOpen, onOpen, onClose } = useDisclosure();

	// Update URL when filters change
	useEffect(() => {
		const params = new URLSearchParams();

		if (activeTab !== "all") params.set("status", activeTab);
		if (paymentFilter !== "all") params.set("payment", paymentFilter);
		if (startDate) params.set("startDate", startDate);
		if (endDate) params.set("endDate", endDate);

		const queryString = params.toString();
		const newUrl = queryString ? `?${queryString}` : window.location.pathname;

		// Only update if URL actually changed
		if (window.location.search !== (queryString ? `?${queryString}` : "")) {
			router.replace(newUrl, { scroll: false });
		}
	}, [activeTab, paymentFilter, startDate, endDate, router]);

	// Fetch data based on role, status, payment filter, and date range
	const {
		data,
		isLoading,
		error,
		approveHandler,
		rejectHandler,
		authorizePaymentHandler,
		executePaymentHandler,
		executeBulkPaymentHandler,
		bulkApproveHandler,
		bulkRejectHandler,
		bulkAuthorizePaymentHandler,
		refetch,
	} = useClaimsData({
		role,
		status: activeTab,
		payment: paymentFilter,
		startDate,
		endDate,
	});

	// Handle view details
	const handleViewDetails = (claim: ClaimRepairItem) => {
		setSelectedClaim(claim);
		onOpen();
	};

	// Get bank details for selected claim
	const getBankDetails = (claim: ClaimRepairItem | null) => {
		if (
			!claim ||
			claim.status !== "completed" ||
			claim.paymentStatus !== "unpaid"
		) {
			return undefined;
		}

		return {
			bankName: ["GTBank", "Access Bank", "First Bank", "Zenith Bank"][
				parseInt(claim.id) % 4
			],
			accountNumber: String(1000000000 + parseInt(claim.id)),
			accountName: `${claim.serviceCenterName} Account`,
		};
	};

	// Wrap action handlers to refetch and close modal
	const handleApprove = async (claimId: string) => {
		await approveHandler(claimId);
		await refetch();
		onClose();
	};

	const handleReject = async (claimId: string, reason: string) => {
		await rejectHandler(claimId, reason);
		await refetch();
		onClose();
	};

	const handleAuthorizePayment = async (claimId: string) => {
		await authorizePaymentHandler(claimId);
		await refetch();
		onClose();
	};

	const handleExecutePayment = async (
		claimId: string,
		transactionRef: string
	) => {
		await executePaymentHandler(claimId, transactionRef);
		await refetch();
		onClose();
	};

	// Handle tab change
	const handleTabChange = (key: string) => {
		setActiveTab(key);
	};

	// Handle payment filter change
	const handlePaymentFilterChange = (key: string) => {
		setPaymentFilter(key);
	};

	// Handle date range change
	const handleDateRangeChange = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};

	// Determine which tabs to show based on role
	const getTabs = () => {
		const allTabs = [
			{
				key: "all",
				title: "All",
				icon: <ListChecks className="w-4 h-4" />,
			},
			{
				key: "pending",
				title: "Pending",
				icon: <Clock className="w-4 h-4" />,
			},
			{
				key: "approved",
				title: "Approved",
				icon: <CheckCircle className="w-4 h-4" />,
			},
			{
				key: "in-progress",
				title: "In Progress",
				icon: <Settings className="w-4 h-4" />,
			},
			{
				key: "completed",
				title: "Completed",
				icon: <CheckCheck className="w-4 h-4" />,
			},
			{
				key: "rejected",
				title: "Rejected",
				icon: <XCircle className="w-4 h-4" />,
			},
		];

		// Role-based tab filtering
		switch (role) {
			case "service-center":
				// Service centers see all tabs (view-only)
				return allTabs;

			case "samsung-partners":
				// Samsung partners see all tabs (can approve/reject)
				return allTabs;

			case "samsung-sentinel":
				// Admin/Sub-admin focus on completed and payment-related tabs
				return allTabs.filter((tab) =>
					["all", "completed", "approved", "in-progress"].includes(tab.key)
				);

			default:
				return allTabs;
		}
	};

	const getPaymentTabs = () => {
		return [
			{
				key: "all",
				title: "All",
			},
			{
				key: "unpaid",
				title: "Unpaid",
			},
			{
				key: "paid",
				title: "Paid",
			},
		];
	};

	return (
		<div className="space-y-6">
			<Tabs
				selectedKey={activeTab}
				onSelectionChange={(key) => handleTabChange(key as string)}
			>
				{getTabs().map((tab) => (
					<Tab
						key={tab.key}
						title={
							<div className="flex items-center space-x-2">
								{tab.icon}
								<span>{tab.title}</span>
							</div>
						}
					>
						<div className="p-6">
							{/* Payment Filter for Completed and All Tabs */}
							{showPaymentTabs &&
								(activeTab === "completed" || activeTab === "all") && (
									<Card className="mb-4">
										<CardBody className="flex flex-row items-center gap-3 p-3">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
												Payment Status:
											</span>
											<div className="flex gap-2">
												{getPaymentTabs().map((paymentTab) => (
													<Button
														key={paymentTab.key}
														size="sm"
														variant={
															paymentFilter === paymentTab.key
																? "solid"
																: "flat"
														}
														color={
															paymentFilter === paymentTab.key
																? "primary"
																: "default"
														}
														onPress={() =>
															handlePaymentFilterChange(paymentTab.key)
														}
														className={
															paymentFilter === paymentTab.key
																? "font-semibold"
																: ""
														}
													>
														{paymentTab.title}
														{paymentFilter === paymentTab.key &&
															paymentTab.key !== "all" && (
																<span className="ml-2 text-xs">
																	({data?.length || 0})
																</span>
															)}
													</Button>
												))}
											</div>
											{role === "samsung-sentinel" &&
												paymentFilter === "unpaid" && (
													<span className="ml-auto text-xs text-warning-600 dark:text-warning-400">
														💳 Payment execution available
													</span>
												)}
										</CardBody>
									</Card>
								)}

							<ClaimsRepairsTable
								data={data}
								isLoading={isLoading}
								error={error}
								role={role}
								onApprove={approveHandler}
								onReject={rejectHandler}
								onAuthorizePayment={authorizePaymentHandler}
								onExecutePayment={(claimIds) => {
									if (claimIds.length === 1) {
										// For single selection, we'll need transaction ref
										// This will be handled via modal in the future
										return;
									}
								}}
								onBulkPayment={executeBulkPaymentHandler}
								onBulkApprove={bulkApproveHandler}
								onBulkReject={bulkRejectHandler}
								onBulkAuthorizePayment={bulkAuthorizePaymentHandler}
								onViewDetails={handleViewDetails}
								showPaymentColumns={
									showPaymentTabs &&
									(activeTab === "completed" || activeTab === "all") &&
									paymentFilter !== "all"
								}
								enableMultiSelect={
									(role === "samsung-sentinel" &&
										activeTab === "completed" &&
										paymentFilter === "unpaid") ||
									(role === "samsung-partners" &&
										(activeTab === "pending" ||
											(activeTab === "completed" &&
												paymentFilter === "unpaid")))
								}
								onDateFilterChange={handleDateRangeChange}
								initialStartDate={startDate}
								initialEndDate={endDate}
								defaultDateRange={{ days: 30 }}
							/>
						</div>
					</Tab>
				))}
			</Tabs>

			{/* Detail View Modal */}
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size="5xl"
				scrollBehavior="inside"
			>
				<ModalContent>
					<ModalBody className="p-0">
						{selectedClaim && (
							<UnifiedClaimRepairDetailView
								claimData={selectedClaim}
								role={role}
								onApprove={handleApprove}
								onReject={handleReject}
								onAuthorizePayment={handleAuthorizePayment}
								onExecutePayment={handleExecutePayment}
								serviceCenterBankDetails={getBankDetails(selectedClaim)}
							/>
						)}
					</ModalBody>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default UnifiedClaimsView;
