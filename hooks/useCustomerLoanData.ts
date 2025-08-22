import useSWR from "swr";
import { getSingleCollectionCustomerData } from "@/lib";

export function useCustomerLoanData(customerId: string, channel: string) {
	const { data, error, isLoading, mutate } = useSWR(
		customerId && channel ? ["customer-loan-data", customerId, channel] : null,
		() => getSingleCollectionCustomerData(customerId, channel)
			.then((r) => r.data)
			.catch((error) => {
				console.error(`Error fetching data for customer ${customerId}:`, error);
				return null;
			}),
		{
			revalidateOnFocus: true,
			dedupingInterval: 60000,
			refreshInterval: 60000,
			shouldRetryOnError: false,
			keepPreviousData: true,
			revalidateIfStale: true
		}
	);

	return {
		data,
		error,
		isLoading,
		mutate
	};
}
