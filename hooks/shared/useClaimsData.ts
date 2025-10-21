"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
	ClaimRepairRole,
	ClaimRepairItem,
} from "@/components/shared/ClaimsRepairsTable";
import { showToast } from "@/lib/showNotification";
import testData from "@/lib/testData/claimsRepairsTestData.json";

export interface UseClaimsDataOptions {
	role: ClaimRepairRole;
	status?: string;
	payment?: string;
	startDate?: string;
	endDate?: string;
	enableAutoRefresh?: boolean;
	refreshInterval?: number;
}

export interface UseClaimsDataReturn {
	data: ClaimRepairItem[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	approveHandler: (claimId: string) => Promise<void>;
	rejectHandler: (claimId: string, reason: string) => Promise<void>;
	authorizePaymentHandler: (claimId: string) => Promise<void>;
	executePaymentHandler: (
		claimId: string,
		transactionRef: string
	) => Promise<void>;
	executeBulkPaymentHandler: (
		claimIds: string[],
		transactionRef: string
	) => Promise<void>;
	bulkApproveHandler: (claimIds: string[]) => Promise<void>;
	bulkRejectHandler: (claimIds: string[], reason: string) => Promise<void>;
	bulkAuthorizePaymentHandler: (claimIds: string[]) => Promise<void>;
}

export const useClaimsData = (
	options: UseClaimsDataOptions
): UseClaimsDataReturn => {
	const {
		role,
		status: statusProp,
		payment: paymentProp,
		startDate,
		endDate,
		enableAutoRefresh = false,
		refreshInterval = 30000,
	} = options;
	const searchParams = useSearchParams();

	const [data, setData] = useState<ClaimRepairItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Use props if provided, otherwise fall back to search params
	const status = statusProp || searchParams.get("status") || "all";
	const payment = paymentProp || searchParams.get("payment") || "all";

	// Construct API endpoint based on role
	const getApiEndpoint = useCallback(() => {
		const baseUrl = "/api/claims";
		const params = new URLSearchParams();

		// Add role-specific params
		params.append("role", role);

		// Add status filter
		if (status && status !== "all") {
			params.append("status", status);
		}

		// Add payment filter
		if (payment && payment !== "all") {
			params.append("payment", payment);
		}

		return `${baseUrl}?${params.toString()}`;
	}, [role, status, payment]);

	// Load data from centralized test data
	const loadTestData = useCallback((): ClaimRepairItem[] => {
		// Map test data claims to ClaimRepairItem format
		return testData.claims.map((claim: any) => {
			// Find service center and engineer details
			const serviceCenter = testData.serviceCenters.find(
				(sc: any) => sc.id === claim.serviceCenterId
			);
			const engineer = testData.engineers.find(
				(eng: any) => eng.id === claim.engineerId
			);

			return {
				...claim,
				serviceCenterName: serviceCenter?.name,
				engineerName: engineer?.name,
			};
		}) as ClaimRepairItem[];
	}, []);

	// Fetch claims data (using centralized test data)
	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Load centralized test data
			let allData = loadTestData();

			// Filter by status
			if (status && status !== "all") {
				allData = allData.filter((item) => item.status === status);
			}

			// Filter by payment
			if (payment && payment !== "all") {
				allData = allData.filter((item) => item.paymentStatus === payment);
			}

			setData(allData);

			// TODO: Replace with actual API call when backend is ready
			/*
			const endpoint = getApiEndpoint();
			const response = await fetch(endpoint);

			if (!response.ok) {
				throw new Error(`Failed to fetch claims: ${response.statusText}`);
			}

			const result = await response.json();
			setData(result.data || []);
			*/
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Unknown error occurred");
			setError(error);
			showToast({
				message: error.message,
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	}, [status, payment, loadTestData]);

	// Initial fetch and refetch on dependency changes
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Auto-refresh setup
	useEffect(() => {
		if (!enableAutoRefresh) return;

		const interval = setInterval(() => {
			fetchData();
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [enableAutoRefresh, refreshInterval, fetchData]);

	// Approve handler (with dummy simulation)
	const approveHandler = useCallback(
		async (claimId: string) => {
			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 800));

				// Simulate success
				showToast({
					message: "Claim approved successfully",
					type: "success",
				});

				await fetchData();

				// TODO: Replace with actual API call when backend is ready
				/*
				const response = await fetch(`/api/claims/${claimId}/approve`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					throw new Error("Failed to approve claim");
				}

				showToast({
					message: "Claim approved successfully",
					type: "success",
				});

				await fetchData();
				*/
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unknown error occurred");
				showToast({
					message: error.message,
					type: "error",
				});
				throw error;
			}
		},
		[fetchData]
	);

	// Reject handler (with dummy simulation)
	const rejectHandler = useCallback(
		async (claimId: string, reason: string) => {
			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 800));

				// Simulate success
				showToast({
					message: "Claim rejected successfully",
					type: "success",
				});

				await fetchData();

				// TODO: Replace with actual API call when backend is ready
				/*
				const response = await fetch(`/api/claims/${claimId}/reject`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ reason }),
				});

				if (!response.ok) {
					throw new Error("Failed to reject claim");
				}

				showToast({
					message: "Claim rejected successfully",
					type: "success",
				});

				await fetchData();
				*/
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unknown error occurred");
				showToast({
					message: error.message,
					type: "error",
				});
				throw error;
			}
		},
		[fetchData]
	);

	// Authorize payment handler (samsung-partners) (with dummy simulation)
	const authorizePaymentHandler = useCallback(
		async (claimId: string) => {
			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 800));

				// Simulate success
				showToast({
					message: "Payment authorized successfully",
					type: "success",
				});

				await fetchData();

				// TODO: Replace with actual API call when backend is ready
				/*
				const response = await fetch(
					`/api/claims/${claimId}/authorize-payment`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (!response.ok) {
					throw new Error("Failed to authorize payment");
				}

				showToast({
					message: "Payment authorized successfully",
					type: "success",
				});

				await fetchData();
				*/
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unknown error occurred");
				showToast({
					message: error.message,
					type: "error",
				});
				throw error;
			}
		},
		[fetchData]
	);

	// Execute payment handler (samsung-sentinel) (with dummy simulation)
	const executePaymentHandler = useCallback(
		async (claimId: string, transactionRef: string) => {
			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Simulate success
				showToast({
					message: "Payment executed successfully",
					type: "success",
				});

				await fetchData();

				// TODO: Replace with actual API call when backend is ready
				/*
				const response = await fetch(`/api/claims/${claimId}/execute-payment`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ transactionRef }),
				});

				if (!response.ok) {
					throw new Error("Failed to execute payment");
				}

				showToast({
					message: "Payment executed successfully",
					type: "success",
				});

				await fetchData();
				*/
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unknown error occurred");
				showToast({
					message: error.message,
					type: "error",
				});
				throw error;
			}
		},
		[fetchData]
	);

	// Execute bulk payment handler (samsung-sentinel) (with dummy simulation)
	const executeBulkPaymentHandler = useCallback(
		async (claimIds: string[], transactionRef: string) => {
			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 1200));

				// Simulate success
				showToast({
					message: `${claimIds.length} payment(s) executed successfully`,
					type: "success",
				});

				await fetchData();

				// TODO: Replace with actual API call when backend is ready
				/*
				const response = await fetch(`/api/claims/bulk-execute-payment`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ claimIds, transactionRef }),
				});

				if (!response.ok) {
					throw new Error("Failed to execute bulk payment");
				}

				const result = await response.json();

				showToast({
					message: `${
						result.successCount || claimIds.length
					} payment(s) executed successfully`,
					type: "success",
				});

				await fetchData();
				*/
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unknown error occurred");
				showToast({
					message: error.message,
					type: "error",
				});
				throw error;
			}
		},
		[fetchData]
	);

	const bulkApproveHandler = useCallback(
		async (claimIds: string[]) => {
			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Simulate success
				showToast({
					message: `${claimIds.length} claim(s) approved successfully`,
					type: "success",
				});

				await fetchData();

				// TODO: Replace with actual API call when backend is ready
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unknown error occurred");
				showToast({
					message: error.message,
					type: "error",
				});
				throw error;
			}
		},
		[fetchData]
	);

	const bulkRejectHandler = useCallback(
		async (claimIds: string[], reason: string) => {
			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Simulate success
				showToast({
					message: `${claimIds.length} claim(s) rejected`,
					type: "success",
				});

				await fetchData();

				// TODO: Replace with actual API call when backend is ready
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unknown error occurred");
				showToast({
					message: error.message,
					type: "error",
				});
				throw error;
			}
		},
		[fetchData]
	);

	const bulkAuthorizePaymentHandler = useCallback(
		async (claimIds: string[]) => {
			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Simulate success
				showToast({
					message: `${claimIds.length} payment(s) authorized successfully`,
					type: "success",
				});

				await fetchData();

				// TODO: Replace with actual API call when backend is ready
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unknown error occurred");
				showToast({
					message: error.message,
					type: "error",
				});
				throw error;
			}
		},
		[fetchData]
	);

	return {
		data,
		isLoading,
		error,
		refetch: fetchData,
		approveHandler,
		rejectHandler,
		authorizePaymentHandler,
		executePaymentHandler,
		executeBulkPaymentHandler,
		bulkApproveHandler,
		bulkRejectHandler,
		bulkAuthorizePaymentHandler,
	};
};
