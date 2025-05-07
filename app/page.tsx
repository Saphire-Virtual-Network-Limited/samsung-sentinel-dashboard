"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib";
import { SkeletonLoader } from "@/components/reususables";

const Home = () => {
	const router = useRouter();
	const { userResponse, isLoading } = useAuth();

	useEffect(() => {
		if (isLoading) return;

		if (userResponse) {
			router.prefetch("/dashboard");
			router.replace("/dashboard");
		} else {
			router.prefetch("/auth/login");
			router.replace("/auth/login");
		}
	}, [router, userResponse, isLoading]);

	return <SkeletonLoader />;
};

export default Home;
