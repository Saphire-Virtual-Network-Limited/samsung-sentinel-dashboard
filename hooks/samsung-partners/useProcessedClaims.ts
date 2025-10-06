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

// Comprehensive processed claims dummy data
const generateProcessedClaimsData = (
	paymentStatus?: string
): ProcessedClaim[] => {
	const allClaims: ProcessedClaim[] = [
		// Paid Claims
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
			dateApproved: "2024-09-15T16:30:00Z",
			dateCompleted: "2024-09-18T11:20:00Z",
			paymentStatus: "paid",
			paymentDate: "2024-09-20T10:15:00Z",
			paymentReference: "PAY-2024-001",
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
			dateApproved: "2024-09-12T10:15:00Z",
			dateCompleted: "2024-09-15T14:45:00Z",
			paymentStatus: "paid",
			paymentDate: "2024-09-16T09:30:00Z",
			paymentReference: "PAY-2024-002",
		},
		{
			id: "PC003",
			imei: "345678901234567",
			customerName: "Carol Davis",
			customerPhone: "+234806789012",
			serviceCenter: "Samsung Service Enugu",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy S22 Ultra",
			faultType: "Screen Replacement",
			repairCost: 85000,
			dateApproved: "2024-09-10T08:20:00Z",
			dateCompleted: "2024-09-14T16:30:00Z",
			paymentStatus: "paid",
			paymentDate: "2024-09-15T11:45:00Z",
			paymentReference: "PAY-2024-003",
		},
		{
			id: "PC004",
			imei: "456789012345678",
			customerName: "Daniel Moore",
			customerPhone: "+234807890123",
			serviceCenter: "Samsung Service Kaduna",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A73",
			faultType: "Battery Replacement",
			repairCost: 35000,
			dateApproved: "2024-09-08T13:10:00Z",
			dateCompleted: "2024-09-12T10:25:00Z",
			paymentStatus: "paid",
			paymentDate: "2024-09-13T14:20:00Z",
			paymentReference: "PAY-2024-004",
		},

		// Unpaid Claims
		{
			id: "PC005",
			imei: "567890123456789",
			customerName: "Eva Thompson",
			customerPhone: "+234808901234",
			serviceCenter: "Samsung Service Benin",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A34",
			faultType: "Speaker Repair",
			repairCost: 22000,
			dateApproved: "2024-09-20T11:15:00Z",
			dateCompleted: "2024-09-25T15:40:00Z",
			paymentStatus: "unpaid",
		},
		{
			id: "PC006",
			imei: "678901234567890",
			customerName: "Frank Miller",
			customerPhone: "+234809012345",
			serviceCenter: "Samsung Service Jos",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy S21",
			faultType: "Performance Issues",
			repairCost: 40000,
			dateApproved: "2024-09-18T09:30:00Z",
			dateCompleted: "2024-09-22T12:15:00Z",
			paymentStatus: "unpaid",
		},
		{
			id: "PC007",
			imei: "789012345678901",
			customerName: "Grace Adams",
			customerPhone: "+234810123456",
			serviceCenter: "Samsung Service Warri",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy Note 20",
			faultType: "Network Issues",
			repairCost: 55000,
			dateApproved: "2024-09-16T14:25:00Z",
			dateCompleted: "2024-09-20T11:50:00Z",
			paymentStatus: "unpaid",
		},
		{
			id: "PC008",
			imei: "890123456789012",
			customerName: "Henry Clark",
			customerPhone: "+234811234567",
			serviceCenter: "Samsung Service Calabar",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A14",
			faultType: "Button Repair",
			repairCost: 18000,
			dateApproved: "2024-09-14T16:40:00Z",
			dateCompleted: "2024-09-18T09:20:00Z",
			paymentStatus: "unpaid",
		},
	];

	// Filter by payment status if provided
	if (paymentStatus && paymentStatus !== "all") {
		return allClaims.filter((claim) => claim.paymentStatus === paymentStatus);
	}

	return allClaims;
};

export const useProcessedClaims = (options: UseProcessedClaimsOptions = {}) => {
	const {
		paymentStatus = "all",
		search = "",
		dateRange,
		page = 1,
		limit = 10,
	} = options;

	// For demo purposes, return filtered dummy data
	let filteredData = generateProcessedClaimsData(paymentStatus);

	// Filter by search if provided
	if (search) {
		const searchTerm = search.toLowerCase();
		filteredData = filteredData.filter(
			(claim) =>
				claim.customerName.toLowerCase().includes(searchTerm) ||
				claim.imei.includes(searchTerm) ||
				claim.deviceModel.toLowerCase().includes(searchTerm) ||
				claim.faultType.toLowerCase().includes(searchTerm) ||
				claim.serviceCenter.toLowerCase().includes(searchTerm)
		);
	}

	return {
		claims: filteredData,
		isLoading: false,
		error: null,
		mutate: () => {},
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
