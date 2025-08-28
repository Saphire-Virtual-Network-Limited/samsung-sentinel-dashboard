import useSWR from "swr";
import {
	getAllAgentsLoansAndCommissions,
	AllAgentsLoansAndCommissionsParams,
} from "@/lib/api";

export function useCommissionsData(
	params: AllAgentsLoansAndCommissionsParams = {}
) {
	// Use a stable key based on params for SWR caching
	const key = ["all-agents-loans-commissions", params];
	const { data, error, isLoading, mutate } = useSWR(key, () =>
		getAllAgentsLoansAndCommissions(params).then((res) => res.data)
	);
	return { data, error, isLoading, mutate };
}
