import useSWR from "swr";
import {
  getAmbassadorLeadsWithDetails,
  getUnassignedLeadsWithDetails,
} from "@/lib/api";

export const useAmbassadorLeads = () => {
  const { data, error, isLoading, mutate } = useSWR(
    "/admin/ambassador/leads-with-details",
    getAmbassadorLeadsWithDetails,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    data: data?.data || [],
    isLoading,
    error,
    mutate,
  };
};

export const useUnassignedLeads = () => {
  const { data, error, isLoading, mutate } = useSWR(
    "/admin/ambassador/unassigned-leads-with-details",
    getUnassignedLeadsWithDetails,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    data: data?.data || [],
    isLoading,
    error,
    mutate,
  };
};
