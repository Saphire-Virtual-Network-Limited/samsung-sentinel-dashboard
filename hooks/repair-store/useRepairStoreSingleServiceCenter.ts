import { useState } from "react";
import useSWR from "swr";
import {
	getServiceCenterById,
	updateServiceCenter,
	activateServiceCenter,
	deactivateServiceCenter,
	type ServiceCenter,
	type UpdateServiceCenterDto,
} from "@/lib/api";
import { showToast } from "@/lib";
import { useRepairStoreEngineers } from "./useRepairStoreEngineers";

export function useRepairStoreSingleServiceCenter(serviceCenterId: string) {
	const [isUpdating, setIsUpdating] = useState(false);
	const [isChangingStatus, setIsChangingStatus] = useState(false);

	// Fetch service center details
	const {
		data: serviceCenter,
		error,
		isLoading,
		mutate,
	} = useSWR<ServiceCenter>(
		serviceCenterId ? `/service-centers/${serviceCenterId}` : null,
		() => getServiceCenterById(serviceCenterId),
		{
			revalidateOnFocus: false,
			dedupingInterval: 30000,
		}
	);

	// Fetch engineers for this service center
	const {
		engineers,
		isLoading: isLoadingEngineers,
		handleCreate: handleCreateEngineer,
		handleUpdate: handleUpdateEngineer,
		handleDelete: handleDeleteEngineer,
		handleResendInvitation,
	} = useRepairStoreEngineers({
		service_center_id: serviceCenterId,
	});

	// Update service center
	const handleUpdate = async (data: UpdateServiceCenterDto) => {
		setIsUpdating(true);
		try {
			const result = await updateServiceCenter(serviceCenterId, data);
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
	const handleActivate = async () => {
		setIsChangingStatus(true);
		try {
			const result = await activateServiceCenter(serviceCenterId);
			showToast({
				message: "Service center activated successfully",
				type: "success",
			});
			mutate(); // Revalidate data
			return result;
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
	const handleDeactivate = async () => {
		setIsChangingStatus(true);
		try {
			const result = await deactivateServiceCenter(serviceCenterId);
			showToast({
				message: "Service center deactivated successfully",
				type: "success",
			});
			mutate(); // Revalidate data
			return result;
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

	// Toggle status (activate/deactivate)
	const handleToggleStatus = async () => {
		if (!serviceCenter) return;

		if (serviceCenter.status === "ACTIVE") {
			return handleDeactivate();
		} else {
			return handleActivate();
		}
	};

	return {
		// Service center data
		serviceCenter,
		isLoading,
		error,
		refetch: mutate,

		// Service center actions
		handleUpdate,
		handleActivate,
		handleDeactivate,
		handleToggleStatus,
		isUpdating,
		isChangingStatus,

		// Engineers data
		engineers: engineers || [],
		isLoadingEngineers,
		handleCreateEngineer,
		handleUpdateEngineer,
		handleDeleteEngineer,
		handleResendInvitation,
	};
}
