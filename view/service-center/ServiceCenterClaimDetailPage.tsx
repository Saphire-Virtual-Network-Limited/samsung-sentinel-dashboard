"use client";

import React from "react";
import { useParams } from "next/navigation";
import UnifiedClaimRepairDetailView from "@/components/shared/UnifiedClaimRepairDetailView";
import { useDummyClaimDetail } from "@/hooks/shared/useDummyClaimDetail";
import { useClaimsData } from "@/hooks/shared/useClaimsData";
import { Spinner } from "@heroui/react";

const ServiceCenterClaimDetailPage = () => {
	const params = useParams();
	const claimId = params?.id as string;

	// Fetch dummy claim data
	const { claim, isLoading, error, bankDetails } = useDummyClaimDetail(claimId);

	// Get action handlers from useClaimsData
	const {
		approveHandler,
		rejectHandler,
		authorizePaymentHandler,
		executePaymentHandler,
	} = useClaimsData({ role: "service-center" });

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Spinner size="lg" />
			</div>
		);
	}

	if (error || !claim) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<p className="text-red-500">Failed to load claim details</p>
			</div>
		);
	}

	return (
		<UnifiedClaimRepairDetailView 
			claimData={claim} 
			role="service-center"
			serviceCenterBankDetails={bankDetails}
			onApprove={approveHandler}
			onReject={rejectHandler}
			onAuthorizePayment={authorizePaymentHandler}
			onExecutePayment={executePaymentHandler}
		/>
	);
};

export default ServiceCenterClaimDetailPage;

// TODO: Replace with actual API hook when backend is ready
/*
import { useServiceCenterClaim } from "@/hooks/service-center/useServiceCenterClaim";

const ServiceCenterClaimDetailPage = () => {
	const params = useParams();
	const claimId = params?.id as string;

	// Fetch claim data
	const { claim, isLoading, error } = useServiceCenterClaim(claimId);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Spinner size="lg" />
			</div>
		);
	}

	if (error || !claim) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<p className="text-red-500">Failed to load claim details</p>
			</div>
		);
	}

	// Map ServiceCenterClaim to ClaimRepairItem format
	const claimData = {
		id: claim.id,
		claimId: claim.id,
		customerName: claim.customerName,
		imei: claim.imei,
		deviceName: `${claim.deviceBrand} ${claim.deviceModel}`,
		brand: claim.deviceBrand,
		model: claim.deviceModel,
		faultType: claim.faultType,
		repairCost: claim.repairCost || 0,
		status:
			(claim.status as
				| "pending"
				| "approved"
				| "rejected"
				| "in-progress"
				| "completed") || "pending",
		paymentStatus: "unpaid" as "paid" | "unpaid", // Default, should come from API
		createdAt: claim.dateSubmitted,
		documents: claim.documents || [],
		approvedAt: claim.dateUpdated,
		completedAt: claim.estimatedCompletionDate,
	};

	return (
		<UnifiedClaimRepairDetailView claimData={claimData} role="service-center" />
	);
};
*/
