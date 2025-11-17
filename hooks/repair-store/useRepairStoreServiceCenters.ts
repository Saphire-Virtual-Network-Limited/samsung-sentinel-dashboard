import { useState, useEffect } from "react";
import useSWR from "swr";
import {
	getAllServiceCenters,
	createServiceCenter,
	updateServiceCenter,
	activateServiceCenter,
	deactivateServiceCenter,
	getMyRepairStore,
	type ServiceCenter,
	type CreateServiceCenterDto,
	type UpdateServiceCenterDto,
	type GetServiceCentersParams,
	type PaginatedServiceCentersResponse,
} from "@/lib/api";
import { showToast } from "@/lib";

interface UseRepairStoreServiceCentersOptions {
	status?: string;
	state?: string;
	city?: string;
	search?: string;
	page?: number;
	limit?: number;
}

export function useRepairStoreServiceCenters(
	options: UseRepairStoreServiceCentersOptions = {}
) {
	const [isCreating, setIsCreating] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const [repairStoreId, setRepairStoreId] = useState<string | null>(null);

	// Fetch the repair partner ID on mount
	useEffect(() => {
		const fetchRepairStoreId = async () => {
			try {
				const repairStore = await getMyRepairStore();
				setRepairStoreId(repairStore.id);
			} catch (error) {
				console.error("Failed to fetch repair partner:", error);
			}
		};
		fetchRepairStoreId();
	}, []);

	// Build query params for SWR key - only include defined values
	const params: GetServiceCentersParams = {
		page: options.page || 1,
		limit: options.limit || 25,
	};

	// Only add optional params if they have valid values
	if (
		options.status &&
		options.status !== "all" &&
		options.status !== "undefined"
	) {
		params.status = options.status as any;
	}
	if (options.state && options.state !== "undefined") {
		params.state = options.state;
	}
	if (options.city && options.city !== "undefined") {
		params.city = options.city;
	}
	if (
		options.search &&
		options.search !== "undefined" &&
		options.search.trim()
	) {
		params.search = options.search.trim();
	}

	// Create SWR key
	const swrKey = options ? ["/service-centers", params] : null;

	// Fetch service centers with SWR
	const {
		data: response,
		error,
		isLoading,
		mutate,
	} = useSWR<PaginatedServiceCentersResponse>(
		swrKey,
		() => getAllServiceCenters(params),
		{
			revalidateOnFocus: false,
			dedupingInterval: 30000,
		}
	);

	// Create service center
	const handleCreate = async (data: CreateServiceCenterDto) => {
		setIsCreating(true);
		try {
			// Ensure we have the repair partner ID
			let storeId = repairStoreId;
			if (!storeId) {
				// Fetch it if not already loaded
				const repairStore = await getMyRepairStore();
				storeId = repairStore.id;
				setRepairStoreId(storeId);
			}

			// Add repair_store_id to the request
			const createData: CreateServiceCenterDto = {
				...data,
				repair_store_id: storeId,
			};

			const result = await createServiceCenter(createData);
			showToast({
				message: "Service center created successfully",
				type: "success",
			});
			mutate(); // Revalidate data
			return result;
		} catch (error: any) {
			showToast({
				message: error.message || "Failed to create service center",
				type: "error",
			});
			throw error;
		} finally {
			setIsCreating(false);
		}
	};

	// Update service center
	const handleUpdate = async (id: string, data: UpdateServiceCenterDto) => {
		setIsUpdating(true);
		try {
			const result = await updateServiceCenter(id, data);
			showToast({
				message: "Service center updated successfully",
				type: "success",
			});
			mutate(); // Revalidate data
			return result;
		} catch (error: any) {
			showToast({
				message: error.message || "Failed to update service center",
				type: "error",
			});
			throw error;
		} finally {
			setIsUpdating(false);
		}
	};

	// Activate service center
	const handleActivate = async (id: string) => {
		setIsChangingStatus(true);
		try {
			await activateServiceCenter(id);
			showToast({
				message: "Service center activated successfully",
				type: "success",
			});
			mutate(); // Revalidate data
		} catch (error: any) {
			showToast({
				message: error.message || "Failed to activate service center",
				type: "error",
			});
			throw error;
		} finally {
			setIsChangingStatus(false);
		}
	};

	// Deactivate service center
	const handleDeactivate = async (id: string) => {
		setIsChangingStatus(true);
		try {
			await deactivateServiceCenter(id);
			showToast({
				message: "Service center deactivated successfully",
				type: "success",
			});
			mutate(); // Revalidate data
		} catch (error: any) {
			showToast({
				message: error.message || "Failed to deactivate service center",
				type: "error",
			});
			throw error;
		} finally {
			setIsChangingStatus(false);
		}
	};

	return {
		serviceCenters: response?.data || [],
		total: response?.total || 0,
		page: response?.page || 1,
		limit: response?.limit || 25,
		totalPages: response?.totalPages || 1,
		isLoading,
		error,
		isCreating,
		isUpdating,
		isChangingStatus,
		handleCreate,
		handleUpdate,
		handleActivate,
		handleDeactivate,
		mutate,
	};
}
