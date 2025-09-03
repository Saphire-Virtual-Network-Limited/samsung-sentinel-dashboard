import useSWR from "swr";
import { getCDFRepaymentById } from "@/lib";

export const useRepaymentById = (repaymentId?: string) => {
	return useSWR(
		repaymentId ? ["creditflex", "repayment", repaymentId] : null,
		async () => {
			if (!repaymentId) return null;
			const res = await getCDFRepaymentById(repaymentId);
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
