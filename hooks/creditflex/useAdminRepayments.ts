import useSWR from "swr";
import { getCDFRepayments } from "@/lib";
import { creditflexQueryKeys } from "./queryKeys";

export interface RepaymentFilters {
	status?: string;
	teleMarketerId?: string;
	loanId?: string;
	startDate?: string;
	endDate?: string;
	search?: string;
}

export const useAdminRepayments = (filters: RepaymentFilters = {}) => {
	const {
		status = "all",
		teleMarketerId,
		loanId,
		startDate,
		endDate,
		search,
	} = filters;

	return useSWR(
		creditflexQueryKeys.repayments(filters),
		async () => {
			const res = await getCDFRepayments({
				status,
				teleMarketerId,
				loanId,
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
