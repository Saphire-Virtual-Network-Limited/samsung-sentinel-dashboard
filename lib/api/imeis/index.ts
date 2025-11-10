import { apiCall, BaseApiResponse } from "../shared";

// ============================================================================
// IMEIs APIs
// ============================================================================

// Types & Interfaces
export interface Imei {
	id: string;
	imei: string;
	product_id: string;
	upload_id: string;
	distributor?: string;
	expiry_date?: string;
	is_used: boolean;
	used_at?: string;
	used_by_claim_id?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ImeiUpload {
	id: string;
	product_id: string;
	filename: string;
	total_imeis: number;
	uploaded_by_id: string;
	createdAt: string;
}

export interface ValidateImeiDto {
	imei: string;
}

export interface ValidateImeiResponse {
	valid: boolean;
	imei?: Imei;
	message: string;
}

export interface GetImeisParams {
	product_id?: string;
	upload_id?: string;
	imei?: string;
	is_used?: boolean;
	page?: number;
	limit?: number;
}

export interface GetUploadsParams {
	product_id?: string;
	page?: number;
	limit?: number;
}

// API Functions

/**
 * Upload IMEI CSV file
 * @summary Upload a CSV file containing IMEIs for a specific product. CSV must have columns: Device IMEI, Distributor, Expiry Date
 * @tag IMEIs
 */
export async function uploadImeiCsv(
	file: File,
	product_id: string
): Promise<BaseApiResponse<ImeiUpload>> {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("product_id", product_id);
	return apiCall("/api/v1/imeis/upload", "POST", formData);
}

/**
 * Get upload history
 * @summary Retrieve all IMEI upload records with pagination and filters
 * @tag IMEIs
 */
export async function getImeiUploads(
	params?: GetUploadsParams
): Promise<BaseApiResponse<ImeiUpload[]>> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/api/v1/imeis/uploads?${queryParams}`, "GET");
}

/**
 * Get upload details
 * @summary Retrieve detailed information about a specific upload including all IMEIs
 * @tag IMEIs
 */
export async function getImeiUploadById(
	id: string
): Promise<BaseApiResponse<ImeiUpload>> {
	return apiCall(`/api/v1/imeis/uploads/${id}`, "GET");
}

/**
 * Get all IMEIs
 * @summary Retrieve all IMEIs with pagination and filters
 * @tag IMEIs
 */
export async function getAllImeis(
	params?: GetImeisParams
): Promise<BaseApiResponse<Imei[]>> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/api/v1/imeis?${queryParams}`, "GET");
}

/**
 * Validate IMEI
 * @summary Check if an IMEI exists and is eligible for creating a claim
 * @tag IMEIs
 */
export async function validateImei(
	data: ValidateImeiDto
): Promise<BaseApiResponse<ValidateImeiResponse>> {
	return apiCall("/api/v1/imeis/validate", "POST", data);
}

/**
 * Search IMEI
 * @summary Search for a specific IMEI and get its details
 * @tag IMEIs
 */
export async function searchImei(imei: string): Promise<BaseApiResponse<Imei>> {
	return apiCall(`/api/v1/imeis/search/${imei}`, "GET");
}
