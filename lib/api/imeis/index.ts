import { apiCall, BaseApiResponse } from "../shared";

// ============================================================================
// IMEIs APIs
// ============================================================================

// Types & Interfaces
export interface Product {
	id: string;
	created_at: string;
	updated_at: string;
	created_by_id: string | null;
	updated_by_id: string | null;
	name: string;
	sapphire_cost: string;
	repair_cost: string;
	status: "ACTIVE" | "INACTIVE";
}

export interface ImeiUpload {
	id: string;
	created_at: string;
	updated_at: string;
	file_name: string;
	product_id: string;
	total_records: number;
	successful_records: number;
	failed_records: number;
	uploaded_by_id: string | null;
	uploaded_at: string;
	processing_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
	error_message: string | null;
	processing_details: {
		duplicates?: string[];
		errors?: string[];
	};
	product?: Product;
	uploaded_by?: any | null;
}

export interface Imei {
	id: string;
	created_at: string;
	updated_at: string;
	imei: string;
	upload_id: string;
	product_id: string;
	supplier?: string;
	expiry_date?: string;
	is_used: boolean;
	used_at?: string;
	used_by_claim_id?: string;
	upload?: ImeiUpload;
	product?: Product;
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

export interface PaginatedImeiUploadsResponse {
	data: ImeiUpload[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface PaginatedImeisResponse {
	data: Imei[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
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
	return apiCall("/imeis/upload", "POST", formData);
}

/**
 * Get upload history
 * @summary Retrieve all IMEI upload records with pagination and filters
 * @tag IMEIs
 */
export async function getImeiUploads(
	params?: GetUploadsParams
): Promise<PaginatedImeiUploadsResponse> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/imeis/uploads?${queryParams}`, "GET");
}

/**
 * Get upload details
 * @summary Retrieve detailed information about a specific upload including all IMEIs
 * @tag IMEIs
 */
export async function getImeiUploadById(
	id: string
): Promise<BaseApiResponse<ImeiUpload>> {
	return apiCall(`/imeis/uploads/${id}`, "GET");
}

/**
 * Get all IMEIs
 * @summary Retrieve all IMEIs with pagination and filters
 * @tag IMEIs
 */
export async function getAllImeis(
	params?: GetImeisParams
): Promise<PaginatedImeisResponse> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/imeis?${queryParams}`, "GET");
}

/**
 * Validate IMEI
 * @summary Check if an IMEI exists and is eligible for creating a claim
 * @tag IMEIs
 */
export async function validateImei(
	data: ValidateImeiDto
): Promise<BaseApiResponse<ValidateImeiResponse>> {
	return apiCall("/imeis/validate", "POST", data);
}

/**
 * Search IMEI
 * @summary Search for a specific IMEI and get its details
 * @tag IMEIs
 */
export async function searchImei(imei: string): Promise<Imei> {
	return apiCall(`/imeis/search/${imei}`, "GET");
}
