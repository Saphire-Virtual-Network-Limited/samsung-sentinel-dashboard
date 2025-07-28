import useSWR from "swr";
import { getCDFAllInvoices } from "@/lib";
import { creditflexQueryKeys } from "./queryKeys";

export const useInvoices = () => {
  return useSWR(
    creditflexQueryKeys.invoices(),
    async () => {
      const res = await getCDFAllInvoices();
      return res;
    },
    {
      revalidateOnFocus: false, // Disable revalidation on window focus
      dedupingInterval: 300000, // 5 minutes deduping
      refreshInterval: 0, // Disable automatic refresh
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 5000,
      keepPreviousData: true,
      revalidateIfStale: false, // Don't revalidate stale data automatically
      revalidateOnMount: true, // Only revalidate on mount
    }
  );
};
