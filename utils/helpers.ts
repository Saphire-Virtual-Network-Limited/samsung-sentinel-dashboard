export function capitalize(s: string) {
	return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const getSelectedProduct = (): {
	value: string | null;
	label: string | null;
} => {
	if (typeof window === "undefined") return { value: null, label: null };

	const value = localStorage.getItem("Sapphire-Credit-Product");
	const label = localStorage.getItem("Sapphire-Credit-Product-Name");

	return { value, label };
};

/**
 * Normalize Nigerian phone numbers to E.164 format (+234XXXXXXXXXX)
 * Handles various input formats:
 * - 0901234567 -> +2349012345678
 * - 901234567 -> +2349012345678
 * - 2349012345678 -> +2349012345678
 * - +2349012345678 -> +2349012345678
 * - 08012345678 -> +2348012345678
 *
 * @param phoneNumber - The phone number to normalize
 * @returns Normalized phone number with +234 country code, or original if invalid
 */
export function normalizePhoneNumber(
	phoneNumber: string | undefined | null
): string {
	if (!phoneNumber) return "";

	// Remove all non-digit characters except leading +
	let cleaned = phoneNumber.trim().replace(/[\s\-()]/g, "");

	// If it starts with +234, ensure it's properly formatted
	if (cleaned.startsWith("+234")) {
		const remaining = cleaned.substring(4).replace(/\D/g, "");
		// Should have exactly 10 digits after +234
		if (remaining.length === 10) {
			return `+234${remaining}`;
		}
		return phoneNumber; // Return original if invalid
	}

	// If it starts with 234 (without +), add the +
	if (cleaned.startsWith("234")) {
		const remaining = cleaned.substring(3).replace(/\D/g, "");
		if (remaining.length === 10) {
			return `+234${remaining}`;
		}
		return phoneNumber;
	}

	// Remove any non-digits for local format processing
	const digits = cleaned.replace(/\D/g, "");

	// If it starts with 0, remove it and add +234
	if (digits.startsWith("0") && digits.length === 11) {
		return `+234${digits.substring(1)}`;
	}

	// If it's 10 digits (no leading 0), add +234
	if (digits.length === 10) {
		return `+234${digits}`;
	}

	// Return original if we can't normalize it
	return phoneNumber;
}
