import axios from "axios";
import { cachedApiCall, generateCacheKey } from "./cache";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
	{ mbeId }: { mbeId: string },
	options?: ApiCallOptions
) {
	return apiCall(
		`/admin/mbe/item-balances/${mbeId}`,
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
	period?: "daily" | "weekly" | "monthly" | "yearly",
	mbeId?: string
) {
	const queryParams = new URLSearchParams();
	if (period) queryParams.append("period", period);
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

export async function deleteCustomer(customerId: string) {
	return apiCall(`/admin/customers/delete-customer/${customerId}`, "DELETE");
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
	return apiCall(`/admin/customers/create-customer-wallet`, "POST", {
		customerId,
	});
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

export async function releaseDevice(imei?: string) {
	return apiCall("/admin/device/release", "POST", { imei });
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

	// Add all other fields
	Object.keys(createDevice).forEach((key) => {
		if (
			key !== "deviceImage" &&
			createDevice[key as keyof createDevice] !== undefined
		) {
			formData.append(key, String(createDevice[key as keyof createDevice]));
		}
	});

	return apiCall("/admin/device/create", "POST", formData);
}

// Update Device

export interface updateDevice {
	deviceBrand: string;
	deviceModel: string;
	price: number;
	currency: string;
	deviceImage?: File; // File object for FormData
	deviceModelNumber: string;
	back_camera: string;
	battery: string;
	color: string;
	data_storage: string;
	display: string;
	front_camera: string;
	memory: string;
	network: string;
	os: string;
	other_features: string;
	processor_cpu: string;
	sentinel_cover: string;
	sap: number;
	screen_size: string;
	sld: number;
	deviceType: string;
	case_colors: string;
	windows_version: string;
	isActive: boolean;
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

	return apiCall(`/admin/device/update/${deviceId}`, "PATCH", formData);
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
	period?: "daily" | "weekly" | "monthly" | "yearly",
	options?: ApiCallOptions
): Promise<BaseApiResponse<MobiflexLeaderboardData>> {
	const query = period ? `?period=${period}` : "";
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
	period?: "daily" | "weekly" | "monthly" | "yearly",
	options?: ApiCallOptions
): Promise<BaseApiResponse<RegionStatsData>> {
	const query = period ? `?period=${period}` : "";
	return apiCall(`/admin/mbe/by-region${query}`, "GET", undefined, options);
}

/**
 * Get Mobiflex partner statistics and performance data
 */
export async function getMobiflexPartnerStats(
	period?: "daily" | "weekly" | "monthly" | "yearly",
	options?: ApiCallOptions
): Promise<BaseApiResponse<PartnerStatsData>> {
	const query = period ? `?period=${period}` : "";
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
	period?: "daily" | "weekly" | "monthly" | "yearly",
	options?: ApiCallOptions
): Promise<BaseApiResponse<MobiflexLeaderboardData>> {
	const query = period ? `?period=${period}` : "";
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
	period?: "daily" | "weekly" | "monthly" | "yearly",
	options?: ApiCallOptions
): Promise<BaseApiResponse<AgentPerformanceData>> {
	const query = period ? `?period=${period}` : "";
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
	period?: "daily" | "weekly" | "monthly" | "yearly",
	options?: ApiCallOptions
): Promise<BaseApiResponse<LeaderboardComparisonData>> {
	const query = period ? `?period=${period}` : "";
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
	period?: "daily" | "weekly" | "monthly" | "yearly",
	options?: ApiCallOptions
): Promise<BaseApiResponse<RegionSpecificData>> {
	const query = period ? `?period=${period}` : "";
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
	period?: "daily" | "weekly" | "monthly" | "yearly",
	options?: ApiCallOptions
): Promise<BaseApiResponse<PartnerSpecificData>> {
	const query = period ? `?period=${period}` : "";
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
	options?: ApiCallOptions
): Promise<BaseApiResponse<PartnerAgentStatusData>> {
	return apiCall(
		`/admin/mbe/approved-agents/${partnerId}`,
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

/**
 * Get daily and MTD unapproved agents for a specific scan partner
 */
export async function getMobiflexPartnerUnapprovedAgents(
	partnerId: string,
	options?: ApiCallOptions
): Promise<BaseApiResponse<PartnerAgentStatusData>> {
	return apiCall(
		`/admin/mbe/unapproved-agents/${partnerId}`,
		"GET",
		undefined,
		options
	);
}
