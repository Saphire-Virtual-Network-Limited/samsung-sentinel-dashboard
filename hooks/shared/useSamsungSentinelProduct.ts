import useSWR from "swr";
import { apiCall } from "@/lib/api";

export interface RepairType {
	id: string;
	name: string;
	category: string;
	price: number;
	status: "active" | "inactive";
	createdBy: string;
	createdAt: string;
	lastUpdatedAt: string;
	lastUpdatedBy: string;
}

export interface Product {
	id: string;
	name: string;
	createdBy: string;
	createdAt: string;
	lastUpdatedAt: string;
	lastUpdatedBy: string;
	status: "active" | "inactive";
	repairTypesCount: number;
	repairTypes: RepairType[];
}

export interface AuditHistory {
	id: string;
	action: string;
	field: string;
	oldValue: string;
	newValue: string;
	modifiedBy: string;
	modifiedAt: string;
}

interface UseSamsungSentinelProductReturn {
	product: Product | undefined;
	auditHistory: AuditHistory[];
	isLoading: boolean;
	isError: any;
	mutate: () => void;
}

/**
 * Hook to fetch Samsung Sentinel product details by ID
 * @param productId - The ID of the product to fetch
 * @returns Product data, audit history, loading state, error state, and mutate function
 */
export function useSamsungSentinelProduct(
	productId: string
): UseSamsungSentinelProductReturn {
	// TODO: Replace with actual API calls when backend is ready
	// For now, return mock data to avoid errors
	
	// Mock product data based on productId
	const getMockProduct = (): Product => ({
		id: productId,
		name:
			productId === "samsung_a05"
				? "Samsung Galaxy A05"
				: productId === "samsung_a06"
				? "Samsung Galaxy A06"
				: productId === "samsung_a07"
				? "Samsung Galaxy A07"
				: `Samsung Product ${productId}`,
		createdBy: "admin@sapphire.com",
		createdAt: "2024-01-15T10:30:00Z",
		lastUpdatedAt: "2024-10-01T14:22:00Z",
		lastUpdatedBy: "subadmin@sapphire.com",
		status: "active",
		repairTypesCount: 5,
		repairTypes: [
			{
				id: "repair_001",
				name: "Screen Replacement",
				category: "screen",
				price: 25000,
				status: "active",
				createdBy: "admin@sapphire.com",
				createdAt: "2024-01-15T10:35:00Z",
				lastUpdatedAt: "2024-09-15T09:20:00Z",
				lastUpdatedBy: "admin@sapphire.com",
			},
			{
				id: "repair_002",
				name: "Battery Replacement",
				category: "battery",
				price: 15000,
				status: "active",
				createdBy: "admin@sapphire.com",
				createdAt: "2024-01-15T10:40:00Z",
				lastUpdatedAt: "2024-08-20T16:45:00Z",
				lastUpdatedBy: "subadmin@sapphire.com",
			},
			{
				id: "repair_003",
				name: "Camera Repair",
				category: "camera",
				price: 18000,
				status: "active",
				createdBy: "subadmin@sapphire.com",
				createdAt: "2024-02-01T11:15:00Z",
				lastUpdatedAt: "2024-09-10T13:30:00Z",
				lastUpdatedBy: "admin@sapphire.com",
			},
			{
				id: "repair_004",
				name: "Charging Port Fix",
				category: "charging_port",
				price: 12000,
				status: "active",
				createdBy: "admin@sapphire.com",
				createdAt: "2024-02-15T14:20:00Z",
				lastUpdatedAt: "2024-09-05T10:15:00Z",
				lastUpdatedBy: "admin@sapphire.com",
			},
			{
				id: "repair_005",
				name: "Speaker Replacement",
				category: "speaker",
				price: 10000,
				status: "inactive",
				createdBy: "subadmin@sapphire.com",
				createdAt: "2024-03-01T09:45:00Z",
				lastUpdatedAt: "2024-09-20T15:30:00Z",
				lastUpdatedBy: "admin@sapphire.com",
			},
		],
	});

	const getMockAuditHistory = (): AuditHistory[] => [
		{
			id: "audit_001",
			action: "UPDATE",
			field: "name",
			oldValue: "Samsung A05",
			newValue: "Samsung Galaxy A05",
			modifiedBy: "subadmin@sapphire.com",
			modifiedAt: "2024-10-01T14:22:00Z",
		},
		{
			id: "audit_002",
			action: "CREATE",
			field: "repair_type",
			oldValue: "",
			newValue: "Speaker Replacement - ₦10,000",
			modifiedBy: "subadmin@sapphire.com",
			modifiedAt: "2024-03-01T09:45:00Z",
		},
		{
			id: "audit_003",
			action: "UPDATE",
			field: "repair_price",
			oldValue: "₦20,000",
			newValue: "₦25,000",
			modifiedBy: "admin@sapphire.com",
			modifiedAt: "2024-09-15T09:20:00Z",
		},
	];

	// Uncomment when API is ready:
	// const {
	// 	data: product,
	// 	error: productError,
	// 	isLoading: productLoading,
	// 	mutate,
	// } = useSWR<Product>(
	// 	productId ? `/samsung-sentinel/products/${productId}` : null,
	// 	(url: string) => apiCall(url, "GET")
	// );

	// const {
	// 	data: auditHistory,
	// 	error: auditError,
	// 	isLoading: auditLoading,
	// } = useSWR<AuditHistory[]>(
	// 	productId ? `/samsung-sentinel/products/${productId}/audit` : null,
	// 	(url: string) => apiCall(url, "GET")
	// );

	// return {
	// 	product,
	// 	auditHistory: auditHistory || [],
	// 	isLoading: productLoading || auditLoading,
	// 	isError: productError || auditError,
	// 	mutate,
	// };

	// Mock data return (remove when API is ready)
	return {
		product: getMockProduct(),
		auditHistory: getMockAuditHistory(),
		isLoading: false,
		isError: null,
		mutate: () => {}, // No-op for mock data
	};
}
