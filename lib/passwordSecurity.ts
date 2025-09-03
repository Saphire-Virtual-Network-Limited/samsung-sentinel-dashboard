/**
 * Password Security Utilities
 * Manages default password detection and enforcement
 */

import { loginAdmin } from "@/lib";
import { showToast } from "@/lib";

const INSECURE_PASSWORD = "Password123!";
const PASSWORD_STATUS_COOKIE = "password_security_status";
const COOKIE_EXPIRY_DAYS = 1;

export enum PasswordStatus {
	SECURE = "secure",
	INSECURE = "insecure",
	UNKNOWN = "unknown",
}

/**
 * Set password security status cookie
 */
export function setPasswordSecurityStatus(status: PasswordStatus): void {
	if (typeof document === "undefined") return;

	const expiryDate = new Date();
	expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

	document.cookie = `${PASSWORD_STATUS_COOKIE}=${status}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict; Secure`;
}

/**
 * Get password security status from cookie
 */
export function getPasswordSecurityStatus(): PasswordStatus {
	if (typeof document === "undefined") return PasswordStatus.UNKNOWN;

	const cookies = document.cookie.split(";");
	const cookie = cookies.find((c) =>
		c.trim().startsWith(`${PASSWORD_STATUS_COOKIE}=`)
	);

	if (!cookie) return PasswordStatus.UNKNOWN;

	const status = cookie.split("=")[1].trim() as PasswordStatus;
	return Object.values(PasswordStatus).includes(status)
		? status
		: PasswordStatus.UNKNOWN;
}

/**
 * Clear password security status cookie
 */
export function clearPasswordSecurityStatus(): void {
	if (typeof document === "undefined") return;

	document.cookie = `${PASSWORD_STATUS_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Check if user is using the default insecure password
 */
export async function checkDefaultPassword(email: string): Promise<boolean> {
	try {
		await loginAdmin({ email, password: INSECURE_PASSWORD });
		return true; // Login successful = using default password
	} catch (error: any) {
		// Login failed - either not using default password or other error
		if (error?.response?.status === 401) {
			return false; // Unauthorized = not using default password
		}
		// For other errors, assume secure to avoid blocking legitimate users
		return false;
	}
}

/**
 * Validate if a password is the insecure default
 */
export function isDefaultPassword(password: string): boolean {
	return password === INSECURE_PASSWORD;
}

/**
 * Force redirect to settings for password change
 */
export function redirectToPasswordChange(): void {
	if (typeof window === "undefined") return;

	const currentPath = window.location.pathname;
	if (currentPath !== "/access/settings") {
		showToast({
			type: "warning",
			message: "You must change your password for security reasons.",
			duration: 5000,
		});
		window.location.href = "/access/settings";
	}
}

/**
 * Check if current route should be exempt from password enforcement
 */
export function isExemptRoute(pathname: string): boolean {
	const exemptRoutes = [
		"/auth/login",
		"/auth/logout",
		"/access/settings",
		"/auth/forget-password",
		"/verify-code",
		"/invite",
	];

	return exemptRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Handle password change completion
 */
export function onPasswordChanged(newPassword: string): void {
	const status = isDefaultPassword(newPassword)
		? PasswordStatus.INSECURE
		: PasswordStatus.SECURE;
	setPasswordSecurityStatus(status);

	if (status === PasswordStatus.SECURE) {
		showToast({
			type: "success",
			message:
				"Password updated successfully.",
			duration: 3000,
		});
	}
}
