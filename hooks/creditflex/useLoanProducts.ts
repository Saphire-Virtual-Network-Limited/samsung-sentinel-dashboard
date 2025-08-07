import useSWR from "swr";
import { getCDFAllLoanProducts } from "@/lib";
import { creditflexQueryKeys } from "./queryKeys";

export const useLoanProducts = () => {
  return useSWR(
    creditflexQueryKeys.loanProducts(),
    async () => {
      const res = await getCDFAllLoanProducts();
      return res;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
      refreshInterval: 0,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 5000,
      keepPreviousData: true,
      revalidateIfStale: false,
      revalidateOnMount: true,
    }
  );
};
