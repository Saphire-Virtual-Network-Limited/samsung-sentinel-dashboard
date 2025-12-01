import axios, { AxiosError } from "axios";
import { cachedApiCall, generateCacheKey } from "../../cache";
import {
	getPasswordSecurityStatus,
	PasswordStatus,
	redirectToPasswordChange,
	isExemptRoute,
} from "../../passwordSecurity";
import { ApiCallOptions } from "./types";
import {
	getAccessToken,
	getRefreshToken,
	saveTokens,
	clearAuthData,
	isTokenExpired,
} from "./tokenManager";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const appkey = process.env.NEXT_PUBLIC_APP_KEY;

// Check if CORS bypass is enabled
const USE_CORS_BYPASS = process.env.NEXT_PUBLIC_USE_CORS_BYPASS === "true";
const PROXY_PATH = "/api/proxy";

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Add subscriber to wait for token refresh
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
	refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers when token is refreshed
 */
function onTokenRefreshed(token: string) {
	refreshSubscribers.forEach((callback) => callback(token));
	refreshSubscribers = [];
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
	const refreshToken = getRefreshToken();

	if (!refreshToken) {
		console.error("No refresh token available");
		return null;
	}

	try {
		const response = await axios.post(
			`${apiUrl}/auth/refresh`,
			{ refresh_token: refreshToken },
			{
				headers: {
					"Content-Type": "application/json",
					"x-app-key": appkey,
				},
			}
		);

		// Response structure: { access_token, refresh_token, token_type, expires_in }
		const {
			access_token,
			refresh_token: newRefreshToken,
			expires_in,
		} = response.data;

		// Save the new tokens with expiration
		saveTokens(access_token, newRefreshToken, expires_in || 86400);

		return access_token;
	} catch (error) {
		console.error("Failed to refresh token:", error);
		// Clear auth data and redirect to login
		clearAuthData();

		if (
			typeof window !== "undefined" &&
			!window.location.pathname.startsWith("/auth/login")
		) {
			const currentPath = window.location.pathname;
			window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(
				currentPath
			)}`;
		}

		return null;
	}
}

// Add axios response interceptor for automatic token refresh on 401
axios.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as any;

		// Check if it's a 401 error and we haven't already tried to refresh
		if (error?.response?.status === 401 && !originalRequest._retry) {
			// Skip refresh for login and refresh endpoints
			if (
				originalRequest.url?.includes("/auth/login") ||
				originalRequest.url?.includes("/auth/refresh")
			) {
				clearAuthData();

				if (
					typeof window !== "undefined" &&
					!window.location.pathname.startsWith("/auth/login")
				) {
					const currentPath = window.location.pathname;
					window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(
						currentPath
					)}`;
				}

				return Promise.reject(error);
			}

			if (isRefreshing) {
				// If already refreshing, wait for the new token
				return new Promise((resolve) => {
					subscribeTokenRefresh((token: string) => {
						originalRequest.headers["Authorization"] = `Bearer ${token}`;
						resolve(axios(originalRequest));
					});
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const newAccessToken = await refreshAccessToken();

				if (newAccessToken) {
					isRefreshing = false;
					onTokenRefreshed(newAccessToken);

					// Retry the original request with new token
					originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
					return axios(originalRequest);
				}
			} catch (refreshError) {
				isRefreshing = false;
				clearAuthData();

				if (
					typeof window !== "undefined" &&
					!window.location.pathname.startsWith("/auth/login")
				) {
					const currentPath = window.location.pathname;
					window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(
						currentPath
					)}`;
				}

				return Promise.reject(refreshError);
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
		// Proactively refresh token if it's about to expire (client-side only)
		// Skip refresh for auth endpoints to avoid infinite loops
		if (typeof window !== "undefined") {
			const isAuthEndpoint =
				endpoint.includes("/auth/login") ||
				endpoint.includes("/auth/refresh") ||
				endpoint.includes("/auth/register") ||
				endpoint.includes("/auth/set-password") ||
				endpoint.includes("/auth/verify-invitation");

			if (!isAuthEndpoint && isTokenExpired(300)) {
				// Token expired or will expire in 5 minutes
				console.log("Token is expired or expiring soon, refreshing...");

				if (!isRefreshing) {
					isRefreshing = true;
					try {
						const newAccessToken = await refreshAccessToken();
						isRefreshing = false;

						if (newAccessToken) {
							onTokenRefreshed(newAccessToken);
							console.log("Token refreshed successfully");
						} else {
							console.error("Failed to refresh token proactively");
						}
					} catch (error) {
						isRefreshing = false;
						console.error("Error during proactive token refresh:", error);
					}
				} else {
					// Wait for ongoing refresh to complete
					await new Promise<void>((resolve) => {
						subscribeTokenRefresh(() => resolve());
					});
				}
			}
		}

		// Check password security before making API calls (client-side only)
		if (typeof window !== "undefined") {
			const currentPath = window.location.pathname;
			const passwordStatus = getPasswordSecurityStatus();

			// Skip password check for auth routes, settings, and login endpoint
			const isLoginEndpoint = endpoint.includes("/auth/login");
			const isProfileEndpoint = endpoint.includes("/users/me");
			const isPasswordChangeEndpoint = endpoint.includes("/change-password");

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
			"x-app-key": options?.appKey || appkey,
		};

		// Add Authorization header if access token exists
		if (typeof window !== "undefined") {
			const accessToken = getAccessToken();
			if (accessToken) {
				headers["Authorization"] = `Bearer ${accessToken}`;
			}

			// Add refresh token header
			const refreshToken = getRefreshToken();
			if (refreshToken) {
				headers["X-Refresh-Token"] = refreshToken;
			}

			// Add Sapphire product header
			const sapphireProduct = localStorage.getItem("Sapphire-Credit-Product");
			if (sapphireProduct) {
				headers["Sapphire-Credit-Product"] = sapphireProduct;
			}
		}

		const config: any = {
			method,
			url:
				USE_CORS_BYPASS && typeof window !== "undefined"
					? `${PROXY_PATH}${endpoint}` // Use proxy route
					: `${apiUrl}${endpoint}`, // Direct API call
			headers,
			withCredentials: !USE_CORS_BYPASS, // Don't send credentials to proxy
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
