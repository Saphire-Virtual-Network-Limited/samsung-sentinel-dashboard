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
	documents?: any[];
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
		documents: [
			{
				id: "DOC001",
				name: "diagnostic_report.pdf",
				type: "document",
				uploadDate: "2024-01-18",
				url: "/files/diagnostic_report.pdf",
			},
			{
				id: "DOC002",
				name: "device_photos.jpg",
				type: "image",
				uploadDate: "2024-01-18",
				url: "/files/device_photos.jpg",
			},
		],
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

	const uploadDocument = async (claimId: string, file: File): Promise<Doc> => {
		// API call to upload document (mocked)
		const uploaded: Doc = {
			id: `DOC${Date.now()}`,
			name: file.name,
			type: file.type.startsWith("image")
				? "image"
				: file.type === "application/pdf"
				? "document"
				: "file",
			url: `/files/${file.name}`,
		};

		const key = `/api/service-center/claims/${claimId}`;
		// Update SWR cache to include the newly uploaded document and add status history
		await mutate(
			key,
			(current: any) => {
				if (!current) return current;
				const newDocs = [uploaded, ...(current.documents || [])];
				const historyEntry = {
					id: `ST${Date.now()}`,
					date: new Date().toISOString(),
					status: "document-uploaded",
					user: "Service Center Staff",
					notes: `Uploaded ${file.name}`,
				};
				return {
					...current,
					documents: newDocs,
					statusHistory: [historyEntry, ...(current.statusHistory || [])],
				};
			},
			false
		);

		return Promise.resolve(uploaded);
	};

	const replaceDocument = async (
		claimId: string,
		docId: string,
		file: File
	): Promise<Doc> => {
		// API call to replace document (mocked)
		const replaced: Doc = {
			id: docId,
			name: file.name,
			type: file.type.startsWith("image")
				? "image"
				: file.type === "application/pdf"
				? "document"
				: "file",
			url: `/files/${file.name}`,
		};

		const key = `/api/service-center/claims/${claimId}`;
		await mutate(
			key,
			(current: any) => {
				if (!current) return current;
				const newDocs = (current.documents || []).map((d: any) =>
					d.id === docId ? replaced : d
				);
				const historyEntry = {
					id: `ST${Date.now()}`,
					date: new Date().toISOString(),
					status: "document-replaced",
					user: "Service Center Staff",
					notes: `Replaced ${docId} with ${file.name}`,
				};
				return {
					...current,
					documents: newDocs,
					statusHistory: [historyEntry, ...(current.statusHistory || [])],
				};
			},
			false
		);

		return Promise.resolve(replaced);
	};

	const deleteDocument = async (claimId: string, docId: string) => {
		// API call to delete document (mocked)
		const key = `/api/service-center/claims/${claimId}`;
		await mutate(
			key,
			(current: any) => {
				if (!current) return current;
				const newDocs = (current.documents || []).filter(
					(d: any) => d.id !== docId
				);
				const historyEntry = {
					id: `ST${Date.now()}`,
					date: new Date().toISOString(),
					status: "document-deleted",
					user: "Service Center Staff",
					notes: `Deleted ${docId}`,
				};
				return {
					...current,
					documents: newDocs,
					statusHistory: [historyEntry, ...(current.statusHistory || [])],
				};
			},
			false
		);
		return Promise.resolve();
	};

	return {
		updateStatus,
		uploadDocument,
		replaceDocument,
		deleteDocument,
	};
};
