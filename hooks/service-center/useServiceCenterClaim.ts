import useSWR, { mutate } from "swr";
import {
	getClaimById,
	completeClaim,
	approveClaim,
	rejectClaim,
	authorizePayment,
	type Claim,
	type CompleteClaimDto,
	type ApproveClaimDto,
	type RejectClaimDto,
	type AuthorizePaymentDto,
} from "@/lib/api/claims";
import { getAccessToken } from "@/lib/api/shared/tokenManager";

export type { Claim as ServiceCenterClaim } from "@/lib/api/claims";

// Fetcher function that calls the real API
const fetcher = async (claimId: string): Promise<Claim> => {
	const response = await getClaimById(claimId);
	// API returns claim object directly (not wrapped in BaseApiResponse)
	// Type definitions say BaseApiResponse<Claim> but actual API returns Claim
	return response as unknown as Claim;
};

export const useServiceCenterClaim = (claimId: string) => {
	// Only fetch if we have an access token
	const hasToken = typeof window !== "undefined" && getAccessToken();

	const { data, error, mutate, isLoading } = useSWR(
		hasToken && claimId ? `/api/service-center/claims/${claimId}` : null,
		() => fetcher(claimId)
	);

	return {
		claim: data,
		isLoading,
		error,
		mutate,
	};
};

export const useServiceCenterClaimActions = () => {
	/**
	 * Mark claim as completed (Engineer only)
	 */
	const markAsCompleted = async (claimId: string, data?: CompleteClaimDto) => {
		const response = await completeClaim(claimId, data);
		// Refresh the claim data
		await mutate(`/api/service-center/claims/${claimId}`);
		return response;
	};

	/**
	 * Approve claim (Samsung Partner only)
	 */
	const approveClaim_Action = async (
		claimId: string,
		data?: ApproveClaimDto
	) => {
		const response = await approveClaim(claimId, data);
		// Refresh the claim data
		await mutate(`/api/service-center/claims/${claimId}`);
		return response;
	};

	/**
	 * Reject claim (Samsung Partner only)
	 */
	const rejectClaim_Action = async (claimId: string, data: RejectClaimDto) => {
		const response = await rejectClaim(claimId, data);
		// Refresh the claim data
		await mutate(`/api/service-center/claims/${claimId}`);
		return response;
	};

	/**
	 * Authorize payment (Samsung Partner only)
	 */
	const authorizePayment_Action = async (
		claimId: string,
		data?: AuthorizePaymentDto
	) => {
		const response = await authorizePayment(claimId, data);
		// Refresh the claim data
		await mutate(`/api/service-center/claims/${claimId}`);
		return response;
	};

	return {
		markAsCompleted,
		approveClaim: approveClaim_Action,
		rejectClaim: rejectClaim_Action,
		authorizePayment: authorizePayment_Action,
	};
};
