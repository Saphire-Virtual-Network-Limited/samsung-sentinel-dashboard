import axios from "axios";
import { cachedApiCall, generateCacheKey } from "../../cache";
import {
	getPasswordSecurityStatus,
	PasswordStatus,
	redirectToPasswordChange,
	isExemptRoute,
} from "../../passwordSecurity";
import { ApiCallOptions } from "./types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const appkey = process.env.NEXT_PUBLIC_APP_KEY;

// Function to clear all authentication cookies
const clearAllCookies = () => {
	if (typeof document === "undefined") return;

	const cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i];
		const eqPos = cookie.indexOf("=");
		const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

		// Clear the cookie for all possible paths and domains
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
	}
};

// Add axios response interceptor for global 401 handling
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		// Check if it's a 401 error
		if (error?.response?.status === 401 && typeof window !== "undefined") {
			// Clear all authentication data
			clearAllCookies();

			if (typeof localStorage !== "undefined") {
				localStorage.removeItem("user");
				localStorage.removeItem("selectedProduct");
				localStorage.removeItem("Sapphire-Credit-Product");
				localStorage.removeItem("Sapphire-Credit-Product-Name");
			}

			if (typeof sessionStorage !== "undefined") {
				sessionStorage.clear();
			}

			// Redirect to login if not already there
			if (!window.location.pathname.startsWith("/auth/login")) {
				const currentPath = window.location.pathname;
				window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(
					currentPath
				)}`;
			}
		}

		return Promise.reject(error);
	}
);

export async function apiCall(
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
export async function cachedApiCallWrapper<T>(
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
