"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn } from "@/lib";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { getDailyReport } from "@/lib";
import { TrendingDown, TrendingUp, BarChart3, Smartphone } from "lucide-react";
import { useState } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import { getSelectedProduct } from "@/utils";

const DailyDashCard = () => {
	const [hasNoRecords, setHasNoRecords] = useState(false);
	const { label: selectedProduct } = getSelectedProduct();

	const sales_channels = [
		"",
		"samsung",
		"xiaomi",
		"oppo",
		"MBE",
		"GLO",
		"9MOBILE",
	];

	// Fetch data for all channels in parallel
	const { data: reports = [], isLoading } = useSWR(
		["daily-report-multi", ...sales_channels],
		async () => {
			try {
				const results = await Promise.all(
					sales_channels.map((channel) =>
						getDailyReport(channel)
							.then((r) => r.data || {})
							.catch((error) => {
								console.error(`Error fetching data for ${channel}:`, error);
								return {};
							})
					)
				);

				if (
					results.every((result) => !result || Object.keys(result).length === 0)
				) {
					setHasNoRecords(true);
				} else {
					setHasNoRecords(false);
				}

				return results;
			} catch (error) {
				console.error("Error fetching daily reports:", error);
				setHasNoRecords(true);
				return [];
			}
		},
		{
			revalidateOnFocus: true,
			dedupingInterval: 60000,
			refreshInterval: 60000,
			shouldRetryOnError: false,
			keepPreviousData: true,
			revalidateIfStale: true,
		}
	);

	console.log("NEW DAILY reports", reports);

	// Extract data for each channel
	const overall = reports[0] || {};
	const samsung = reports[1] || {};
	const xiaomi = reports[2] || {};
	const oppo = reports[3] || {};
	const mbe = reports[4] || {};
	const glo = reports[5] || {};
	const nineMobile = reports[6] || {};
	// Helper to format numbers with commas
	const formatNumber = (num: string | number) => {
		if (typeof num === "string" && num.includes(".")) {
			// Format decimals with commas
			const [intPart, decPart] = num.split(".");
			return `${Number(intPart).toLocaleString("en-GB")}.${decPart}`;
		}
		return Number(num).toLocaleString("en-GB");
	};

	// Helper to get channel data
	const getChannelData = (channelData: any) => {
		return {
			today_loan: channelData.Total_Today_Loan || 0,
			total_value: channelData.Total_Today_Loan_Value || "0",
			average_value: channelData.Average_Today_Loan_Value || "0",
			This_month_MTD_loan: channelData.Total_Today_MTD_Loan || 0,
			Last_month_LTD_loan: channelData.Total_Today_LTD_Loan || 0,
		};
	};

	// Get data for each channel
	const overallData = getChannelData(overall);
	const samsungData = getChannelData(samsung);
	const xiaomiData = getChannelData(xiaomi);
	const oppoData = getChannelData(oppo);
	const mbeData = getChannelData(mbe);
	const gloData = getChannelData(glo);
	const nineMobileData = getChannelData(nineMobile);
	// Helper to format each metric card
	const formatMetric = (
		title: string,
		value: string | number,
		change: string,
		href: string,
		hasNaira: boolean = false
	) => {
		const numericChange = parseFloat(change);
		const isPositive = numericChange > 0;
		const trendIcon = isPositive ? (
			<TrendingUp className="w-3.5 h-3.5" />
		) : (
			<TrendingDown className="w-3.5 h-3.5" />
		);
		const changeColor = isPositive ? "text-green-600" : "text-red-600";
		const changeBg = isPositive ? "bg-green-100" : "bg-red-100";

		return {
			title,
			value,
			change: `${change}%`,
			trendIcon,
			changeColor,
			changeBg,
			href,
			hasNaira,
		};
	};

	// Build dynamic metrics from API response
	const metrics = [
		formatMetric(
			"Total Today Loan",
			formatNumber(overallData.today_loan),
			"0",
			"#"
		),
		formatMetric(
			"Total Today Loan Value",
			formatNumber(overallData.total_value),
			"0",
			"#",
			true
		),
		formatMetric(
			"Average Today Loan Value",
			formatNumber(overallData.average_value),
			"0",
			"#",
			true
		),
		formatMetric("Today Date", overall.Today_Date || "", "0", "#"),
		formatMetric(
			"This Month MTD Loan",
			formatNumber(overallData.This_month_MTD_loan),
			"0",
			"#"
		),
		formatMetric(
			"Last Month LTD Loan",
			formatNumber(overallData.Last_month_LTD_loan),
			"0",
			"#"
		),
	];

	// Channel configuration with colors and icons
	const channelConfig = {
		overall: {
			name: "Overall",
			color: "from-blue-500 to-blue-600",
			bgColor: "bg-blue-50",
			borderColor: "border-blue-200",
			icon: <BarChart3 className="w-4 h-4 text-blue-600" />,
			url: "/access/admin/reports/sales/overview",
		},
		mbe: {
			name: "MBE",
			color: "from-red-500 to-red-600",
			bgColor: "bg-red-50",
			borderColor: "border-red-200",
			icon: <Smartphone className="w-4 h-4 text-red-600" />,
			url: "/access/admin/reports/sales/mbe",
		},
		samsung: {
			name: "Samsung",
			color: "from-purple-500 to-purple-600",
			bgColor: "bg-purple-50",
			borderColor: "border-purple-200",
			icon: <Smartphone className="w-4 h-4 text-purple-600" />,
			url: "/access/admin/reports/sales/samsung",
		},
		xiaomi: {
			name: "Xiaomi",
			color: "from-orange-500 to-orange-600",
			bgColor: "bg-orange-50",
			borderColor: "border-orange-200",
			icon: <Smartphone className="w-4 h-4 text-orange-600" />,
			url: "/access/admin/reports/sales/xiaomi",
		},
		oppo: {
			name: "Oppo",
			color: "from-green-500 to-green-600",
			bgColor: "bg-green-50",
			borderColor: "border-green-200",
			icon: <Smartphone className="w-4 h-4 text-green-600" />,
			url: "/access/admin/reports/sales/oppo",
		},
		glo: {
			name: "GLO",
			color: "from-yellow-500 to-yellow-600",
			bgColor: "bg-yellow-50",
			borderColor: "border-yellow-200",
			icon: <Smartphone className="w-4 h-4 text-yellow-600" />,
			url: "/access/admin/reports/sales/glo",
		},
		nineMobile: {
			name: "9Mobile",
			color: "from-pink-500 to-pink-600",
			bgColor: "bg-pink-50",
			borderColor: "border-pink-200",
			icon: <Smartphone className="w-4 h-4 text-pink-600" />,
			url: "/access/admin/reports/sales/9mobile",
		},
	};

	const renderMetricRow = (
		label: string,
		value: string | number,
		isCurrency: boolean = false
	) => (
		<div className="flex flex-row items-center justify-between lg:flex-col lg:items-start  xl:flex-col xl:items-start py-1 border-b border-gray-100 last:border-b-0">
			<span
				className={cn(
					"text-xs text-gray-600 lg:mb-0.5 xl:mb-0.5",
					GeneralSans_Meduim.className
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					"text-xs font-semibold text-gray-900",
					GeneralSans_SemiBold.className
				)}
			>
				{isCurrency ? `₦${formatNumber(value)}` : formatNumber(value)}
			</span>
		</div>
	);

	const renderChannelCard = (
		channel: keyof typeof channelConfig,
		data: any
	) => {
		const config = channelConfig[channel];

		return (
			<Card
				as={Link}
				isPressable
				href={config.url}
				className={cn(
					"group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] min-h-[200px]",
					config.borderColor,
					"hover:border-gray-300"
				)}
			>
				{/* Gradient header */}
				<div className={cn("bg-gradient-to-r p-3", config.color)}>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<div className={cn("p-1.5 rounded-lg", config.bgColor)}>
								{config.icon}
							</div>
							<h2
								className={cn(
									"text-white font-semibold text-sm",
									GeneralSans_SemiBold.className
								)}
							>
								{config.name}
							</h2>
						</div>
						<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							<div className="w-2 h-2 bg-white rounded-full"></div>
						</div>
					</div>
				</div>

				{/* Card body */}
				<CardBody className="p-4 space-y-3">
					{renderMetricRow("Today Loan", data.today_loan)}
					{renderMetricRow("Total Value", data.total_value, true)}
					{renderMetricRow("Average Value", data.average_value, true)}
					{renderMetricRow("MTD Loans", data.This_month_MTD_loan)}
					{renderMetricRow("Last Month", data.Last_month_LTD_loan)}
				</CardBody>

				{/* Hover effect overlay */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
			</Card>
		);
	};

	// Chart component to display channel data
	const renderChannelChart = () => {
		// For Mobiflex, only show overall, MBE, and Samsung
		const chartData =
			selectedProduct === "Mobiflex"
				? []
				: [
						{
							name: "MBE",
							mtd: mbeData.This_month_MTD_loan,
							lmtd: mbeData.Last_month_LTD_loan,
							color: "#ef4444",
						},
						{
							name: "Samsung",
							mtd: samsungData.This_month_MTD_loan,
							lmtd: samsungData.Last_month_LTD_loan,
							color: "#8b5cf6",
						},
						{
							name: "Xiaomi",
							mtd: xiaomiData.This_month_MTD_loan,
							lmtd: xiaomiData.Last_month_LTD_loan,
							color: "#f97316",
						},
						{
							name: "Oppo",
							mtd: oppoData.This_month_MTD_loan,
							lmtd: oppoData.Last_month_LTD_loan,
							color: "#22c55e",
						},
						{
							name: "GLO",
							mtd: gloData.This_month_MTD_loan,
							lmtd: gloData.Last_month_LTD_loan,
							color: "#eab308",
						},
						{
							name: "9Mobile",
							mtd: nineMobileData.This_month_MTD_loan,
							lmtd: nineMobileData.Last_month_LTD_loan,
							color: "#ec4899",
						},
				  ];

		// Hide chart for Mobiflex
		if (selectedProduct === "Mobiflex") {
			return null;
		}

		const CustomTooltip = ({ active, payload, label }: any) => {
			if (active && payload && payload.length) {
				const data = payload[0].payload;
				return (
					<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
						<p
							className={cn(
								"font-semibold text-gray-900",
								GeneralSans_SemiBold.className
							)}
						>
							{label}
						</p>
						<p
							className={cn(
								"text-sm text-gray-600",
								GeneralSans_Meduim.className
							)}
						>
							MTD Loans: {formatNumber(data.mtd)}
						</p>
						<p
							className={cn(
								"text-sm text-gray-600",
								GeneralSans_Meduim.className
							)}
						>
							Last Month LTD: {formatNumber(data.lmtd)}
						</p>
					</div>
				);
			}
			return null;
		};

		return (
			<Card className="h-[350px] border border-gray-200 rounded-xl overflow-hidden">
				<div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200">
					<div className="flex items-center space-x-2">
						<BarChart3 className="w-4 h-4 text-gray-600" />
						<h3
							className={cn(
								"text-base font-semibold text-gray-900",
								GeneralSans_SemiBold.className
							)}
						>
							Channel Performance
						</h3>
					</div>
					<p className="text-xs text-gray-600 mt-1">
						Month Till Date vs Last Month Till Date
					</p>
				</div>
				<CardBody className="p-0">
					<div className="h-full w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={chartData}
								margin={{ top: 25, right: 20, left: -5, bottom: 10 }}
							>
								<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
								<XAxis
									dataKey="name"
									tick={{ fontSize: 10 }}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									tick={{ fontSize: 10 }}
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => formatNumber(value)}
									width={40}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Bar dataKey="mtd" radius={[2, 2, 0, 0]} name="MTD">
									{chartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Bar>
								<Bar
									dataKey="lmtd"
									radius={[2, 2, 0, 0]}
									name="Last Month LTD"
									fill="#94a3b8"
								>
									{chartData.map((entry, index) => (
										<Cell key={`cell-lmtd-${index}`} fill="#94a3b8" />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardBody>
			</Card>
		);
	};

	return (
		<div className="space-y-6">
			{/* Loading state */}
			{isLoading && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
					{/* Left Column - Overall and Chart Skeletons (1/3 width) */}
					<div className="space-y-4">
						{/* Overall Card Skeleton */}
						<div className="animate-pulse">
							<div className="bg-gray-200 h-16 rounded-t-2xl"></div>
							<div className="bg-white p-4 space-y-3 rounded-b-2xl border">
								{[...Array(5)].map((_, j) => (
									<div key={j} className="flex justify-between">
										<div className="h-3 bg-gray-200 rounded w-20"></div>
										<div className="h-3 bg-gray-200 rounded w-16"></div>
									</div>
								))}
							</div>
						</div>

						{/* Chart Skeleton - Hidden for Mobiflex */}
						{selectedProduct !== "Mobiflex" && (
							<div className="animate-pulse">
								<div className="bg-gray-200 h-16 rounded-t-2xl"></div>
								<div className="bg-white p-4 rounded-b-2xl border">
									<div className="h-48 bg-gray-200 rounded"></div>
								</div>
							</div>
						)}
					</div>

					{/* Right Column - Channel Card Skeletons (2/3 width) */}
					<div
						className={cn(
							"grid gap-3 sm:gap-4",
							selectedProduct === "Mobiflex"
								? "lg:col-span-2 grid-cols-1 sm:grid-cols-2"
								: "lg:col-span-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
						)}
					>
						{[...Array(selectedProduct === "Mobiflex" ? 0 : 6)].map((_, i) => (
							<div key={i} className="animate-pulse">
								<div className="bg-gray-200 h-16 rounded-t-2xl"></div>
								<div className="bg-white p-4 space-y-3 rounded-b-2xl border">
									{[...Array(5)].map((_, j) => (
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

			{/* Cards Grid - Only show when not loading */}
			{!isLoading && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
					{/* Left Column - Overall and Chart (1/3 width) */}
					<div className="space-y-4">
						{/* Overall Card */}
						{renderChannelCard("overall", overallData)}

						{/* Chart Card - Hidden for Mobiflex */}
						{selectedProduct !== "Mobiflex" && renderChannelChart()}
					</div>

					{/* Right Column - Channel Cards (2/3 width) */}
					<div
						className={cn(
							"grid gap-3 sm:gap-4",
							selectedProduct === "Mobiflex"
								? "lg:col-span-2 grid-cols-1 sm:grid-cols-2"
								: "lg:col-span-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
						)}
					>
						{renderChannelCard("mbe", mbeData)}
						{renderChannelCard("samsung", samsungData)}
						{/* Hide these channels for Mobiflex */}
						{selectedProduct !== "Mobiflex" && (
							<>
								{renderChannelCard("xiaomi", xiaomiData)}
								{renderChannelCard("oppo", oppoData)}
								{renderChannelCard("glo", gloData)}
								{renderChannelCard("nineMobile", nineMobileData)}
							</>
						)}
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
						No Data Available
					</h3>
					<p className="text-gray-600">
						There are no loan records available for the selected date range.
					</p>
				</div>
			)}
		</div>
	);
};

export default DailyDashCard;
