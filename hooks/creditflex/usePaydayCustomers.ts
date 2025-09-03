import useSWR from "swr";
import { getPaydayCustomers, getPaydayCustomerById } from "@/lib";

export const usePaydayCustomers = (params: Record<string, any> = {}) => {
	return useSWR(
		["creditflex", "payday", "customers", JSON.stringify(params)],
		async () => {
			const res = await getPaydayCustomers(params);
			return res;
		},
		{
			revalidateOnFocus: false,
			dedupingInterval: 60000,
			shouldRetryOnError: true,
			errorRetryCount: 2,
		}
	);
};

export const usePaydayCustomerById = (wacsCustomerId?: string) => {
	return useSWR(
		wacsCustomerId
			? ["creditflex", "payday", "customer", wacsCustomerId]
			: null,
		async () => {
			if (!wacsCustomerId) return null;
			const res = await getPaydayCustomerById(wacsCustomerId);
			return res;
		},
		{
			revalidateOnFocus: false,
			dedupingInterval: 60000,
			shouldRetryOnError: true,
			errorRetryCount: 2,
		}
	);
};
