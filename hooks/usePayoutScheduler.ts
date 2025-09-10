import useSWR from "swr";
import { getPayoutSchedulerStatus, PayoutStatusResponse } from "@/lib/api";
import { showToast } from "@/lib";

export const usePayoutSchedulerStatus = () => {
	return useSWR<PayoutStatusResponse>(
		"payout-scheduler-status",
		getPayoutSchedulerStatus,
		{
			refreshInterval: 30000, // Auto-refresh every 30 seconds
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
			errorRetryCount: 3,
			dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
			onError: (error) => {
				console.error("Error fetching payout status:", error);
				showToast({
					type: "error",
					message: error.message || "Failed to fetch payout status",
					duration: 5000,
				});
			},
		}
	);
};

export const usePayoutSchedulerActions = () => {
	const { mutate } = usePayoutSchedulerStatus();

	const executeActionWithRevalidation = async (
		action: () => Promise<any>,
		actionName: string,
		optimisticUpdate?: (
			currentData: PayoutStatusResponse | undefined
		) => PayoutStatusResponse | undefined
	) => {
		try {
			// Perform optimistic update if provided
			if (optimisticUpdate) {
				mutate(optimisticUpdate, false);
			}

			const response = await action();

			showToast({
				type: "success",
				message: response.message,
				duration: 5000,
			});

			// Revalidate to ensure data consistency
			mutate();

			return response;
		} catch (error: any) {
			console.error(`Error with ${actionName}:`, error);
			showToast({
				type: "error",
				message: error.message || `Failed to execute ${actionName}`,
				duration: 5000,
			});

			// Revalidate on error to restore correct state
			mutate();
			throw error;
		}
	};

	const revalidateStatus = () => {
		mutate();
	};

	return {
		executeActionWithRevalidation,
		revalidateStatus,
	};
};
