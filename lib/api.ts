import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface ApiCallOptions {
	cache?: RequestCache;
	revalidate?: number;
	appKey?: string;
}

async function apiCall(endpoint: string, method: string, body?: any, options?: ApiCallOptions) {
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

		// If Unauthorized, clear session and redirect to login
		if (status === 401 && typeof window !== "undefined") {
			// Clear any stored product key
			localStorage.removeItem("Sapphire-Credit-Product");
			// Redirect user to admin login
			window.location.href = "/auth/login";
			// Return a never‑resolving promise to stop further execution
			return new Promise(() => {});
		}

		const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";
		console.log(`Error in ${method} ${endpoint}:`, errorMessage);
		throw new Error(errorMessage);
	}
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
	const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/loan/data${query}`, "GET");
}

//get all loan record
export async function getAllLoanRecord(startDate?: string, endDate?: string) {
	const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/loan/record${query}`, "GET");
}

//** Devices */

export async function getAllDevicesData(startDate?: string, endDate?: string) {
	const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/device/data${query}`, "GET");
}

//** Reports Drop offs */

export async function getDropOffsData(startDate?: string, endDate?: string) {
	const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
	return apiCall(`/admin/drop-off/data${query}`, "GET");
}

