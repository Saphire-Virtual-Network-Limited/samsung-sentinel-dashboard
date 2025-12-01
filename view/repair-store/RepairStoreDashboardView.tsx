"use client";

import React from "react";
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Chip,
	Skeleton,
} from "@heroui/react";
import {
	MapPin,
	Users,
	CreditCard,
	Wrench,
	AlertCircle,
	TrendingUp,
	Package,
	ClipboardList,
} from "lucide-react";
import { StatCard } from "@/components/atoms/StatCard";
import { useRouter } from "next/navigation";
import { useRepairStoreDashboard } from "@/hooks/repair-store/useRepairStoreDashboard";

export default function RepairStoreDashboardView() {
	const router = useRouter();

	// Fetch dashboard statistics with inception filter
	const { stats, isLoading, error } = useRepairStoreDashboard({
		filter: "inception",
	});

	// Extract dashboard data
	const overview = stats?.overview;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const statCards = [
		{
			title: "Total Service Centers",
			value: overview?.total_service_centers?.toString() || "0",
			icon: <MapPin className="w-5 h-5" />,
			link: "/access/repair-store/service-centers",
		},
		{
			title: "Total Engineers",
			value: overview?.total_engineers?.toString() || "0",
			icon: <Users className="w-5 h-5" />,
			link: "/access/repair-store/engineers",
		},
		{
			title: "Monthly Revenue",
			value: formatCurrency(overview?.monthly_revenue || 0),
			icon: <CreditCard className="w-5 h-5" />,
			link: "/access/repair-store/statistics",
		},
		{
			title: "Total Repairs",
			value: overview?.total_repairs?.toString() || "0",
			icon: <Wrench className="w-5 h-5" />,
			link: "/access/repair-store/claims",
		},
	];

	const quickActions = [
		{
			title: "Create Service Center",
			description: "Add a new service center to your network",
			icon: <MapPin className="w-4 h-4" />,
			color: "primary" as const,
			action: () => router.push("/access/repair-store/service-centers"),
		},
		{
			title: "Manage Engineers",
			description: "View and manage engineers across all centers",
			icon: <Users className="w-4 h-4" />,
			color: "secondary" as const,
			action: () => router.push("/access/repair-store/engineers"),
		},
		{
			title: "View Claims",
			description: "Monitor all repair claims and their status",
			icon: <ClipboardList className="w-4 h-4" />,
			color: "warning" as const,
			action: () => router.push("/access/repair-store/claims"),
		},
		{
			title: "View Statistics",
			description: "Analyze performance and revenue metrics",
			icon: <TrendingUp className="w-4 h-4" />,
			color: "success" as const,
			action: () => router.push("/access/repair-store/statistics"),
		},
	];

	return (
		<div className="p-6 space-y-6 min-h-screen">
			{/* Header */}
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold text-gray-900">
					Repair Partner Dashboard
				</h1>
				<p className="text-gray-600">
					Manage your network of service centers and monitor repair operations
				</p>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((card, index) => (
					<Card
						key={index}
						isPressable
						onPress={() => router.push(card.link)}
						className="group hover:shadow-xl transition-all duration-300 border border-default-200"
					>
						<CardBody className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-600 mb-2">
										{card.title}
									</p>
									{isLoading ? (
										<Skeleton className="h-10 w-24 rounded" />
									) : (
										<div className="flex items-baseline gap-2 mb-2">
											<h3 className="text-3xl font-bold text-gray-900">
												{card.value}
											</h3>
										</div>
									)}
								</div>
								<div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
									{card.icon}
								</div>
							</div>
						</CardBody>
					</Card>
				))}
			</div>

			{/* Claims Overview */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
						<div className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-orange-600" />
							<h3 className="text-lg font-semibold">Pending Claims</h3>
						</div>
					</CardHeader>
					<CardBody className="p-4">
						<div className="text-center">
							{isLoading ? (
								<Skeleton className="h-10 w-16 mx-auto mb-2 rounded" />
							) : (
								<p className="text-3xl font-bold text-orange-600 mb-2">
									{overview?.pending_claims || 0}
								</p>
							)}
							<p className="text-sm text-gray-500">Awaiting approval</p>
						</div>
					</CardBody>
				</Card>

				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
						<div className="flex items-center gap-2">
							<Package className="w-5 h-5 text-blue-600" />
							<h3 className="text-lg font-semibold">In Progress</h3>
						</div>
					</CardHeader>
					<CardBody className="p-4">
						<div className="text-center">
							{isLoading ? (
								<Skeleton className="h-10 w-16 mx-auto mb-2 rounded" />
							) : (
								<p className="text-3xl font-bold text-blue-600 mb-2">
									{overview?.in_progress_claims || 0}
								</p>
							)}
							<p className="text-sm text-gray-500">Being repaired</p>
						</div>
					</CardBody>
				</Card>

				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
						<div className="flex items-center gap-2">
							<Wrench className="w-5 h-5 text-green-600" />
							<h3 className="text-lg font-semibold">Completed</h3>
						</div>
					</CardHeader>
					<CardBody className="p-4">
						<div className="text-center">
							{isLoading ? (
								<Skeleton className="h-10 w-16 mx-auto mb-2 rounded" />
							) : (
								<p className="text-3xl font-bold text-green-600 mb-2">
									{overview?.completed_claims || 0}
								</p>
							)}
							<p className="text-sm text-gray-500">All time</p>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Quick Actions and Recent Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Quick Actions */}
				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
						<div className="flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-purple-600" />
							<h3 className="text-lg font-semibold">Quick Actions</h3>
						</div>
					</CardHeader>
					<CardBody className="p-4">
						<div className="space-y-3">
							{quickActions.map((action, index) => (
								<Button
									key={index}
									variant="flat"
									color={action.color}
									className="w-full justify-start h-auto p-3"
									startContent={action.icon}
									onPress={action.action}
								>
									<div className="flex flex-col items-start">
										<span className="font-medium">{action.title}</span>
										<span className="text-xs opacity-70">
											{action.description}
										</span>
									</div>
								</Button>
							))}
						</div>
					</CardBody>
				</Card>

				{/* Revenue Summary */}
				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
						<div className="flex items-center gap-2">
							<CreditCard className="w-5 h-5 text-green-600" />
							<h3 className="text-lg font-semibold">Revenue Summary</h3>
						</div>
					</CardHeader>
					<CardBody className="p-4">
						<div className="space-y-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">Total Revenue</p>
								{isLoading ? (
									<Skeleton className="h-8 w-32 rounded" />
								) : (
									<p className="text-2xl font-bold text-green-600">
										{formatCurrency(overview?.total_revenue || 0)}
									</p>
								)}
							</div>
							<div className="h-px bg-gray-200" />
							<div>
								<p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
								{isLoading ? (
									<Skeleton className="h-6 w-24 rounded" />
								) : (
									<p className="text-xl font-semibold text-gray-900">
										{formatCurrency(overview?.monthly_revenue || 0)}
									</p>
								)}
							</div>
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
