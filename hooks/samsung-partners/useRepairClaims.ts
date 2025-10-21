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
	rejectionReason?: string;
	deviceImages?: string[];
	documents?: Array<{
		name: string;
		type: string;
		url: string;
	}>;
	engineer?: string;
	engineerPhone?: string;
	estimatedCompletionDate?: string;
	warrantyStartDate?: string;
	warrantyEndDate?: string;
	previousClaims?: any[];
	activityLog?: any[];
}

interface UseRepairClaimsOptions {
	status?: "all" | "pending" | "approved" | "rejected";
	search?: string;
	dateRange?: { start: string; end: string };
	page?: number;
	limit?: number;
}

// Comprehensive dummy data for Samsung Partners
const generateRepairClaimsData = (status?: string): RepairClaim[] => {
	const allClaims: RepairClaim[] = [
		// Pending Claims
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
			dateSubmitted: "2024-10-01T10:30:00Z",
			status: "pending",
			deviceStatus: "Under Review",
			deviceImages: [
				"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600",
				"https://images.unsplash.com/photo-1607057234456-242c6a613b3a?w=800&h=600",
			],
			documents: [
				{
					name: "Purchase Receipt",
					type: "pdf",
					url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
				},
				{
					name: "Device Warranty",
					type: "image",
					url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600",
				},
			],
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
			dateSubmitted: "2024-09-30T14:20:00Z",
			status: "pending",
			deviceStatus: "Awaiting Parts",
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
			dateSubmitted: "2024-09-29T09:45:00Z",
			status: "pending",
			deviceStatus: "Under Diagnosis",
		},
		{
			id: "RC004",
			imei: "456789012345678",
			customerName: "Sarah Wilson",
			customerPhone: "+234804567890",
			serviceCenter: "Samsung Service Port Harcourt",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A34",
			faultType: "Camera Malfunction",
			repairCost: 28000,
			dateSubmitted: "2024-09-28T16:15:00Z",
			status: "pending",
			deviceStatus: "Quality Check",
		},

		// Approved Claims
		{
			id: "RC005",
			imei: "567890123456789",
			customerName: "David Brown",
			customerPhone: "+234805678901",
			serviceCenter: "Samsung Service Ibadan",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy S21",
			faultType: "Charging Port",
			repairCost: 22000,
			dateSubmitted: "2024-09-25T08:45:00Z",
			status: "approved",
			deviceStatus: "Repair Approved",
			deviceImages: [
				"https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=600",
				"https://images.unsplash.com/photo-1607057234456-242c6a613b3a?w=800&h=600",
				"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600",
			],
			documents: [
				{
					name: "Approval Letter",
					type: "pdf",
					url: "https://www.africau.edu/images/default/sample.pdf",
				},
				{
					name: "Technical Assessment",
					type: "pdf",
					url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
				},
			],
		},
		{
			id: "RC006",
			imei: "678901234567890",
			customerName: "Lisa Anderson",
			customerPhone: "+234806789012",
			serviceCenter: "Samsung Service Enugu",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A54",
			faultType: "Speaker Issue",
			repairCost: 18000,
			dateSubmitted: "2024-09-24T13:30:00Z",
			status: "approved",
			deviceStatus: "Parts Ordered",
		},
		{
			id: "RC007",
			imei: "789012345678901",
			customerName: "Robert Taylor",
			customerPhone: "+234807890123",
			serviceCenter: "Samsung Service Kaduna",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy S23",
			faultType: "Display Issue",
			repairCost: 55000,
			dateSubmitted: "2024-09-23T11:20:00Z",
			status: "approved",
			deviceStatus: "Ready for Repair",
		},
		{
			id: "RC008",
			imei: "890123456789012",
			customerName: "Emily Davis",
			customerPhone: "+234808901234",
			serviceCenter: "Samsung Service Benin",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A73",
			faultType: "Performance Issues",
			repairCost: 32000,
			dateSubmitted: "2024-09-22T15:45:00Z",
			status: "approved",
			deviceStatus: "Approved for Service",
		},

		// Rejected Claims
		{
			id: "RC009",
			imei: "901234567890123",
			customerName: "Chris Miller",
			customerPhone: "+234809012345",
			serviceCenter: "Samsung Service Jos",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy S20",
			faultType: "Physical Damage",
			repairCost: 95000,
			dateSubmitted: "2024-09-20T12:10:00Z",
			status: "rejected",
			deviceStatus: "Beyond Repair",
			rejectionReason:
				"Severe physical damage exceeds repair coverage. Device motherboard compromised.",
		},
		{
			id: "RC010",
			imei: "012345678901234",
			customerName: "Amanda White",
			customerPhone: "+234810123456",
			serviceCenter: "Samsung Service Warri",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A14",
			faultType: "Software Issue",
			repairCost: 15000,
			dateSubmitted: "2024-09-19T09:25:00Z",
			status: "rejected",
			deviceStatus: "Warranty Void",
			rejectionReason:
				"Device shows evidence of unauthorized software modification. Warranty voided.",
		},
		{
			id: "RC011",
			imei: "123450987654321",
			customerName: "Kevin Garcia",
			customerPhone: "+234811234567",
			serviceCenter: "Samsung Service Calabar",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy Note 10",
			faultType: "Liquid Damage",
			repairCost: 70000,
			dateSubmitted: "2024-09-18T14:50:00Z",
			status: "rejected",
			deviceStatus: "Corrosion Detected",
			rejectionReason:
				"Extensive liquid damage with corrosion. Not economically repairable.",
		},

		// Additional rejected claims for demo
		{
			id: "RC012",
			imei: "234561098765432",
			customerName: "Rachel Green",
			customerPhone: "+234812345678",
			serviceCenter: "Samsung Service Owerri",
			deviceBrand: "Samsung",
			deviceModel: "Galaxy A33",
			faultType: "Network Issues",
			repairCost: 25000,
			dateSubmitted: "2024-09-17T11:35:00Z",
			status: "rejected",
			deviceStatus: "User Damage",
			rejectionReason:
				"Network connectivity issues due to user tampering with device settings and hardware modifications.",
		},
	];

	// Filter by status if provided
	if (status && status !== "all") {
		return allClaims.filter((claim) => claim.status === status);
	}

	return allClaims;
};

const fetcher = (url: string) => {
	return Promise.resolve(generateRepairClaimsData());
};

export const useRepairClaims = (options: UseRepairClaimsOptions = {}) => {
	const {
		status = "all",
		search = "",
		dateRange,
		page = 1,
		limit = 10,
	} = options;

	// For demo purposes, return filtered dummy data
	let filteredData = generateRepairClaimsData(status);

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
