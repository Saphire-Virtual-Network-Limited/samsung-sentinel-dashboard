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

		// Safely access localStorage only in the browser
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
		const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";
		console.log(`Error in ${method} ${endpoint}:`, errorMessage);
		throw new Error(errorMessage);
	}
}

// *** Auth *** //

// admin login
export interface adminLogin {
	email: string;
	password: string;
}

export async function loginAdmin(adminLogin: adminLogin) {
	return apiCall("/admin/login", "POST", adminLogin);
}

// get user profile
export async function getAdminProfile() {
	return apiCall("/admin/profile", "GET");
}

// logout
export async function logoutAdmin() {
	return apiCall("/admin/logout", "POST");
}

// get all products
export async function getAllProducts() {
	return apiCall("/admin/products", "GET");
}

//** Loans */

// get all loans
export async function getAllLoans(startDate?: string, endDate?: string) {
	return apiCall(`/admin/loan/data?startDate=${startDate}&endDate=${endDate}`, "GET");
}

// get all devices
export async function getAllDevices(startDate?: string, endDate?: string) {
	return apiCall(`/admin/device/data?startDate=${startDate}&endDate=${endDate}`, "GET");
}

// get all loan records
export async function getAllLoanRecords(startDate?: string, endDate?: string) {
	return apiCall(`/admin/loan/record?startDate=${startDate}&endDate=${endDate}`, "GET");
}
