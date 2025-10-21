import { redirect } from "next/navigation";

export default function UnpaidRepairsPage() {
	redirect("/access/service-center/claims?status=completed&payment=unpaid");
}
