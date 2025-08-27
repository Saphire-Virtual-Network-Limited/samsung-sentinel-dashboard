"use client";

import React, { useState } from "react";
import { Card, CardBody, Select, SelectItem } from "@heroui/react";
import Link from "next/link";
import {
	TrendingUp,
	Users,
	Award,
	DollarSign,
	Target,
	CheckCircle,
	XCircle,
	Calendar,
} from "lucide-react";
import { useMobiflexLeaderboard } from "@/hooks/mobiflex";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn } from "@/lib";
import { formatCurrency, formatNumber } from "@/lib/helper";

// Period options for the dashboard
const periodOptions = [
	{ key: "daily", label: "Daily" },
	{ key: "weekly", label: "Weekly" },
	{ key: "monthly", label: "Monthly" },
	{ key: "yearly", label: "Yearly" },
	{ key: "mtd", label: "MTD" },
];

const MobiflexLeaderboardAnalytic = () => {
	const [hasNoRecords, setHasNoRecords] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState<
		"daily" | "weekly" | "monthly" | "yearly" | "mtd"
	>("mtd");

	const { data: leaderboardData, isLoading } =
		useMobiflexLeaderboard(selectedPeriod);

	// Helper to format numbers with commas
	const formatDisplayNumber = (num: string | number) => {
		if (typeof num === "string" && num.includes(".")) {
			const [intPart, decPart] = num.split(".");
			return `${Number(intPart).toLocaleString("en-GB")}.${decPart}`;
		}
		return Number(num).toLocaleString("en-GB");
	};

	// Metric configuration with colors and icons
	const metricConfig = {
		agents: {
			title: "Agent Performance",
			color: "from-blue-500 to-blue-600",
			bgColor: "bg-blue-50",
			borderColor: "border-blue-200",
			icon: <Users className="w-5 h-5 text-blue-600" />,
		},
		commission: {
			title: "Commission Analytics",
			color: "from-purple-500 to-purple-600",
			bgColor: "bg-purple-50",
			borderColor: "border-purple-200",
			icon: <DollarSign className="w-5 h-5 text-purple-600" />,
		},
		performance: {
			title: "Top Performance",
			color: "from-green-500 to-green-600",
			bgColor: "bg-green-50",
			borderColor: "border-green-200",
			icon: <Award className="w-5 h-5 text-green-600" />,
		},
	};

	const renderMetricRow = (
		label: string,
		value: string | number,
		isTop: boolean = true,
		isCurrency: boolean = false
	) => (
		<div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
			<div className="flex items-center space-x-2">
				{isTop ? (
					<CheckCircle className="w-4 h-4 text-green-500" />
				) : (
					<Target className="w-4 h-4 text-blue-500" />
				)}
				<span
					className={cn("text-xs text-gray-600", GeneralSans_Meduim.className)}
				>
					{label}
				</span>
			</div>
			<span
				className={cn(
					"text-sm font-semibold text-gray-900",
					GeneralSans_SemiBold.className
				)}
			>
				{isCurrency
					? `₦${formatDisplayNumber(value)}`
					: formatDisplayNumber(value)}
			</span>
		</div>
	);

	const renderMetricCard = (
		metricKey: keyof typeof metricConfig,
		data1: {
			label: string;
			value: string | number;
			isTop?: boolean;
			isCurrency?: boolean;
		},
		data2: {
			label: string;
			value: string | number;
			isTop?: boolean;
			isCurrency?: boolean;
		}
	) => {
		const config = metricConfig[metricKey];

		return (
			<Card
				as={Link}
				isPressable
				href={"#"}
				className={cn(
					"group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
					config.borderColor,
					"hover:border-gray-300"
				)}
			>
				{/* Gradient header */}
				<div className={cn("bg-gradient-to-r p-4", config.color)}>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<div className={cn("p-2 rounded-lg", config.bgColor)}>
								{config.icon}
							</div>
							<h2
								className={cn(
									"text-white font-semibold text-lg",
									GeneralSans_SemiBold.className
								)}
							>
								{config.title}
							</h2>
						</div>
						<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							<div className="w-2 h-2 bg-white rounded-full"></div>
						</div>
					</div>
				</div>

				{/* Card body */}
				<CardBody className="p-4 space-y-1">
					{renderMetricRow(
						data1.label,
						data1.value,
						data1.isTop,
						data1.isCurrency
					)}
					{renderMetricRow(
						data2.label,
						data2.value,
						data2.isTop,
						data2.isCurrency
					)}
				</CardBody>

				{/* Hover effect overlay */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
			</Card>
		);
	};

	// Build metrics data
	const metrics = [
		{
			key: "agents" as keyof typeof metricConfig,
			data1: {
				label: "Total Agents",
				value: leaderboardData?.totalAgents || 0,
				isTop: true,
				isCurrency: false,
			},
			data2: {
				label: "Top Agent Loans",
				value: leaderboardData?.summary?.topAgent?.loanCount || 0,
				isTop: false,
				isCurrency: false,
			},
		},
		{
			key: "commission" as keyof typeof metricConfig,
			data1: {
				label: "Total Commission",
				value: leaderboardData?.summary?.totalCommission || 0,
				isTop: true,
				isCurrency: true,
			},
			data2: {
				label: "Agent Commission",
				value: leaderboardData?.summary?.totalAgentCommission || 0,
				isTop: false,
				isCurrency: true,
			},
		},
		{
			key: "performance" as keyof typeof metricConfig,
			data1: {
				label: "Total Loans",
				value: leaderboardData?.summary?.totalLoans || 0,
				isTop: true,
				isCurrency: false,
			},
			data2: {
				label: "Top Agent Commission",
				value: leaderboardData?.summary?.topAgent?.totalCommission || 0,
				isTop: false,
				isCurrency: true,
			},
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="text-center sm:text-left">
					<h1
						className={cn(
							"text-2xl sm:text-3xl font-bold text-gray-900 mb-2",
							GeneralSans_SemiBold.className
						)}
					>
						Mobiflex Leaderboard Analytics
					</h1>
					<p className="text-gray-600 text-sm sm:text-base">
						Agent performance metrics and commission analytics across different
						categories
					</p>
				</div>

				{/* Period Selector */}
				<div className="flex items-center gap-2 sm:min-w-[200px]">
					<Calendar className="w-4 h-4 text-gray-500" />
					<Select
						label="Period"
						placeholder="Select period"
						value={selectedPeriod}
						onChange={(e) =>
							setSelectedPeriod(
								e.target.value as
									| "daily"
									| "weekly"
									| "monthly"
									| "yearly"
									| "mtd"
							)
						}
						className="max-w-xs"
						size="sm"
					>
						{periodOptions.map((period) => (
							<SelectItem key={period.key} value={period.key}>
								{period.label}
							</SelectItem>
						))}
					</Select>
				</div>
			</div>

			{/* Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
				{metrics.map((metric, index) => (
					<div key={index}>
						{renderMetricCard(metric.key, metric.data1, metric.data2)}
					</div>
				))}
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="animate-pulse">
							<div className="bg-gray-200 h-16 rounded-t-2xl"></div>
							<div className="bg-white p-4 space-y-3 rounded-b-2xl border">
								{[...Array(2)].map((_, j) => (
									<div key={j} className="flex justify-between">
										<div className="h-3 bg-gray-200 rounded w-20"></div>
										<div className="h-3 bg-gray-200 rounded w-16"></div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{/* No records state */}
			{hasNoRecords && !isLoading && (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<Users className="w-8 h-8 text-gray-400" />
					</div>
					<h3
						className={cn(
							"text-lg font-semibold text-gray-900 mb-2",
							GeneralSans_SemiBold.className
						)}
					>
						No Leaderboard Data Available
					</h3>
					<p className="text-gray-600">
						There are no agent leaderboard records available at the moment.
					</p>
				</div>
			)}
		</div>
	);
};

export default MobiflexLeaderboardAnalytic;
