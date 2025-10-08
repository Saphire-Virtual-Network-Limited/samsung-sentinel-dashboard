"use client";

import React from "react";
import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import {
	Home,
	FileText,
	CheckCircle,
	XCircle,
	Clock,
	DollarSign,
	Wrench,
	TrendingUp,
} from "lucide-react";
import { useRepairClaims } from "@/hooks/samsung-partners/useRepairClaims";
import { useProcessedClaims } from "@/hooks/samsung-partners/useProcessedClaims";
import Link from "next/link";

interface RepairClaim {
	id: string;
	status: "pending" | "approved" | "rejected";
}

interface ProcessedClaim {
	id: string;
	paymentStatus: "paid" | "unpaid";
}

export default function SamsungPartnersHomeView() {
	const { claims: repairClaims, isLoading: repairClaimsLoading } =
		useRepairClaims();
	const { claims: processedClaims, isLoading: processedClaimsLoading } =
		useProcessedClaims();

	const getClaimsStats = () => {
		if (!repairClaims)
			return { total: 0, pending: 0, approved: 0, rejected: 0 };

		return {
			total: repairClaims.length,
			pending: repairClaims.filter(
				(claim: RepairClaim) => claim.status === "pending"
			).length,
			approved: repairClaims.filter(
				(claim: RepairClaim) => claim.status === "approved"
			).length,
			rejected: repairClaims.filter(
				(claim: RepairClaim) => claim.status === "rejected"
			).length,
		};
	};

	const getProcessedStats = () => {
		if (!processedClaims) return { total: 0, paid: 0, unpaid: 0 };

		return {
			total: processedClaims.length,
			paid: processedClaims.filter(
				(claim: ProcessedClaim) => claim.paymentStatus === "paid"
			).length,
			unpaid: processedClaims.filter(
				(claim: ProcessedClaim) => claim.paymentStatus === "unpaid"
			).length,
		};
	};

	const claimsStats = getClaimsStats();
	const processedStats = getProcessedStats();
	const isLoading = repairClaimsLoading || processedClaimsLoading;

	const dashboardCards = [
		{
			title: "Total Repair Claims",
			value: isLoading ? "..." : claimsStats.total,
			icon: FileText,
			color: "bg-blue-500",
			textColor: "text-blue-500",
			href: "/access/samsung-partners/repair-claims",
		},
		{
			title: "Pending Claims",
			value: isLoading ? "..." : claimsStats.pending,
			icon: Clock,
			color: "bg-orange-500",
			textColor: "text-orange-500",
			href: "/access/samsung-partners/repair-claims/pending",
		},
		{
			title: "Approved Claims",
			value: isLoading ? "..." : claimsStats.approved,
			icon: CheckCircle,
			color: "bg-green-500",
			textColor: "text-green-500",
			href: "/access/samsung-partners/repair-claims/approved",
		},
		{
			title: "Rejected Claims",
			value: isLoading ? "..." : claimsStats.rejected,
			icon: XCircle,
			color: "bg-red-500",
			textColor: "text-red-500",
			href: "/access/samsung-partners/repair-claims/rejected",
		},
		{
			title: "Total Processed",
			value: isLoading ? "..." : processedStats.total,
			icon: Wrench,
			color: "bg-purple-500",
			textColor: "text-purple-500",
			href: "/access/samsung-partners/processed-claims",
		},
		{
			title: "Paid Claims",
			value: isLoading ? "..." : processedStats.paid,
			icon: DollarSign,
			color: "bg-green-600",
			textColor: "text-green-600",
			href: "/access/samsung-partners/processed-claims/paid",
		},
		{
			title: "Unpaid Claims",
			value: isLoading ? "..." : processedStats.unpaid,
			icon: TrendingUp,
			color: "bg-yellow-500",
			textColor: "text-yellow-500",
			href: "/access/samsung-partners/processed-claims/unpaid",
		},
	];

	return (
		<div className="space-y-6 p-6">
			{/* Stats Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{dashboardCards.map((card, index) => {
					const IconComponent = card.icon;
					return (
						<Link key={index} href={card.href}>
							<Card className="hover:shadow-lg transition-shadow cursor-pointer">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<div className="text-sm font-medium text-gray-600">
										{card.title}
									</div>
									<IconComponent className={`h-4 w-4 ${card.textColor}`} />
								</CardHeader>
								<CardBody>
									<div className="text-2xl font-bold">{card.value}</div>
								</CardBody>
							</Card>
						</Link>
					);
				})}
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Quick Actions</h3>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<Link
							href="/access/samsung-partners/repair-claims"
							className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
						>
							<FileText className="h-6 w-6 text-blue-500" />
							<div>
								<div className="font-medium">All Repair Claims</div>
								<div className="text-sm text-gray-500">
									View all repair claims
								</div>
							</div>
						</Link>

						<Link
							href="/access/samsung-partners/repair-claims/pending"
							className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
						>
							<Clock className="h-6 w-6 text-orange-500" />
							<div>
								<div className="font-medium">Pending Claims</div>
								<div className="text-sm text-gray-500">
									Review pending claims
								</div>
							</div>
						</Link>

						<Link
							href="/access/samsung-partners/processed-claims"
							className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
						>
							<Wrench className="h-6 w-6 text-purple-500" />
							<div>
								<div className="font-medium">Processed Claims</div>
								<div className="text-sm text-gray-500">
									View processed claims
								</div>
							</div>
						</Link>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
