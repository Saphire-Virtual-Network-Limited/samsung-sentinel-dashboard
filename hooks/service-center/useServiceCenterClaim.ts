import useSWR, { mutate } from "swr";

export interface ServiceCenterClaim {
	id: string;
	imei: string;
	customerName: string;
	customerPhone: string;
	customerEmail?: string;
	customerAddress?: string;
	deviceBrand: string;
	deviceModel: string;
	devicePrice?: number;
	faultType: string;
	faultDescription?: string;
	repairCost?: number;
	dateSubmitted: string;
	dateUpdated?: string;
	status: string;
	deviceStatus?: string;
	engineer?: string;
	engineerPhone?: string;
	estimatedCompletionDate?: string;
	warrantyStartDate?: string;
	warrantyEndDate?: string;
	partsRequired?: any[];
	repairHistory?: any[];
	statusHistory?: any[];
	repairStatus?: "pending" | "awaiting-parts" | "received-device" | "completed";
}

// Mock data fetcher
const fetcher = (url: string): Promise<ServiceCenterClaim> => {
	return Promise.resolve({
		id: "SC001",
		imei: "123456789012345",
		customerName: "Jane Smith",
		customerPhone: "+234802345678",
		customerEmail: "jane.smith@email.com",
		customerAddress: "456 Market Street, Abuja, Nigeria",
		deviceBrand: "Samsung",
		deviceModel: "Galaxy S22",
		devicePrice: 450000,
		faultType: "Battery Drain",
		faultDescription:
			"Device battery drains quickly even when not in use. Battery life reduced to 2-3 hours.",
		dateSubmitted: "2024-01-18T09:15:00Z",
		dateUpdated: "2024-01-18T16:30:00Z",
		status: "in-progress",
		deviceStatus: "Under Diagnosis",
		repairCost: 35000,
		engineer: "Eng. Sarah Johnson",
		engineerPhone: "+234901234567",
		estimatedCompletionDate: "2024-01-22T17:00:00Z",
		warrantyStartDate: "2023-06-15T00:00:00Z",
		warrantyEndDate: "2024-06-15T00:00:00Z",
		partsRequired: [
			{
				partName: "Battery",
				partCode: "SM-G996B-BAT",
				cost: 25000,
				availability: "In Stock",
			},
			{
				partName: "Charging Port",
				partCode: "SM-G996B-PORT",
				cost: 8000,
				availability: "Ordered",
			},
		],
		repairStatus: "awaiting-parts" as const,
		repairHistory: [
			{
				id: "REP001",
				date: "2024-01-18T10:00:00Z",
				action: "Initial Diagnosis",
				engineer: "Eng. Sarah Johnson",
				findings: "Battery health at 65%, charging port shows signs of wear",
				status: "completed",
			},
			{
				id: "REP002",
				date: "2024-01-18T14:30:00Z",
				action: "Parts Assessment",
				engineer: "Eng. Sarah Johnson",
				findings: "Battery replacement required, charging port needs cleaning",
				status: "completed",
			},
		],
		statusHistory: [
			{
				id: "ST001",
				date: "2024-01-18T09:15:00Z",
				status: "submitted",
				user: "Service Center Staff",
				notes: "Claim submitted by customer",
			},
			{
				id: "ST002",
				date: "2024-01-18T10:00:00Z",
				status: "in-progress",
				user: "Eng. Sarah Johnson",
				notes: "Diagnosis started",
			},
		],
	});
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
	const updateStatus = async (
		claimId: string,
		status: string,
		notes: string
	) => {
		// API call to update claim status (mock)
		// update SWR cache for the claim
		const key = `/api/service-center/claims/${claimId}`;
		await mutate(
			key,
			(current: any) => {
				if (!current) return current;
				const historyEntry = {
					id: `ST${Date.now()}`,
					date: new Date().toISOString(),
					status,
					user: "Service Center Staff",
					notes,
				};
				return {
					...current,
					status,
					statusHistory: [historyEntry, ...(current.statusHistory || [])],
				};
			},
			false
		);
		return Promise.resolve();
	};

	type Doc = {
		id: string;
		name: string;
		type?: string;
		url?: string;
	};

	// Document functions removed - focusing on repair status management

	const updateRepairStatus = async (
		claimId: string, 
		newRepairStatus: "pending" | "awaiting-parts" | "received-device" | "completed",
		notes?: string
	) => {
		// API call to update repair status (mocked)
		const key = `/api/service-center/claims/${claimId}`;
		
		await mutate(
			key,
			(current: any) => {
				if (!current) return current;
				
				const historyEntry = {
					id: `ST${Date.now()}`,
					date: new Date().toISOString(),
					status: `repair-${newRepairStatus}`,
					user: "Service Center Staff",
					notes: notes || `Repair status updated to ${newRepairStatus.replace('-', ' ')}`,
				};
				
				return {
					...current,
					repairStatus: newRepairStatus,
					dateUpdated: new Date().toISOString(),
					statusHistory: [historyEntry, ...(current.statusHistory || [])],
				};
			},
			false
		);

		return Promise.resolve();
	};

	return {
		updateStatus,
		updateRepairStatus,
	};
};
