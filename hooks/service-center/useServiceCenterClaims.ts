import useSWR from "swr";

interface ServiceCenterClaim {
	id: string;
	imei: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	deviceBrand: string;
	deviceModel: string;
	faultType: string;
	faultDescription: string;
	dateSubmitted: string;
	status:
		| "submitted"
		| "in-progress"
		| "waiting-parts"
		| "repair-completed"
		| "ready-pickup"
		| "completed"
		| "cancelled";
	engineer?: string;
	estimatedCompletionDate?: string;
}

interface UseServiceCenterClaimsOptions {
	status?: string;
	search?: string;
	dateRange?: { from: string; to: string };
	page?: number;
	limit?: number;
}

const fetcher = (url: string) => {
	// Mock data for now - replace with actual API call
	const mockData: ServiceCenterClaim[] = [
		{
			id: "SC001",
			imei: "123456789012345",
			customerName: "Jane Smith",
			customerPhone: "+234802345678",
			customerEmail: "jane.smith@email.com",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy S22",
			faultType: "Battery Drain",
			faultDescription: "Device battery drains quickly even when not in use.",
			dateSubmitted: "2024-01-18T09:15:00Z",
			status: "in-progress",
			engineer: "Eng. Sarah Johnson",
			estimatedCompletionDate: "2024-01-25T00:00:00Z",
		},
		{
			id: "SC002",
			imei: "234567890123456",
			customerName: "Mike Johnson",
			customerPhone: "+234803456789",
			customerEmail: "mike.johnson@email.com",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A54",
			faultType: "Screen Flickering",
			faultDescription:
				"Screen flickers intermittently, especially in bright conditions.",
			dateSubmitted: "2024-01-17T14:30:00Z",
			status: "waiting-parts",
			engineer: "Eng. David Okafor",
			estimatedCompletionDate: "2024-01-30T00:00:00Z",
		},
	];

	return Promise.resolve(mockData);
};

export const useServiceCenterClaims = (
	options: UseServiceCenterClaimsOptions = {}
) => {
	const {
		status = "all",
		search = "",
		dateRange,
		page = 1,
		limit = 10,
	} = options;

	const queryParams = new URLSearchParams({
		status,
		search,
		page: page.toString(),
		limit: limit.toString(),
		...(dateRange && {
			startDate: dateRange.from,
			endDate: dateRange.to,
		}),
	});

	const { data, error, mutate, isLoading } = useSWR(
		`/api/service-center/claims?${queryParams.toString()}`,
		fetcher
	);

	return {
		claims: data || [],
		isLoading,
		error,
		mutate,
	};
};

export const useServiceCenterClaim = (claimId: string) => {
	const { data, error, mutate, isLoading } = useSWR(
		claimId ? `/api/service-center/claims/${claimId}` : null,
		fetcher
	);

	return {
		claim: data,
		isLoading,
		error,
		mutate,
	};
};

export const useServiceCenterClaimActions = () => {
	const updateClaimStatus = async (
		claimId: string,
		status: string,
		notes?: string
	) => {
		// API call to update claim status
		return Promise.resolve();
	};

	const uploadDocument = async (claimId: string, file: File) => {
		// API call to upload document
		return Promise.resolve();
	};

	const validateIMEI = async (imei: string) => {
		// API call to validate IMEI
		return Promise.resolve({
			isValid: true,
			deviceInfo: {
				brand: "Samsung",
				model: "Galaxy S22",
				warrantyStatus: "Active",
				warrantyEndDate: "2025-08-20",
			},
		});
	};

	const submitClaim = async (claimData: any) => {
		// API call to submit new claim
		return Promise.resolve();
	};

	return {
		updateClaimStatus,
		uploadDocument,
		validateIMEI,
		submitClaim,
	};
};
