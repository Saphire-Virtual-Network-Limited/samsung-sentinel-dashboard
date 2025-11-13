import {
	apiCall,
	BaseApiResponse,
	ClaimStatus,
	PaymentStatus,
} from "../shared";

// ============================================================================
// CLAIMS APIs
// ============================================================================

// Helper function to build clean query strings without undefined values
function buildQueryString(params?: Record<string, any>): string {
	if (!params) return "";

	const cleanParams: Record<string, string> = {};

	Object.entries(params).forEach(([key, value]) => {
		if (
			value !== undefined &&
			value !== null &&
			value !== "" &&
			value !== "undefined"
		) {
			cleanParams[key] = String(value);
		}
	});

	const queryString = new URLSearchParams(cleanParams).toString();
	return queryString ? `?${queryString}` : "";
}

// Types & Interfaces
export interface Claim {
	id: string;
	created_at: string;
	updated_at: string;
	claim_number: string;
	imei_id: string;
	product_id: string;
	service_center_id: string;
	engineer_id: string;
	customer_first_name: string;
	customer_last_name: string;
	customer_phone: string;
	customer_email?: string;
	repair_price: string | number;
	description?: string;
	status: ClaimStatus;
	payment_status: PaymentStatus;
	rejection_reason?: string;
	completed_at?: string;
	completed_by_id?: string;
	approved_at?: string;
	approved_by_id?: string;
	rejected_at?: string;
	rejected_by_id?: string;
	authorized_at?: string;
	authorized_by_id?: string;
	paid_at?: string;
	paid_by_id?: string;
	transaction_id?: string;
	reference_id?: string;
	// Populated relations when fetching single claim
	imei?: {
		id: string;
		imei: string;
		supplier: string;
		expiry_date: string;
		is_used: boolean;
		product_id: string;
	};
	product?: {
		id: string;
		name: string;
		sapphire_cost: string;
		repair_cost: string;
		status: string;
	};
	service_center?: {
		id: string;
		name: string;
		email: string;
		phone: string;
		state: string;
		city: string;
		address: string;
		repair_store_id: string;
		repair_store?: any;
	};
	engineer?: {
		id: string;
		user_id: string;
		service_center_id: string;
		description?: string;
		user?: {
			id: string;
			name: string;
			email: string;
			phone: string;
			role: string;
		};
	};
	timeline?: Array<{
		id: string;
		created_at: string;
		event: string;
		details: any;
		performed_by_id: string;
		performed_at: string;
		performed_by?: {
			id: string;
			name: string;
			email: string;
			role: string;
		};
	}>;
}

export interface CreateClaimDto {
	imei: string;
	customer_first_name: string;
	customer_last_name: string;
	customer_phone: string;
	customer_email?: string;
	repair_price: number;
	description?: string;
}

export interface CompleteClaimDto {
	notes?: string;
}

export interface ApproveClaimDto {
	notes?: string;
}

export interface RejectClaimDto {
	reason: string;
	notes?: string;
}

export interface AuthorizePaymentDto {
	notes?: string;
}

export interface BulkAuthorizeDto {
	claim_ids: string[];
	notes?: string;
}

export interface BulkMarkPaidDto {
	claim_ids: string[];
	transaction_reference: string;
	notes?: string;
}

export interface GetClaimsParams {
	status?: ClaimStatus;
	payment_status?: PaymentStatus;
	service_center_id?: string;
	engineer_id?: string;
	claim_number?: string;
	imei?: string;
	customer_name?: string;
	page?: number;
	limit?: number;
	start_date?: string;
	end_date?: string;
}

export interface ClaimStatistics {
	total: number;
	pending: number;
	approved: number;
	rejected: number;
	completed: number;
	authorized: number;
	paid: number;
	unpaid: number;
	total_value: number;
	approved_value: number;
	paid_value: number;
}

// API Functions

/**
 * Create insurance claim
 * @summary Create a new insurance claim. Only engineers can create claims. Validates IMEI eligibility.
 * @tag Claims
 */
export async function createClaim(
	data: CreateClaimDto
): Promise<BaseApiResponse<Claim>> {
	return apiCall("/claims", "POST", data);
}

/**
 * Get all claims
 * @summary Get all claims with filters. Engineers see only their service center claims. Repair store admins see claims from their service centers. Partners and admins see all claims.
 * @tag Claims
 */
export async function getAllClaims(
	params?: GetClaimsParams
): Promise<BaseApiResponse<Claim[]>> {
	const queryString = buildQueryString(params as Record<string, any>);
	return apiCall(`/claims${queryString}`, "GET");
}

/**
 * Get claim by ID
 * @summary Get detailed claim information including timeline
 * @tag Claims
 */
export async function getClaimById(
	id: string
): Promise<BaseApiResponse<Claim>> {
	return apiCall(`/claims/${id}`, "GET");
}

/**
 * Mark claim as completed
 * @summary Mark a claim as completed after repair is done. Only the engineer from the same service center can complete.
 * @tag Claims
 */
export async function completeClaim(
	id: string,
	data?: CompleteClaimDto
): Promise<BaseApiResponse<Claim>> {
	return apiCall(`/claims/${id}/complete`, "PATCH", data);
}

/**
 * Approve claim
 * @summary Approve a pending claim. Only partners can approve claims.
 * @tag Claims
 */
export async function approveClaim(
	id: string,
	data?: ApproveClaimDto
): Promise<BaseApiResponse<Claim>> {
	return apiCall(`/claims/${id}/approve`, "PATCH", data);
}

/**
 * Reject claim
 * @summary Reject a pending claim with reason. Only partners can reject claims.
 * @tag Claims
 */
export async function rejectClaim(
	id: string,
	data: RejectClaimDto
): Promise<BaseApiResponse<Claim>> {
	return apiCall(`/claims/${id}/reject`, "PATCH", data);
}

/**
 * Authorize payment
 * @summary Authorize completed claim for payment by admin. Only partners can authorize payments.
 * @tag Claims
 */
export async function authorizePayment(
	id: string,
	data?: AuthorizePaymentDto
): Promise<BaseApiResponse<Claim>> {
	return apiCall(`/claims/${id}/authorize-payment`, "PATCH", data);
}

/**
 * Bulk authorize claims
 * @summary Authorize multiple completed claims at once. Partners and admins only.
 * @tag Claims
 */
export async function bulkAuthorizeClaims(
	data: BulkAuthorizeDto
): Promise<BaseApiResponse<{ authorized: number; failed: number }>> {
	return apiCall("/claims/bulk-authorize", "POST", data);
}

/**
 * Bulk mark claims as paid
 * @summary Mark multiple authorized claims as paid. Admin only.
 * @tag Claims
 */
export async function bulkMarkClaimsPaid(
	data: BulkMarkPaidDto
): Promise<BaseApiResponse<{ marked_paid: number; failed: number }>> {
	return apiCall("/claims/bulk-mark-paid", "POST", data);
}

/**
 * Mark single claim as paid
 * @summary Mark a single authorized claim as paid. Admin only.
 * @tag Claims
 */
export async function markClaimPaid(
	id: string,
	transaction_reference: string,
	notes?: string
): Promise<BaseApiResponse<Claim>> {
	return bulkMarkClaimsPaid({
		claim_ids: [id],
		transaction_reference,
		notes,
	}) as any;
}

/**
 * Get claims by service center
 * @summary Get all claims for a specific service center. Engineers can only access their own service center. Repair store admins can access their service centers. Partners and admins can access all.
 * @tag Claims
 */
export async function getClaimsByServiceCenter(
	service_center_id: string,
	params?: GetClaimsParams
): Promise<BaseApiResponse<Claim[]>> {
	const queryString = buildQueryString(params as Record<string, any>);
	return apiCall(
		`/claims/service-center/${service_center_id}${queryString}`,
		"GET"
	);
}

/**
 * Get service center claim statistics
 * @summary Get statistics for claims in a service center including status breakdown, payment stats, and top engineers
 * @tag Claims
 */
export async function getServiceCenterStatistics(
	service_center_id: string
): Promise<BaseApiResponse<ClaimStatistics>> {
	return apiCall(
		`/claims/service-center/${service_center_id}/statistics`,
		"GET"
	);
}

/**
 * Get claims by repair store
 * @summary Get all claims for a specific repair store across all its service centers. Repair store admins can only access their own store. Partners and admins can access all.
 * @tag Claims
 */
export async function getClaimsByRepairStore(
	repair_store_id: string,
	params?: GetClaimsParams
): Promise<BaseApiResponse<Claim[]>> {
	const queryString = buildQueryString(params as Record<string, any>);
	return apiCall(
		`/claims/repair-store/${repair_store_id}${queryString}`,
		"GET"
	);
}

/**
 * Get repair store claim statistics
 * @summary Get statistics for claims in a repair store including status breakdown, payment stats, and service center breakdown
 * @tag Claims
 */
export async function getRepairStoreStatistics(
	repair_store_id: string
): Promise<BaseApiResponse<ClaimStatistics>> {
	return apiCall(`/claims/repair-store/${repair_store_id}/statistics`, "GET");
}
