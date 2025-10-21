"use client";

import React from "react";
import UnifiedClaimsView from "@/components/shared/UnifiedClaimsView";

const ServiceCenterClaimsPage = () => {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Claims Management</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					View and manage your repair claims
				</p>
			</div>

			<UnifiedClaimsView role="service-center" showPaymentTabs={false} />
		</div>
	);
};

export default ServiceCenterClaimsPage;
