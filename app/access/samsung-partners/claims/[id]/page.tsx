"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import UnifiedClaimRepairDetailView from "@/components/shared/UnifiedClaimRepairDetailView";
import { useClaim } from "@/hooks/shared/useClaim";

const SamsungPartnersClaimDetailPage = () => {
	const params = useParams();
	const router = useRouter();
	const claimId = params.id as string;

	const {
		claim,
		isLoading,
		error,
		approveHandler,
		rejectHandler,
		authorizePaymentHandler,
	} = useClaim({ claimId, role: "samsung-partners" });

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-6">
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading claim details...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !claim) {
		return (
			<div className="container mx-auto px-4 py-6">
				<div className="text-center py-12">
					<p className="text-red-500 text-lg">
						{error?.message || "Claim not found"}
					</p>
					<Button
						color="primary"
						variant="flat"
						className="mt-4"
						onPress={() => router.back()}
						startContent={<ArrowLeft size={16} />}
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<Button
				variant="flat"
				size="sm"
				className="mb-4"
				onPress={() => router.back()}
				startContent={<ArrowLeft size={16} />}
			>
				Back to Claims
			</Button>

			<UnifiedClaimRepairDetailView
				claimData={claim}
				role="samsung-partners"
				onApprove={approveHandler}
				onReject={rejectHandler}
				onAuthorizePayment={authorizePaymentHandler}
				onExecutePayment={undefined} // Samsung partners cannot execute payment
			/>
		</div>
	);
};

export default SamsungPartnersClaimDetailPage;
