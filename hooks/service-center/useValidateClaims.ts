import useSWR from "swr";

export interface ValidationResult {
	isValid: boolean;
	customerName?: string;
	deviceModel?: string;
	deviceBrand?: string;
	previousClaims?: {
		count: number;
		lastClaimDate: string;
		registrationDate: string;
		insuranceExpiry: string;
		canMakeClaim: boolean;
		remainingClaims: number;
		claimHistory?: Array<{
			id: string;
			issue: string;
			claimDate: string;
			repairCost: number;
			status: string;
		}>;
	};
	error?: string;
}

export interface ClaimFormData {
	imei: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	deviceBrand: string;
	deviceModel: string;
	devicePrice: string;
	faultType: string;
	repairCost: string;
	description: string;
}

// Mock validation fetcher
const validateIMEI = async (imei: string): Promise<ValidationResult> => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1500));

	// Mock validation logic
	if (imei === "123456789012345") {
		return {
			isValid: true,
			customerName: "John Doe",
			deviceModel: "Galaxy S23 Ultra",
			deviceBrand: "Samsung",
			previousClaims: {
				count: 2,
				lastClaimDate: "2024-09-15",
				registrationDate: "2023-10-10",
				insuranceExpiry: "2025-10-10",
				canMakeClaim: true,
				remainingClaims: 3,
				claimHistory: [
					{
						id: "SC001",
						issue: "Screen Replacement",
						claimDate: "2024-09-15",
						repairCost: 45000,
						status: "Completed",
					},
					{
						id: "SC002",
						issue: "Battery Replacement",
						claimDate: "2024-06-20",
						repairCost: 25000,
						status: "Completed",
					},
				],
			},
		};
	} else if (imei === "999999999999999") {
		return {
			isValid: false,
			error: "Device not found in system",
		};
	} else {
		return {
			isValid: true,
			customerName: "Jane Smith",
			deviceModel: "iPhone 15 Pro Max",
			deviceBrand: "Apple",
			previousClaims: {
				count: 0,
				lastClaimDate: "",
				registrationDate: "2024-08-01",
				insuranceExpiry: "2026-08-01",
				canMakeClaim: true,
				remainingClaims: 5,
				claimHistory: [],
			},
		};
	}
};

// Mock claim submission
const submitClaim = async (
	claimData: ClaimFormData
): Promise<{ success: boolean; claimId?: string; error?: string }> => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// Mock success response
	return {
		success: true,
		claimId: `SC${Date.now()}`,
	};
};

export const useValidateClaims = () => {
	const validateImei = async (imei: string) => {
		return await validateIMEI(imei);
	};

	const submitClaimForm = async (claimData: ClaimFormData) => {
		return await submitClaim(claimData);
	};

	return {
		validateImei,
		submitClaimForm,
	};
};
