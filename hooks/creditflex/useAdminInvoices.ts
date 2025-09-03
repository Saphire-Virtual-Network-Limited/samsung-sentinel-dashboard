import useSWR from "swr";
import { getCDFInvoices } from "@/lib";
import { creditflexQueryKeys } from "./queryKeys";

export interface InvoiceFilters {
	isPaid?: boolean;
	dateField?: string;
	startDate?: string;
	endDate?: string;
	search?: string;
}

export const useAdminInvoices = (filters: InvoiceFilters = {}) => {
	const {
		isPaid,
		dateField = "createdAt",
		startDate,
		endDate,
		search,
	} = filters;

	return useSWR(
		creditflexQueryKeys.invoices(filters),
		async () => {
			const res = await getCDFInvoices({
				isPaid,
				dateField,
				startDate,
				endDate,
				search,
			});
			return res;
		},
		{
			revalidateOnFocus: true,
			dedupingInterval: 60000,
			refreshInterval: 300000,
			shouldRetryOnError: true,
			errorRetryCount: 3,
			errorRetryInterval: 5000,
			keepPreviousData: true,
			revalidateIfStale: true,
		}
	);
};
