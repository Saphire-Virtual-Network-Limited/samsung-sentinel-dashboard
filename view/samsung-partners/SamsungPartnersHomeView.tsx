"use client";

import React, { useState, useMemo } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
	Skeleton,
} from "@heroui/react";
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
import { usePartnersDashboard } from "@/hooks/samsung-partners/usePartnersDashboard";
import { DashboardFilter } from "@/lib/api/partners";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the SamsungPartnersSearchImeiModal to avoid SSR issues
const SamsungPartnersSearchImeiModal = dynamic(
	() => import("@/components/modals/SamsungPartnersSearchImeiModal"),
	{ ssr: false }
);

const FILTER_OPTIONS = [
	{ label: "Daily", value: "daily" },
	{ label: "Weekly", value: "weekly" },
	{ label: "Month to Date", value: "mtd" },
	{ label: "Since Inception", value: "inception" },
];

export default function SamsungPartnersHomeView() {
	const [filter, setFilter] = useState<DashboardFilter>("mtd");

	// Fetch dashboard statistics
	const { stats, isLoading } = usePartnersDashboard({ filter });

	const dashboardCards = useMemo(
		() => [
			{
				title: "Total Claims",
				value: stats?.statistics?.total_claims || 0,
				icon: FileText,
				color: "bg-blue-500",
				textColor: "text-blue-500",
				href: "/access/samsung-partners/claims",
			},
			{
				title: "Pending Claims",
				value: stats?.statistics?.pending_claims || 0,
				icon: Clock,
				color: "bg-orange-500",
				textColor: "text-orange-500",
				href: "/access/samsung-partners/claims/pending",
			},
			{
				title: "Approved Claims",
				value: stats?.statistics?.approved_claims || 0,
				icon: CheckCircle,
				color: "bg-green-500",
				textColor: "text-green-500",
				href: "/access/samsung-partners/claims/approved",
			},
			{
				title: "Rejected Claims",
				value: stats?.statistics?.rejected_claims || 0,
				icon: XCircle,
				color: "bg-red-500",
				textColor: "text-red-500",
				href: "/access/samsung-partners/claims/rejected",
			},
			{
				title: "Completed Claims",
				value: stats?.statistics?.completed_claims || 0,
				icon: Wrench,
				color: "bg-purple-500",
				textColor: "text-purple-500",
				href: "/access/samsung-partners/claims?status=completed",
			},
			{
				title: "Authorized Claims",
				value: stats?.statistics?.authorized_claims || 0,
				icon: CheckCircle,
				color: "bg-teal-500",
				textColor: "text-teal-500",
				href: "/access/samsung-partners/claims?status=authorized",
			},
			{
				title: "Paid Claims",
				value: stats?.statistics?.paid_claims || 0,
				icon: DollarSign,
				color: "bg-green-600",
				textColor: "text-green-600",
				href: "/access/samsung-partners/claims?status=completed&payment=paid",
			},
			{
				title: "Unpaid Claims",
				value: stats?.statistics?.unpaid_claims || 0,
				icon: TrendingUp,
				color: "bg-yellow-500",
				textColor: "text-yellow-500",
				href: "/access/samsung-partners/claims?status=authorized",
			},
		],
		[stats]
	);

	return (
		<div className="space-y-6 p-6">
			{/* Header with Filter */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Samsung Partners Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Overview of your repair claims and processing status
					</p>
				</div>
				<div className="w-48">
					<Select
						label="Time Period"
						selectedKeys={[filter]}
						onSelectionChange={(keys) => {
							const selected = Array.from(keys)[0] as DashboardFilter;
							setFilter(selected);
						}}
						size="sm"
					>
						{FILTER_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</Select>
				</div>
			</div>

			{/* Stats Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{isLoading ? (
					<>
						{[...Array(8)].map((_, idx) => (
							<Card key={idx} className="border border-default-200">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<Skeleton className="h-4 w-24 rounded" />
									<Skeleton className="h-4 w-4 rounded" />
								</CardHeader>
								<CardBody>
									<Skeleton className="h-8 w-16 rounded" />
								</CardBody>
							</Card>
						))}
					</>
				) : (
					dashboardCards.map((card, index) => {
						const IconComponent = card.icon;
						return (
							<Link key={index} href={card.href}>
								<Card className="hover:shadow-lg transition-shadow cursor-pointer border border-default-200">
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
					})
				)}
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Quick Actions</h3>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<Link
							href="/access/samsung-partners/claims"
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
							href="/access/samsung-partners/claims?status=pending"
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
							href="/access/samsung-partners/claims?status=completed"
							className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
						>
							<Wrench className="h-6 w-6 text-purple-500" />
							<div>
								<div className="font-medium">Completed Claims</div>
								<div className="text-sm text-gray-500">
									View completed claims
								</div>
							</div>
						</Link>
						{/* Samsung Partners IMEI Search Quick Action */}
						<div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
							<SamsungPartnersSearchImeiModal
								buttonText="Search IMEI"
								buttonColor="primary"
								buttonVariant="flat"
								buttonSize="md"
								showIcon={true}
							/>
							<div>
								<div className="font-medium">Search IMEI</div>
								<div className="text-sm text-gray-500">
									Lookup IMEI and view claims
								</div>
							</div>
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
