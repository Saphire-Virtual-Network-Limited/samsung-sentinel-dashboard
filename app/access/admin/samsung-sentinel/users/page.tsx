import type { Metadata } from "next";
import { SamsungSentinelUsersView } from "@/view";

export const metadata: Metadata = {
	title: "User Management - Samsung Sentinel",
	description: "Manage system users, roles, and permissions",
};

export default function SamsungSentinelUsersPage() {
	return <SamsungSentinelUsersView />;
}
