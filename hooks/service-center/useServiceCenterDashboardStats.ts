import useSWR from "swr";

export interface ServiceCenterDashboardStats {
	totalClaims: number;
	pendingClaims: number;
	approvedClaims: number;
	inProgressClaims: number;
	completedClaims: number;
	rejectedClaims: number;
	waitingParts: number;
	readyForPickup: number;
	totalRepairCost: number;
	averageRepairTime: number; // in days
	recentClaims: Array<{
		id: string;
		imei: string;
		customerName: string;
		deviceModel: string;
		status: string;
		dateSubmitted: string;
	}>;
	claimsByStatus: Array<{
		status: string;
		count: number;
		percentage: number;
	}>;
	claimsTrend: Array<{
		date: string;
		count: number;
	}>;
}

const fetcher = (url: string): Promise<ServiceCenterDashboardStats> => {
	// Mock data - replace with actual API call
	return Promise.resolve({
		totalClaims: 156,
		pendingClaims: 23,
		approvedClaims: 45,
		inProgressClaims: 18,
		completedClaims: 89,
		rejectedClaims: 12,
		waitingParts: 8,
		readyForPickup: 14,
		totalRepairCost: 4567000,
		averageRepairTime: 4.5,
		recentClaims: [
			{
				id: "SC156",
				imei: "123456789012345",
				customerName: "Jane Smith",
				deviceModel: "Galaxy S22",
				status: "pending",
				dateSubmitted: "2024-01-18T09:15:00Z",
			},
			{
				id: "SC155",
				imei: "234567890123456",
				customerName: "Mike Johnson",
				deviceModel: "Galaxy A54",
				status: "in-progress",
				dateSubmitted: "2024-01-17T14:30:00Z",
			},
			{
				id: "SC154",
				imei: "345678901234567",
				customerName: "Sarah Williams",
				deviceModel: "Galaxy S21",
				status: "approved",
				dateSubmitted: "2024-01-16T10:20:00Z",
			},
			{
				id: "SC153",
				imei: "456789012345678",
				customerName: "David Brown",
				deviceModel: "Galaxy A34",
				status: "completed",
				dateSubmitted: "2024-01-15T16:45:00Z",
			},
			{
				id: "SC152",
				imei: "567890123456789",
				customerName: "Emily Davis",
				deviceModel: "Galaxy S23",
				status: "waiting-parts",
				dateSubmitted: "2024-01-14T11:30:00Z",
			},
		],
		claimsByStatus: [
			{ status: "Pending", count: 23, percentage: 14.7 },
			{ status: "Approved", count: 45, percentage: 28.8 },
			{ status: "In Progress", count: 18, percentage: 11.5 },
			{ status: "Completed", count: 89, percentage: 57.1 },
			{ status: "Rejected", count: 12, percentage: 7.7 },
			{ status: "Waiting Parts", count: 8, percentage: 5.1 },
			{ status: "Ready Pickup", count: 14, percentage: 9.0 },
		],
		claimsTrend: [
			{ date: "2024-01-12", count: 8 },
			{ date: "2024-01-13", count: 12 },
			{ date: "2024-01-14", count: 15 },
			{ date: "2024-01-15", count: 11 },
			{ date: "2024-01-16", count: 14 },
			{ date: "2024-01-17", count: 18 },
			{ date: "2024-01-18", count: 16 },
		],
	});
};

export const useServiceCenterDashboardStats = () => {
	const { data, error, mutate, isLoading } = useSWR(
		"/api/service-center/dashboard/stats",
		fetcher,
		{
			refreshInterval: 30000, // Refresh every 30 seconds
		}
	);

	return {
		stats: data,
		isLoading,
		error,
		mutate,
	};
};
