import useSWR from "swr";
import { getCDFAllLoanData } from "@/lib";
import { creditflexQueryKeys } from "./queryKeys";
import {
  CreditflexLoanFilters,
  CreditflexLoanApiResponse,
} from "@/view/creditflex/allLoans/types";

export const useAdminAllLoans = (filters: CreditflexLoanFilters = {}) => {
  const {
    status = "all",
    customerName,
    telemarketerName,
    loanId,
    loanProductId,
    ippisNumber,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = filters;

  return useSWR(
    creditflexQueryKeys.allLoans(filters),
    async () => {
      const res = await getCDFAllLoanData({
        loanId,
        telemarketerName,
        customerName,
        ippisNumber,
        loanProductId,
        status,
        startDate,
        endDate,
        page,
        limit,
      });
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
