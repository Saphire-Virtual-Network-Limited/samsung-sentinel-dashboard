import { useState } from "react";
import useSWR from "swr";
import {
	getAllEngineers,
	createEngineer,
	updateEngineer,
	deleteEngineer,
	resendEngineerInvitation,
	type Engineer,
	type CreateEngineerDto,
	type UpdateEngineerDto,
	type GetEngineersParams,
	type BaseApiResponse,
} from "@/lib/api";
import { showToast } from "@/lib";

interface UseRepairStoreEngineersOptions {
	service_center_id?: string;
	repair_store_id?: string;
	search?: string;
	page?: number;
	limit?: number;
}

export function useRepairStoreEngineers(
	options: UseRepairStoreEngineersOptions = {}
) {
	const [isCreating, setIsCreating] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isResendingInvite, setIsResendingInvite] = useState(false);

	// Build query params for SWR key - only include defined values
	const params: GetEngineersParams = {
		page: options.page || 1,
		limit: options.limit || 25,
	};

	// Only add optional params if they have valid values
	if (
		options.service_center_id &&
		options.service_center_id !== "undefined" &&
		options.service_center_id !== "all"
	) {
		params.service_center_id = options.service_center_id;
	}
	if (options.repair_store_id && options.repair_store_id !== "undefined") {
		params.repair_store_id = options.repair_store_id;
	}
	if (
		options.search &&
		options.search !== "undefined" &&
		options.search.trim()
	) {
		params.search = options.search.trim();
	}

	// Create SWR key
	const swrKey = ["/engineers", params];

	// Fetch engineers with SWR
	const {
		data: response,
		error,
		isLoading,
		mutate,
	} = useSWR<BaseApiResponse<Engineer[]>>(
		swrKey,
		() => getAllEngineers(params),
		{
			revalidateOnFocus: false,
			dedupingInterval: 30000,
		}
	);

	// Create engineer
	const handleCreate = async (data: CreateEngineerDto) => {
		setIsCreating(true);
		try {
			const result = await createEngineer(data);
			showToast({
				message: "Engineer created and invitation sent successfully",
				type: "success",
			});
			mutate(); // Revalidate data
			return result;
		} catch (error: any) {
			showToast({
				message: error.message || "Failed to create engineer",
				type: "error",
			});
			throw error;
		} finally {
			setIsCreating(false);
		}
	};

	// Update engineer
	const handleUpdate = async (id: string, data: UpdateEngineerDto) => {
		setIsUpdating(true);
		try {
			const result = await updateEngineer(id, data);
			showToast({
				message: "Engineer updated successfully",
				type: "success",
			});
			mutate(); // Revalidate data
			return result;
		} catch (error: any) {
			showToast({
				message: error.message || "Failed to update engineer",
				type: "error",
			});
			throw error;
		} finally {
			setIsUpdating(false);
		}
	};

	// Delete engineer
	const handleDelete = async (id: string) => {
		setIsDeleting(true);
		try {
			await deleteEngineer(id);
			showToast({
				message: "Engineer deleted successfully",
				type: "success",
			});
			mutate(); // Revalidate data
		} catch (error: any) {
			showToast({
				message: error.message || "Failed to delete engineer",
				type: "error",
			});
			throw error;
		} finally {
			setIsDeleting(false);
		}
	};

	// Resend invitation
	const handleResendInvitation = async (email: string) => {
		setIsResendingInvite(true);
		try {
			await resendEngineerInvitation({ email });
			showToast({
				message: "Invitation email resent successfully",
				type: "success",
			});
		} catch (error: any) {
			showToast({
				message: error.message || "Failed to resend invitation",
				type: "error",
			});
			throw error;
		} finally {
			setIsResendingInvite(false);
		}
	};

	return {
		engineers: response?.data || [],
		isLoading,
		error,
		isCreating,
		isUpdating,
		isDeleting,
		isResendingInvite,
		handleCreate,
		handleUpdate,
		handleDelete,
		handleResendInvitation,
		mutate,
	};
}
