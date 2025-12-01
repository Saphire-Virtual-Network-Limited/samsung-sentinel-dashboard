"use client";

import useSWR from "swr";
import { useState, useCallback } from "react";
import {
	getAllClaims,
	approveClaim,
	rejectClaim,
	authorizePayment,
	bulkAuthorizeClaims,
	bulkMarkClaimsPaid,
	Claim,
	GetClaimsParams,
	ApproveClaimDto,
	RejectClaimDto,
	AuthorizePaymentDto,
} from "@/lib/api/claims";
import { getAccessToken } from "@/lib/api/shared/tokenManager";
import { ClaimRepairItem } from "@/components/shared/ClaimsRepairsTable";
import { showToast } from "@/lib/showNotification";
import { ClaimStatus, PaymentStatus } from "@/lib/api/shared";

export interface UseClaimsApiOptions {
	role: string;
	status?: string;
	payment?: string;
	search?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
	onPaymentResults?: (results: {
		totalProcessed: number;
		successful: number;
		failed: number;
		transactionRef: string;
	}) => void;
}

export interface UseClaimsApiReturn {
	data: ClaimRepairItem[];
	isLoading: boolean;
	error: Error | null;
	pagination?: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
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
	updateRepairStatusHandler: (
		claimId: string,
		repairStatus: "pending" | "awaiting-parts" | "received-device" | "completed"
	) => Promise<void>;
}

// Transform API Claim to ClaimRepairItem format
function transformClaim(claim: Claim): ClaimRepairItem {
	return {
		id: claim.id,
		claimId: claim.claim_number,
		customerName: `${claim.customer_first_name} ${claim.customer_last_name}`,
		imei: claim.imei?.imei || "",
		deviceName: claim.product?.name || "",
		brand: "Samsung", // Default brand
		model: claim.product?.name || "",
		faultType: "Faulty/Broken Screen",
		repairCost: Number(claim.repair_price) || 0,
		status: claim.status as
			| "PENDING"
			| "APPROVED"
			| "REJECTED"
			| "COMPLETED"
			| "AUTHORIZED",
		repairStatus: "PENDING", // Default as not provided by API
		paymentStatus: claim.payment_status as "PAID" | "UNPAID" | undefined,
		transactionRef: claim.transaction_id || undefined,
		sessionId: claim.reference_id || undefined,
		createdAt: claim.created_at,
		serviceCenterName: claim.service_center?.name || "",
		serviceCenterId: claim.service_center_id,
		engineerName: claim.engineer?.user?.name || "",
		completedAt: claim.completed_at || undefined,
		completedById: claim.completed_by_id || undefined,
		approvedAt: claim.approved_at || undefined,
		approvedById: claim.approved_by_id || undefined,
		rejectedAt: claim.rejected_at || undefined,
		rejectedById: claim.rejected_by_id || undefined,
		rejectionReason: claim.rejection_reason || undefined,
		authorizedAt: claim.authorized_at || undefined,
		authorizedById: claim.authorized_by_id || undefined,
		paidAt: claim.paid_at || undefined,
		paidById: claim.paid_by_id || undefined,
		transactionId: claim.transaction_id || undefined,
		referenceId: claim.reference_id || undefined,
	};
}

export function useClaimsApi(options: UseClaimsApiOptions): UseClaimsApiReturn {
	const {
		role,
		status,
		payment,
		search,
		startDate,
		endDate,
		page,
		limit,
		onPaymentResults,
	} = options;

	// Build API params
	const getParams = useCallback((): GetClaimsParams => {
		const params: GetClaimsParams = {
			page: page || 1,
			limit: limit || 10,
		};

		// Map status filter - only add if valid
		if (status && status !== "all" && status !== "undefined") {
			params.status = status.toUpperCase() as ClaimStatus;
		}

		// Map payment filter - only add if valid
		if (payment && payment !== "all" && payment !== "undefined") {
			params.payment_status = payment.toUpperCase() as PaymentStatus;
		}

		// Search filters - only add if valid and not empty
		if (search && search !== "undefined" && search.trim()) {
			const trimmedSearch = search.trim();
			// Try to determine if it's IMEI, claim number, or customer name
			if (trimmedSearch.startsWith("CLM-")) {
				params.claim_number = trimmedSearch;
			} else if (/^\d+$/.test(trimmedSearch)) {
				params.imei = trimmedSearch;
			} else {
				params.customer_name = trimmedSearch;
			}
		}

		// Date range filters
		if (startDate && startDate !== "undefined") {
			params.start_date = startDate;
		}
		if (endDate && endDate !== "undefined") {
			params.end_date = endDate;
		}

		return params;
	}, [status, payment, search, startDate, endDate, page, limit]);

	// SWR fetcher
	const fetcher = async () => {
		const hasToken = typeof window !== "undefined" && getAccessToken();
		if (!hasToken) {
			return {
				items: [],
				pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
			};
		}

		try {
			const params = getParams();
			const response = await getAllClaims(params);

			// API returns { data: Claim[], total, page, limit, totalPages } at root level
			const claims = response.data || [];
			return {
				items: claims.map(transformClaim),
				pagination: {
					total: response.total || 0,
					page: response.page || 1,
					limit: response.limit || 10,
					totalPages: response.totalPages || 1,
				},
			};
		} catch (error) {
			console.error("Error fetching claims:", error);
			return {
				items: [],
				pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
			};
		}
	};

	// Use SWR
	const hasToken = typeof window !== "undefined" && getAccessToken();
	const { data, error, mutate, isLoading } = useSWR<{
		items: ClaimRepairItem[];
		pagination: {
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	}>(
		hasToken
			? ["claims", status, payment, search, startDate, endDate, page, limit]
			: null,
		fetcher,
		{
			revalidateOnFocus: false,
			dedupingInterval: 5000,
		}
	);

	// Refetch function
	const refetch = useCallback(async () => {
		await mutate();
	}, [mutate]);

	// Approve handler
	const approveHandler = useCallback(
		async (claimId: string) => {
			try {
				const approveData: ApproveClaimDto = {
					notes: "Claim approved",
				};
				await approveClaim(claimId, approveData);
				showToast({
					message: "Claim approved successfully",
					type: "success",
				});
				await refetch();
			} catch (error: any) {
				showToast({
					message: error.message || "Failed to approve claim",
					type: "error",
				});
				throw error;
			}
		},
		[refetch]
	);

	// Reject handler
	const rejectHandler = useCallback(
		async (claimId: string, reason: string) => {
			try {
				const rejectData: RejectClaimDto = {
					reason,
					notes: reason,
				};
				await rejectClaim(claimId, rejectData);
				showToast({
					message: "Claim rejected",
					type: "success",
				});
				await refetch();
			} catch (error: any) {
				showToast({
					message: error.message || "Failed to reject claim",
					type: "error",
				});
				throw error;
			}
		},
		[refetch]
	);

	// Authorize payment handler
	const authorizePaymentHandler = useCallback(
		async (claimId: string) => {
			try {
				const authorizeData: AuthorizePaymentDto = {
					notes: "Payment authorized",
				};
				await authorizePayment(claimId, authorizeData);
				showToast({
					message: "Payment authorized successfully",
					type: "success",
				});
				await refetch();
			} catch (error: any) {
				showToast({
					message: error.message || "Failed to authorize payment",
					type: "error",
				});
				throw error;
			}
		},
		[refetch]
	);

	// Execute payment handler (mark single claim as paid)
	const executePaymentHandler = useCallback(
		async (claimId: string, transactionRef: string) => {
			try {
				const response = await bulkMarkClaimsPaid({
					claim_ids: [claimId],
					transaction_reference: transactionRef,
					notes: "Single payment processed",
				});

				const { successful, failed } = response;

				if (successful > 0) {
					showToast({
						message: "Claim marked as paid successfully",
						type: "success",
					});
					await refetch();
				} else {
					showToast({
						message: "Failed to mark claim as paid",
						type: "error",
					});
				}
			} catch (error: any) {
				showToast({
					message: error.message || "Failed to execute payment",
					type: "error",
				});
			}
		},
		[refetch]
	);

	// Bulk approve handler
	const bulkApproveHandler = useCallback(
		async (claimIds: string[]) => {
			try {
				await Promise.all(
					claimIds.map((id) => approveClaim(id, { notes: "Bulk approved" }))
				);
				showToast({
					message: `${claimIds.length} claims approved successfully`,
					type: "success",
				});
				await refetch();
			} catch (error: any) {
				showToast({
					message: error.message || "Failed to approve claims",
					type: "error",
				});
			}
		},
		[refetch]
	);

	// Bulk reject handler
	const bulkRejectHandler = useCallback(
		async (claimIds: string[], reason: string) => {
			try {
				await Promise.all(
					claimIds.map((id) => rejectClaim(id, { reason, notes: reason }))
				);
				showToast({
					message: `${claimIds.length} claims rejected`,
					type: "success",
				});
				await refetch();
			} catch (error: any) {
				showToast({
					message: error.message || "Failed to reject claims",
					type: "error",
				});
			}
		},
		[refetch]
	);

	// Bulk authorize payment handler
	const bulkAuthorizePaymentHandler = useCallback(
		async (claimIds: string[]) => {
			try {
				const response = await bulkAuthorizeClaims({
					claim_ids: claimIds,
					notes: "Bulk payment authorized",
				});

				const { successful, failed } = response.data || {
					successful: 0,
					failed: 0,
				};

				if (successful > 0) {
					showToast({
						message: `Successfully authorized ${successful} claim${
							successful > 1 ? "s" : ""
						}${failed > 0 ? ` (${failed} failed)` : ""}`,
						type: "success",
					});
					await refetch();
				} else {
					showToast({
						message: `Failed to authorize claims: ${failed} failed`,
						type: "error",
					});
				}
			} catch (error: any) {
				showToast({
					message: error.message || "Failed to authorize payments",
					type: "error",
				});
			}
		},
		[refetch]
	);

	// Execute bulk payment handler
	const executeBulkPaymentHandler = useCallback(
		async (claimIds: string[], transactionRef: string) => {
			try {
				const response = await bulkMarkClaimsPaid({
					claim_ids: claimIds,
					transaction_reference: transactionRef,
					notes: "Bulk payment processed",
				});

				// Response structure: { data: { total_processed, successful, failed, results } }
				const { successful, failed, total_processed } = response;

				// Refetch data first to update the UI
				await refetch();

				// Call the results callback if provided (to show modal)
				if (onPaymentResults) {
					onPaymentResults({
						totalProcessed: total_processed,
						successful,
						failed,
						transactionRef,
					});
				} else {
					// Fallback to toast if no callback provided
					if (successful > 0) {
						showToast({
							message: `Successfully disbursed payment for ${successful} claim${
								successful > 1 ? "s" : ""
							}${failed > 0 ? ` (${failed} failed)` : ""}`,
							type: "success",
						});
					} else {
						showToast({
							message: `Failed to disburse payments: ${failed} claim${
								failed > 1 ? "s" : ""
							} failed`,
							type: "error",
						});
					}
				}
			} catch (error: any) {
				showToast({
					message: error.message || "Failed to execute bulk payment",
					type: "error",
				});
			}
		},
		[refetch, onPaymentResults]
	);

	// Update repair status handler (placeholder - not in current API)
	const updateRepairStatusHandler = useCallback(
		async (
			claimId: string,
			repairStatus:
				| "pending"
				| "awaiting-parts"
				| "received-device"
				| "completed"
		) => {
			try {
				showToast({
					message: "Repair status update not implemented yet",
					type: "info",
				});
				// TODO: Implement when API endpoint is available
			} catch (error: any) {
				showToast({
					message: error.message || "Failed to update repair status",
					type: "error",
				});
			}
		},
		[]
	);

	return {
		data: data?.items || [],
		pagination: data?.pagination,
		isLoading,
		error: error || null,
		refetch,
		approveHandler,
		rejectHandler,
		authorizePaymentHandler,
		executePaymentHandler,
		executeBulkPaymentHandler,
		bulkApproveHandler,
		bulkRejectHandler,
		bulkAuthorizePaymentHandler,
		updateRepairStatusHandler,
	};
}
