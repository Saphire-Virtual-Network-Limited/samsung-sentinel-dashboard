import useSWR from "swr";
import { getCDFAllLoanData } from "@/lib";
import { creditflexQueryKeys } from "./queryKeys";
import { CreditflexLoanFilters } from "@/view/creditflex/allLoans/types";

export const useDisbursedLoans = (filters: CreditflexLoanFilters = {}) => {
  // Force status to only show disbursed loans
  const disbursedFilters = {
    ...filters,
    status: "Paid", // Disbursed status
  };

  return useSWR(
    creditflexQueryKeys.disbursedLoans(disbursedFilters),
    async () => {
      const res = await getCDFAllLoanData(disbursedFilters);
      return res;
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
      refreshInterval: 300000, // 5 minutes
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      keepPreviousData: true,
      revalidateIfStale: true,
    }
  );
};
