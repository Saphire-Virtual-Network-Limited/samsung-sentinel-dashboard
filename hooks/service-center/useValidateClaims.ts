import useSWR from "swr";

export interface ValidationResult {
	isValid: boolean;
	customerName?: string;
	previousClaims?: {
		count: number;
		lastClaimDate: string;
		registrationDate: string;
		insuranceExpiry: string;
		canMakeClaim: boolean;
		remainingClaims: number;
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
	await new Promise(resolve => setTimeout(resolve, 1500));
	
	// Mock validation logic
	if (imei === "123456789012345") {
		return {
			isValid: true,
			customerName: "John Doe",
			previousClaims: {
				count: 2,
				lastClaimDate: "2024-01-15",
				registrationDate: "2023-06-15",
				insuranceExpiry: "2024-06-15",
				canMakeClaim: true,
				remainingClaims: 3,
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
			previousClaims: {
				count: 0,
				lastClaimDate: "",
				registrationDate: "2024-01-01",
				insuranceExpiry: "2025-01-01",
				canMakeClaim: true,
				remainingClaims: 5,
			},
		};
	}
};

// Mock claim submission
const submitClaim = async (claimData: ClaimFormData): Promise<{ success: boolean; claimId?: string; error?: string }> => {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 2000));
	
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