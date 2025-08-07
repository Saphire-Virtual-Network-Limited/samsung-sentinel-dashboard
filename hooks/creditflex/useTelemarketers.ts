import useSWR from "swr";
import { TelemarketerApiResponse } from "@/view/creditflex/telesales/types";
import { getCDFAllTeleMarketers } from "@/lib/api";

// Fetcher function using the actual API
const fetchTelemarketers = async (
  search?: string,
  status?: string
): Promise<TelemarketerApiResponse> => {
  try {
    const response = await getCDFAllTeleMarketers(search, status);
    return response;
  } catch (error) {
    console.error("Error fetching telemarketers:", error);
    throw error;
  }
};

export const useTelemarketers = (search?: string, status?: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    ["telemarketers", search, status],
    () => fetchTelemarketers(search, status),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: false,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 2,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
