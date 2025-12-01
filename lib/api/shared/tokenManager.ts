// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

import Cookies from "js-cookie";

const TOKEN_KEYS = {
	ACCESS_TOKEN: "SamsungSentinelAccessToken",
	REFRESH_TOKEN: "SamsungSentinelRefreshToken",
	USER: "SamsungSentinelUser",
	TOKEN_EXPIRY: "SamsungSentinelTokenExpiry",
} as const;

// Cookie options for security
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
	expires: 7, // 7 days
	secure: process.env.NODE_ENV === "production", // HTTPS only in production
	sameSite: "strict",
	path: "/",
};

/**
 * Save authentication tokens to cookies
 * @param accessToken - The JWT access token
 * @param refreshToken - The JWT refresh token
 * @param expiresIn - Token expiration time in seconds (default: 86400 = 24 hours)
 */
export function saveTokens(
	accessToken: string,
	refreshToken: string,
	expiresIn: number = 86400
): void {
	try {
		// Calculate expiration timestamp (current time + expiresIn seconds)
		const expiryTimestamp = Date.now() + expiresIn * 1000;

		Cookies.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken, COOKIE_OPTIONS);
		Cookies.set(TOKEN_KEYS.REFRESH_TOKEN, refreshToken, COOKIE_OPTIONS);
		Cookies.set(
			TOKEN_KEYS.TOKEN_EXPIRY,
			expiryTimestamp.toString(),
			COOKIE_OPTIONS
		);
	} catch (error) {
		console.error("Failed to save tokens:", error);
	}
}

/**
 * Get access token from cookies
 */
export function getAccessToken(): string | undefined {
	try {
		return Cookies.get(TOKEN_KEYS.ACCESS_TOKEN);
	} catch (error) {
		console.error("Failed to get access token:", error);
		return undefined;
	}
}

/**
 * Get refresh token from cookies
 */
export function getRefreshToken(): string | undefined {
	try {
		return Cookies.get(TOKEN_KEYS.REFRESH_TOKEN);
	} catch (error) {
		console.error("Failed to get refresh token:", error);
		return undefined;
	}
}

/**
 * Save user data to cookies
 */
export function saveUser(user: any): void {
	try {
		Cookies.set(TOKEN_KEYS.USER, JSON.stringify(user), COOKIE_OPTIONS);
	} catch (error) {
		console.error("Failed to save user:", error);
	}
}

/**
 * Get user data from cookies
 */
export function getUser(): any | null {
	try {
		const user = Cookies.get(TOKEN_KEYS.USER);
		return user ? JSON.parse(user) : null;
	} catch (error) {
		console.error("Failed to get user:", error);
		return null;
	}
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
	try {
		// Remove authentication cookies
		Cookies.remove(TOKEN_KEYS.ACCESS_TOKEN, { path: "/" });
		Cookies.remove(TOKEN_KEYS.REFRESH_TOKEN, { path: "/" });
		Cookies.remove(TOKEN_KEYS.USER, { path: "/" });
		Cookies.remove(TOKEN_KEYS.TOKEN_EXPIRY, { path: "/" });

		// Clear legacy localStorage keys (for migration)
		if (typeof window !== "undefined") {
			localStorage.removeItem("user");
			localStorage.removeItem("selectedProduct");
			localStorage.removeItem("Sapphire-Credit-Product");
			localStorage.removeItem("Sapphire-Credit-Product-Name");
			localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
			localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
			localStorage.removeItem(TOKEN_KEYS.USER);

			// Clear session storage
			sessionStorage.clear();
		}

		// Clear all other cookies
		clearAllCookies();
	} catch (error) {
		console.error("Failed to clear auth data:", error);
	}
}

/**
 * Clear all authentication cookies using js-cookie
 */
function clearAllCookies(): void {
	try {
		const allCookies = Cookies.get();
		Object.keys(allCookies).forEach((cookieName) => {
			Cookies.remove(cookieName, { path: "/" });
			// Try removing with different domain variations
			if (typeof window !== "undefined") {
				Cookies.remove(cookieName, {
					path: "/",
					domain: window.location.hostname,
				});
				Cookies.remove(cookieName, {
					path: "/",
					domain: `.${window.location.hostname}`,
				});
			}
		});
	} catch (error) {
		console.error("Failed to clear all cookies:", error);
	}
}

/**
 * Check if user is authenticated (has valid tokens)
 */
export function isAuthenticated(): boolean {
	return !!getAccessToken() && !!getRefreshToken();
}

/**
 * Get token expiration timestamp from cookies
 */
export function getTokenExpiry(): number | null {
	try {
		const expiry = Cookies.get(TOKEN_KEYS.TOKEN_EXPIRY);
		return expiry ? parseInt(expiry, 10) : null;
	} catch (error) {
		console.error("Failed to get token expiry:", error);
		return null;
	}
}

/**
 * Check if the access token is expired or will expire soon
 * @param bufferSeconds - Number of seconds before actual expiry to consider token as expired (default: 300 = 5 minutes)
 * @returns true if token is expired or will expire within buffer time
 */
export function isTokenExpired(bufferSeconds: number = 300): boolean {
	const expiry = getTokenExpiry();
	if (!expiry) return true;

	const now = Date.now();
	const bufferMs = bufferSeconds * 1000;

	return now >= expiry - bufferMs;
}

/**
 * Get remaining time until token expiry in seconds
 * @returns Remaining seconds, or 0 if expired/not found
 */
export function getTokenRemainingTime(): number {
	const expiry = getTokenExpiry();
	if (!expiry) return 0;

	const now = Date.now();
	const remainingMs = expiry - now;

	return remainingMs > 0 ? Math.floor(remainingMs / 1000) : 0;
}
