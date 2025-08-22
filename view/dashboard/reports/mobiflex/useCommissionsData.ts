import useSWR from "swr";
import { getAllAgentsLoansAndCommissions } from "@/lib/api";

export function useCommissionsData() {
	const { data, error, isLoading, mutate } = useSWR(
		"all-agents-loans-commissions",
		() => getAllAgentsLoansAndCommissions().then((res) => res.data)
	);
	return { data, error, isLoading, mutate };
}
