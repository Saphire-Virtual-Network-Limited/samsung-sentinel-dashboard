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

export async function getAllDueLoanRecord(
  fromDate?: string,
  toDate?: string
) {
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
    `/agent/erp/admin/item-balances/${mbeId}`,
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
  }: {
    status: "APPROVED" | "REJECTED" | any;
    mbeId: string;
    guarantorId: string;
  },
  options?: ApiCallOptions
) {
  return apiCall(
    `/admin/mbe/verify-guarantors`,
    "POST",
    { status, mbeId, guarantorId },
    options
  );
}

export async function exportAllAgentDetails(options?: ApiCallOptions) {
  return apiCall(`/agent/export/all-details`, "GET", undefined, options);
}

export async function deleteAgentDetails(data: any, options?: ApiCallOptions) {
  return apiCall(`/admin/mbe/delete-agent`, "POST", data, options);
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
  return apiCall(
    `/admin/customers/create-customer-wallet`,
    "POST",
    { customerId }
  );
}

// ============================================================================
// DEVICE lOCKING AND UNLOCKING
// ============================================================================


export async function lockDevice(imei?: string) {
  return apiCall(`/admin/locks/activate/single`, "POST", { imei });
}

export async function unlockDevice(imei?: string) {
  return apiCall(`/admin/locks/unlock/single-bulk`, "POST", { imei });
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
    formData.append('deviceImage', createDevice.deviceImage);
  }
  
  // Add all other fields
  Object.keys(createDevice).forEach(key => {
    if (key !== 'deviceImage' && createDevice[key as keyof createDevice] !== undefined) {
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

export async function updateDevice(deviceId: string, updateDevice: updateDevice) {
  const formData = new FormData();
  
  // Add file if it exists
  if (updateDevice.deviceImage) {
    formData.append('deviceImage', updateDevice.deviceImage);
  }
  
  // Add all other fields
  Object.keys(updateDevice).forEach(key => {
    if (key !== 'deviceImage' && updateDevice[key as keyof updateDevice] !== undefined) {
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
export async function updateDeviceImeiNumber(deviceOnLoanId: string, imei: string) {
  return apiCall(`/admin/device/imei/${deviceOnLoanId}`, "PUT", {imei}); 
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
export async function updateAdminPassword(password: string, confirmPassword: string) {
  return apiCall(`/admin/update-password`, "POST", { password, confirmPassword }); 
}

//update admin password  for only dev
export async function updateAdminPasswordForDev(adminId: string, password: string, confirmPassword: string) {
  return apiCall(`/admin/dev/update-password`, "POST", { adminId, password, confirmPassword }); 
}

//Get mbe with customer which is use to submit transaction to relay
export async function getMBEWithCustomerForRelay(mbe_old_id: string) {
  return apiCall(`/admin/customers/mbes-with-customers?mbe_old_id=${mbe_old_id}`, "GET"); 
}

// assign customer to mbe
export async function assignCustomersToMBE(customerId: string, mbeId: string) {
  return apiCall(`/admin/customers/assign-mbe?customerId=${customerId}&mbeId=${mbeId}`, "POST"); 
}





