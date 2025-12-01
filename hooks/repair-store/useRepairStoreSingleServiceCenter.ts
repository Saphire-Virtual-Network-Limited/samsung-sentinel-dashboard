import { useState, useMemo } from "react";
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
import type { Engineer } from "@/lib/api";

export function useRepairStoreSingleServiceCenter(serviceCenterId: string) {
	const [isUpdating, setIsUpdating] = useState(false);
	const [isChangingStatus, setIsChangingStatus] = useState(false);

	// Fetch service center details (which includes engineers array)
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

	// Extract engineers from the service center response
	const engineers = useMemo(() => {
		return (serviceCenter?.engineers as Engineer[]) || [];
	}, [serviceCenter]);

	// Also get the engineers hook for CRUD operations
	const {
		handleCreate: createEngineer,
		handleUpdate: updateEngineer,
		handleDelete: deleteEngineer,
		handleResendInvitation: resendInvitation,
	} = useRepairStoreEngineers({
		service_center_id: serviceCenterId,
	});

	// Wrap engineer CRUD to also refresh service center data
	const handleCreateEngineer = async (data: any) => {
		const result = await createEngineer(data);
		mutate(); // Refresh service center to get updated engineers list
		return result;
	};

	const handleUpdateEngineer = async (id: string, data: any) => {
		const result = await updateEngineer(id, data);
		mutate(); // Refresh service center to get updated engineers list
		return result;
	};

	const handleDeleteEngineer = async (id: string) => {
		const result = await deleteEngineer(id);
		mutate(); // Refresh service center to get updated engineers list
		return result;
	};

	const handleResendInvitation = async (id: string) => {
		const result = await resendInvitation(id);
		return result;
	};

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

		// Engineers data (from service center response)
		engineers,
		isLoadingEngineers: isLoading, // Engineers load with service center
		handleCreateEngineer,
		handleUpdateEngineer,
		handleDeleteEngineer,
		handleResendInvitation,
	};
}
