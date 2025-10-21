"use client";

import React from "react";
import UnifiedClaimsView from "@/components/shared/UnifiedClaimsView";

const AdminSamsungSentinelClaimsPage = () => {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">
					Samsung Sentinel - Claims & Payments
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					Monitor all repair claims and process payments to service centers
				</p>
			</div>

			<UnifiedClaimsView role="samsung-sentinel" showPaymentTabs={true} />
		</div>
	);
};

export default AdminSamsungSentinelClaimsPage;
