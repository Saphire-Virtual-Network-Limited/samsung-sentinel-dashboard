"use client";

import useSWR from "swr";
import {
	ClaimRepairItem,
	ClaimRepairRole,
} from "@/components/shared/ClaimsRepairsTable";
import { showToast } from "@/lib/showNotification";
import testData from "@/lib/testData/claimsRepairsTestData.json";

interface UseClaimOptions {
	claimId: string;
	role: ClaimRepairRole;
}

interface UseClaimReturn {
	claim: ClaimRepairItem | null;
	isLoading: boolean;
	error: Error | null;
	approveHandler: (claimId: string) => Promise<void>;
	rejectHandler: (claimId: string, reason: string) => Promise<void>;
	authorizePaymentHandler: (claimId: string) => Promise<void>;
	executePaymentHandler: (
		claimId: string,
		transactionRef: string
	) => Promise<void>;
	updateDeviceStatus: (claimId: string, status: string) => Promise<void>;
	mutate: () => void;
}

export const useClaim = ({
	claimId,
	role,
}: UseClaimOptions): UseClaimReturn => {
	// Fetch single claim
	const {
		data: claim,
		error,
		mutate,
		isLoading,
	} = useSWR<ClaimRepairItem | null>(
		claimId ? [`/api/claims/${claimId}`, role] : null,
		async () => {
			// TODO: Replace with actual API call
			// const response = await fetch(`/api/claims/${claimId}?role=${role}`);
			// if (!response.ok) throw new Error("Failed to fetch claim");
			// return response.json();

			// Fallback to test data
			const foundClaim = testData.claims.find(
				(c: any) => c.id === claimId || c.claimId === claimId
			);

			if (!foundClaim) {
				throw new Error("Claim not found");
			}

			return foundClaim as ClaimRepairItem;
		},
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		}
	);

	// Approve handler
	const approveHandler = async (claimId: string) => {
		try {
			// TODO: Replace with actual API call
			// await fetch(`/api/claims/${claimId}/approve`, { method: "POST" });

			showToast({
				type: "success",
				message: "Claim approved successfully",
				duration: 3000,
			});

			// Optimistic update
			mutate();
		} catch (error: any) {
			showToast({
				type: "error",
				message: error.message || "Failed to approve claim",
				duration: 5000,
			});
			throw error;
		}
	};

	// Reject handler
	const rejectHandler = async (claimId: string, reason: string) => {
		try {
			// TODO: Replace with actual API call
			// await fetch(`/api/claims/${claimId}/reject`, {
			//   method: "POST",
			//   body: JSON.stringify({ reason })
			// });

			showToast({
				type: "success",
				message: "Claim rejected successfully",
				duration: 3000,
			});

			// Optimistic update
			mutate();
		} catch (error: any) {
			showToast({
				type: "error",
				message: error.message || "Failed to reject claim",
				duration: 5000,
			});
			throw error;
		}
	};

	// Authorize payment handler
	const authorizePaymentHandler = async (claimId: string) => {
		try {
			// TODO: Replace with actual API call
			// await fetch(`/api/claims/${claimId}/authorize-payment`, { method: "POST" });

			showToast({
				type: "success",
				message: "Payment authorized successfully",
				duration: 3000,
			});

			// Optimistic update
			mutate();
		} catch (error: any) {
			showToast({
				type: "error",
				message: error.message || "Failed to authorize payment",
				duration: 5000,
			});
			throw error;
		}
	};

	// Execute payment handler
	const executePaymentHandler = async (
		claimId: string,
		transactionRef: string
	) => {
		try {
			// TODO: Replace with actual API call
			// await fetch(`/api/claims/${claimId}/execute-payment`, {
			//   method: "POST",
			//   body: JSON.stringify({ transactionRef })
			// });

			showToast({
				type: "success",
				message: `Payment processed successfully. Ref: ${transactionRef}`,
				duration: 3000,
			});

			// Optimistic update
			mutate();
		} catch (error: any) {
			showToast({
				type: "error",
				message: error.message || "Failed to process payment",
				duration: 5000,
			});
			throw error;
		}
	};

	// Update device status handler (for service centers)
	const updateDeviceStatus = async (claimId: string, status: string) => {
		try {
			// TODO: Replace with actual API call
			// await fetch(`/api/claims/${claimId}/status`, {
			//   method: "PATCH",
			//   body: JSON.stringify({ status })
			// });

			showToast({
				type: "success",
				message: `Device status updated to: ${status}`,
				duration: 3000,
			});

			// Optimistic update
			mutate();
		} catch (error: any) {
			showToast({
				type: "error",
				message: error.message || "Failed to update device status",
				duration: 5000,
			});
			throw error;
		}
	};

	return {
		claim: claim || null,
		isLoading,
		error: error || null,
		approveHandler,
		rejectHandler,
		authorizePaymentHandler,
		executePaymentHandler,
		updateDeviceStatus,
		mutate,
	};
};
