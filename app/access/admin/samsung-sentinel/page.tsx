"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SamsungSentinelPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to IMEI management for backward compatibility
		router.replace("/access/admin/samsung-sentinel/imei");
	}, [router]);

	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="text-center">
				<p className="text-gray-500">Redirecting to IMEI Management...</p>
			</div>
		</div>
	);
}
