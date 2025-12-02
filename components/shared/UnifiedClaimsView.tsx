"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Card,
	CardBody,
	Tabs,
	Tab,
	Button,
	Input,
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
	Search,
} from "lucide-react";
import ClaimsRepairsTable, {
	ClaimRepairRole,
	ClaimRepairItem,
} from "@/components/shared/ClaimsRepairsTable";
import ViewClaimDetailView from "@/view/shared/ViewClaimDetailView";
import { useClaimsApi } from "@/hooks/shared/useClaimsApi";
import { getAllClaims } from "@/lib/api/claims";

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
	const [searchQuery, setSearchQuery] = useState(
		searchParams.get("search") || ""
	);
	const debouncedSearchQuery = useDebounce(searchQuery, 400);
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const { isOpen, onOpen, onClose } = useDisclosure();

	// Derived search params for API (debounced)
	let imeiParam = undefined;
	let claimNumberParam = undefined;
	if (debouncedSearchQuery) {
		if (/^\d+/.test(debouncedSearchQuery)) {
			imeiParam = debouncedSearchQuery;
		} else if (/^CLM-/i.test(debouncedSearchQuery)) {
			claimNumberParam = debouncedSearchQuery;
		}
	}

	// Sync state with URL params when they change (e.g., browser back/forward)
	useEffect(() => {
		const statusParam = searchParams.get("status");
		const paymentParam = searchParams.get("payment");
		const searchParam = searchParams.get("search");
		const startDateParam = searchParams.get("startDate");
		const endDateParam = searchParams.get("endDate");

		if (statusParam && statusParam !== activeTab) {
			setActiveTab(statusParam);
		} else if (!statusParam && activeTab !== "all") {
			setActiveTab("all");
		}

		if (paymentParam && paymentParam !== paymentFilter) {
			setPaymentFilter(paymentParam);
		} else if (!paymentParam && paymentFilter !== "all") {
			setPaymentFilter("all");
		}

		if (searchParam !== searchQuery) {
			setSearchQuery(searchParam || "");
		}

		if (startDateParam !== startDate) {
			setStartDate(startDateParam || undefined);
		}

		if (endDateParam !== endDate) {
			setEndDate(endDateParam || undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	// Payment results modal state
	const {
		isOpen: isPaymentResultsOpen,
		onOpen: onPaymentResultsOpen,
		onClose: onPaymentResultsClose,
	} = useDisclosure();
	const [paymentResults, setPaymentResults] = useState<{
		totalProcessed: number;
		successful: number;
		failed: number;
		transactionRef: string;
	} | null>(null);

	// Callback to handle payment results
	const handlePaymentResults = (results: {
		totalProcessed: number;
		successful: number;
		failed: number;
		transactionRef: string;
	}) => {
		setPaymentResults(results);
		onPaymentResultsOpen();
	};

	// Handle payment results modal close - refetch data to ensure fresh state
	const handlePaymentResultsClose = () => {
		onPaymentResultsClose();
		// Optional: refetch here if needed, though it already happens in the handler
	};

	// Update URL when filters change (debounced search)
	useEffect(() => {
		const params = new URLSearchParams();

		if (activeTab !== "all") params.set("status", activeTab);
		if (paymentFilter !== "all") params.set("payment", paymentFilter);
		if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
		if (startDate) params.set("startDate", startDate);
		if (endDate) params.set("endDate", endDate);

		const queryString = params.toString();
		const newUrl = queryString ? `?${queryString}` : window.location.pathname;

		// Only update if URL actually changed
		if (window.location.search !== (queryString ? `?${queryString}` : "")) {
			router.replace(newUrl, { scroll: false });
		}
	}, [
		activeTab,
		paymentFilter,
		debouncedSearchQuery,
		startDate,
		endDate,
		router,
	]);

	// Fetch data based on role, status, payment filter, and date range
	const {
		data,
		isLoading,
		error,
		pagination,
		approveHandler,
		rejectHandler,
		authorizePaymentHandler,
		executePaymentHandler,
		executeBulkPaymentHandler,
		bulkApproveHandler,
		bulkRejectHandler,
		bulkAuthorizePaymentHandler,
		updateRepairStatusHandler,
		refetch,
	} = useClaimsApi({
		role,
		status: activeTab,
		payment: paymentFilter,
		search: debouncedSearchQuery,
		startDate,
		endDate,
		page,
		limit: rowsPerPage,
		onPaymentResults: handlePaymentResults,
	});

	// Fetch all data for export (respecting current filters but with high limit)
	const fetchAllData = async (): Promise<ClaimRepairItem[]> => {
		try {
			// Build params matching current filters
			// Use pagination total + 100 to ensure we get all records
			const totalRecords = pagination?.total || 0;
			const params: any = {
				limit: totalRecords + 100,
			};

			// Add status filter
			if (activeTab && activeTab !== "all") {
				params.status = activeTab.toUpperCase();
			}

			// Add payment filter
			if (paymentFilter && paymentFilter !== "all") {
				params.payment_status = paymentFilter.toUpperCase();
			}

			// Add search params
			if (imeiParam) {
				params.imei = imeiParam;
			} else if (claimNumberParam) {
				params.claim_number = claimNumberParam;
			}

			// Add date range
			if (startDate) {
				params.start_date = startDate;
			}
			if (endDate) {
				params.end_date = endDate;
			}

			const response = await getAllClaims(params);

			// Map the response data to ClaimRepairItem format
			// Use the same transformation as in useClaimsApi
			return response.data.map((claim: any) => ({
				id: claim.id,
				claimId: claim.claim_number,
				customerName: `${claim.customer_first_name} ${claim.customer_last_name}`,
				imei: claim.imei?.imei || "",
				deviceName: claim.product?.name || "",
				brand: "Samsung",
				model: claim.product?.name || "",
				faultType: "Faulty/Broken Screen",
				repairCost: Number(claim.repair_price) || 0,
				status: claim.status,
				repairStatus: "PENDING",
				paymentStatus: claim.payment_status,
				transactionRef: claim.transaction_id,
				sessionId: claim.reference_id,
				createdAt: claim.created_at,
				serviceCenterName: claim.service_center?.name || "",
				serviceCenterId: claim.service_center_id,
				engineerName: claim.engineer?.user?.name || "",
				completedAt: claim.completed_at,
				completedById: claim.completed_by_id,
				approvedAt: claim.approved_at,
				approvedById: claim.approved_by_id,
				rejectedAt: claim.rejected_at,
				rejectedById: claim.rejected_by_id,
				rejectionReason: claim.rejection_reason,
				authorizedAt: claim.authorized_at,
				authorizedById: claim.authorized_by_id,
				paidAt: claim.paid_at,
				paidById: claim.paid_by_id,
				transactionId: claim.transaction_id,
				referenceId: claim.reference_id,
				service_center: claim.service_center
					? {
							id: claim.service_center.id,
							name: claim.service_center.name,
							account_name: claim.service_center.account_name,
							account_number: claim.service_center.account_number,
							bank_name: claim.service_center.bank_name,
					  }
					: undefined,
			}));
		} catch (error) {
			console.error("Error fetching all data for export:", error);
			return [];
		}
	};

	// Handle view details
	const handleViewDetails = (claim: ClaimRepairItem) => {
		setSelectedClaim(claim);
		onOpen();
	};

	// Handle tab change
	const handleTabChange = (key: string) => {
		setActiveTab(key);
		// Reset payment filter when switching to tabs that don't support it
		if (key !== "authorized" && key !== "all") {
			setPaymentFilter("all");
		}
	};

	// Handle payment filter change
	const handlePaymentFilterChange = (key: string) => {
		setPaymentFilter(key);
	};

	// Handle date range change
	const handleDateRangeChange = React.useCallback(
		(start: string, end: string) => {
			setStartDate(start);
			setEndDate(end);
			setPage(1); // Reset to first page when date range changes
		},
		[]
	);

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
				key: "authorized",
				title: "Authorized",
				icon: <CheckCircle className="w-4 h-4" />,
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
				// Samsung partners see all tabs (can approve/reject and authorize payments)
				return allTabs;

			case "samsung-sentinel":
				// Admin/Sub-admin see all tabs
				return allTabs;

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
							{/* Payment Filter for Authorized and All Tabs */}
							{showPaymentTabs &&
								(activeTab === "authorized" || activeTab === "all") && (
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
												activeTab === "authorized" &&
												paymentFilter === "unpaid" && (
													<span className="ml-auto text-xs text-warning-600 dark:text-warning-400">
														Payment execution available
													</span>
												)}
										</CardBody>
									</Card>
								)}{" "}
							<ClaimsRepairsTable
								data={data}
								isLoading={isLoading}
								error={error}
								role={role}
								pagination={pagination}
								page={page}
								onPageChange={setPage}
								rowsPerPage={rowsPerPage}
								onRowsPerPageChange={setRowsPerPage}
								onApprove={approveHandler}
								onReject={rejectHandler}
								onAuthorizePayment={authorizePaymentHandler}
								onSearchParamsChange={(searchParams) => {
									setSearchQuery(searchParams);
									setPage(1);
								}}
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
								onUpdateRepairStatus={updateRepairStatusHandler}
								onViewDetails={handleViewDetails}
								onFetchAllData={fetchAllData}
								showPaymentColumns={
									showPaymentTabs &&
									(activeTab === "completed" || activeTab === "all") &&
									paymentFilter !== "all"
								}
								enableMultiSelect={
									(role === "samsung-sentinel" && activeTab === "authorized") ||
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
							<ViewClaimDetailView claimId={selectedClaim.id} />
						)}
					</ModalBody>
				</ModalContent>
			</Modal>

			{/* Payment Results Modal */}
			<Modal
				isOpen={isPaymentResultsOpen}
				onClose={handlePaymentResultsClose}
				size="2xl"
			>
				<ModalContent>
					{(onClose) => (
						<>
							<div className="p-6">
								<h2 className="text-2xl font-bold mb-4">
									Bulk Payment Results
								</h2>
								<div className="space-y-4">
									{/* Summary Cards */}
									<div className="grid grid-cols-3 gap-4">
										<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
												Total Processed
											</p>
											<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
												{paymentResults?.totalProcessed || 0}
											</p>
										</div>
										<div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
												Successful
											</p>
											<p className="text-3xl font-bold text-green-600 dark:text-green-400">
												{paymentResults?.successful || 0}
											</p>
										</div>
										<div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
												Failed
											</p>
											<p className="text-3xl font-bold text-red-600 dark:text-red-400">
												{paymentResults?.failed || 0}
											</p>
										</div>
									</div>

									{/* Transaction Reference */}
									<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
											Transaction Reference
										</p>
										<p className="font-mono text-lg font-semibold">
											{paymentResults?.transactionRef || "N/A"}
										</p>
									</div>

									{/* Success/Error Message */}
									{paymentResults && (
										<div
											className={`p-4 rounded-lg ${
												paymentResults.successful > 0
													? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
													: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
											}`}
										>
											<p
												className={`font-medium ${
													paymentResults.successful > 0
														? "text-green-800 dark:text-green-200"
														: "text-red-800 dark:text-red-200"
												}`}
											>
												{paymentResults.successful > 0
													? `Successfully disbursed payment for ${
															paymentResults.successful
													  } claim${paymentResults.successful > 1 ? "s" : ""}${
															paymentResults.failed > 0
																? ` (${paymentResults.failed} failed)`
																: ""
													  }`
													: `Failed to disburse payments: ${
															paymentResults.failed
													  } claim${
															paymentResults.failed > 1 ? "s" : ""
													  } failed`}
											</p>
										</div>
									)}
								</div>

								{/* Close Button */}
								<div className="mt-6 flex justify-end">
									<Button color="primary" onPress={onClose}>
										Close
									</Button>
								</div>
							</div>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
};

export default UnifiedClaimsView;
