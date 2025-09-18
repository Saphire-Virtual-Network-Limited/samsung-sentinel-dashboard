import axios from "axios";
import { cachedApiCall, generateCacheKey } from "./cache";
import {
	getPasswordSecurityStatus,
	PasswordStatus,
	redirectToPasswordChange,
	isExemptRoute,
} from "./passwordSecurity";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const appkey = process.env.NEXT_PUBLIC_APP_KEY;

export interface ApiCallOptions {
	cache?: RequestCache;
	revalidate?: number;
	appKey?: string;
	useCache?: boolean;
	cacheTTL?: number;
}

async function apiCall(
	endpoint: string,
	method: string,
	body?: any,
	options?: ApiCallOptions
) {
	try {
		// Check password security before making API calls (client-side only)
		if (typeof window !== "undefined") {
			const currentPath = window.location.pathname;
			const passwordStatus = getPasswordSecurityStatus();

			// Skip password check for auth routes, settings, and login endpoint
			const isLoginEndpoint = endpoint === "/admin/login";
			const isProfileEndpoint = endpoint === "/admin/profile";
			const isPasswordChangeEndpoint = endpoint.includes(
				"/admin/update-password"
			);

			if (
				!isLoginEndpoint &&
				!isProfileEndpoint &&
				!isPasswordChangeEndpoint &&
				!isExemptRoute(currentPath)
			) {
				if (passwordStatus === PasswordStatus.INSECURE) {
					redirectToPasswordChange();
					return new Promise(() => {}); // Never resolve to stop execution
				}
			}
		}

		const headers: any = {
			Accept: "*/*",
			"x-app-key": options?.appKey,
		};

		if (typeof window !== "undefined") {
			const sapphireProduct = localStorage.getItem("Sapphire-Credit-Product");
			if (sapphireProduct) {
				headers["Sapphire-Credit-Product"] = sapphireProduct;
			}
		}

		const config: any = {
			method,
			url: `${apiUrl}${endpoint}`,
			headers,
			withCredentials: true,
		};

		if (method !== "GET" && method !== "HEAD" && body) {
			if (body instanceof FormData) {
				delete headers["Content-Type"];
				config.data = body;
			} else {
				headers["Content-Type"] = "application/json";
				config.data = JSON.stringify(body);
			}
		}

		if (method === "GET") {
			if (options?.cache) {
				config.cache = options.cache;
			}
			if (options?.revalidate !== undefined) {
				config.revalidate = options.revalidate;
			}
		}

		const response = await axios(config);
		return response.data;
	} catch (error: any) {
		const status = error?.response?.status;

		/**
    // If Unauthorized, clear session and redirect to login
    if (status === 401 && typeof window !== "undefined") {
      // Clear any stored product key
      localStorage.removeItem("Sapphire-Credit-Product");
      // Redirect user to admin login
      window.location.href = "/auth/login";
      // Return a never‑resolving promise to stop further execution
      return new Promise(() => {});
    }
 */
		const errorMessage =
			error?.response?.data?.message ||
			error?.message ||
			"Something went wrong";
		console.log(`Error in ${method} ${endpoint}:`, errorMessage);
		throw new Error(errorMessage);
	}
}

// Cached API call wrapper
async function cachedApiCallWrapper<T>(
	endpoint: string,
	params: Record<string, any> = {},
	options?: ApiCallOptions
): Promise<T> {
	const cacheKey = generateCacheKey(endpoint, params);

	if (options?.useCache !== false) {
		return cachedApiCall(
			cacheKey,
			() => apiCall(endpoint, "GET", undefined, options),
			options?.cacheTTL
		);
	}

	return apiCall(endpoint, "GET", undefined, options);
}

// *** Auth ***

export interface adminLogin {
	email: string;
	password: string;
}

export async function loginAdmin(adminLogin: adminLogin) {
	return apiCall("/admin/login", "POST", adminLogin);
}

export async function getAdminProfile() {
	return apiCall("/admin/profile", "GET");
}

export async function logoutAdmin() {
	return apiCall("/admin/logout", "POST");
}

export async function getAllProducts() {
	return apiCall("/admin/products", "GET");
}

//** Loans */

//get all loan data
export async function getAllLoanData(startDate?: string, endDate?: string) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/loan/data${query}`, "GET");
}

//get all loan record
export async function getAllLoanRecord(startDate?: string, endDate?: string) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/loan/record${query}`, "GET");
}

export async function getAllEnrolledRecord(
	startDate?: string,
	endDate?: string
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/loan/enrolled${query}`, "GET");
}

export async function getAllApprovedRecord(
	startDate?: string,
	endDate?: string
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/loan/approved${query}`, "GET");
}

export async function getAllDefaultedRecord(
	startDate?: string,
	endDate?: string
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/loan/defaulted${query}`, "GET");
}

export async function getAllDueLoanRecord(fromDate?: string, toDate?: string) {
	const query =
		fromDate && toDate ? `?fromDate=${fromDate}&toDate=${toDate}` : "";
	return apiCall(`/admin/loan/due${query}`, "GET");
}

//** Users Management */

export async function suspendUser({
	adminId,
	status,
}: {
	adminId: string;
	status: string;
}) {
	return apiCall("/admin/suspend", "POST", { adminId, status });
}

export interface AcceptInviteData {
	password: string;
	adminid: string;
	confirmPassword: string;
}

export async function acceptAdminInvite(data: AcceptInviteData) {
	return apiCall("/admin/invite/accept", "POST", data);
}

export interface InviteAdminData {
	firstName: string;
	lastName: string;
	role: string;
	email: string;
	telephoneNumber: string;
}

export async function inviteAdmin(data: InviteAdminData) {
	return apiCall("/admin/invite", "POST", data);
}
export async function getAllAdmins() {
	return apiCall("/admin/admins", "GET");
}

//** Devices */

export async function getAllDevicesData(startDate?: string, endDate?: string) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/device/data${query}`, "GET");
}

//** Reports Drop offs */

export async function getDropOffsData(startDate?: string, endDate?: string) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/customers/drop-off/data${query}`, "GET");
}

export async function getDropOffsRecord(startDate?: string, endDate?: string) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/customers/drop-off/record${query}`, "GET");
}

//get all customer record
export async function getAllCustomerRecord(
	startDate?: string,
	endDate?: string
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/customers/record${query}`, "GET");
}

//get all customer BASIC record
export async function getAllCustomerBasicRecord(
	startDate?: string,
	endDate?: string
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/customers/basic${query}`, "GET");
}

//get customer record by id
export async function getCustomerRecordById(customerId: string) {
	return apiCall(`/admin/customers/view/${customerId}`, "GET");
}

// New optimized customer record functions
export interface CustomerRecordParams {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	startDate?: string;
	endDate?: string;
	status?: string;
	region?: string;
	state?: string;
}

export interface PaginatedCustomerResponse {
	data: any[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export async function getPaginatedCustomerRecords(
	params: CustomerRecordParams = {}
) {
	const queryParams = new URLSearchParams();

	if (params.page) queryParams.append("page", params.page.toString());
	if (params.limit) queryParams.append("limit", params.limit.toString());
	if (params.search) queryParams.append("search", params.search);
	if (params.sortBy) queryParams.append("sortBy", params.sortBy);
	if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
	if (params.startDate) queryParams.append("startDate", params.startDate);
	if (params.endDate) queryParams.append("endDate", params.endDate);
	if (params.status) queryParams.append("status", params.status);
	if (params.region) queryParams.append("region", params.region);
	if (params.state) queryParams.append("state", params.state);

	const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
	const endpoint = `/admin/customers/paginated${query}`;

	// Use caching for paginated requests with shorter TTL
	return cachedApiCallWrapper(endpoint, params, {
		useCache: true,
		cacheTTL: 2 * 60 * 1000, // 2 minutes cache
	});
}

// Lightweight customer list for quick loading
export async function getCustomerList(params: CustomerRecordParams = {}) {
	const queryParams = new URLSearchParams();

	if (params.page) queryParams.append("page", params.page.toString());
	if (params.limit) queryParams.append("limit", params.limit.toString());
	if (params.search) queryParams.append("search", params.search);
	if (params.sortBy) queryParams.append("sortBy", params.sortBy);
	if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
	if (params.startDate) queryParams.append("startDate", params.startDate);
	if (params.endDate) queryParams.append("endDate", params.endDate);

	const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
	const endpoint = `/admin/customers/list${query}`;

	// Use caching for list requests
	return cachedApiCallWrapper(endpoint, params, {
		useCache: true,
		cacheTTL: 5 * 60 * 1000, // 5 minutes cache
	});
}

export interface verifyCustomerReferenceNumber {
	customerId: string;
	phoneNumber: string;
	phoneVerified: boolean;
	comment: string;
}

export async function verifyCustomerReferenceNumber(
	verifyCustomerReferenceNumber: verifyCustomerReferenceNumber
) {
	return apiCall(
		"/admin/customers/verify-reference",
		"POST",
		verifyCustomerReferenceNumber
	);
}

//** Stores */

export async function getAllStores() {
	return apiCall("/admin/stores/record", "GET");
}

export async function getStoreRecordById(storeId: string) {
	return apiCall(`/admin/stores/record/${storeId}`, "GET");
}

export async function getUnpaidStores(startDate?: string, endDate?: string) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/stores/unpaid${query}`, "GET");
}

export async function getPaidStores(startDate?: string, endDate?: string) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/stores/paid${query}`, "GET");
}

export async function getStoresbyStatus(status: string) {
	return apiCall(`/admin/stores/status?status=${status}`, "GET");
}

export async function AuditApprovalforStoreDetails(
	storeId: string,
	status: string
) {
	return apiCall(`/admin/stores/${storeId}/status`, "PATCH", { status });
}

//** Referees */

export async function getAllReferees(startDate?: string, endDate?: string) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/customers/all-kyc${query}`, "GET");
}

export async function getSingleReferee(customerId: string) {
	return apiCall(`/admin/customers/kyc/${customerId}`, "GET");
}

export async function getUnapprovedReferees(
	startDate?: string,
	endDate?: string
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/customers/unapproved-refreees${query}`, "GET");
}

export async function getApprovedReferees(
	startDate?: string,
	endDate?: string
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/customers/approved-refreees${query}`, "GET");
}

export async function getRejectedReferees(
	startDate?: string,
	endDate?: string
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/customers/rejected-refreees${query}`, "GET");
}

export interface updateStoreStatus {
	status: string;
	storeOnLoanId: string;
	bankUsed: string;
}

export async function updateStoreStatus(updateStoreStatus: updateStoreStatus) {
	return apiCall("/admin/stores/update-payment", "PUT", updateStoreStatus);
}

//** Devices */

export async function getAllDevices(startDate?: string, endDate?: string) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/device/all${query}`, "GET");
}

export async function getDeviceById(deviceId?: string) {
	return apiCall(`/admin/device/${deviceId}`, "GET");
}

export async function getAllEnrolledDevices(
	status?: string,
	startDate?: string,
	endDate?: string
) {
	let query = "";
	if (status) {
		query += `?status=${status}`;
		if (startDate && endDate) {
			query += `&startDate=${startDate}&endDate=${endDate}`;
		}
	} else if (startDate && endDate) {
		query = `?startDate=${startDate}&endDate=${endDate}`;
	}
	return apiCall(`/admin/device/status${query}`, "GET");
}

export async function getAllUnEnrolledDevices(
	status?: string,
	startDate?: string,
	endDate?: string
) {
	let query = "";
	if (status) {
		query += `?status=${status}`;
		if (startDate && endDate) {
			query += `&startDate=${startDate}&endDate=${endDate}`;
		}
	} else if (startDate && endDate) {
		query = `?startDate=${startDate}&endDate=${endDate}`;
	}
	return apiCall(`/admin/device/status${query}`, "GET");
}

//** Link Details */

export async function updateLinkStatus(customerId: string) {
	return apiCall(`/admin/customers/update-kyc/${customerId}`, "POST");
}

// get all sentinel sales/data
export async function getAllSentinelData(startDate?: string, endDate?: string) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/customers/sentinel${query}`, "GET");
}

//** Dashboard analytics */
export async function getDailyReport(sales_channel?: string) {
	const query = sales_channel ? `?sales_channel=${sales_channel}` : "";
	return apiCall(`/admin/analytics/daily-report${query}`, "GET");
}

export async function getInceptionReport(sales_channel?: string) {
	const query = sales_channel ? `?sales_channel=${sales_channel}` : "";
	return apiCall(`/admin/analytics/inception${query}`, "GET");
}

export async function getDeviceDashAnalytic() {
	return apiCall(`/admin/analytics/devices`, "GET");
}

export async function getDropOffReport(screen?: string) {
	const query = screen ? `?screen=${screen}` : "";
	return apiCall(`/admin/analytics/drop-off-report${query}`, "GET");
}

// collection dashboard

export async function getDailyCollectionReport(sales_channel?: string) {
	const query = sales_channel ? `?sales_channel=${sales_channel}` : "";
	return apiCall(`/admin/analytics/collections/daily-report${query}`, "GET");
}

export async function getInceptionCollectionReport(sales_channel?: string) {
	const query = sales_channel ? `?sales_channel=${sales_channel}` : "";
	return apiCall(`/admin/analytics/collections/inception${query}`, "GET");
}

//** Sync Stores from 1.9 dashboard */

export async function syncStores() {
	return apiCall(`/resources/sync-stores`, "GET");
}

//** Agent Store Assignment */

// Interface for assign/update agent store
export interface AssignAgentStore {
	storeId: string;
	mbeId: string;
}

// Assign agent to store
export async function assignAgentToStore(data: AssignAgentStore) {
	return apiCall("/admin/mbe/assign/agent/store", "POST", data);
}

// Update agent store assignment
export async function updateAgentStore(data: AssignAgentStore) {
	return apiCall("/admin/mbe/update-store", "POST", data);
}

// Get available stores for an agent
export async function getAgentAvailableStores(mbeId: string) {
	return apiCall(`/admin/mbe/stores/${mbeId}`, "GET");
}

// ============================================================================
// AGENTS
// ============================================================================

export async function getAllAgentRecord(
	startDate?: string,
	endDate?: string,
	options?: ApiCallOptions
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/mbe/records${query}`, "GET", undefined, options);
}

export async function getAgentRecordByMbeId(
	mbeId: string,

	options?: ApiCallOptions
) {
	return apiCall(`/admin/mbe/get/${mbeId}`, "GET", undefined, options);
}

export async function getAgentDevice(
	{ mbeId, acceptedDate }: { mbeId: string; acceptedDate?: string },
	options?: ApiCallOptions
) {
	const query = acceptedDate ? `?acceptedDate=${acceptedDate}` : "";
	return apiCall(
		`/admin/mbe/item-balances/${mbeId}${query}`,
		"GET",
		undefined,
		options
	);
}

export async function updateAgentAddressStatus(
	{
		status,
		mbeId,
		kycId,
	}: {
		status: "APPROVED" | "REJECTED" | any;
		mbeId: string;
		kycId: string;
	},
	options?: ApiCallOptions
) {
	return apiCall(
		`/admin/mbe/verify-address`,
		"POST",
		{ status, mbeId, kycId },
		options
	);
}

export async function updateAgentGuarantorStatus(
	{
		status,
		mbeId,
		guarantorId,
		comment,
	}: {
		status: "APPROVED" | "REJECTED" | any;
		mbeId: string;
		guarantorId: string;
		comment?: string;
	},
	options?: ApiCallOptions
) {
	return apiCall(
		`/admin/mbe/verify-guarantors`,
		"POST",
		{ status, mbeId, guarantorId, comment },
		options
	);
}

export async function exportAllAgentDetails(options?: ApiCallOptions) {
	return apiCall(`/agent/export/all-details`, "GET", undefined, options);
}

export async function deleteAgentDetails(data: any, options?: ApiCallOptions) {
	return apiCall(`/admin/mbe/delete-agent`, "POST", data, options);
}

export async function updateScanPartner(
	{ mbeId, userId }: { mbeId: string; userId: string },
	options?: ApiCallOptions
) {
	return apiCall(
		`/admin/mbe/update-scan-partner`,
		"POST",
		{ mbeId, userId },
		options
	);
}

export async function createMbeRecord(
	data: {
		title: string;
		firstname: string;
		lastname: string;
		phone: string;
		state: string;
		username: string;
		bvn: string;
		bvnPhoneNumber: string;
		channel: string;
		dob: string;
		email: string;
		isActive: boolean;
		password?: string;
		role: string;
	},
	options?: ApiCallOptions
) {
	return apiCall(`/admin/mbe/create`, "POST", data, options);
}

// ============================================================================
// MBE RECONCILIATION & AGENT MANAGEMENT
// ============================================================================

export interface ReconciliationAgent {
	mbeId: string;
	name: string;
	phone: string;
	email: string;
}

export interface ReconciliationAssignedMbe {
	mbeId: string;
	name: string;
	phone: string;
	email: string;
}

export interface TransferItem {
	qty: number;
	item_code: string;
	serial_nos: string[];
}

export interface ReconciliationRecord {
	reconciliationId: string;
	agent: ReconciliationAgent;
	assignedMbe: ReconciliationAssignedMbe;
	targetWarehouse: string;
	transferItems: TransferItem[];
	status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
	erpTransferId: string | null;
	erpResponse: any | null;
	createdAt: string;
	updatedAt: string;
}

export interface ReconciliationPagination {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface ReconciliationFilters {
	mbeId: string | null;
	agentId: string | null;
	date: string | null;
}

export interface ReconciliationHistoryData {
	data: ReconciliationRecord[];
	pagination: ReconciliationPagination;
	filters: ReconciliationFilters;
}

export interface ReconciliationHistoryResponse {
	statusCode: number;
	statusType: string;
	message: string;
	data: ReconciliationHistoryData;
	responseTime: string;
}

export interface ReconciliationHistoryParams {
	mbeId?: string;
	agentId?: string;
	date?: string;
	page?: number;
	limit?: number;
}

export async function getReconciliationHistory(
	params: ReconciliationHistoryParams = {},
	options?: ApiCallOptions
): Promise<ReconciliationHistoryResponse> {
	const queryParams = new URLSearchParams();

	if (params.mbeId) queryParams.append("mbeId", params.mbeId);
	if (params.agentId) queryParams.append("agentId", params.agentId);
	if (params.date) queryParams.append("date", params.date);
	if (params.page) queryParams.append("page", params.page.toString());
	if (params.limit) queryParams.append("limit", params.limit.toString());

	const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
	return apiCall(
		`/admin/mbe/reconciliation/history${query}`,
		"GET",
		undefined,
		options
	);
}

export interface ReconciliationStatusBreakdown {
	pending: string;
	approved: string;
	rejected: string;
	completed: string;
}

export interface ReconciliationStatsData {
	total: number;
	pending: number;
	approved: number;
	rejected: number;
	completed: number;
	statusBreakdown: ReconciliationStatusBreakdown;
}

export interface ReconciliationStatsResponse {
	statusCode: number;
	statusType: string;
	message: string;
	data: ReconciliationStatsData;
	responseTime: string;
}

export interface ReconciliationStatsParams {
	mbeId?: string;
	agentId?: string;
	startDate?: string;
	endDate?: string;
}

export async function getReconciliationStats(
	params: ReconciliationStatsParams = {},
	options?: ApiCallOptions
): Promise<ReconciliationStatsResponse> {
	const queryParams = new URLSearchParams();

	if (params.mbeId) queryParams.append("mbeId", params.mbeId);
	if (params.agentId) queryParams.append("agentId", params.agentId);
	if (params.startDate) queryParams.append("startDate", params.startDate);
	if (params.endDate) queryParams.append("endDate", params.endDate);

	const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
	return apiCall(
		`/admin/mbe/reconciliation/stats${query}`,
		"GET",
		undefined,
		options
	);
}

export interface MbeInfo {
	mbeId: string;
	firstname: string;
	lastname: string;
	phone: string;
	email: string;
	role: "MOBIFLEX_MBE" | string;
	accountStatus:
		| "PENDING"
		| "APPROVED"
		| "REJECTED"
		| "ACTIVE"
		| "INACTIVE"
		| string;
	isActive: boolean;
}

export interface AssignedAgent {
	agentId: string;
	firstname: string;
	lastname: string;
	phone: string;
	email: string;
	role: string;
	accountStatus: string;
	isActive: boolean;
	assignedAt?: string;
}

export interface MbeWithAgents {
	mbe: MbeInfo;
	agents: AssignedAgent[];
	totalAgents: number;
}

export interface MbeAssignedAgentsData {
	mbe: {
		mbeId: string;
		firstname: string;
		lastname: string;
		phone: string;
		email: string;
	};
	agents: MbeWithAgents[];
	totalAgents: number;
}

export interface MbeAssignedAgentsResponse {
	statusCode: number;
	statusType: string;
	message: string;
	data: MbeAssignedAgentsData;
	responseTime: string;
}

export interface MbeAssignedAgentsParams {
	mbeId?: string;
	page?: number;
	limit?: number;
}

export async function getMbeAssignedAgents(
	params: MbeAssignedAgentsParams = {},
	options?: ApiCallOptions
): Promise<MbeAssignedAgentsResponse> {
	const queryParams = new URLSearchParams();

	if (params.mbeId) queryParams.append("mbeId", params.mbeId);
	if (params.page) queryParams.append("page", params.page.toString());
	if (params.limit) queryParams.append("limit", params.limit.toString());

	const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
	return apiCall(
		`/admin/mbe/mbe-assigned/agents${query}`,
		"GET",
		undefined,
		options
	);
}

export async function changeAgentMbeAssignment(
	agentId: string,
	newMbeId: string,
	options?: ApiCallOptions
) {
	return apiCall(
		`/admin/mbe/admin/agent/${agentId}/change-mbe`,
		"PUT",
		{ newMbeId },
		options
	);
}

export async function unlinkAgentFromMbe(
	agentId: string,
	options?: ApiCallOptions
) {
	return apiCall(
		`/admin/mbe/agent/${agentId}/unlink-mbe`,
		"PUT",
		undefined,
		options
	);
}

// ============================================================================
// SCAN PARTNERS
// ============================================================================
export async function getAllScanPartners(
	startDate?: string,
	endDate?: string,
	options?: ApiCallOptions
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/mbe/scan-partners${query}`, "GET", undefined, options);
}

export async function getScanPartnerAgents(options?: ApiCallOptions) {
	return apiCall(`/admin/mbe/scan-partners/agents`, "GET", undefined, options);
}

export async function getScanPartnerByUserId(
	userId: string,

	options?: ApiCallOptions
) {
	return apiCall(
		`/admin/mbe/scan-partner/${userId}`,
		"GET",
		undefined,
		options
	);
}

export type SortOrder = "asc" | "desc";

export interface AgentLoanCommissionParams {
	startDate?: string;
	endDate?: string;
	minCommission?: number;
	maxCommission?: number;
	sortBy?: "date" | "commission" | "mbeCommission" | "partnerCommission";
	sortOrder?: SortOrder;
	limit?: number;
	offset?: number;
}

export async function getAgentLoansAndCommissions(
	userId: string,
	params: AgentLoanCommissionParams = {}
) {
	const queryParams = new URLSearchParams();

	if (params.startDate) queryParams.append("startDate", params.startDate);
	if (params.endDate) queryParams.append("endDate", params.endDate);
	if (params.minCommission)
		queryParams.append("minCommission", params.minCommission.toString());
	if (params.maxCommission)
		queryParams.append("maxCommission", params.maxCommission.toString());
	if (params.sortBy) queryParams.append("sortBy", params.sortBy);
	if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
	if (params.limit) queryParams.append("limit", params.limit.toString());
	if (params.offset) queryParams.append("offset", params.offset.toString());

	const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
	const endpoint = `/admin/mbe/agents-loans/${userId}${query}`;
	return apiCall(endpoint, "GET");
}

// Get all agents with their loans and commissions (admin-level aggregation)
export interface AllAgentsLoansAndCommissionsParams {
	startDate?: string;
	endDate?: string;
	minCommission?: number;
	maxCommission?: number;
	sortBy?: string;
	sortOrder?: string;
	limit?: number;
	offset?: number;
}

// Base interfaces for shared types
export interface BaseEntity {
	createdAt: string;
	updatedAt: string;
}

// User interface
export interface User {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	dob: string | null;
	gender: string | null;
	role: "SCAN_PARTNER" | "CUSTOMER" | "MERCHANT" | "ADMIN" | string;
	referralCode: string | null;
	telephoneNumber: string;
	profile_picture: string | null;
	otp: string | null;
	tokenVersion: number;
	accountStatus: "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED" | string;
	isActive: boolean;
	otpExpiry: string | null;
	createdAt: string;
	updatedAt: string;
	accountType: "INDIVIDUAL" | "CORPORATE" | string;
	companyName: string | null;
	companyAddress: string | null;
	companyState: string | null;
	companyCity: string | null;
	companyLGA: string | null;
}

// Device interface
export interface Device {
	price: number;
	deviceModelNumber: string;
	SAP: number;
	SLD: number;
	createdAt: string;
	deviceManufacturer: string;
	deviceName: string;
	deviceRam: string;
	deviceScreen: string | null;
	deviceStorage: string | null;
	imageLink: string;
	newDeviceId: string;
	oldDeviceId: string | null;
	sentiprotect: number;
	updatedAt: string;
	deviceType: string | null;
	deviceCamera: string[];
	android_go: string;
	erpItemCode: string;
	erpName: string;
	erpSerialNo: string;
	devfinStatus: boolean;
	status: string;
}

// Store interface
export interface Store {
	storeOldId: number;
	storeName: string;
	city: string | null;
	state: string | null;
	region: string | null;
	address: string | null;
	accountNumber: string;
	accountName: string;
	bankName: string;
	bankCode: string;
	phoneNumber: string | null;
	storeEmail: string | null;
	longitude: number | null;
	latitude: number | null;
	clusterId: string | null;
	partner: string | null;
	storeOpen: string | null;
	storeClose: string | null;
	status: string;
	createdAt: string;
	updatedAt: string;
	storeId: string;
	isArchived: boolean;
	storeErpId: string | null;
	channel: string;
}

// Store on Loan interface
export interface StoreOnLoan extends BaseEntity {
	storeOnLoanId: string;
	storeId: string;
	loanRecordId: string;
	amount: number;
	status: string;
	channel: string;
	bankUsed: string;
	payChannel: string;
	reference: string;
	sessionId: string;
	tnxId: string;
	store: Store;
}

// Customer interface
export interface Customer extends BaseEntity {
	customerId: string;
	firstName: string;
	lastName: string;
	email: string;
	bvn: string;
	dob: string;
	dobMisMatch: boolean;
	customerLoanDiskId: string;
	channel: string;
	bvnPhoneNumber: string;
	mainPhoneNumber: string;
	mbeId: string;
	monoCustomerConnectedCustomerId: string;
	inputtedDob: string;
}

// Device on Loan interface
export interface DeviceOnLoan extends BaseEntity {
	deviceOnLoanId: string;
	deviceId: string;
	loanRecordId: string;
	status: string;
	channel: string;
	imei: string;
	amount: number;
	devicePrice: number;
	lockType: string;
	device: Device;
}

// Loan Record interface
export interface LoanRecord extends BaseEntity {
	loanRecordId: string;
	customerId: string;
	loanDiskId: string;
	lastPoint: string;
	channel: string;
	loanStatus: string;
	loanAmount: number;
	deviceId: string;
	downPayment: number;
	insurancePackage: string;
	insurancePrice: number;
	mbsEligibleAmount: number;
	payFrequency: string;
	storeId: string;
	devicePrice: number;
	deviceAmount: number;
	monthlyRepayment: number;
	duration: number;
	interestAmount: number;
	deviceName: string;
	mbeId: string;
	solarPackageId: string | null;
	powerflexCustomCalculationId: string | null;
	customer: Customer;
	StoresOnLoan: StoreOnLoan[];
}

// Commission interface (improved, type-safe, with device and agent/partner linkage)
export interface Commission {
	commissionId: string;
	mbeId: string;
	deviceOnLoanId: string;
	commission: number;
	mbeCommission: number;
	partnerCommission: number;
	splitPercent: number;
	agentPaid: boolean;
	partnerPaid: boolean;
	agentPaidAt: string | null;
	partnerPaidAt: string | null;
	paymentStatus: string;
	date_created: string;
	updated_at: string;
	mbePayoutId: string | null;
	partnerPayoutId: string | null;
	devicesOnLoan: DeviceOnLoan;
	// Optionally, link to the agent and partner for richer lookups
	agent?: MobiflexSalesAgent;
	partner?: User;
}

// Commission Summary interface
export interface CommissionSummary {
	totalCommission: number;
	totalMbeCommission: number;
	totalPartnerCommission: number;
	commissionCount: number;
	avgCommission: number;
	avgMbeCommission: number;
	avgPartnerCommission: number;
	maxCommission: number;
	minCommission: number;
	latestCommissionDate: string;
	earliestCommissionDate: string;
}

// Main Sales Agent interface (improved, type-safe, with all relationships)
export interface MobiflexSalesAgent extends BaseEntity {
	title: string;
	mbeId: string;
	mbe_old_id: string;
	firstname: string;
	lastname: string;
	phone: string;
	state: string | null;
	username: string;
	accountStatus: string;
	bvn: string;
	bvnPhoneNumber: string;
	channel: string;
	dob: string;
	email: string;
	isActive: boolean;
	otp: string | null;
	otpExpiry: string | null;
	password: string;
	role: string;
	tokenVersion: number;
	resetOtp: string | null;
	resetOtpExpiry: string | null;
	imagePublicId: string;
	imageUrl: string;
	defaultSplitPercent: number | null;
	mbeManaged: boolean;
	userId: string;
	assignedMbeId: string | null;
	LoanRecord: LoanRecord[];
	Commission: Commission[];
	user: User;
	commissionSummary: CommissionSummary;
	totalCommissionCount: number;
	filteredCommissionCount: number;
	scanPartner: User;
	// Optionally, add bank details for reporting
	MbeAccountDetails?: {
		accountName?: string;
		accountNumber?: string;
		bankName?: string;
		bankCode?: string;
		vfdBankName?: string;
		vfdBankCode?: string;
		recipientCode?: string;
		walletBalance?: string;
	};
	// Optionally, add UserAccountDetails for scan partner
	UserAccountDetails?: Array<{
		accountName?: string;
		accountNumber?: string;
		bankName?: string;
		bankCode?: string;
		vfdBankName?: string;
		vfdBankCode?: string;
		recipientCode?: string;
		walletBalance?: string;
	}>;
}

export interface AllAgentsLoansAndCommissionsData {
	agents: MobiflexSalesAgent[];
	appliedFilters: Record<string, any>;
	pagination: Record<string, any>;
}

export interface AllAgentsLoansAndCommissionsResponse {
	statusCode: number;
	message: string;
	data: AllAgentsLoansAndCommissionsData;
	responseTime: string;
}

export async function getAllAgentsLoansAndCommissions(
	params: AllAgentsLoansAndCommissionsParams = {}
): Promise<AllAgentsLoansAndCommissionsResponse> {
	const queryParams = new URLSearchParams();

	if (params.startDate) queryParams.append("startDate", params.startDate);
	if (params.endDate) queryParams.append("endDate", params.endDate);
	if (params.minCommission !== undefined)
		queryParams.append("minCommission", params.minCommission.toString());
	if (params.maxCommission !== undefined)
		queryParams.append("maxCommission", params.maxCommission.toString());
	if (params.sortBy) queryParams.append("sortBy", params.sortBy);
	if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
	if (params.limit !== undefined)
		queryParams.append("limit", params.limit.toString());
	if (params.offset !== undefined)
		queryParams.append("offset", params.offset.toString());

	const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
	const endpoint = `/admin/mbe/all-agents/loans${query}`;
	return apiCall(endpoint, "GET");
}

export async function getAgentLoansAndCommissionsByScanPartner(
	scanPartnerId: string,
	mbeId: string,
	params: AgentLoanCommissionParams = {}
) {
	const queryParams = new URLSearchParams();

	if (params.startDate) queryParams.append("startDate", params.startDate);
	if (params.endDate) queryParams.append("endDate", params.endDate);
	if (params.minCommission)
		queryParams.append("minCommission", params.minCommission.toString());
	if (params.maxCommission)
		queryParams.append("maxCommission", params.maxCommission.toString());
	if (params.sortBy) queryParams.append("sortBy", params.sortBy);
	if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
	if (params.limit) queryParams.append("limit", params.limit.toString());
	if (params.offset) queryParams.append("offset", params.offset.toString());

	const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
	const endpoint = `/admin/mbe/agent-loans/${scanPartnerId}/${mbeId}${query}`;
	return apiCall(endpoint, "GET");
}

export async function getCommissionAnalytics(
	scanPartnerId: string,
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	mbeId?: string
) {
	const queryParams = new URLSearchParams();
	if (period) queryParams.append("period", period);
	if (start_date) queryParams.append("start_date", start_date);
	if (end_date) queryParams.append("end_date", end_date);
	if (mbeId) queryParams.append("mbeId", mbeId);

	const endpoint = `/admin/mbe/commission-analytics/${scanPartnerId}?${queryParams.toString()}`;
	return apiCall(endpoint, "GET");
}
// ============================================================================
// GET MBE DETAILS WITH
// ============================================================================

export async function getMBEwithCustomer(
	mbeId?: string,
	page?: number,
	limit?: number
) {
	const query = mbeId ? `?mbeId=${mbeId}&page=${page}&limit=${limit}` : "";
	return apiCall(`/admin/mbe/records${query}`, "GET");
}

// ============================================================================
// CANCEL/DELETE BILL
// ============================================================================

export async function deleteCustomer(customerId: string, reason: string) {
	return apiCall(
		`/admin/customers/delete-customer/${customerId}?reason=${reason}`,
		"DELETE"
	);
}

// Update customer LastPoint

export async function updateCustomerLastPoint(
	customerId: string,
	lastPoint: string
) {
	return apiCall(
		`/admin/customers/update-last-point?customerId=${customerId}&lastPoint=${lastPoint}`,
		"PUT"
	);
}

// Delete Customer Mandate And Update Last Point
export async function deleteCustomerMandateAndUpdateLastPoint(
	customerId: string,
	lastPoint: string
) {
	return apiCall(
		`/admin/customers/customer-mandate-fix?customerId=${customerId}&lastPoint=${lastPoint}`,
		"PUT"
	);
}

// Update customer virtual wallet balance

export async function updateCustomerVirtualWalletBalance(
	customerId: string,
	amount: number
) {
	return apiCall(
		`/admin/customers/update-wallet?customerId=${customerId}&amount=${amount}`,
		"PUT"
	);
}

// Create customer virtual wallet

export async function createCustomerVirtualWallet(customerId: string) {
	return apiCall(
		`/admin/customers/create-customer-wallet?customerId=${customerId}`,
		"POST"
	);
}

// Inject payment history into customer
export interface InjectPaymentHistoryData {
	amount?: string; // Changed to string for better input handling
	paymentType?: "CREDIT" | "DEBIT";
	paymentReference?: string;
	paymentDescription?: string;
	paid_at?: string;
	senderAccount?: string;
	senderBank?: string;
	receiverAccount?: string;
	receiverBank?: string;
}

export async function injectPaymentHistory(
	customerId: string,
	data: InjectPaymentHistoryData
) {
	// Convert amount to number before sending to API
	const apiData = {
		...data,
		amount: parseFloat(data.amount || "0") || 0,
	};

	return apiCall(
		`/admin/customers/inject-payment-history/${customerId}`,
		"POST",
		apiData
	);
}

// ============================================================================
// DEVICE lOCKING AND UNLOCKING
// ============================================================================

export async function lockDevice(imei?: string) {
	return apiCall(`/admin/locks/activate/single`, "POST", { imei });
}

export async function unlockDevice(
	imei?: string,
	dueDate?: string,
	dueTime?: string
) {
	return apiCall(`/admin/locks/unlock/single-bulk`, "POST", {
		imei,
		dueDate,
		dueTime,
	});
}

export async function releaseDevice(imei?: string, reason?: string) {
	return apiCall("/admin/locks/release/single", "POST", { imei, reason });
}

// ============================================================================
// Change loan status  | Approved, Rejected, Defaulted, Due, Overdue
// ============================================================================

export async function changeLoanStatus(loanRecordId: string, status: string) {
	return apiCall(`/admin/loan/status/${loanRecordId}`, "PUT", { status });
}

// Create store
export interface createStore {
	storeName: string;
	city: string;
	state: string;
	region: string;
	address: string;
	accountNumber: string;
	accountName: string;
	bankName: string;
	bankCode: string;
	phoneNumber: string;
	storeEmail: string;
	longitude: number;
	latitude: number;
	clusterId: number;
	partner: string;
	storeOpen: string;
	storeClose: string;
}

export async function createStore(createStore: createStore) {
	return apiCall("/admin/stores", "POST", createStore);
}

// update store details
export interface updateStore {
	storeId: string;
	storeName: string;
	city: string;
	state: string;
	region: string;
	address: string;
	accountNumber: string;
	accountName: string;
	bankName: string;
	bankCode: string;
	phoneNumber: string;
	storeEmail: string;
	longitude: number;
	latitude: number;
	clusterId: number;
	partner: string;
	storeOpen: string;
	storeClose: string;
}

export async function updateStore(updateStore: updateStore) {
	return apiCall(`/admin/stores/${updateStore.storeId}`, "PUT", updateStore);
}

export async function deleteStore(storeId: string) {
	return apiCall(`/admin/stores/${storeId}/archive`, "PATCH");
}

// Deactivate store
export async function deactivateStore(storeId: string) {
	return apiCall(`/admin/stores/${storeId}/deactivate`, "PATCH");
}

// Create Device

export interface createDevice {
	deviceBrand: string;
	deviceModel: string;
	price: number;
	currency: string;
	deviceImage?: File; // File object for FormData
	deviceModelNumber: string;
	back_camera?: string;
	battery?: string;
	color?: string;
	data_storage?: string;
	display?: string;
	front_camera?: string;
	memory?: string;
	network?: string;
	os?: string;
	other_features?: string;
	proccessor_cpu?: string;
	sap: number;
	screen_size: string;
	sentinel_cover: string;
	sld: number;
	deviceType: string;
	case_colors?: string;
	windows_version: string;
	isActive: boolean;
}

export async function createDevice(createDevice: createDevice) {
	const formData = new FormData();

	// Add file if it exists
	if (createDevice.deviceImage) {
		formData.append("deviceImage", createDevice.deviceImage);
	}

	// Append all fields as strings, matching the curl example
	const fieldMap: Record<string, any> = {
		deviceBrand: createDevice.deviceBrand,
		deviceModel: createDevice.deviceModel,
		price: createDevice.price,
		currency: createDevice.currency,
		deviceModelNumber: createDevice.deviceModelNumber,
		back_camera: createDevice.back_camera ?? "",
		battery: createDevice.battery ?? "",
		color: createDevice.color ?? "",
		data_storage: createDevice.data_storage ?? "",
		display: createDevice.display ?? "",
		front_camera: createDevice.front_camera ?? "",
		memory: createDevice.memory ?? "",
		network: createDevice.network ?? "",
		os: createDevice.os ?? "",
		other_features: createDevice.other_features ?? "",
		proccessor_cpu: createDevice.proccessor_cpu ?? "",
		sap: createDevice.sap,
		screen_size: createDevice.screen_size ?? "",
		sentinel_cover: createDevice.sentinel_cover ?? "",
		sld: createDevice.sld,
		deviceType: createDevice.deviceType,
		case_colors: createDevice.case_colors ?? "",
		windows_version: createDevice.windows_version ?? "",
		isActive: createDevice.isActive,
	};

	Object.entries(fieldMap).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			formData.append(key, String(value));
		}
	});

	return apiCall("/admin/device/create", "POST", formData);
}

// Update Device

export interface updateDevice {
	deviceBrand?: string;
	deviceModel?: string;
	price?: number;
	currency?: string;
	deviceImage?: File; // File object for FormData
	deviceModelNumber?: string;
	back_camera?: string;
	battery?: string;
	color?: string;
	data_storage?: string;
	display?: string;
	front_camera?: string;
	memory?: string;
	network?: string;
	os?: string;
	other_features?: string;
	proccessor_cpu?: string;
	sentinel_cover?: string;
	sap?: number;
	screen_size?: string;
	sld?: number;
	deviceType?: string;
	case_colors?: string;
	windows_version?: string;
	isActive?: boolean;
}

export async function updateDevice(
	deviceId: string,
	updateDevice: updateDevice
) {
	const formData = new FormData();

	// Add file if it exists
	if (updateDevice.deviceImage) {
		formData.append("deviceImage", updateDevice.deviceImage);
	}

	// Add all other fields
	Object.keys(updateDevice).forEach((key) => {
		if (
			key !== "deviceImage" &&
			updateDevice[key as keyof updateDevice] !== undefined
		) {
			formData.append(key, String(updateDevice[key as keyof updateDevice]));
		}
	});
	console.log("formdata is: ", formData);
	return apiCall(`/admin/device/update/${deviceId}`, "PATCH", formData);
}

//deactivate device
export async function deactivateDevice(deviceId: string, reason: string) {
	return apiCall(`/admin/device/deactivate/${deviceId}`, "PUT", { reason });
}

//deactivate device
export async function activateDevice(deviceId: string) {
	return apiCall(`/admin/device/reactivate/${deviceId}`, "PUT");
}

//fetch all vfd banks
export async function getAllVfdBanks() {
	return apiCall("/payments/bank-list", "GET");
}

//update device imei number
export async function updateDeviceImeiNumber(
	deviceOnLoanId: string,
	imei: string
) {
	return apiCall(`/admin/device/imei/${deviceOnLoanId}`, "PUT", { imei });
}

//search customer across all channels
export async function searchGlobalCustomer(search: string) {
	return apiCall(`/admin/customers/search?search=${search}`, "GET");
}

// //endpoint to update imei number
// export async function updateImeiNumber(imei: string, customerId: string) {
//   return apiCall(`/admin/customers/update-imei?imei=${imei}&customerId=${customerId}`, "PUT");
// }

//update admin password
export async function updateAdminPassword(data: UpdatePasswordDto) {
	return apiCall(`/admin/update-password`, "POST", data);
}

//update admin password  for only dev
export async function updateAdminPasswordForDev(
	adminId: string,
	password: string,
	confirmPassword: string
) {
	return apiCall(`/admin/dev/update-password`, "POST", {
		adminId,
		password,
		confirmPassword,
	});
}

//Get mbe with customer which is use to submit transaction to relay
export async function getMBEWithCustomerForRelay(mbe_old_id: string) {
	return apiCall(
		`/admin/customers/mbes-with-customers?mbe_old_id=${mbe_old_id}`,
		"GET"
	);
}

// assign customer to mbe
export async function assignCustomersToMBE(customerId: string, mbeId: string) {
	return apiCall(
		`/admin/customers/assign-mbe?customerId=${customerId}&mbeId=${mbeId}`,
		"POST"
	);
}

//commnunication log
export async function postCommunicationLog(customerId: string, note: string) {
	return apiCall(`/admin/communication-log/create`, "POST", {
		customerId,
		note,
	});
}

//get communication log by customer id
export async function getCommunicationLogByCustomerId(customerId: string) {
	return apiCall(
		`/admin/communication-log/getBycustomerid?customerId=${customerId}`,
		"GET"
	);
}

//get all communication log in the system
export async function getAllCommunicationLog() {
	return apiCall(`/admin/communication-log/getAll`, "GET");
}

//update communication log by customer id
export async function updateCommunication(
	id: string,
	customerId: string,
	note: string
) {
	return apiCall(`/admin/communication-log/update/${id}`, "PUT", {
		customerId,
		note,
	});
}

//delete communication log by customer id
export async function deleteCommunicationLog(id: string) {
	return apiCall(`/admin/communication-log/delete/${id}`, "DELETE");
}

//get device locks logs with optional imei filter
export async function getDeviceLocksLogs(
	imei?: string,
	options?: ApiCallOptions
) {
	const query = imei ? `?imei=${imei}` : "";
	return apiCall(`/admin/locks/logs${query}`, "GET", undefined, options);
}

//get all downpayment lower than 20%
export async function getAllDownpaymentLowerThan20(
	includeRelations: boolean = true
) {
	return apiCall(
		`/admin/loan/low-downpayment?includeRelations=${includeRelations}`,
		"GET"
	);
}

// ============================================================================
// CREDITFLEX PAYDAY LOANS 😒😢
// ============================================================================

export interface BaseApiResponse<T = any> {
	statusCode: number;
	statusType: string;
	message: string;
	data: T;
	responseTime: string;
	channel: string;
}

export interface BulkDisbursementResponse {
	totalProcessed: number;
	successful: number;
	failed: number;
	results: Array<{
		loanId: string;
		invoiceReference: string;
		amount: number;
		paymentStatus: string;
		transferMeta: {
			tnxId: string;
			sessionId: string;
			reference: string;
			channel: string;
		};
		customerId: string;
		status: string;
	}>;
	errors: Array<{
		loanId: string;
		error: string;
		status: string;
	}>;
	summary: {
		totalAmount: number;
		successfulDisbursements: string[];
		failedDisbursements: string[];
	};
}

/**
 * Triggers bulk loan disbursement for multiple loans
 *
 * @param disbursements - Array of disbursement objects containing loan ID and invoice reference
 * @returns Promise with bulk disbursement response
 */
export async function triggerCDFAdminBulkDisbursement(
	disbursements: { loanId: string; invoiceReference?: string }[]
): Promise<BaseApiResponse<BulkDisbursementResponse>> {
	return apiCall("/admin/payday/loans/bulk-disbursement", "POST", {
		disbursements,
	});
}

/**
 * Triggers loan disbursement for a specific loan ID
 *
 * @param loanId - Loan ID to disburse
 * @param invoiceReference - Invoice reference for the disbursement
 * @returns Promise with disbursement response
 */
export async function triggerCDFAdminDisbursement(
	loanId: string,
	invoiceReference: string
): Promise<BaseApiResponse<any>> {
	return apiCall(`/admin/payday/loans/${loanId}/disbursement`, "POST", {
		invoiceReference,
	});
}

/**
 * Retrieves all loans for a specific telemarketer with optional filters
 *
 * @param telemarketerID - Telemarketer ID to get loans for (required)
 * @param status - Loan status filter (defaults to "all")
 * @param startDate - Start date filter (optional, format: YYYY-MM-DD)
 * @param endDate - End date filter (optional, format: YYYY-MM-DD)
 * @param limit - Number of results to return (optional)
 * @param offset - Number of results to skip (optional)
 * @param options - Caching options
 * @returns Promise with telemarketer loans response including pagination
 */

export async function getCDFAllLoanData(
	filters: {
		loanId?: string;
		telemarketerName?: string;
		customerName?: string;
		ippisNumber?: string;
		loanProductId?: string;
		status?: string;
		startDate?: string;
		endDate?: string;
		page?: number;
		limit?: number;
	} = {}
) {
	const {
		loanId,
		telemarketerName,
		customerName,
		ippisNumber,
		loanProductId,
		status,
		startDate,
		endDate,
		page = 1,
		limit = 10,
	} = filters;

	const params = new URLSearchParams();

	const entries = {
		loanId,
		telemarketerName,
		customerName,
		ippisNumber,
		loanProductId,
		startDate,
		endDate,
		page: String(page),
		limit: String(limit),
	};

	Object.entries(entries).forEach(([key, value]) => {
		if (value) params.append(key, value);
	});

	if (status && status !== "all") {
		params.append("loanStatus", status);
	}

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(`/admin/payday/loans${query}`, "GET");
}

export async function getCDFLoanById(
	loanId: string
): Promise<BaseApiResponse<any>> {
	return apiCall(`/admin/payday/loans/${loanId}`, "GET", undefined);
}

export async function getCDFAllTeleMarketers(search?: string, status?: string) {
	const params = new URLSearchParams();

	if (search) params.append("search", search);
	if (status && status !== "ALL") params.append("status", status);
	const query = params.toString() ? `?${params.toString()}` : "";

	return apiCall(`/admin/payday/telemarketers${query}`, "GET");
}

export async function getCDFAllCustomers(search?: string, status?: string) {
	const params = new URLSearchParams();

	if (search) params.append("search", search);
	if (status) params.append("status", status);

	//const query = params.toString() ? `?${params.toString()}` : "";

	return apiCall(`/admin/payday/telemarketers`, "GET");
}

export async function getCDFAllLoanProducts() {
	return apiCall(`/admin/payday/loan-products`, "GET");
}

export async function createCDFLoanProduct(data: any) {
	return apiCall(`/admin/payday/loan-products`, "POST", data);
}

export async function updateCDFLoanProduct(id: string, data: any) {
	return apiCall(`/admin/payday/loan-products/${id}`, "PUT", data);
}

export async function deleteCDFLoanProduct(id: string) {
	return apiCall(`/admin/payday/loan-products/${id}`, "DELETE");
}

export async function getCDFLoanProductById(id: string) {
	return apiCall(`/admin/payday/loan-products/${id}`, "GET");
}

export async function getCDFAllRepayments() {
	return apiCall(`/admin/payday/repayments`, "GET");
}

// Fetch repayments with optional query params (status, teleMarketerId, loanId, dateFrom, dateTo, page, limit)
export async function getCDFRepayments(filters: Record<string, any> = {}) {
	const params = new URLSearchParams();
	Object.entries(filters).forEach(([k, v]) => {
		if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
	});
	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(`/admin/payday/repayments${query}`, "GET");
}

// Fetch repayments for a specific loan
export async function getCDFRepaymentsByLoanId(loanId: string) {
	return apiCall(`/admin/payday/loans/repayment/${loanId}`, "GET");
}

// Fetch single repayment by id
export async function getCDFRepaymentById(repaymentId: string) {
	return apiCall(`/admin/payday/repayments/${repaymentId}`, "GET");
}

// Record a repayment (assumption: endpoint accepts POST to record a manual repayment)
// NOTE: If your backend uses a different endpoint, update this helper accordingly.
export async function recordCDFRepayment(
	repaymentId: string,
	payload: Record<string, any>
) {
	return apiCall(
		`/admin/payday/repayments/${repaymentId}/record-payment`,
		"POST",
		payload
	);
}

// Fetch invoices with filters
export async function getCDFInvoices(filters: Record<string, any> = {}) {
	const params = new URLSearchParams();
	Object.entries(filters).forEach(([k, v]) => {
		if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
	});
	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(`/admin/payday/invoices${query}`, "GET");
}

// Fetch single invoice by id
export async function getCDFInvoiceById(invoiceId: string) {
	return apiCall(`/admin/payday/invoices/${invoiceId}`, "GET");
}

// Customer endpoints (list & single) used by Creditflex/payday
export async function getPaydayCustomers(params: Record<string, any> = {}) {
	const qp = new URLSearchParams();
	Object.entries(params).forEach(([k, v]) => {
		if (v !== undefined && v !== null && v !== "") qp.append(k, String(v));
	});
	const query = qp.toString() ? `?${qp.toString()}` : "";
	return apiCall(`/admin/payday/customers${query}`, "GET");
}

export async function getPaydayCustomerById(wacsCustomerId: string) {
	return apiCall(`/admin/payday/customers/${wacsCustomerId}`, "GET");
}

export async function getCDFAllInvoices() {
	return apiCall(`/admin/payday/invoices`, "GET");
}

export async function cdfAdminRegisterAgent(payload: {
	firstname: string;
	lastname: string;
	email: string;
	phone: string;
}) {
	return apiCall("/admin/payday/telemarketers/register", "POST", payload);
}

export async function cdfAdminEditAgent({
	telemarketerId,
	status,
}: {
	telemarketerId: string;
	status: string;
}) {
	return apiCall(
		`/admin/payday/telemarketers/${telemarketerId}/status`,
		"POST",
		{ status }
	);
}

export async function cdfAdminDeleteAgent({
	telemarketerId,
}: {
	telemarketerId: string;
}) {
	return apiCall(`/admin/payday/telemarketers/${telemarketerId}`, "DELETE");
}

export async function getCDFAdminDashboardStatistics(): Promise<
	BaseApiResponse<AdminDashboardStatistics>
> {
	return apiCall(`/admin/payday/dashboard-statistics`, "GET");
}
export interface AdminDashboardStatistics {
	totalUsersOnboarded: number;
	totalLoansDisbursed: number;
	activeLoans: number;
	totalLoansRepaid: number;
	totalLoanAmountRepaid: number;
	activeLoanApplications: number;
	totalDisbursedAmount: number;
	totalOutstandingBalance: number;
	totalTelemarketers: number;
	repaymentRate: string;
	averageLoanAmount: number;
	conversionRate: string;
}

// Bank Details API Functions
export async function getVfdBanks(): Promise<
	BaseApiResponse<{ status: string; message: string; data: { bank: any[] } }>
> {
	return apiCall("/payments/bank-list", "GET", undefined, {
		appKey: process.env.NEXT_PUBLIC_MOBIFLEX_APP_KEY,
	});
}

export async function getPaystackBanks(): Promise<
	BaseApiResponse<{ status: boolean; message: string; data: any[] }>
> {
	return apiCall("/payments/banks", "GET", undefined, {
		appKey: process.env.NEXT_PUBLIC_MOBIFLEX_APP_KEY,
	});
}

export async function verifyBankAccount(data: {
	accountNumber: string;
	bankCode: string; // This should be the Paystack bank code
}): Promise<
	BaseApiResponse<{
		account_number: string;
		account_name: string;
		bank_id: number;
	}>
> {
	return apiCall(
		`/payments/resolve-account-number?bankCode=${data.bankCode}&accountNumber=${data.accountNumber}`,
		"GET",
		undefined,
		{
			appKey: process.env.NEXT_PUBLIC_MOBIFLEX_APP_KEY,
		}
	);
}

export async function addUserBankDetails(
	userId: string,
	data: {
		accountName: string;
		accountNumber: string;
		vfdBankName: string;
		vfdBankCode: string;
		channel: string;
		bankID: number;
		bankCode: string;
		bankName: string;
	}
): Promise<BaseApiResponse<any>> {
	return apiCall(`/admin/account-details/${userId}`, "POST", data, {
		appKey: process.env.NEXT_PUBLIC_MOBIFLEX_APP_KEY,
	});
}

// ============================================================================
// AMBASSADOR MANAGEMENT APIs
// ============================================================================

export interface Lead {
	id: string;
	bvn: string;
	phoneNumber: string;
	leadName: string;
	ippisNumber: string;
	salaryAccountNumber: string;
	salaryAccountName: string;
	salaryBankName: string;
	salaryBankCode: string;
	gradeLevel: string;
	pfaName: string;
	dob: string;
	state: string;
	status: string;
	ambassadorId: string | null;
	teleMarketerId: string | null;
	createdAt: string;
	updatedBy: string;
	ambassador?: {
		id: string;
		fullName: string;
		emailAddress: string | null;
		phoneNumber: string;
		ambassadorProfile: string;
		teleMarketer?: {
			teleMarketerId: string;
			firstname: string;
			lastname: string;
			email: string;
			phone: string;
			role: string;
			createdAt: string;
			updatedAt: string;
		} | null;
	} | null;
}

export interface Ambassador {
	id: string;
	bvn?: string;
	phoneNumber: string;
	emailAddress: string | null;
	institution?: string | null;
	fullName: string;
	address?: string;
	ippisNumber?: string | null;
	password?: string;
	accountNumber?: string;
	accountName?: string;
	bankName?: string;
	bankCode?: string;
	referralCode?: string;
	referredBy?: string | null;
	ambassadorProfile: string;
	teleMarketerId?: string | null;
	createdAt: string;
	updatedBy: string;
	PaydayLead?: Lead[];
	teleMarketer?: {
		teleMarketerId: string;
		firstname: string;
		lastname: string;
		email: string;
		phone: string;
		role: string;
		createdAt: string;
		updatedAt: string;
	} | null;
}

export interface ConversionRate {
	ambassadorId: string;
	ambassadorName: string;
	fullName: string;
	emailAddress: string | null;
	phoneNumber: string;
	state: string;
	totalLeads: number;
	convertedLeads: number;
	disbursedLeads: number;
	rejectedLeads: number;
	conversionRate: number;
	teleMarketerName?: string;
}

/**
 * Get all leads with their details
 */
export async function getAmbassadorLeadsWithDetails(): Promise<
	BaseApiResponse<Lead[]>
> {
	return apiCall("/admin/ambassador/leads-with-details", "GET");
}

/**
 * Get all ambassadors with their leads
 */
export async function getAmbassadorsWithLeads(): Promise<
	BaseApiResponse<Ambassador[]>
> {
	return apiCall("/admin/ambassador/ambassadors-with-leads", "GET");
}

/**
 * Get unassigned leads (leads without telemarketer assignment)
 */
export async function getUnassignedLeadsWithDetails(): Promise<
	BaseApiResponse<Lead[]>
> {
	return apiCall("/admin/ambassador/unassigned-leads-with-details", "GET");
}

/**
 * Get conversion rates for all ambassadors
 */
export async function getAmbassadorConversionRates(): Promise<
	BaseApiResponse<ConversionRate[]>
> {
	return apiCall("/admin/ambassador/conversion-rate", "GET");
}

/**
 * Get all ambassadors
 */
export async function getAllAmbassadors(): Promise<
	BaseApiResponse<Ambassador[]>
> {
	return apiCall("/admin/ambassador/", "GET");
}

/**
 * Get a specific ambassador by ID
 */
export async function getAmbassadorById(
	ambassadorId: string
): Promise<BaseApiResponse<any>> {
	return apiCall(`/admin/ambassador/${ambassadorId}`, "GET");
}

/**
 * Delete an ambassador
 */
export async function deleteAmbassador(
	ambassadorId: string
): Promise<BaseApiResponse<any>> {
	return apiCall(`/admin/ambassador/${ambassadorId}`, "DELETE");
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
	ambassadorId: string,
	leadId: string,
	status: string
): Promise<BaseApiResponse<any>> {
	return apiCall(
		`/admin/ambassador/${ambassadorId}/lead/${leadId}/status`,
		"PATCH",
		{ status }
	);
}

/**
 * Assign telemarketer to a lead
 */
export async function assignTelemarketerToLead(
	ambassadorId: string,
	leadId: string,
	teleMarketerId: string
): Promise<BaseApiResponse<any>> {
	return apiCall(
		`/admin/ambassador/${ambassadorId}/${leadId}/assign-telemarketer`,
		"PATCH",
		{
			teleMarketerId,
		}
	);
}

// ============================================================================
// MOBIFLEX APIs
// ============================================================================

export interface MobiflexAgent {
	mbeId: string;
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	state: string | null;
	partnerName: string;
	totalCommission: number;
	agentCommission: number;
	loanCount: number;
	averageCommissionPerLoan: number;
	createdAt: string;
}

export interface MobiflexLeaderboardData {
	leaderboard: MobiflexAgent[];
	totalAgents: number;
	period: string;
	sortBy: string;
	summary: {
		totalCommission: number;
		totalAgentCommission: number;
		totalLoans: number;
		topAgent: MobiflexAgent;
	};
}

export interface RegionStat {
	state: string;
	totalCommission: number;
	totalAgentCommission: number;
	totalPartnerCommission: number;
	commissionCount: number;
	agentCount: number;
	averageCommissionPerAgent: number;
}

export interface RegionStatsData {
	period: string;
	regionStats: RegionStat[];
	summary: {
		totalStates: number;
		grandTotalCommission: number;
		grandTotalAgentCommission: number;
		grandTotalPartnerCommission: number;
		totalCommissions: number;
		totalAgents: number;
		topPerformingState: RegionStat;
	};
}

export interface PartnerStat {
	partnerId: string;
	partnerName: string;
	totalCommission: number;
	totalAgentCommission: number;
	totalPartnerCommission: number;
	commissionCount: number;
	agentCount: number;
	stateCount: number;
	averageCommissionPerAgent: number;
}

export interface PartnerStatsData {
	period: string;
	partnerStats: PartnerStat[];
	summary: {
		totalPartners: number;
		grandTotalCommission: number;
		grandTotalAgentCommission: number;
		grandTotalPartnerCommission: number;
		totalCommissions: number;
		totalAgents: number;
		topPerformingPartner: PartnerStat;
		averageAgentsPerPartner: number;
	};
}

export interface AgentPerformanceData {
	mbeId: string;
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	state: string | null;
	partnerName: string;
	totalCommission: number;
	agentCommission: number;
	loanCount: number;
	averageCommissionPerLoan: number;
	createdAt: string;
	performanceMetrics: {
		dailyCommission: number;
		weeklyCommission: number;
		monthlyCommission: number;
		yearlyCommission: number;
		rank: number;
		percentile: number;
	};
}

export interface LeaderboardComparisonData {
	scanPartnerLeaderboard: MobiflexAgent[];
	generalLeaderboard: MobiflexAgent[];
	comparison: {
		scanPartnerAvgCommission: number;
		generalAvgCommission: number;
		scanPartnerTotalAgents: number;
		scanPartnerTopPerformer: MobiflexAgent;
		generalTopPerformer: MobiflexAgent;
		performanceGap: number;
	};
}

export interface RegionSpecificData {
	state: string;
	totalCommission: number;
	totalAgentCommission: number;
	totalPartnerCommission: number;
	commissionCount: number;
	agentCount: number;
	averageCommissionPerAgent: number;
	topAgents: MobiflexAgent[];
	partnerBreakdown: PartnerStat[];
}

export interface PartnerSpecificData {
	partnerId: string;
	partnerName: string;
	summary: {
		totalCommission: number;
		totalAgentCommission: number;
		totalPartnerCommission: number;
		totalAgents: number;
	};
	agentPerformance: Array<{
		agent: {
			firstname: string;
			lastname: string;
			phone: string;
			mbeId: string;
		};
		totalCommission: number;
		agentCommission: number;
		partnerCommission: number;
		commissionCount: number;
	}>;
}

export interface PartnerAgentStatusData {
	partnerId: string;
	partnerName: string;
	daily: {
		approved: number;
		unapproved: number;
		total: number;
		totalCount: number;
	};
	mtd: {
		approved: number;
		unapproved: number;
		total: number;
		totalCount: number;
		period: string;
	};
	scanPartner?: {
		name: string;
	};
	agents: Array<{
		mbeId: string;
		firstName: string;
		lastName: string;
		status: string;
		approvedDate?: string;
		createdAt: string;
	}>;
}

/**
 * Get Mobiflex leaderboard data with agent performance metrics
 */
export async function getMobiflexLeaderboard(
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	sortBy?: "loans" | "commission",
	limit?: number,
	options?: ApiCallOptions
): Promise<BaseApiResponse<MobiflexLeaderboardData>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);
	if (sortBy) params.append("sortBy", sortBy);
	if (limit) params.append("limit", limit.toString());

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/leaderboard/general${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Get Mobiflex regional statistics and performance data
 */
export async function getMobiflexRegionStats(
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	sortBy?: "loans" | "commission",
	limit?: number,
	options?: ApiCallOptions
): Promise<BaseApiResponse<RegionStatsData>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);
	if (sortBy) params.append("sortBy", sortBy);
	if (limit) params.append("limit", limit.toString());

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(`/admin/mbe/by-region${query}`, "GET", undefined, options);
}

/**
 * Get Mobiflex partner statistics and performance data
 */
export async function getMobiflexPartnerStats(
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	sortBy?: "loans" | "commission",
	limit?: number,
	options?: ApiCallOptions
): Promise<BaseApiResponse<PartnerStatsData>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);
	if (sortBy) params.append("sortBy", sortBy);
	if (limit) params.append("limit", limit.toString());

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/sale/scan-partner${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Get agent leaderboard for specific scan partner
 */
export async function getMobiflexScanPartnerLeaderboard(
	scanPartnerId: string,
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	sortBy?: "loans" | "commission",
	limit?: number,
	options?: ApiCallOptions
): Promise<BaseApiResponse<MobiflexLeaderboardData>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);
	if (sortBy) params.append("sortBy", sortBy);
	if (limit) params.append("limit", limit.toString());

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/leaderboard/scan-partner/${scanPartnerId}${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Get detailed agent performance metrics for a specific agent
 */
export async function getMobiflexAgentPerformance(
	mbeId: string,
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	options?: ApiCallOptions
): Promise<BaseApiResponse<AgentPerformanceData>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/performance/${mbeId}${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Compare scan partner agents with general leaderboard
 */
export async function getMobiflexLeaderboardComparison(
	scanPartnerId: string,
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	options?: ApiCallOptions
): Promise<BaseApiResponse<LeaderboardComparisonData>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/leaderboard/comparison/${scanPartnerId}${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Get sales statistics for a specific state/region
 */
export async function getMobiflexRegionStatsById(
	state: string,
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	options?: ApiCallOptions
): Promise<BaseApiResponse<RegionSpecificData>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/by-region/${state}${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Get sales statistics for a specific scan partner
 */
export async function getMobiflexScanPartnerStatsById(
	partnerId: string,
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	options?: ApiCallOptions
): Promise<BaseApiResponse<PartnerSpecificData>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/by-scan-partner/${partnerId}${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Get daily and MTD approved agents for a specific scan partner
 */
export async function getMobiflexPartnerApprovedAgents(
	partnerId: string,
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	options?: ApiCallOptions
): Promise<BaseApiResponse<PartnerAgentStatusData>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/approved-agents/${partnerId}${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Get daily and MTD unapproved agents for a specific scan partner
 */
export async function getMobiflexPartnerUnapprovedAgents(
	partnerId: string,
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	options?: ApiCallOptions
): Promise<BaseApiResponse<PartnerAgentStatusData>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/unapproved-agents/${partnerId}${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Get daily and MTD approved agents across all scan partners
 */
export async function getMobiflexAllApprovedAgents(
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	options?: ApiCallOptions
): Promise<BaseApiResponse<any>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/approved/agents/all${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Get daily and MTD unapproved agents across all scan partners
 */
export async function getMobiflexAllUnapprovedAgents(
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	options?: ApiCallOptions
): Promise<BaseApiResponse<any>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/unapproved/agents/all${query}`,
		"GET",
		undefined,
		options
	);
}

/**
 * Get daily and MTD pending agents across all scan partners
 */
export async function getMobiflexAllPendingAgents(
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	options?: ApiCallOptions
): Promise<BaseApiResponse<any>> {
	const params = new URLSearchParams();
	if (period) params.append("period", period);
	if (start_date) params.append("start_date", start_date);
	if (end_date) params.append("end_date", end_date);

	const query = params.toString() ? `?${params.toString()}` : "";
	return apiCall(
		`/admin/mbe/pending/agents/all${query}`,
		"GET",
		undefined,
		options
	);
}

// Settings/Profile interfaces
export interface AdminProfile {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	dob: string | null;
	gender: string | null;
	role: string;
	referralCode: string | null;
	telephoneNumber: string;
	profile_picture: string | null;
	accountStatus: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	accountType: string;
	companyName: string | null;
	companyAddress: string | null;
	companyState: string | null;
	companyCity: string | null;
	companyLGA: string | null;
	Admins: {
		adminid: string;
		userid: string;
		inviteStatus: string;
	};
}

export interface UpdateUserDto {
	firstName?: string;
	lastName?: string;
	email?: string;
	companyName?: string;
	companyAddress?: string;
	companyState?: string;
	companyCity?: string;
	companyLGA?: string;
	telephoneNumber?: string;
	profile_picture?: string;
}

export interface UpdatePasswordDto {
	password: string;
	confirmPassword: string;
	oldPassword: string;
}

// Validate old password by attempting login
export async function validateOldPassword(email: string, oldPassword: string) {
	try {
		await loginAdmin({ email, password: oldPassword });
		return { isValid: true };
	} catch (error: any) {
		return {
			isValid: false,
			message: error?.message || "Invalid current password",
		};
	}
}

// Update user profile function
export async function updateUserProfile(userId: string, data: UpdateUserDto) {
	return apiCall(`/admin/update/${userId}`, "PUT", data);
}

// single collection customer, Extract transaction data for a specific customer
export async function getSingleCollectionCustomerData(
	customerId: string,
	channel?: string
) {
	const query = channel ? `?channel=${channel}` : "";
	return apiCall(`/collections/customer/${customerId}${query}`, "GET");
}

//Get loan repayment(excluding down payment and card tokenization)
export async function getLoanRepaymentData(
	startDate?: string,
	endDate?: string
) {
	const query1 = startDate ? `?startDate=${startDate}` : "";
	const query2 = endDate ? `&endDate=${endDate}` : "";
	return apiCall(`/collections/loan-repayments${query1}${query2}`, "GET");
}

//Get all down Payment
export async function getDownPaymentData(startDate?: string, endDate?: string) {
	const query1 = startDate ? `?startDate=${startDate}` : "";
	const query2 = endDate ? `&endDate=${endDate}` : "";
	return apiCall(`/collections/down-payments${query1}${query2}`, "GET");
}

//Extract all transaction data across all customers
export async function getTransactionData(startDate?: string, endDate?: string) {
	const query1 = startDate ? `?startDate=${startDate}` : "";
	const query2 = endDate ? `&endDate=${endDate}` : "";
	return apiCall(`/collections/all${query1}${query2}`, "GET");
}

// SENTINEL INTEGRATION PART

export interface SentinelCustomerDevice {
	sentinelCustomerDeviceId: string;
	sentinelCustomerId: string;
	serialNumber: string;
	deviceBrand: string;
	deviceId: string;
	deviceName: string;
	devicePrice: string;
	salesStoreId: string;
	purchaseReceiptImagePublicId: string | null;
	sentinelBlockformImagePublicId: string | null;
	sentinelReceiptImagePublicId: string | null;
	createdAt: string;
	updatedAt: string;
	deviceType: string | null;
	purchaseReceiptImageUrl: string | null;
	sentinelBlockformImageUrl: string | null;
	sentinelReceiptImageUrl: string | null;
	deviceOS: string;
	paymentOption: string;
	sentinelPackage: string;
	enrolledAt: string | null;
	enrollmentStatus: string | null;
	isEnrolled: boolean;
}

export interface SentinelCustomer {
	sentinelCustomerId: string;
	createdAt: string;
	updatedAt: string;
	deviceEnrollmentId: string | null;
	deviceId: string | null;
	resendOtp: string | null;
	resendOtpExpiry: string | null;
	storeId: string | null;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	address: string;
	country: string;
	mbeId: string;
	SentinelCustomerDevice: SentinelCustomerDevice[];
}

export async function getAllSentinelCustomers(
	startDate?: string,
	endDate?: string
) {
	const query =
		startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/sentinel/sentinel-customers${query}`, "GET");
}

export async function getSentinelCustomerById(
	id: string
): Promise<BaseApiResponse<any>> {
	return apiCall(`/admin/sentinel/sentinel-customers/${id}`, "GET");
}

// =============================
// ADMIN PAYOUT ENDPOINTS
// =============================

// Types for payout API
export interface MbePayout {
	mbePayoutId: string;
	payoutId: string;
	mbeId: string;
	totalCommission: number;
	commissionCount: number;
	status: string;
	paymentProvider: string;
	accountNumber: string;
	accountName: string;
	bankCode: string;
	bankName: string;
	amount: number;
	reference: string;
	remark: string;
	tnxId: string;
	sessionId: string;
	paymentReference: string;
	channel: string;
	failureReason: string | null;
	paidAt: string;
	createdAt: string;
	updatedAt: string;
	mbe: {
		firstname: string;
		lastname: string;
		email: string;
	};
}

export interface PartnerPayout {
	partnerPayoutId: string;
	payoutId: string;
	partnerId: string;
	totalCommission: number;
	commissionCount: number;
	status: string;
	paymentProvider: string;
	accountNumber: string;
	accountName: string;
	bankCode: string;
	bankName: string;
	amount: number;
	reference: string;
	remark: string;
	tnxId: string;
	sessionId: string;
	paymentReference: string;
	channel: string;
	failureReason: string | null;
	paidAt: string;
	createdAt: string;
	updatedAt: string;
	partner: {
		firstName: string;
		lastName: string;
		email: string;
	};
}

export interface Payout {
	payoutId: string;
	payoutType: string;
	status: string;
	totalAmount: number;
	currency: string;
	payoutDate: string;
	scheduledDate: string | null;
	startPeriod: string;
	endPeriod: string;
	triggeredBy: string | null;
	metadata: {
		failedCount: number;
		processedCount: number;
	};
	createdAt: string;
	updatedAt: string;
	mbePayouts: MbePayout[];
	partnerPayouts: PartnerPayout[];
}

export interface PayoutsPagination {
	page: number;
	limit: number;
	total: number;
	pages: number;
}

export interface GetAdminPayoutsResponse {
	statusCode: number;
	statusType: string;
	message: string;
	data: {
		success: boolean;
		data: {
			payouts: Payout[];
			pagination: PayoutsPagination;
		};
		message: string;
	};
	responseTime: string;
}

// Get payout history with pagination
export async function getAdminPayouts(
	page: number = 1,
	limit: number = 20
): Promise<GetAdminPayoutsResponse> {
	return apiCall(`/payouts?page=${page}&limit=${limit}`, "GET");
}

// Get payout statistics
// Types for payout stats API
export interface PayoutStats {
	totalPayouts: number;
	totalAmount: number;
	pendingPayouts: number;
	failedPayouts: number;
	thisMonthAmount: number;
	thisWeekAmount: number;
}

export interface GetAdminPayoutStatsResponse {
	statusCode: number;
	statusType: string;
	message: string;
	data: {
		success: boolean;
		data: PayoutStats;
		message: string;
	};
	responseTime: string;
}

// Get payout statistics
export async function getAdminPayoutStats(): Promise<GetAdminPayoutStatsResponse> {
	return apiCall("/payouts/stats", "GET");
}

/**
 * Pay a single MBE (agent) commissions
 * @param {string} mbeId - Unique ID of the MBE to pay
 * @param {string} triggeredBy - User ID of the user who triggered the payout
 * @param {string} [startPeriod] - Start of date range (ISO string, optional)
 * @param {string} [endPeriod] - End of date range (ISO string, optional)
 */
export async function paySingleMbe({
	mbeId,
	triggeredBy,
	startPeriod,
	endPeriod,
}: {
	mbeId: string;
	triggeredBy?: string;
	startPeriod?: string;
	endPeriod?: string;
}) {
	return apiCall("/admin/payouts/mbe/pay", "POST", {
		mbeId,
		triggeredBy,
		...(startPeriod && { startPeriod }),
		...(endPeriod && { endPeriod }),
	});
}

/**
 * Pay a single Partner commissions
 * @param {string} partnerId - Unique ID of the Partner (User.userId) to pay
 * @param {string} triggeredBy - User ID of the user who triggered the payout
 * @param {string} [startPeriod] - Start of date range (ISO string, optional)
 * @param {string} [endPeriod] - End of date range (ISO string, optional)
 */
export async function paySinglePartner({
	partnerId,
	triggeredBy,
	startPeriod,
	endPeriod,
}: {
	partnerId: string;
	triggeredBy?: string;
	startPeriod?: string;
	endPeriod?: string;
}) {
	return apiCall("/admin/payouts/partner/pay", "POST", {
		partnerId,
		triggeredBy,
		...(startPeriod && { startPeriod }),
		...(endPeriod && { endPeriod }),
	});
}

/**
 * Bulk pay multiple MBEs (agents)
 * @param {string[]} mbeIds - List of MBE IDs to pay in bulk
 * @param {string} triggeredBy - User ID of the user who triggered the payout
 * @param {string} [startPeriod] - Start of date range (ISO string, optional)
 * @param {string} [endPeriod] - End of date range (ISO string, optional)
 */
export async function bulkPayMbes({
	mbeIds,
	triggeredBy,
	startPeriod,
	endPeriod,
}: {
	mbeIds: string[];
	triggeredBy?: string;
	startPeriod?: string;
	endPeriod?: string;
}) {
	return apiCall("/admin/payouts/mbe/bulk-pay", "POST", {
		mbeIds,
		triggeredBy,
		...(startPeriod && { startPeriod }),
		...(endPeriod && { endPeriod }),
	});
}

/**
 * Bulk pay multiple Partners
 * @param {string[]} partnerIds - List of Partner IDs (User.userId) to pay in bulk
 * @param {string} triggeredBy - User ID of the user who triggered the payout
 * @param {string} [startPeriod] - Start of date range (ISO string, optional)
 * @param {string} [endPeriod] - End of date range (ISO string, optional)
 */
export async function bulkPayPartners({
	partnerIds,
	triggeredBy,
	startPeriod,
	endPeriod,
}: {
	partnerIds: string[];
	triggeredBy?: string;
	startPeriod?: string;
	endPeriod?: string;
}) {
	return apiCall("/admin/payouts/partner/bulk-pay", "POST", {
		partnerIds,
		triggeredBy,
		...(startPeriod && { startPeriod }),
		...(endPeriod && { endPeriod }),
	});
}
// ============================================================================
// COMMISSION PAYMENT MARK/UNMARK APIs
// ============================================================================

/**
 * Mark agent commission as paid
 * @param commissionId - The commission ID
 */
export async function markAgentPaid(commissionId: string) {
	return apiCall(`/admin/mbe/mark-agent-paid/${commissionId}`, "PATCH");
}

/**
 * Mark partner commission as paid
 * @param commissionId - The commission ID
 */
export async function markPartnerPaid(commissionId: string) {
	return apiCall(`/admin/mbe/mark-partner-paid/${commissionId}`, "PATCH");
}

/**
 * Mark both agent and partner commissions as paid
 * @param commissionId - The commission ID
 */
export async function markBothPaid(commissionId: string) {
	return apiCall(`/admin/mbe/mark-both-paid/${commissionId}`, "PATCH");
}

/**
 * Unmark agent commission as paid
 * @param commissionId - The commission ID
 */
export async function unmarkAgentPaid(commissionId: string) {
	return apiCall(`/admin/mbe/unmark-agent-paid/${commissionId}`, "PATCH");
}

/**
 * Unmark partner commission as paid
 * @param commissionId - The commission ID
 */
export async function unmarkPartnerPaid(commissionId: string) {
	return apiCall(`/admin/mbe/unmark-partner-paid/${commissionId}`, "PATCH");
}

/**
 * Unmark both agent and partner commissions as paid
 * @param commissionId - The commission ID
 */
export async function unmarkBothPaid(commissionId: string) {
	return apiCall(`/admin/mbe/unmark-both-paid/${commissionId}`, "PATCH");
}

// SMS Interface and Functions
export interface SendSmsData {
	phone?: string[];
	message: string;
	customerId?: string;
	channel?: string;
}

/**
 * Send SMS to customer
 * @param smsData - The SMS data to send
 */
export async function sendSms(smsData: SendSmsData) {
	return apiCall("/admin/customers/send-sms", "POST", smsData);
}
/**
 * Get all SMS sent to a customer by customerId
 * @param customerId - The customer ID
 */
export async function getCustomerSmsById(customerId: string) {
	return apiCall(`/admin/customers/sms/${customerId}`, "GET");
}

// Payout Scheduler Interfaces and Functions
export interface CountdownData {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	totalSeconds: number;
	isOverdue: boolean;
	isPending: boolean;
	humanReadable: string;
}

export interface JobData {
	type: string;
	scheduledFor: string;
	testMode?: boolean;
	scheduledBy?: string;
	customSchedule?: boolean;
	payoutFor?: string;
	manual?: boolean;
	triggeredAt?: string;
	originalScheduleTime?: string;
}

export interface PayoutJobInfo {
	scheduled: boolean;
	description?: string;
	schedule?: string;
	executionTime?: string;
	countdown?: CountdownData;
	jobId?: string;
	data?: JobData;
	isCustomSchedule?: boolean;
	scheduledBy?: string;
	nextAvailable?: string;
}

export interface QueueStats {
	waiting: number;
	active: number;
	total: number;
}

export interface ServerInfo {
	schedulerEnabled: boolean;
	canScheduleJobs: boolean;
}

export interface JobData {
	type: string;
	scheduledFor: string;
	testMode?: boolean;
	scheduledBy?: string;
	customSchedule?: boolean;
	payoutFor?: string;
	manual?: boolean;
}

export interface PayoutStatusData {
	currentTime: string;
	currentTimeWAT: string;
	serverInfo: ServerInfo;
	test: PayoutJobInfo;
	weeklyMbe: PayoutJobInfo;
	monthlyPartner: PayoutJobInfo;
	queue: QueueStats;
	timezone: string;
}

export interface PayoutStatusResponse {
	statusCode?: number;
	statusType?: string;
	message?: string;
	responseTime?: string;
	data: PayoutStatusData;
}

export interface ScheduleCustomTestDto {
	scheduledDateTime: string;
	scheduledBy?: string;
}

export interface ScheduleCustomTestResponse {
	message: string;
	scheduledFor: string;
	scheduledForWAT: string;
	scheduledBy: string;
	hoursUntil: number;
	jobId: string;
	previousJobRemoved: boolean;
}

export interface CancelledJobInfo {
	jobId: string;
	scheduledFor: string;
	scheduledBy: string;
	wasCustom: boolean;
}

export interface NewScheduleInfo {
	type: string;
	scheduledFor: string;
	description: string;
}

export interface CancelCustomTestResponse {
	message: string;
	cancelledJob?: CancelledJobInfo;
	newSchedule: NewScheduleInfo;
}

export interface TriggerResponse {
	message: string;
}

export interface ResetScheduleInfo {
	test: string;
	weeklyMbe: string;
	monthlyPartner: string;
}

export interface ResetResponse {
	message: string;
	schedules: ResetScheduleInfo;
}

export interface SafeRestartResponse {
	message: string;
	existing: number;
	scheduled: number;
	preserved: number;
}

export interface ClearedJobsInfo {
	total: number;
	byType: Record<string, number>;
	byStatus: Record<string, number>;
}

export interface ClearAllResponse {
	message: string;
	clearedJobs: ClearedJobsInfo;
	timestamp: string;
}

/**
 * Get payout queue status with countdown timers
 */
export async function getPayoutSchedulerStatus(): Promise<PayoutStatusResponse> {
	return apiCall("/admin/payout-scheduler/status", "GET");
}

/**
 * Schedule a custom test payout
 * @param scheduleData - The schedule data for custom test payout
 */
export async function scheduleCustomTestPayout(
	scheduleData: ScheduleCustomTestDto
): Promise<ScheduleCustomTestResponse> {
	return apiCall(
		"/admin/payout-scheduler/schedule-custom-test",
		"POST",
		scheduleData
	);
}

/**
 * Cancel custom test payout and revert to default schedule
 */
export async function cancelCustomTestPayout(): Promise<CancelCustomTestResponse> {
	return apiCall("/admin/payout-scheduler/cancel-custom-test", "POST");
}

/**
 * Trigger immediate test payout
 */
export async function triggerTestPayout(): Promise<TriggerResponse> {
	return apiCall("/admin/payout-scheduler/trigger/test", "POST");
}

/**
 * Trigger immediate weekly MBE payout
 */
export async function triggerWeeklyMbePayout(): Promise<TriggerResponse> {
	return apiCall("/admin/payout-scheduler/trigger/weekly-mbe", "POST");
}

/**
 * Trigger immediate monthly partner payout
 */
export async function triggerMonthlyPartnerPayout(): Promise<TriggerResponse> {
	return apiCall("/admin/payout-scheduler/trigger/monthly-partner", "POST");
}

/**
 * Reset all payout schedules (DANGEROUS)
 */
export async function resetAllPayoutSchedules(): Promise<ResetResponse> {
	return apiCall("/admin/payout-scheduler/reset", "POST");
}

/**
 * Safe restart of payout scheduler
 */
export async function safeRestartPayoutScheduler(): Promise<SafeRestartResponse> {
	return apiCall("/admin/payout-scheduler/safe-restart", "POST");
}

/**
 * Clear all payout schedules completely (NUCLEAR OPTION)
 */
export async function clearAllPayoutSchedules(): Promise<ClearAllResponse> {
	return apiCall("/admin/payout-scheduler/clear-all", "POST");
}

//get all sms sent count

export async function getCustomerSmsTotalSent() {
	return apiCall(`/admin/analytics/sms/total-sent`, "GET");
}

//get all email sent count
export async function getCustomerEmailTotalSent() {
	return apiCall(`/resources/email-logs`, "GET");
}

// Cluster management //////////////////////////////////////////////////////////////

// create cluster supervisor

export interface createClusterSupervisor {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	clusterId: string;
	clusterName?: string;
}

export async function clusterSupervisor(createClusterSupervisor: createClusterSupervisor) {
	return apiCall(`/admin/cluster/supervisor/create`, "POST", createClusterSupervisor);
}

// create state manager

export interface createStateManager {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	stateName: string;
}

export async function stateManager(createStateManager: createStateManager) {
	return apiCall(`/admin/cluster/state-manager/create`, "POST", createStateManager);
}

// create state Supervisor

export interface createStateSupervisor {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	stateName: string;
}

export async function stateSupervisor(createStateSupervisor: createStateSupervisor) {
	return apiCall(`/admin/cluster/state-supervisor/create`, "POST", createStateSupervisor);
}


// Get all cluster supervisors

export async function getClusterSupervisors() {
	return apiCall(`/admin/cluster/supervisors`, "GET");	
}

// Get all state managers
export async function getStateManagers() {
	return apiCall(`/admin/cluster/state-managers`, "GET");
}

// Get all state supervisors
export async function getStateSupervisors() {
	return apiCall(`/admin/cluster/state-supervisors`, "GET");
}


// Assign cluster supervisor to a cluster

export async function assignClusterSupervisorToCluster(userId: string) {
	return apiCall(`/admin/cluster/assign-supervisor/${userId}`, "PUT");
}

// get all cluster for assignment

export async function getClustersForAssignment() {
	return apiCall(`/admin/cluster/clusters`, "GET");
}




