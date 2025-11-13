"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SkeletonLoader } from "@/components/reususables";
import { useAuth } from "@/lib";
import { getRoleBasePath } from "@/lib/roleConfig";

export default function Page() {
	const router = useRouter();
	const { userResponse, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading) {
			if (userResponse?.role) {
				// Redirect authenticated users to their role-based dashboard
				const roleBasePath = getRoleBasePath(userResponse.role);
				router.replace(roleBasePath);
			} else {
				// Redirect unauthenticated users to login
				router.replace("/auth/login");
			}
		}
	}, [userResponse, isLoading, router]);

	return (
		<>
			<SkeletonLoader />
		</>
	);
}
