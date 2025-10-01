import useSWR from "swr";

interface RepairClaim {
	id: string;
	imei: string;
	customerName: string;
	customerPhone: string;
	customerEmail?: string;
	customerAddress?: string;
	serviceCenter: string;
	serviceCenterPhone?: string;
	serviceCenterAddress?: string;
	deviceBrand: string;
	deviceModel: string;
	devicePrice?: number;
	faultType: string;
	faultDescription?: string;
	repairCost: number;
	dateSubmitted: string;
	dateUpdated?: string;
	status: "pending" | "approved" | "rejected";
	deviceStatus: string;
	engineer?: string;
	engineerPhone?: string;
	estimatedCompletionDate?: string;
	warrantyStartDate?: string;
	warrantyEndDate?: string;
	previousClaims?: any[];
	documents?: any[];
	activityLog?: any[];
}

interface UseRepairClaimsOptions {
	status?: "all" | "pending" | "approved" | "rejected";
	search?: string;
	dateRange?: { start: string; end: string };
	page?: number;
	limit?: number;
}

const fetcher = (url: string) => {
	// Mock data for now - replace with actual API call
	const mockData: RepairClaim[] = [
		{
			id: "RC001",
			imei: "123456789012345",
			customerName: "John Doe",
			customerPhone: "+234801234567",
			serviceCenter: "Samsung Service Lagos",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A24",
			faultType: "Broken Screen",
			repairCost: 45000,
			dateSubmitted: "2024-01-15T10:30:00Z",
			status: "pending",
			deviceStatus: "Under Repair",
		},
		{
			id: "RC002",
			imei: "234567890123456",
			customerName: "Jane Smith",
			customerPhone: "+234802345678",
			serviceCenter: "Samsung Service Abuja",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy S22",
			faultType: "Battery Issue",
			repairCost: 35000,
			dateSubmitted: "2024-01-14T14:20:00Z",
			status: "approved",
			deviceStatus: "Completed",
		},
		{
			id: "RC003",
			imei: "345678901234567",
			customerName: "Mike Johnson",
			customerPhone: "+234803456789",
			serviceCenter: "Samsung Service Kano",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy Note 20",
			faultType: "Water Damage",
			repairCost: 85000,
			dateSubmitted: "2024-01-13T09:45:00Z",
			status: "rejected",
			deviceStatus: "Cannot Repair",
		},
	];

	return Promise.resolve(mockData);
};

export const useRepairClaims = (options: UseRepairClaimsOptions = {}) => {
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
			startDate: dateRange.start,
			endDate: dateRange.end,
		}),
	});

	const { data, error, mutate, isLoading } = useSWR(
		`/api/samsung-partners/repair-claims?${queryParams.toString()}`,
		fetcher
	);

	return {
		claims: data || [],
		isLoading,
		error,
		mutate,
	};
};

const singleClaimFetcher = (url: string): RepairClaim => {
	// Extract claim ID from URL and find the matching claim
	const claimId = url.split("/").pop();
	const mockData: RepairClaim[] = [
		{
			id: "RC001",
			imei: "123456789012345",
			customerName: "John Doe",
			customerPhone: "+234801234567",
			serviceCenter: "Samsung Service Lagos",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A24",
			faultType: "Broken Screen",
			repairCost: 45000,
			dateSubmitted: "2024-01-15T10:30:00Z",
			status: "pending",
			deviceStatus: "Under Repair",
		},
		{
			id: "RC002",
			imei: "234567890123456",
			customerName: "Jane Smith",
			customerPhone: "+234802345678",
			serviceCenter: "Samsung Service Abuja",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy S22",
			faultType: "Water Damage",
			repairCost: 75000,
			dateSubmitted: "2024-01-16T14:45:00Z",
			status: "approved",
			deviceStatus: "Ready for Collection",
		},
	];

	const claim = mockData.find((c) => c.id === claimId);
	if (!claim) {
		throw new Error(`Claim with ID ${claimId} not found`);
	}
	return claim;
};

export const useRepairClaim = (claimId: string) => {
	const { data, error, mutate, isLoading } = useSWR(
		claimId ? `/api/samsung-partners/repair-claims/${claimId}` : null,
		singleClaimFetcher
	);

	return {
		claim: data,
		isLoading,
		error,
		mutate,
	};
};

export const useRepairClaimActions = () => {
	const approveClaim = async (claimId: string) => {
		// API call to approve claim
		return Promise.resolve();
	};

	const rejectClaim = async (claimId: string, reason: string) => {
		// API call to reject claim
		return Promise.resolve();
	};

	const bulkApproveClaims = async (claimIds: string[]) => {
		// API call to bulk approve claims
		return Promise.resolve();
	};

	return {
		approveClaim,
		rejectClaim,
		bulkApproveClaims,
	};
};
