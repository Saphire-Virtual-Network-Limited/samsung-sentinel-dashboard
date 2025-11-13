"use client";

import React, { useState, useEffect } from "react";
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
	const { isOpen, onOpen, onClose } = useDisclosure();

	// Update URL when filters change
	useEffect(() => {
		const params = new URLSearchParams();

		if (activeTab !== "all") params.set("status", activeTab);
		if (paymentFilter !== "all") params.set("payment", paymentFilter);
		if (searchQuery) params.set("search", searchQuery);
		if (startDate) params.set("startDate", startDate);
		if (endDate) params.set("endDate", endDate);

		const queryString = params.toString();
		const newUrl = queryString ? `?${queryString}` : window.location.pathname;

		// Only update if URL actually changed
		if (window.location.search !== (queryString ? `?${queryString}` : "")) {
			router.replace(newUrl, { scroll: false });
		}
	}, [activeTab, paymentFilter, searchQuery, startDate, endDate, router]);

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
		updateRepairStatusHandler,
		refetch,
	} = useClaimsApi({
		role,
		status: activeTab,
		payment: paymentFilter,
		search: searchQuery,
		startDate,
		endDate,
	});

	// Handle view details
	const handleViewDetails = (claim: ClaimRepairItem) => {
		setSelectedClaim(claim);
		onOpen();
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
				// Admin/Sub-admin focus on completed and payment-related tabs
				return allTabs.filter((tab) =>
					["all", "completed", "approved", "authorized"].includes(tab.key)
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
			{/* Search Section 
			<Card>
				<CardBody className="flex flex-row items-center justify-between p-4">
					<div className="flex items-center gap-3">
						<Search className="w-5 h-5 text-primary" />
						<span className="font-medium">Search Claims by IMEI</span>
					</div>
					<div className="flex items-center space-x-2">
						<Input
							placeholder="Enter IMEI..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-64"
							maxLength={15}
						/>
						<Button
							onClick={() => {
								// Update the filters to include search
								handleTabChange(activeTab);
							}}
							variant="ghost"
							size="sm"
							className="flex items-center space-x-1"
						>
							<Search className="w-4 h-4" />
							<span>Search</span>
						</Button>
					</div>
				</CardBody>
			</Card>
*/}
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
								onUpdateRepairStatus={updateRepairStatusHandler}
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
							<ViewClaimDetailView claimId={selectedClaim.id} />
						)}
					</ModalBody>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default UnifiedClaimsView;
