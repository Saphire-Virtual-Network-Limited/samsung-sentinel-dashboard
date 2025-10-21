"use client";

import React from "react";
import UnifiedClaimsView from "@/components/shared/UnifiedClaimsView";

const SamsungPartnersClaimsPage = () => {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Repair Claims Management</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					Review, approve, and manage repair claims from service centers
				</p>
			</div>

			<UnifiedClaimsView role="samsung-partners" showPaymentTabs={true} />
		</div>
	);
};

export default SamsungPartnersClaimsPage;
