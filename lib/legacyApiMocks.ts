/**
 * Legacy API Mock Functions
 *
 * These are temporary mock implementations for legacy API functions
 * that have been removed but are still referenced in some components.
 *
 * TODO: Replace these with proper API implementations when endpoints are available.
 */

/**
 * Mock: Accept admin invite
 * @deprecated Use new API endpoint when available
 */
export async function acceptAdminInvite(data: any): Promise<any> {
	console.warn("acceptAdminInvite is deprecated - returning mock success");
	return {
		success: true,
		message: "Admin invite functionality not implemented",
	};
}

/**
 * Mock: Get all loan data
 * @deprecated Use new API endpoint when available
 */
export async function getAllLoanData(): Promise<any[]> {
	console.warn("getAllLoanData is deprecated - returning empty array");
	return [];
}

/**
 * Mock: Get all devices data
 * @deprecated Use new API endpoint when available
 */
export async function getAllDevicesData(): Promise<any[]> {
	console.warn("getAllDevicesData is deprecated - returning empty array");
	return [];
}

/**
 * Mock: Update user profile
 * @deprecated Use updateMyProfile from @/lib/api/users instead
 */
export async function updateUserProfile(data: any): Promise<any> {
	console.warn(
		"updateUserProfile is deprecated - use updateMyProfile from @/lib/api/users"
	);
	return {
		success: true,
		message: "Profile update functionality - use new API",
	};
}

/**
 * Mock: Validate old password
 * @deprecated Use new API endpoint when available
 */
export async function validateOldPassword(password: string): Promise<boolean> {
	console.warn("validateOldPassword is deprecated - returning true");
	return true;
}

/**
 * Mock: Update admin password
 * @deprecated Use changeMyPassword from @/lib/api/users instead
 */
export async function updateAdminPassword(data: {
	oldPassword: string;
	newPassword: string;
}): Promise<any> {
	console.warn(
		"updateAdminPassword is deprecated - use changeMyPassword from @/lib/api/users"
	);
	return {
		success: true,
		message: "Password update functionality - use new API",
	};
}

/**
 * Mock: Get collection analytics with filter
 * @deprecated Use new API endpoint when available
 */
/**
 * Mock: Get collection analytics with filter
 * @deprecated Use new API endpoint when available
 */
export async function getCollectionAnalyticwithFilter(
	startDate?: string,
	endDate?: string
): Promise<any> {
	console.warn(
		"getCollectionAnalyticwithFilter is deprecated - returning empty object"
	);
	return {
		total: 0,
		collected: 0,
		pending: 0,
		analytics: [],
	};
}

/**
 * Mock: Create CDF loan product
 * @deprecated Use new API endpoint when available
 */
export async function createCDFLoanProduct(data: any): Promise<any> {
	console.warn("createCDFLoanProduct is deprecated - returning mock success");
	return {
		success: true,
		message: "Loan product creation not implemented",
	};
}

/**
 * Mock: Get drop-off report
 * @deprecated Use new API endpoint when available
 */
export async function getDropOffReport(): Promise<any[]> {
	console.warn("getDropOffReport is deprecated - returning empty array");
	return [];
}

/**
 * Mock: Get inception report
 * @deprecated Use new API endpoint when available
 */
export async function getInceptionReport(): Promise<any[]> {
	console.warn("getInceptionReport is deprecated - returning empty array");
	return [];
}

/**
 * Mock: Search global customer
 * @deprecated Use new API endpoint when available
 */
export async function searchGlobalCustomer(query: string): Promise<any[]> {
	console.warn("searchGlobalCustomer is deprecated - returning empty array");
	return [];
}

/**
 * Mock: Get device dashboard analytics
 * @deprecated Use new API endpoint when available
 */
export async function getDeviceDashAnalytic(): Promise<any> {
	console.warn("getDeviceDashAnalytic is deprecated - returning empty object");
	return {
		totalDevices: 0,
		activeDevices: 0,
		inactiveDevices: 0,
		pendingDevices: 0,
	};
}

/**
 * Mock: Get inception collection report
 * @deprecated Use new API endpoint when available
 */
export async function getInceptionCollectionReport(): Promise<any[]> {
	console.warn(
		"getInceptionCollectionReport is deprecated - returning empty array"
	);
	return [];
}

/**
 * Mock: Get customer SMS by ID
 * @deprecated Use new API endpoint when available
 */
export async function getCustomerSmsById(id: string): Promise<any[]> {
	console.warn("getCustomerSmsById is deprecated - returning empty array");
	return [];
}

/**
 * Mock: Get customer SMS total sent
 * @deprecated Use new API endpoint when available
 */
export async function getCustomerSmsTotalSent(): Promise<any> {
	console.warn(
		"getCustomerSmsTotalSent is deprecated - returning empty object"
	);
	return {
		total: 0,
		sent: 0,
		failed: 0,
		pending: 0,
	};
}

/**
 * Mock: Send SMS data interface
 */
export interface SendSmsData {
	phoneNumber: string;
	message: string;
	customerId?: string;
}

/**
 * Mock: Send SMS
 * @deprecated Use new API endpoint when available
 */
export async function sendSms(data: SendSmsData): Promise<any> {
	console.warn("sendSms is deprecated - returning mock success");
	return {
		success: true,
		message: "SMS functionality not implemented",
		data: null,
	};
}
