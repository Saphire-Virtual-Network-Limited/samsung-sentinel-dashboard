import useSWR from "swr";

interface ProcessedClaim {
	id: string;
	imei: string;
	customerName: string;
	customerPhone: string;
	serviceCenter: string;
	deviceBrand: string;
	deviceModel: string;
	faultType: string;
	repairCost: number;
	dateApproved: string;
	dateCompleted?: string;
	paymentStatus: "paid" | "unpaid";
	paymentDate?: string;
	paymentReference?: string;
}

interface UseProcessedClaimsOptions {
	paymentStatus?: "all" | "paid" | "unpaid";
	search?: string;
	dateRange?: { start: string; end: string };
	page?: number;
	limit?: number;
}

const fetcher = (url: string) => {
	// Mock data for now - replace with actual API call
	const mockData: ProcessedClaim[] = [
		{
			id: "PC001",
			imei: "123456789012345",
			customerName: "Alice Brown",
			customerPhone: "+234804567890",
			serviceCenter: "Samsung Service Port Harcourt",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A54",
			faultType: "Camera Malfunction",
			repairCost: 65000,
			dateApproved: "2024-01-10T16:30:00Z",
			dateCompleted: "2024-01-12T11:20:00Z",
			paymentStatus: "unpaid",
		},
		{
			id: "PC002",
			imei: "234567890123456",
			customerName: "Bob Wilson",
			customerPhone: "+234805678901",
			serviceCenter: "Samsung Service Ibadan",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy S23",
			faultType: "Charging Port",
			repairCost: 25000,
			dateApproved: "2024-01-08T10:15:00Z",
			dateCompleted: "2024-01-09T14:45:00Z",
			paymentStatus: "paid",
			paymentDate: "2024-01-10T09:30:00Z",
			paymentReference: "PAY001",
		},
	];

	return Promise.resolve(mockData);
};

export const useProcessedClaims = (options: UseProcessedClaimsOptions = {}) => {
	const {
		paymentStatus = "all",
		search = "",
		dateRange,
		page = 1,
		limit = 10,
	} = options;

	const queryParams = new URLSearchParams({
		paymentStatus,
		search,
		page: page.toString(),
		limit: limit.toString(),
		...(dateRange && {
			startDate: dateRange.start,
			endDate: dateRange.end,
		}),
	});

	const { data, error, mutate, isLoading } = useSWR(
		`/api/samsung-partners/processed-claims?${queryParams.toString()}`,
		fetcher
	);

	return {
		claims: data || [],
		isLoading,
		error,
		mutate,
	};
};

export const useProcessedClaimActions = () => {
	const authorizePayment = async (claimIds: string[]) => {
		// API call to authorize payment for selected claims
		return Promise.resolve();
	};

	const generatePaymentReport = async (claimIds: string[]) => {
		// API call to generate payment report
		return Promise.resolve();
	};

	return {
		authorizePayment,
		generatePaymentReport,
	};
};
