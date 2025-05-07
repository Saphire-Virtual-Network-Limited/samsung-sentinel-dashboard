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

		// Define axios request options
		const config: any = {
			method,
			url: `${apiUrl}${endpoint}`,
			headers,
			withCredentials: true, // This ensures cookies are included in cross-origin requests
		};

		// Only add body if the method is not GET or HEAD
		if (method !== "GET" && method !== "HEAD" && body) {
			if (body instanceof FormData) {
				// Allow browser to set Content-Type when using FormData
				delete headers["Content-Type"];
				config.data = body;
			} else {
				headers["Content-Type"] = "application/json";
				config.data = JSON.stringify(body);
			}
		}

		// Apply caching and revalidation strategies for GET requests
		if (method === "GET") {
			if (options?.cache) {
				config.cache = options.cache;
			}
			if (options?.revalidate !== undefined) {
				config.revalidate = options.revalidate; // This is a Next.js-specific thing, but we can't replicate it in axios directly
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
