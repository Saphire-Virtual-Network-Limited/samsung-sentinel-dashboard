"use client";

import React, { useState, useMemo } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
	Button,
	Chip,
} from "@heroui/react";
import { StatCard } from "@/components/atoms/StatCard";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	AreaChart,
	Area,
} from "recharts";
import {
	MapPin,
	Users,
	CreditCard,
	Wrench,
	TrendingUp,
	Calendar,
	Download,
	Star,
	Clock,
} from "lucide-react";

export default function RepairStoreStatisticsView() {
	// Filter states
	const [timeRange, setTimeRange] = useState<Set<string>>(new Set(["30days"]));
	const [selectedCenter, setSelectedCenter] = useState<Set<string>>(
		new Set(["all"])
	);

	// Selection handlers
	const handleTimeRangeChange = (keys: any) => {
		if (keys === "all") {
			setTimeRange(new Set(["30days"]));
		} else {
			setTimeRange(new Set(Array.from(keys)));
		}
	};

	const handleSelectedCenterChange = (keys: any) => {
		if (keys === "all") {
			setSelectedCenter(new Set(["all"]));
		} else {
			setSelectedCenter(new Set(Array.from(keys)));
		}
	};

	// Mock data
	const serviceCenters = [
		{ name: "All Centers", uid: "all" },
		{ name: "Sapphire Tech Hub Lagos", uid: "sc_001" },
		{ name: "Sapphire Tech Hub Abuja", uid: "sc_002" },
		{ name: "Sapphire Tech Hub Port Harcourt", uid: "sc_003" },
		{ name: "Sapphire Tech Hub Kano", uid: "sc_004" },
	];

	const timeRanges = [
		{ name: "Last 7 Days", uid: "7days" },
		{ name: "Last 30 Days", uid: "30days" },
		{ name: "Last 3 Months", uid: "3months" },
		{ name: "Last 6 Months", uid: "6months" },
		{ name: "Last Year", uid: "1year" },
	];

	// Statistics data
	const overallStats = useMemo(
		() => ({
			totalCenters: 4,
			totalEngineers: 23,
			totalRepairs: 3456,
			totalRevenue: 8750000,
			averageRating: 4.5,
			monthlyGrowth: 12.5,
		}),
		[]
	);

	// Monthly revenue data
	const monthlyRevenueData = useMemo(
		() => [
			{ month: "Jan", revenue: 6800000, repairs: 285 },
			{ month: "Feb", revenue: 7200000, repairs: 312 },
			{ month: "Mar", revenue: 7500000, repairs: 328 },
			{ month: "Apr", revenue: 7800000, repairs: 345 },
			{ month: "May", revenue: 8100000, repairs: 367 },
			{ month: "Jun", revenue: 8400000, repairs: 389 },
			{ month: "Jul", revenue: 8750000, repairs: 412 },
		],
		[]
	);

	// Service center performance data
	const centerPerformanceData = useMemo(
		() => [
			{
				center: "Lagos",
				repairs: 1245,
				revenue: 2850000,
				engineers: 8,
				rating: 4.7,
			},
			{
				center: "Abuja",
				repairs: 892,
				revenue: 2100000,
				engineers: 6,
				rating: 4.6,
			},
			{
				center: "Port Harcourt",
				repairs: 654,
				revenue: 1750000,
				engineers: 5,
				rating: 4.4,
			},
			{
				center: "Kano",
				repairs: 423,
				revenue: 1200000,
				engineers: 4,
				rating: 4.2,
			},
		],
		[]
	);

	// Repair types distribution
	const repairTypesData = useMemo(
		() => [
			{ name: "Screen Repairs", value: 1245, color: "#0088FE" },
			{ name: "Battery Replacement", value: 892, color: "#00C49F" },
			{ name: "Water Damage", value: 654, color: "#FFBB28" },
			{ name: "Camera Issues", value: 423, color: "#FF8042" },
			{ name: "Charging Port", value: 312, color: "#8884d8" },
			{ name: "Others", value: 189, color: "#82ca9d" },
		],
		[]
	);

	// Top engineers data
	const topEngineersData = useMemo(
		() => [
			{
				name: "John Adebayo",
				center: "Lagos",
				repairs: 420,
				rating: 4.8,
				revenue: 980000,
			},
			{
				name: "Sarah Ibrahim",
				center: "Lagos",
				repairs: 315,
				rating: 4.6,
				revenue: 750000,
			},
			{
				name: "Ahmed Hassan",
				center: "Port Harcourt",
				repairs: 298,
				rating: 4.5,
				revenue: 720000,
			},
			{
				name: "Michael Okafor",
				center: "Abuja",
				repairs: 256,
				rating: 4.4,
				revenue: 630000,
			},
			{
				name: "Grace Okoro",
				center: "Kano",
				repairs: 189,
				rating: 4.2,
				revenue: 480000,
			},
		],
		[]
	);

	// Customer satisfaction data
	const satisfactionData = useMemo(
		() => [
			{ week: "Week 1", satisfaction: 4.2, responses: 45 },
			{ week: "Week 2", satisfaction: 4.3, responses: 52 },
			{ week: "Week 3", satisfaction: 4.5, responses: 48 },
			{ week: "Week 4", satisfaction: 4.7, responses: 56 },
		],
		[]
	);

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// Export function
	const handleExportReport = () => {
		// Implementation for export functionality
		console.log("Exporting statistics report");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Analytics & Statistics
					</h1>
					<p className="text-gray-600">
						Monitor performance across all your service centers
					</p>
				</div>
				<div className="flex items-center gap-4">
					<Select
						label="Time Range"
						className="max-w-xs"
						selectedKeys={timeRange}
						onSelectionChange={handleTimeRangeChange}
						size="sm"
					>
						{timeRanges.map((range) => (
							<SelectItem key={range.uid} value={range.uid}>
								{range.name}
							</SelectItem>
						))}
					</Select>
					<Select
						label="Service Center"
						className="max-w-xs"
						selectedKeys={selectedCenter}
						onSelectionChange={handleSelectedCenterChange}
						size="sm"
					>
						{serviceCenters.map((center) => (
							<SelectItem key={center.uid} value={center.uid}>
								{center.name}
							</SelectItem>
						))}
					</Select>
					<Button
						color="primary"
						startContent={<Download size={16} />}
						onPress={handleExportReport}
					>
						Export Report
					</Button>
				</div>
			</div>

			{/* Overview Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
				<StatCard
					title="Service Centers"
					value={overallStats.totalCenters.toString()}
					icon={<MapPin className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Engineers"
					value={overallStats.totalEngineers.toString()}
					icon={<Users className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Repairs"
					value={overallStats.totalRepairs.toLocaleString()}
					icon={<Wrench className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Revenue"
					value={formatCurrency(overallStats.totalRevenue)}
					icon={<CreditCard className="w-5 h-5" />}
				/>
				<StatCard
					title="Average Rating"
					value={overallStats.averageRating.toString()}
					icon={<Star className="w-5 h-5" />}
				/>
				<StatCard
					title="Monthly Growth"
					value={`+${overallStats.monthlyGrowth}%`}
					icon={<TrendingUp className="w-5 h-5" />}
				/>
			</div>

			{/* Charts Row 1 */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Monthly Revenue Trend */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Monthly Revenue Trend</h3>
					</CardHeader>
					<CardBody>
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart data={monthlyRevenueData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="month" />
								<YAxis
									tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
								/>
								<Tooltip
									formatter={(value) => [
										formatCurrency(value as number),
										"Revenue",
									]}
								/>
								<Area
									type="monotone"
									dataKey="revenue"
									stroke="#0088FE"
									fill="#0088FE"
									fillOpacity={0.3}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardBody>
				</Card>

				{/* Service Center Performance */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">
							Service Center Performance
						</h3>
					</CardHeader>
					<CardBody>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={centerPerformanceData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="center" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="repairs" fill="#0088FE" name="Repairs" />
							</BarChart>
						</ResponsiveContainer>
					</CardBody>
				</Card>
			</div>

			{/* Charts Row 2 */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Repair Types Distribution */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Repair Types Distribution</h3>
					</CardHeader>
					<CardBody>
						<div className="flex">
							<ResponsiveContainer width="60%" height={300}>
								<PieChart>
									<Pie
										data={repairTypesData}
										cx="50%"
										cy="50%"
										outerRadius={100}
										dataKey="value"
									>
										{repairTypesData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
							<div className="w-40% flex flex-col justify-center space-y-2">
								{repairTypesData.map((item, index) => (
									<div key={index} className="flex items-center gap-2">
										<div
											className="w-3 h-3 rounded"
											style={{ backgroundColor: item.color }}
										/>
										<span className="text-sm">{item.name}</span>
										<span className="text-sm font-medium ml-auto">
											{item.value}
										</span>
									</div>
								))}
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Customer Satisfaction Trend */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Customer Satisfaction</h3>
					</CardHeader>
					<CardBody>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={satisfactionData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="week" />
								<YAxis domain={[4.0, 5.0]} />
								<Tooltip
									formatter={(value) => [
										`${(value as number).toFixed(1)} stars`,
										"Rating",
									]}
								/>
								<Line
									type="monotone"
									dataKey="satisfaction"
									stroke="#00C49F"
									strokeWidth={3}
									dot={{ r: 6 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardBody>
				</Card>
			</div>

			{/* Top Performers Table */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Top Performing Engineers</h3>
				</CardHeader>
				<CardBody>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b">
									<th className="text-left p-3">Engineer</th>
									<th className="text-left p-3">Service Center</th>
									<th className="text-left p-3">Repairs</th>
									<th className="text-left p-3">Rating</th>
									<th className="text-left p-3">Revenue</th>
								</tr>
							</thead>
							<tbody>
								{topEngineersData.map((engineer, index) => (
									<tr key={index} className="border-b">
										<td className="p-3">
											<div className="flex items-center gap-2">
												<div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-bold">
													{index + 1}
												</div>
												<span className="font-medium">{engineer.name}</span>
											</div>
										</td>
										<td className="p-3">{engineer.center}</td>
										<td className="p-3">
											<Chip color="primary" variant="flat" size="sm">
												{engineer.repairs} repairs
											</Chip>
										</td>
										<td className="p-3">
											<div className="flex items-center gap-1">
												<Star className="w-4 h-4 text-yellow-500 fill-current" />
												<span>{engineer.rating}</span>
											</div>
										</td>
										<td className="p-3 font-medium">
											{formatCurrency(engineer.revenue)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardBody>
			</Card>

			{/* Service Center Comparison */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Service Center Comparison</h3>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{centerPerformanceData.map((center) => (
							<div
								key={center.center}
								className="p-4 bg-gray-50 rounded-lg space-y-3"
							>
								<div className="flex items-center justify-between">
									<h4 className="font-semibold">{center.center}</h4>
									<Chip
										color="success"
										variant="flat"
										size="sm"
										startContent={<Star className="w-3 h-3" />}
									>
										{center.rating}
									</Chip>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Engineers</span>
										<span className="font-medium">{center.engineers}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Repairs</span>
										<span className="font-medium">{center.repairs}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Revenue</span>
										<span className="font-medium">
											{formatCurrency(center.revenue)}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
