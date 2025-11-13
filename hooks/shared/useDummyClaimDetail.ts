"use client";

import { useState, useEffect } from "react";
import { ClaimRepairItem } from "@/components/shared/ClaimsRepairsTable";

export const useDummyClaimDetail = (
	claimId: string
): {
	claim: ClaimRepairItem | null;
	isLoading: boolean;
	error: Error | null;
	bankDetails?: {
		bankName: string;
		accountNumber: string;
		accountName: string;
	};
} => {
	const [claim, setClaim] = useState<ClaimRepairItem | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchClaimDetail = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 600));

				// Extract claim number from claimId (e.g., "CLM0001" -> 1)
				const claimNumber = parseInt(claimId.replace(/\D/g, "")) || 1;

				// Generate consistent dummy data based on claimId
				const statuses: Array<"pending" | "approved" | "rejected"> = [
					"pending",
					"approved",
					"rejected",
				];
				const paymentStatuses: Array<"paid" | "unpaid"> = ["paid", "unpaid"];

				const faultTypes = [
					"Screen Damage",
					"Battery Issue",
					"Water Damage",
					"Charging Port",
					"Speaker Problem",
					"Camera Fault",
					"Software Issue",
					"Network Problem",
				];

				const brands = ["Samsung", "Apple", "Xiaomi", "Tecno"];
				const models = [
					"Galaxy S23",
					"Galaxy S22",
					"Galaxy A54",
					"Galaxy Z Fold 5",
					"Galaxy Z Flip 5",
					"Galaxy A34",
					"Galaxy Note 20",
					"iPhone 14 Pro",
					"Redmi Note 12",
					"Spark 10 Pro",
				];

				const serviceCenters = [
					"Lagos Service Center",
					"Abuja Service Center",
					"Port Harcourt Center",
					"Kano Service Hub",
					"Ibadan Repair Center",
				];

				const engineers = [
					"John Doe",
					"Jane Smith",
					"Ahmed Hassan",
					"Chioma Okafor",
					"David Williams",
				];

				const statusIndex = claimNumber % statuses.length;
				const claimStatus = statuses[statusIndex];

				// Generate repair status
				const repairStatuses = [
					"pending",
					"awaiting-parts",
					"received-device",
					"completed",
				] as const;
				const repairStatusIndex = claimNumber % repairStatuses.length;
				const repairStatus = repairStatuses[repairStatusIndex];

				const isCompleted = repairStatus === "completed";
				const paymentStatus = isCompleted
					? paymentStatuses[claimNumber % 2]
					: undefined;
				const brand = brands[claimNumber % brands.length];
				const model = models[claimNumber % models.length];

				const dummyClaim: ClaimRepairItem = {
					id: `${claimNumber}`,
					claimId: claimId,
					customerName: `Customer ${claimNumber}`,
					imei: `35${String(1000000000000 + claimNumber)}`,
					deviceName: `${brand} ${model}`,
					brand,
					model,
					faultType: faultTypes[claimNumber % faultTypes.length],
					repairCost: Math.floor(Math.random() * 50000) + 10000,
					status: claimStatus.toUpperCase() as
						| "PENDING"
						| "APPROVED"
						| "REJECTED"
						| "COMPLETED"
						| "AUTHORIZED",
					repairStatus: repairStatus?.toUpperCase() as
						| "PENDING"
						| "AWAITING_PARTS"
						| "RECEIVED_DEVICE"
						| "COMPLETED"
						| undefined,
					paymentStatus: paymentStatus?.toUpperCase() as
						| "PAID"
						| "UNPAID"
						| undefined,
					serviceCenterName:
						serviceCenters[claimNumber % serviceCenters.length],
					engineerName: engineers[claimNumber % engineers.length],
					createdAt: new Date(
						2025,
						9,
						Math.floor(Math.random() * 13) + 1
					).toISOString(),
					transactionRef:
						paymentStatus === "paid"
							? `TXN${String(claimNumber).padStart(6, "0")}`
							: undefined,
					sessionId:
						paymentStatus === "paid"
							? `SES${String(claimNumber).padStart(6, "0")}`
							: undefined,
					rejectionReason:
						claimStatus === "rejected"
							? `Claim rejected due to policy violation. Invalid documentation provided for claim ${claimId}.`
							: undefined,
					completedAt: isCompleted
						? new Date(
								2025,
								9,
								Math.floor(Math.random() * 13) + 1
						  ).toISOString()
						: undefined,
					approvedAt:
						claimStatus === "approved" || isCompleted
							? new Date(
									2025,
									9,
									Math.floor(Math.random() * 13) + 1
							  ).toISOString()
							: undefined,
					rejectedAt:
						claimStatus === "rejected"
							? new Date(
									2025,
									9,
									Math.floor(Math.random() * 13) + 1
							  ).toISOString()
							: undefined,
				};

				setClaim(dummyClaim);
			} catch (err) {
				const error =
					err instanceof Error
						? err
						: new Error("Failed to fetch claim details");
				setError(error);
			} finally {
				setIsLoading(false);
			}
		};

		if (claimId) {
			fetchClaimDetail();
		}
	}, [claimId]);

	// Generate bank details for unpaid completed claims
	const bankDetails =
		claim?.repairStatus === "COMPLETED" && claim?.paymentStatus === "UNPAID"
			? {
					bankName: ["GTBank", "Access Bank", "First Bank", "Zenith Bank"][
						parseInt(claim.id) % 4
					],
					accountNumber: String(1000000000 + parseInt(claim.id)),
					accountName: `${claim.serviceCenterName} Account`,
			  }
			: undefined;

	return {
		claim,
		isLoading,
		error,
		bankDetails,
	};
};
