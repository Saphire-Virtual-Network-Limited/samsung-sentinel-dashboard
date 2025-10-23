"use client";

import React, { useState, useMemo } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
	Chip,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	DateRangePicker,
} from "@heroui/react";
import { StatCard } from "@/components/atoms/StatCard";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import {
	Smartphone,
	Wrench,
	DollarSign,
	CreditCard,
	TrendingUp,
	Building2,
	Calendar,
	BarChart3,
	Activity,
} from "lucide-react";
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { usePathname } from "next/navigation";

interface ServiceCenterStats {
	id: string;
	name: string;
	location: string;
	unverifiedIMEI: number;
	approvedRepairs: number;
	totalRepairCost: number;
	unpaidRepairCost: number;
	deviceModels: {
		A05: { approved: number; cost: number };
		A06: { approved: number; cost: number };
		A07: { approved: number; cost: number };
	};
}

const DEVICE_MODELS = [
	{ label: "All Models", value: "all" },
	{ label: "Samsung A05", value: "A05" },
	{ label: "Samsung A06", value: "A06" },
	{ label: "Samsung A07", value: "A07" },
];

const TREND_PERIODS = [
	{ label: "Daily (Last 30 Days)", value: "daily" },
	{ label: "Weekly (Last 12 Weeks)", value: "weekly" },
	{ label: "Month to Date", value: "mtd" },
	{ label: "Yearly (Last 12 Months)", value: "yearly" },
	{ label: "Since Inception", value: "inception" },
	{ label: "Custom Date Range", value: "custom" },
];

const serviceCenterColumns: ColumnDef[] = [
	{ name: "Service Center", uid: "name", sortable: true },
	{ name: "Location", uid: "location", sortable: true },
	{ name: "Unverified IMEI", uid: "unverifiedIMEI", sortable: true },
	{ name: "Approved Repairs", uid: "approvedRepairs", sortable: true },
	{ name: "Total Repair Cost", uid: "totalRepairCost", sortable: true },
	{ name: "Unpaid Amount", uid: "unpaidRepairCost", sortable: true },
	{ name: "Device Models", uid: "deviceModels" },
];

export default function SamsungSentinelStatisticsView() {
	const pathname = usePathname();
	const role = pathname.split("/")[2];
	const [selectedModel, setSelectedModel] = useState("all");
	const [trendPeriod, setTrendPeriod] = useState("daily");
	const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
	const [customDateRange, setCustomDateRange] = useState<any>(null);

	// Mock statistics data
	const stats = useMemo(
		() => ({
			daily: {
				unverifiedIMEI: 45,
				authorizedRepairs: 12,
				totalRepairCost: 125000,
				unpaidRepairCost: 85000,
			},
			mtd: {
				unverifiedIMEI: 892,
				authorizedRepairs: 234,
				totalRepairCost: 2840000,
				unpaidRepairCost: 1650000,
			},
			inception: {
				unverifiedIMEI: 15420,
				authorizedRepairs: 4890,
				totalRepairCost: 58960000,
				unpaidRepairCost: 12340000,
			},
		}),
		[]
	);

	// Mock device model statistics
	const deviceStats = useMemo(
		() => ({
			A05: { approved: 1250, totalCost: 18500000, unpaidCost: 4200000 },
			A06: { approved: 1890, totalCost: 22800000, unpaidCost: 5100000 },
			A07: { approved: 1750, totalCost: 17660000, unpaidCost: 3040000 },
		}),
		[]
	);

	// Mock service center data
	const serviceCenterData: ServiceCenterStats[] = useMemo(
		() => [
			{
				id: "sc_001",
				name: "TechFix Lagos",
				location: "Lagos, Nigeria",
				unverifiedIMEI: 234,
				approvedRepairs: 89,
				totalRepairCost: 1240000,
				unpaidRepairCost: 450000,
				deviceModels: {
					A05: { approved: 25, cost: 350000 },
					A06: { approved: 38, cost: 570000 },
					A07: { approved: 26, cost: 320000 },
				},
			},
			{
				id: "sc_002",
				name: "Samsung Care Abuja",
				location: "Abuja, Nigeria",
				unverifiedIMEI: 189,
				approvedRepairs: 76,
				totalRepairCost: 980000,
				unpaidRepairCost: 320000,
				deviceModels: {
					A05: { approved: 22, cost: 308000 },
					A06: { approved: 31, cost: 465000 },
					A07: { approved: 23, cost: 207000 },
				},
			},
			{
				id: "sc_003",
				name: "Mobile Masters Port Harcourt",
				location: "Port Harcourt, Nigeria",
				unverifiedIMEI: 156,
				approvedRepairs: 65,
				totalRepairCost: 850000,
				unpaidRepairCost: 380000,
				deviceModels: {
					A05: { approved: 18, cost: 252000 },
					A06: { approved: 28, cost: 420000 },
					A07: { approved: 19, cost: 178000 },
				},
			},
			{
				id: "sc_004",
				name: "Galaxy Repairs Kano",
				location: "Kano, Nigeria",
				unverifiedIMEI: 201,
				approvedRepairs: 82,
				totalRepairCost: 1100000,
				unpaidRepairCost: 290000,
				deviceModels: {
					A05: { approved: 24, cost: 336000 },
					A06: { approved: 35, cost: 525000 },
					A07: { approved: 23, cost: 239000 },
				},
			},
		],
		[]
	);

	// Mock trend data for charts based on selected period
	const trendData = useMemo(() => {
		const data = [];
		const today = new Date();
		let periods = 30;
		let dateFormat: Intl.DateTimeFormatOptions = {
			month: "short",
			day: "numeric",
		};

		// Determine periods and format based on selected trend period
		switch (trendPeriod) {
			case "daily":
				periods = 30;
				dateFormat = { month: "short", day: "numeric" };
				break;
			case "weekly":
				periods = 12;
				dateFormat = { month: "short", day: "numeric" };
				break;
			case "mtd":
				const dayOfMonth = today.getDate();
				periods = dayOfMonth;
				dateFormat = { month: "short", day: "numeric" };
				break;
			case "yearly":
				periods = 12;
				dateFormat = { month: "short", year: "numeric" };
				break;
			case "inception":
				periods = 24; // Last 24 months for inception view
				dateFormat = { month: "short", year: "numeric" };
				break;
			case "custom":
				periods = 30; // Default for now, will be replaced with custom logic
				dateFormat = { month: "short", day: "numeric" };
				break;
		}

		for (let i = periods - 1; i >= 0; i--) {
			const date = new Date(today);

			// Calculate date based on period type
			if (trendPeriod === "weekly") {
				date.setDate(date.getDate() - i * 7);
			} else if (trendPeriod === "yearly" || trendPeriod === "inception") {
				date.setMonth(date.getMonth() - i);
			} else {
				date.setDate(date.getDate() - i);
			}

			const dateStr = date.toLocaleDateString("en-US", dateFormat);

			// Generate realistic trending data with scaling based on period
			const multiplier =
				trendPeriod === "weekly"
					? 7
					: trendPeriod === "yearly" || trendPeriod === "inception"
					? 30
					: 1;

			const totalClaims = (400 + Math.random() * 150) * multiplier;
			const authorizedRepairs = Math.round(
				totalClaims * (0.6 + Math.random() * 0.3)
			); // 60-90% completion rate
			const totalRepairCost = (2500000 + Math.random() * 800000) * multiplier;
			const paidAmount = Math.round(
				totalRepairCost * (0.5 + Math.random() * 0.4)
			); // 50-90% paid

			data.push({
				date: dateStr,
				totalClaims: Math.round(totalClaims),
				authorizedRepairs: authorizedRepairs,
				totalRepairCost: Math.round(totalRepairCost),
				paidAmount: paidAmount,
			});
		}

		return data;
	}, [trendPeriod]);

	// Filter data based on selected model
	const filteredServiceCenterData = useMemo(() => {
		if (selectedModel === "all") return serviceCenterData;

		return serviceCenterData.map((sc) => ({
			...sc,
			approvedRepairs:
				sc.deviceModels[selectedModel as keyof typeof sc.deviceModels]
					?.approved || 0,
			totalRepairCost:
				sc.deviceModels[selectedModel as keyof typeof sc.deviceModels]?.cost ||
				0,
		}));
	}, [serviceCenterData, selectedModel]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
		}).format(amount);
	};

	const renderServiceCenterCell = (row: ServiceCenterStats, key: string) => {
		switch (key) {
			case "name":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm capitalize">{row.name}</p>
						<p className="text-bold text-xs capitalize text-default-400">
							ID: {row.id}
						</p>
					</div>
				);
			case "location":
				return <p className="text-sm">{row.location}</p>;
			case "unverifiedIMEI":
				return (
					<Chip color="warning" variant="flat" size="sm">
						{row.unverifiedIMEI.toLocaleString()}
					</Chip>
				);
			case "approvedRepairs":
				return (
					<Chip color="success" variant="flat" size="sm">
						{(selectedModel === "all"
							? row.approvedRepairs
							: row.deviceModels[selectedModel as keyof typeof row.deviceModels]
									?.approved || 0
						).toLocaleString()}
					</Chip>
				);
			case "totalRepairCost":
				return (
					<p className="text-sm font-medium">
						{formatCurrency(
							selectedModel === "all"
								? row.totalRepairCost
								: row.deviceModels[
										selectedModel as keyof typeof row.deviceModels
								  ]?.cost || 0
						)}
					</p>
				);
			case "unpaidRepairCost":
				return (
					<p className="text-sm font-medium text-warning">
						{formatCurrency(row.unpaidRepairCost)}
					</p>
				);
			case "deviceModels":
				return (
					<div className="flex flex-wrap gap-1">
						{Object.entries(row.deviceModels).map(([model, data]) => (
							<Chip key={model} color="primary" variant="flat" size="sm">
								{model}: {data.approved}
							</Chip>
						))}
					</div>
				);
			default:
				return <p className="text-sm">{(row as any)[key]}</p>;
		}
	};

	return (
		<div className="space-y-6">
			{/* Daily Statistics */}
			<div>
				<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<Calendar className="w-5 h-5" />
					Daily Statistics
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<StatCard
						title="Unverified IMEI"
						value={stats.daily.unverifiedIMEI.toLocaleString()}
						icon={<Smartphone className="w-5 h-5" />}
					/>
					<StatCard
						title="Authorized Repairs"
						value={stats.daily.authorizedRepairs.toLocaleString()}
						icon={<Wrench className="w-5 h-5" />}
					/>
					<StatCard
						title="Total Repair Cost"
						value={formatCurrency(stats.daily.totalRepairCost)}
						icon={<DollarSign className="w-5 h-5" />}
					/>
					<StatCard
						title="Unpaid Amount"
						value={formatCurrency(stats.daily.unpaidRepairCost)}
						icon={<CreditCard className="w-5 h-5" />}
					/>
				</div>
			</div>

			{/* Month-to-Date Statistics */}
			<div>
				<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<TrendingUp className="w-5 h-5" />
					Month-to-Date Statistics
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<StatCard
						title="Unverified IMEI"
						value={stats.mtd.unverifiedIMEI.toLocaleString()}
						icon={<Smartphone className="w-5 h-5" />}
					/>
					<StatCard
						title="Authorized Repairs"
						value={stats.mtd.authorizedRepairs.toLocaleString()}
						icon={<Wrench className="w-5 h-5" />}
					/>
					<StatCard
						title="Total Repair Cost"
						value={formatCurrency(stats.mtd.totalRepairCost)}
						icon={<DollarSign className="w-5 h-5" />}
					/>
					<StatCard
						title="Unpaid Amount"
						value={formatCurrency(stats.mtd.unpaidRepairCost)}
						icon={<CreditCard className="w-5 h-5" />}
					/>
				</div>
			</div>

			{/* Since Inception Statistics */}
			<div>
				<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<BarChart3 className="w-5 h-5" />
					Since Inception Statistics
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<StatCard
						title="Total Unverified IMEI"
						value={stats.inception.unverifiedIMEI.toLocaleString()}
						icon={<Smartphone className="w-5 h-5" />}
					/>
					<StatCard
						title="Total Authorized Repairs"
						value={stats.inception.authorizedRepairs.toLocaleString()}
						icon={<Wrench className="w-5 h-5" />}
					/>
					<StatCard
						title="Total Repair Cost"
						value={formatCurrency(stats.inception.totalRepairCost)}
						icon={<DollarSign className="w-5 h-5" />}
					/>
					<StatCard
						title="Total Unpaid Amount"
						value={formatCurrency(stats.inception.unpaidRepairCost)}
						icon={<CreditCard className="w-5 h-5" />}
					/>
				</div>
			</div>

			{/* Trend Charts */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold flex items-center gap-2">
						<Activity className="w-5 h-5" />
						Trend Analysis
					</h2>
					<Select
						placeholder="Select time period"
						selectedKeys={trendPeriod ? [trendPeriod] : []}
						onSelectionChange={(keys) => {
							const selected = Array.from(keys)[0] as string;
							if (selected === "custom") {
								setIsCustomDateModalOpen(true);
							} else {
								setTrendPeriod(selected || "daily");
							}
						}}
						className="w-auto min-w-[200px]"
						size="sm"
					>
						{TREND_PERIODS.map((period) => (
							<SelectItem key={period.value} value={period.value}>
								{period.label}
							</SelectItem>
						))}
					</Select>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Claims Trend Chart */}
					<Card>
						<CardHeader className="flex-col items-start gap-1">
							<div className="flex justify-between items-center w-full">
								<h3 className="text-base font-semibold">Claims Over Time</h3>
								<p className="text-xs text-gray-500">
									Total Claims vs Completed Repairs
								</p>
							</div>
						</CardHeader>
						<CardBody>
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={trendData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="date"
										tick={{ fontSize: 12 }}
										angle={-45}
										textAnchor="end"
										height={60}
									/>
									<YAxis tick={{ fontSize: 12 }} />
									<Tooltip
										contentStyle={{
											backgroundColor: "rgba(255, 255, 255, 0.95)",
											border: "1px solid #ccc",
											borderRadius: "8px",
										}}
									/>
									<Legend wrapperStyle={{ paddingTop: "10px" }} />
									<Area
										type="monotone"
										dataKey="totalClaims"
										stroke="#3b82f6"
										fill="#3b82f6"
										fillOpacity={0.6}
										strokeWidth={2}
										name="Total Claims"
									/>
									<Area
										type="monotone"
										dataKey="authorizedRepairs"
										stroke="#10b981"
										fill="#10b981"
										fillOpacity={0.6}
										strokeWidth={2}
										name="Authorized Repairs (Completed)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</CardBody>
					</Card>

					{/* Repair Costs Trend Chart */}
					<Card>
						<CardHeader className="flex-col items-start gap-1">
							<div className="flex justify-between items-center w-full">
								<h3 className="text-base font-semibold">
									Repair Costs Over Time
								</h3>
								<p className="text-xs text-gray-500">
									Total Cost vs Paid Amount
								</p>
							</div>
						</CardHeader>
						<CardBody>
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={trendData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="date"
										tick={{ fontSize: 12 }}
										angle={-45}
										textAnchor="end"
										height={60}
									/>
									<YAxis
										tick={{ fontSize: 12 }}
										tickFormatter={(value) =>
											`₦${(value / 1000000).toFixed(1)}M`
										}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: "rgba(255, 255, 255, 0.95)",
											border: "1px solid #ccc",
											borderRadius: "8px",
										}}
										formatter={(value: number) => [
											formatCurrency(value),
											undefined,
										]}
									/>
									<Legend wrapperStyle={{ paddingTop: "10px" }} />
									<Area
										type="monotone"
										dataKey="totalRepairCost"
										stroke="#3b82f6"
										fill="#3b82f6"
										fillOpacity={0.6}
										name="Total Repair Cost"
									/>
									<Area
										type="monotone"
										dataKey="paidAmount"
										stroke="#10b981"
										fill="#10b981"
										fillOpacity={0.6}
										name="Paid Amount"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</CardBody>
					</Card>
				</div>
			</div>

			{/* Device Model Statistics */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold flex items-center gap-2">
						<Smartphone className="w-5 h-5" />
						Device Model Statistics
					</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{Object.entries(deviceStats).map(([model, data]) => (
						<Card key={model}>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between w-full">
									<h3 className="text-lg font-semibold">Samsung {model}</h3>
									<Chip color="primary" variant="flat">
										{data.approved.toLocaleString()} repairs
									</Chip>
								</div>
							</CardHeader>
							<CardBody className="pt-0">
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Total Cost:</span>
										<span className="font-medium">
											{formatCurrency(data.totalCost)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Unpaid Cost:</span>
										<span className="font-medium text-warning">
											{formatCurrency(data.unpaidCost)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Paid Cost:</span>
										<span className="font-medium text-success">
											{formatCurrency(data.totalCost - data.unpaidCost)}
										</span>
									</div>
								</div>
							</CardBody>
						</Card>
					))}
				</div>
			</div>

			{/* Service Center Statistics */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold flex items-center gap-2">
						<Building2 className="w-5 h-5" />
						Service Center Statistics
					</h2>
					<div className="flex items-center gap-4">
						<Select
							placeholder="Filter by device model"
							selectedKeys={selectedModel ? [selectedModel] : []}
							onSelectionChange={(keys) => {
								const selected = Array.from(keys)[0] as string;
								setSelectedModel(selected || "all");
							}}
							className="min-w-48"
							size="sm"
						>
							{DEVICE_MODELS.map((model) => (
								<SelectItem key={model.value} value={model.value}>
									{model.label}
								</SelectItem>
							))}
						</Select>
					</div>
				</div>

				<GenericTable<ServiceCenterStats>
					columns={serviceCenterColumns}
					data={filteredServiceCenterData}
					allCount={filteredServiceCenterData.length}
					exportData={filteredServiceCenterData}
					isLoading={false}
					filterValue=""
					onFilterChange={() => {}}
					showStatus={false}
					sortDescriptor={{ column: "name", direction: "ascending" }}
					onSortChange={() => {}}
					page={1}
					pages={1}
					onPageChange={() => {}}
					exportFn={async () => {}}
					renderCell={renderServiceCenterCell}
					hasNoRecords={filteredServiceCenterData.length === 0}
					searchPlaceholder="Search service centers..."
				/>
			</div>

			{/* Custom Date Range Modal */}
			<Modal
				isOpen={isCustomDateModalOpen}
				onClose={() => setIsCustomDateModalOpen(false)}
				size="md"
			>
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Select Custom Date Range</h3>
					</ModalHeader>
					<ModalBody>
						<DateRangePicker
							label="Date Range"
							value={customDateRange}
							onChange={setCustomDateRange}
							className="w-full"
						/>
					</ModalBody>
					<ModalFooter>
						<Button
							color="danger"
							variant="light"
							onPress={() => setIsCustomDateModalOpen(false)}
						>
							Cancel
						</Button>
						<Button
							color="primary"
							onPress={() => {
								if (customDateRange) {
									setTrendPeriod("custom");
									setIsCustomDateModalOpen(false);
								}
							}}
						>
							Apply
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
}
