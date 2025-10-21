import { redirect } from "next/navigation";

export default function PaidRepairsPage() {
	redirect("/access/service-center/claims?status=completed&payment=paid");
}
