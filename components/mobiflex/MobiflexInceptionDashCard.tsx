"use client";

import React, { useState } from "react";
import { Card, CardBody, Select, SelectItem } from "@heroui/react";
import Link from "next/link";
import { BarChart3, Smartphone, TrendingUp, Calendar } from "lucide-react";
import {
	useMobiflexLeaderboard,
	useMobiflexRegionStats,
	useMobiflexPartnerStats,
} from "@/hooks/mobiflex";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn } from "@/lib";
import { formatCurrency, formatNumber } from "@/lib/helper";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from "recharts";

// Period options for the dashboard
const periodOptions = [
	{ key: "daily", label: "Daily" },
	{ key: "weekly", label: "Weekly" },
	{ key: "monthly", label: "Monthly" },
	{ key: "yearly", label: "Yearly" },
	{ key: "mtd", label: "MTD" },
];

const MobiflexInceptionDashCard = () => {
	const [hasNoRecords, setHasNoRecords] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState<
		"daily" | "weekly" | "monthly" | "yearly" | "mtd"
	>("mtd");

	const { data: leaderboardData, isLoading: loadingLeaderboard } =
		useMobiflexLeaderboard(selectedPeriod);
	const { data: regionData, isLoading: loadingRegions } =
		useMobiflexRegionStats(selectedPeriod);
	const { data: partnerData, isLoading: loadingPartners } =
		useMobiflexPartnerStats(selectedPeriod);

	const isLoading = loadingLeaderboard || loadingRegions || loadingPartners;

	// Helper to format numbers with commas
	const formatDisplayNumber = (num: string | number) => {
		if (typeof num === "string" && num.includes(".")) {
			const [intPart, decPart] = num.split(".");
			return `${Number(intPart).toLocaleString("en-GB")}.${decPart}`;
		}
		return Number(num).toLocaleString("en-GB");
	};

	// Channel configuration with colors and icons
	const channelConfig = {
		overall: {
			name: "Overall Performance",
			color: "from-indigo-500 to-indigo-600",
			bgColor: "bg-indigo-50",
			borderColor: "border-indigo-200",
			icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
			url: "/access/admin/reports/mobiflex/overview",
		},
		regions: {
			name: "Regional Performance",
			color: "from-purple-500 to-purple-600",
			bgColor: "bg-purple-50",
			borderColor: "border-purple-200",
			icon: <Smartphone className="w-5 h-5 text-purple-600" />,
			url: "/access/admin/reports/mobiflex/regions",
		},
		partners: {
			name: "Partner Performance",
			color: "from-green-500 to-green-600",
			bgColor: "bg-green-50",
			borderColor: "border-green-200",
			icon: <Smartphone className="w-5 h-5 text-green-600" />,
			url: "/access/admin/reports/mobiflex/partners",
		},
	};

	const renderMetricRow = (
		label: string,
		value: string | number,
		isCurrency: boolean = false
	) => (
		<div className="flex flex-row items-center justify-between lg:flex-col lg:items-start xl:flex-col xl:items-start py-2 border-b border-gray-100 last:border-b-0">
			<span
				className={cn(
					"text-xs text-gray-600 lg:mb-1 xl:mb-1",
					GeneralSans_Meduim.className
				)}
			>
				{label}
			</span>
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

	const renderChannelCard = (
		channel: keyof typeof channelConfig,
		data: any,
		type: "overall" | "regions" | "partners"
	) => {
		const config = channelConfig[channel];

		let metrics: Array<{
			label: string;
			value: string | number;
			isCurrency: boolean;
		}> = [];
		if (type === "overall") {
			metrics = [
				{
					label: "Total Agents",
					value: data?.totalAgents || 0,
					isCurrency: false,
				},
				{
					label: "Total Commission",
					value: data?.summary?.totalCommission || 0,
					isCurrency: true,
				},
				{
					label: "Agent Commission",
					value: data?.summary?.totalAgentCommission || 0,
					isCurrency: true,
				},
				{
					label: "Total Loans",
					value: data?.summary?.totalLoans || 0,
					isCurrency: false,
				},
			];
		} else if (type === "regions") {
			metrics = [
				{
					label: "Active States",
					value: data?.summary?.totalStates || 0,
					isCurrency: false,
				},
				{
					label: "Top State Agents",
					value: data?.summary?.topPerformingState?.agentCount || 0,
					isCurrency: false,
				},
				{
					label: "Top State Commission",
					value: data?.summary?.topPerformingState?.totalCommission || 0,
					isCurrency: true,
				},
				{
					label: "Total Commissions",
					value: data?.summary?.totalCommissions || 0,
					isCurrency: false,
				},
			];
		} else if (type === "partners") {
			metrics = [
				{
					label: "Active Partners",
					value: data?.summary?.totalPartners || 0,
					isCurrency: false,
				},
				{
					label: "Top Partner Agents",
					value: data?.summary?.topPerformingPartner?.agentCount || 0,
					isCurrency: false,
				},
				{
					label: "Top Partner Commission",
					value: data?.summary?.topPerformingPartner?.totalCommission || 0,
					isCurrency: true,
				},
				{
					label: "Average per Partner",
					value: data?.summary?.averageAgentsPerPartner || 0,
					isCurrency: false,
				},
			];
		}

		return (
			<Card
				as={Link}
				isPressable
				href={config.url}
				className={cn(
					"group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
					config.borderColor,
					"hover:border-gray-300"
				)}
			>
				{/* Gradient header */}
				<div className={cn("bg-gradient-to-r p-3", config.color)}>
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
								{config.name}
							</h2>
						</div>
						<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							<TrendingUp className="w-5 h-5 text-white" />
						</div>
					</div>
				</div>

				{/* Card body */}
				<CardBody className="p-4 space-y-1">
					{metrics.map((metric, index) => (
						<div key={index}>
							{renderMetricRow(metric.label, metric.value, metric.isCurrency)}
						</div>
					))}
				</CardBody>

				{/* Hover effect overlay */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
			</Card>
		);
	};

	// Chart component to display performance data
	const renderPerformanceChart = () => {
		const chartData = [
			{
				name: "Overall",
				commission: leaderboardData?.summary?.totalCommission || 0,
				loans: leaderboardData?.summary?.totalLoans || 0,
				color: "#6366f1",
			},
			{
				name: "Top Region",
				commission:
					regionData?.summary?.topPerformingState?.totalCommission || 0,
				loans: regionData?.summary?.totalCommissions || 0,
				color: "#8b5cf6",
			},
			{
				name: "Top Partner",
				commission:
					partnerData?.summary?.topPerformingPartner?.totalCommission || 0,
				loans: partnerData?.summary?.totalCommissions || 0,
				color: "#22c55e",
			},
		];

		const CustomTooltip = ({ active, payload, label }: any) => {
			if (active && payload && payload.length) {
				return (
					<div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
						<p
							className={cn(
								"font-semibold text-gray-900 mb-2",
								GeneralSans_SemiBold.className
							)}
						>
							{label}
						</p>
						<div className="space-y-1">
							<p className="text-sm text-blue-600">
								Commission: ₦{formatDisplayNumber(payload[0].value)}
							</p>
							<p className="text-sm text-green-600">
								Loans: {formatDisplayNumber(payload[1].value)}
							</p>
						</div>
					</div>
				);
			}
			return null;
		};

		return (
			<Card className="h-[350px] border border-gray-200 rounded-xl overflow-hidden">
				<div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200">
					<h3
						className={cn(
							"text-lg font-semibold text-gray-900",
							GeneralSans_SemiBold.className
						)}
					>
						Performance Comparison
					</h3>
					<p className="text-sm text-gray-600">
						Commission and loan distribution across categories
					</p>
				</div>
				<CardBody className="p-0">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart
							data={chartData}
							margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Bar dataKey="commission" fill="#3b82f6" name="Commission (₦)" />
							<Bar dataKey="loans" fill="#22c55e" name="Loans" />
						</BarChart>
					</ResponsiveContainer>
				</CardBody>
			</Card>
		);
	};

	// Regional breakdown chart
	const renderRegionalBreakdownChart = () => {
		const chartData =
			regionData?.regionStats?.slice(0, 6).map((region) => ({
				name:
					region.state.length > 10
						? region.state.substring(0, 10) + "..."
						: region.state,
				commission: region.totalCommission,
				agents: region.agentCount,
				color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
			})) || [];

		const CustomTooltip = ({ active, payload, label }: any) => {
			if (active && payload && payload.length) {
				return (
					<div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
						<p
							className={cn(
								"font-semibold text-gray-900 mb-2",
								GeneralSans_SemiBold.className
							)}
						>
							{label}
						</p>
						<div className="space-y-1">
							<p className="text-sm text-blue-600">
								Commission: ₦{formatDisplayNumber(payload[0].value)}
							</p>
							<p className="text-sm text-green-600">
								Agents: {formatDisplayNumber(payload[1].value)}
							</p>
						</div>
					</div>
				);
			}
			return null;
		};

		return (
			<Card className="h-[350px] border border-gray-200 rounded-xl overflow-hidden">
				<div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200">
					<h3
						className={cn(
							"text-lg font-semibold text-gray-900",
							GeneralSans_SemiBold.className
						)}
					>
						Regional Performance Breakdown
					</h3>
					<p className="text-sm text-gray-600">
						Commission and agent distribution by state
					</p>
				</div>
				<CardBody className="p-0">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart
							data={chartData}
							margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Bar dataKey="commission" fill="#6366f1" name="Commission (₦)" />
							<Bar dataKey="agents" fill="#f59e0b" name="Agents" />
						</BarChart>
					</ResponsiveContainer>
				</CardBody>
			</Card>
		);
	};

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
						Mobiflex Performance Overview
					</h1>
					<p className="text-gray-600 text-sm sm:text-base">
						Comprehensive agent performance and commission analytics
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
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
				{/* Chart */}
				<div className="space-y-4">{renderPerformanceChart()}</div>

				{/* Channel Cards */}
				<div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
					{renderChannelCard("overall", leaderboardData, "overall")}
					{renderChannelCard("regions", regionData, "regions")}
					{renderChannelCard("partners", partnerData, "partners")}
				</div>
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
					<div className="space-y-4">
						<div className="animate-pulse">
							<div className="bg-gray-200 h-80 rounded-xl"></div>
						</div>
					</div>
					<div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="animate-pulse">
								<div className="bg-gray-200 h-16 rounded-t-2xl"></div>
								<div className="bg-white p-4 space-y-3 rounded-b-2xl border">
									{[...Array(4)].map((_, j) => (
										<div key={j} className="flex justify-between">
											<div className="h-3 bg-gray-200 rounded w-20"></div>
											<div className="h-3 bg-gray-200 rounded w-16"></div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* No records state */}
			{hasNoRecords && !isLoading && (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<BarChart3 className="w-8 h-8 text-gray-400" />
					</div>
					<h3
						className={cn(
							"text-lg font-semibold text-gray-900 mb-2",
							GeneralSans_SemiBold.className
						)}
					>
						No Mobiflex Data Available
					</h3>
					<p className="text-gray-600">
						There are no Mobiflex performance records available at the moment.
					</p>
				</div>
			)}
		</div>
	);
};

export default MobiflexInceptionDashCard;
