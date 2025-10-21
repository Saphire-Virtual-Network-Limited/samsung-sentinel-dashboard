"use client";

import React from "react";
import UnifiedClaimsView from "@/components/shared/UnifiedClaimsView";

export default function CompletedRepairsPage() {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Completed Repairs</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					View completed repairs and process payments
				</p>
			</div>

			<UnifiedClaimsView role="samsung-sentinel" showPaymentTabs={true} />
		</div>
	);
}
