import useSWR from "swr";
import { getCDFRepaymentsByLoanId } from "@/lib";
import { creditflexQueryKeys } from "./queryKeys";

export const useRepaymentsByLoanId = (loanId?: string) => {
	return useSWR(
		loanId ? ["creditflex", "repaymentsByLoan", loanId] : null,
		async () => {
			if (!loanId) return null;
			const res = await getCDFRepaymentsByLoanId(loanId);
			return res;
		},
		{
			revalidateOnFocus: true,
			dedupingInterval: 60000,
			shouldRetryOnError: true,
			errorRetryCount: 2,
		}
	);
};
