import useSWR from "swr";
import { apiCall } from "@/lib/api";

export interface ServiceCenterClaim {
	id: string;
	claimId: string;
	customerName: string;
	phoneNumber: string;
	email?: string;
	imei: string;
	brand: string;
	model: string;
	deviceName: string;
	storage: string;
	color: string;
	faultType: string;
	faultDescription: string;
	repairCost: number;
	commission: number;
	serviceCenterName: string;
	status: "pending" | "approved" | "rejected" | "completed";
	rejectionReason?: string;
	deviceImages?: string[];
	documents?: Array<{
		name: string;
		type: string;
		url: string;
	}>;
	createdAt: string;
	approvedAt?: string;
	rejectedAt?: string;
	completedAt?: string;
	paymentStatus: "paid" | "unpaid";
	paidAmount: number;
	paymentDate?: string;
	paymentReceipt?: string;
}

interface UseServiceCenterClaimsOptions {
	status?: string;
	search?: string;
	dateRange?: { from: string; to: string };
	limit?: number;
	page?: number;
}

// Dummy data for demo purposes
const generateDummyData = (status?: string): ServiceCenterClaim[] => {
	const allClaims: ServiceCenterClaim[] = [
		// Pending Claims
		{
			id: "SC001",
			claimId: "SC-2024-001",
			customerName: "John Doe",
			phoneNumber: "+234801234567",
			email: "john.doe@email.com",
			imei: "123456789012345",
			brand: "Samsung",
			model: "Galaxy A54",
			deviceName: "Samsung Galaxy A54",
			storage: "128GB",
			color: "Awesome Blue",
			faultType: "Screen Damage",
			faultDescription:
				"Cracked screen after accidental drop. Touch functionality affected.",
			repairCost: 45000,
			commission: 4500,
			serviceCenterName: "TechFix Lagos",
			status: "pending",
			createdAt: "2024-10-01T09:30:00Z",
			paymentStatus: "unpaid",
			paidAmount: 0,
			deviceImages: [
				"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600",
				"https://images.unsplash.com/photo-1607057234456-242c6a613b3a?w=800&h=600",
				"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600",
			],
			documents: [
				{
					name: "Purchase Receipt",
					type: "pdf",
					url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
				},
				{
					name: "ID Card Copy",
					type: "image",
					url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600",
				},
				{
					name: "Warranty Certificate",
					type: "pdf",
					url: "https://www.africau.edu/images/default/sample.pdf",
				},
			],
		},
		{
			id: "SC002",
			claimId: "SC-2024-002",
			customerName: "Jane Smith",
			phoneNumber: "+234802345678",
			email: "jane.smith@email.com",
			imei: "234567890123456",
			brand: "Samsung",
			model: "Galaxy S22",
			deviceName: "Samsung Galaxy S22",
			storage: "256GB",
			color: "Phantom Black",
			faultType: "Battery Issue",
			faultDescription:
				"Battery drains very quickly, phone shuts down unexpectedly.",
			repairCost: 35000,
			commission: 3500,
			serviceCenterName: "Mobile Repair Partner",
			status: "pending",
			createdAt: "2024-09-28T14:15:00Z",
			paymentStatus: "unpaid",
			paidAmount: 0,
			deviceImages: [
				"https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=600",
				"https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600",
			],
			documents: [
				{
					name: "Purchase Invoice",
					type: "pdf",
					url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
				},
				{
					name: "Device Information",
					type: "image",
					url: "https://images.unsplash.com/photo-1611786476775-0a18e52e2d4e?w=800&h=600",
				},
			],
		},
		{
			id: "SC003",
			claimId: "SC-2024-003",
			customerName: "Mike Johnson",
			phoneNumber: "+234803456789",
			email: "mike.johnson@email.com",
			imei: "345678901234567",
			brand: "Samsung",
			model: "Galaxy Note 20",
			deviceName: "Samsung Galaxy Note 20",
			storage: "256GB",
			color: "Mystic Bronze",
			faultType: "Water Damage",
			faultDescription: "Device exposed to water, not turning on.",
			repairCost: 65000,
			commission: 6500,
			serviceCenterName: "Quick Fix Solutions",
			status: "pending",
			createdAt: "2024-09-30T11:45:00Z",
			paymentStatus: "unpaid",
			paidAmount: 0,
		},

		// Approved Claims
		{
			id: "SC004",
			claimId: "SC-2024-004",
			customerName: "Sarah Wilson",
			phoneNumber: "+234804567890",
			email: "sarah.wilson@email.com",
			imei: "456789012345678",
			brand: "Samsung",
			model: "Galaxy A34",
			deviceName: "Samsung Galaxy A34",
			storage: "128GB",
			color: "Awesome Violet",
			faultType: "Camera Malfunction",
			faultDescription: "Rear camera not working, shows black screen.",
			repairCost: 25000,
			commission: 2500,
			serviceCenterName: "Digital Repair Hub",
			status: "approved",
			createdAt: "2024-09-25T10:20:00Z",
			approvedAt: "2024-09-26T15:30:00Z",
			paymentStatus: "unpaid",
			paidAmount: 0,
			deviceImages: [
				"https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600",
				"https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=600",
			],
			documents: [
				{
					name: "Repair Authorization",
					type: "pdf",
					url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
				},
				{
					name: "Camera Test Results",
					type: "image",
					url: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&h=600",
				},
			],
		},
		{
			id: "SC005",
			claimId: "SC-2024-005",
			customerName: "David Brown",
			phoneNumber: "+234805678901",
			email: "david.brown@email.com",
			imei: "567890123456789",
			brand: "Samsung",
			model: "Galaxy S21",
			deviceName: "Samsung Galaxy S21",
			storage: "128GB",
			color: "Phantom Gray",
			faultType: "Charging Port",
			faultDescription: "Charging port loose, intermittent charging.",
			repairCost: 20000,
			commission: 2000,
			serviceCenterName: "Pro Mobile Services",
			status: "approved",
			createdAt: "2024-09-24T08:45:00Z",
			approvedAt: "2024-09-25T12:00:00Z",
			paymentStatus: "unpaid",
			paidAmount: 0,
		},
		{
			id: "SC006",
			claimId: "SC-2024-006",
			customerName: "Lisa Anderson",
			phoneNumber: "+234806789012",
			email: "lisa.anderson@email.com",
			imei: "678901234567890",
			brand: "Samsung",
			model: "Galaxy A24",
			deviceName: "Samsung Galaxy A24",
			storage: "128GB",
			color: "Awesome Black",
			faultType: "Speaker Issue",
			faultDescription:
				"No sound from speakers, audio through headphones only.",
			repairCost: 18000,
			commission: 1800,
			serviceCenterName: "Expert Phone Repair",
			status: "approved",
			createdAt: "2024-09-23T16:30:00Z",
			approvedAt: "2024-09-24T09:15:00Z",
			paymentStatus: "unpaid",
			paidAmount: 0,
		},

		// Rejected Claims
		{
			id: "SC007",
			claimId: "SC-2024-007",
			customerName: "Robert Taylor",
			phoneNumber: "+234807890123",
			email: "robert.taylor@email.com",
			imei: "789012345678901",
			brand: "Samsung",
			model: "Galaxy S20",
			deviceName: "Samsung Galaxy S20",
			storage: "128GB",
			color: "Cloud Blue",
			faultType: "Physical Damage",
			faultDescription: "Severe physical damage from impact.",
			repairCost: 80000,
			commission: 8000,
			serviceCenterName: "City Mobile Repair",
			status: "rejected",
			rejectionReason:
				"Damage beyond repair coverage limits. Cost exceeds device value.",
			createdAt: "2024-09-20T13:20:00Z",
			rejectedAt: "2024-09-21T10:45:00Z",
			paymentStatus: "unpaid",
			paidAmount: 0,
		},
		{
			id: "SC008",
			claimId: "SC-2024-008",
			customerName: "Emily Davis",
			phoneNumber: "+234808901234",
			email: "emily.davis@email.com",
			imei: "890123456789012",
			brand: "Samsung",
			model: "Galaxy A14",
			deviceName: "Samsung Galaxy A14",
			storage: "64GB",
			color: "Light Green",
			faultType: "Software Issue",
			faultDescription: "Phone keeps restarting, boot loop issue.",
			repairCost: 15000,
			commission: 1500,
			serviceCenterName: "Smart Tech Repairs",
			status: "rejected",
			rejectionReason:
				"Issue appears to be user-induced software modification. Not covered under warranty.",
			createdAt: "2024-09-19T11:10:00Z",
			rejectedAt: "2024-09-20T14:30:00Z",
			paymentStatus: "unpaid",
			paidAmount: 0,
		},

		// Completed Claims
		{
			id: "SC009",
			claimId: "SC-2024-009",
			customerName: "Chris Miller",
			phoneNumber: "+234809012345",
			email: "chris.miller@email.com",
			imei: "901234567890123",
			brand: "Samsung",
			model: "Galaxy S23",
			deviceName: "Samsung Galaxy S23",
			storage: "256GB",
			color: "Phantom Black",
			faultType: "Screen Replacement",
			faultDescription: "Screen cracked, touch not responsive in some areas.",
			repairCost: 55000,
			commission: 5500,
			serviceCenterName: "Premier Mobile Solutions",
			status: "completed",
			createdAt: "2024-09-15T10:00:00Z",
			approvedAt: "2024-09-16T09:30:00Z",
			completedAt: "2024-09-18T16:45:00Z",
			paymentStatus: "paid",
			paidAmount: 55000,
			paymentDate: "2024-09-19T10:20:00Z",
			deviceImages: [
				"https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=600",
				"https://images.unsplash.com/photo-1607057234456-242c6a613b3a?w=800&h=600",
				"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600",
			],
			documents: [
				{
					name: "Completed Repair Report",
					type: "pdf",
					url: "https://www.africau.edu/images/default/sample.pdf",
				},
				{
					name: "Quality Check Certificate",
					type: "pdf",
					url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
				},
				{
					name: "Payment Receipt",
					type: "image",
					url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600",
				},
			],
		},
		{
			id: "SC010",
			claimId: "SC-2024-010",
			customerName: "Amanda White",
			phoneNumber: "+234810123456",
			email: "amanda.white@email.com",
			imei: "012345678901234",
			brand: "Samsung",
			model: "Galaxy A53",
			deviceName: "Samsung Galaxy A53",
			storage: "128GB",
			color: "Awesome White",
			faultType: "Button Malfunction",
			faultDescription: "Power button stuck, volume buttons not responsive.",
			repairCost: 22000,
			commission: 2200,
			serviceCenterName: "Reliable Phone Fixes",
			status: "completed",
			createdAt: "2024-09-12T14:25:00Z",
			approvedAt: "2024-09-13T11:15:00Z",
			completedAt: "2024-09-15T09:30:00Z",
			paymentStatus: "paid",
			paidAmount: 22000,
			paymentDate: "2024-09-16T08:45:00Z",
		},
		{
			id: "SC011",
			claimId: "SC-2024-011",
			customerName: "Kevin Garcia",
			phoneNumber: "+234811234567",
			email: "kevin.garcia@email.com",
			imei: "123450987654321",
			brand: "Samsung",
			model: "Galaxy A73",
			deviceName: "Samsung Galaxy A73",
			storage: "256GB",
			color: "Awesome Mint",
			faultType: "Network Issues",
			faultDescription: "No network connectivity, SIM card not detected.",
			repairCost: 30000,
			commission: 3000,
			serviceCenterName: "Advanced Mobile Care",
			status: "completed",
			createdAt: "2024-09-10T09:15:00Z",
			approvedAt: "2024-09-11T13:20:00Z",
			completedAt: "2024-09-14T11:00:00Z",
			paymentStatus: "paid",
			paidAmount: 30000,
			paymentDate: "2024-09-15T15:30:00Z",
		},
		{
			id: "SC012",
			claimId: "SC-2024-012",
			customerName: "Rachel Green",
			phoneNumber: "+234812345678",
			email: "rachel.green@email.com",
			imei: "234561098765432",
			brand: "Samsung",
			model: "Galaxy S22 Ultra",
			deviceName: "Samsung Galaxy S22 Ultra",
			storage: "512GB",
			color: "Burgundy",
			faultType: "Performance Issues",
			faultDescription: "Device very slow, frequent app crashes.",
			repairCost: 40000,
			commission: 4000,
			serviceCenterName: "Elite Tech Repairs",
			status: "completed",
			createdAt: "2024-09-08T12:30:00Z",
			approvedAt: "2024-09-09T10:45:00Z",
			completedAt: "2024-09-12T14:20:00Z",
			paymentStatus: "unpaid",
			paidAmount: 0,
		},
	];

	// Filter by status if provided
	if (status && status !== "all") {
		return allClaims.filter((claim) => claim.status === status);
	}

	return allClaims;
};

export const useServiceCenterClaims = (
	options: UseServiceCenterClaimsOptions = {}
) => {
	const query = new URLSearchParams();

	if (options.status) query.append("status", options.status);
	if (options.search) query.append("search", options.search);
	if (options.dateRange?.from) query.append("dateFrom", options.dateRange.from);
	if (options.dateRange?.to) query.append("dateTo", options.dateRange.to);
	if (options.limit) query.append("limit", options.limit.toString());
	if (options.page) query.append("page", options.page.toString());

	// For demo purposes, return dummy data instead of making API call
	const dummyData = generateDummyData(options.status);

	// Filter by search if provided
	let filteredData = dummyData;
	if (options.search) {
		const searchTerm = options.search.toLowerCase();
		filteredData = dummyData.filter(
			(claim) =>
				claim.customerName.toLowerCase().includes(searchTerm) ||
				claim.claimId.toLowerCase().includes(searchTerm) ||
				claim.imei.includes(searchTerm) ||
				claim.deviceName.toLowerCase().includes(searchTerm) ||
				claim.faultType.toLowerCase().includes(searchTerm)
		);
	}

	return {
		data: filteredData,
		totalCount: filteredData.length,
		error: null,
		isLoading: false,
		mutate: () => {},
	};
};

export const useServiceCenterClaim = (claimId: string) => {
	const { data, error, isLoading, mutate } = useSWR(
		claimId ? `/api/service-center/claims/${claimId}` : null,
		(url: string) => apiCall(url, "GET")
	);

	const updateClaimStatus = async (id: string, status: string, data?: any) => {
		const response = await apiCall(
			`/api/service-center/claims/${id}/status`,
			"PUT",
			{ status, ...data }
		);
		mutate();
		return response;
	};

	const uploadCompletionDocuments = async (id: string, files: File[]) => {
		const formData = new FormData();
		files.forEach((file, index) => {
			formData.append(`document_${index}`, file);
		});

		const response = await apiCall(
			`/api/service-center/claims/${id}/completion-documents`,
			"POST",
			formData
		);
		mutate();
		return response;
	};

	return {
		data,
		error,
		isLoading,
		mutate,
		updateClaimStatus,
		uploadCompletionDocuments,
	};
};

export const useCompletedRepairs = (
	options: UseServiceCenterClaimsOptions & { paymentStatus?: string } = {}
) => {
	const query = new URLSearchParams();

	query.append("status", "completed");
	if (options.paymentStatus)
		query.append("paymentStatus", options.paymentStatus);
	if (options.search) query.append("search", options.search);
	if (options.dateRange?.from) query.append("dateFrom", options.dateRange.from);
	if (options.dateRange?.to) query.append("dateTo", options.dateRange.to);
	if (options.limit) query.append("limit", options.limit.toString());
	if (options.page) query.append("page", options.page.toString());

	const { data, error, isLoading, mutate } = useSWR(
		`/api/service-center/completed-repairs?${query.toString()}`,
		(url: string) => apiCall(url, "GET")
	);

	return {
		data: data?.repairs || [],
		totalCount: data?.totalCount || 0,
		error,
		isLoading,
		mutate,
	};
};
