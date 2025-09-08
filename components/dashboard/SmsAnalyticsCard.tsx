"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	Chip,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import {
	MessageSquare,
	TrendingUp,
	Calendar,
	ChevronDown,
	Table,
	Eye,
} from "lucide-react";
import { getCustomerSmsTotalSent } from "@/lib";
import { showToast } from "@/lib";

export interface SmsAnalyticsData {
	totalCount: number;
	totalCost: number;
	successCount: number;
	failedCount: number;
	dailyCount: number;
	monthlyCount: number;
	yearlyCount: number;
	sinceInceptionCount: number;
}

interface SmsAnalyticsCardProps {
	onShowTable: () => void;
	showTableButton?: boolean;
}

type TimeFilter = "today" | "month-till-date" | "since-inception" | "all-data";

const SmsAnalyticsCard: React.FC<SmsAnalyticsCardProps> = ({
	onShowTable,
	showTableButton = true,
}) => {
	const [selectedFilter, setSelectedFilter] = useState<TimeFilter>("since-inception");
	
	const [isLoading, setIsLoading] = useState(false);
	const [analyticsData, setAnalyticsData] = useState<SmsAnalyticsData>({
		totalCount: 0,
		totalCost: 0,
		successCount: 0,
		failedCount: 0,
		dailyCount: 0,
		monthlyCount: 0,
		yearlyCount: 0,
		sinceInceptionCount: 0,
	});
	const [rawSmsData, setRawSmsData] = useState<any[]>([]);

	const filterOptions = [
		{ key: "today", label: "Today" },
		{ key: "month-till-date", label: "Month Till Date" },
		{ key: "since-inception", label: "Since Inception" },
		{ key: "all-data", label: "All Data" },
	];

	const fetchAnalyticsData = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await getCustomerSmsTotalSent();
			const data = response.data?.numbers?.data || [];
			
			// Calculate analytics from the data
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			const thisYear = new Date(now.getFullYear(), 0, 1);

			// Filter data for different time periods
			const todayData = data.filter((item: any) => {
				const itemDate = new Date(item.createdAt);
				return itemDate >= today;
			});

			const monthData = data.filter((item: any) => {
				const itemDate = new Date(item.createdAt);
				return itemDate >= thisMonth;
			});

			const yearData = data.filter((item: any) => {
				const itemDate = new Date(item.createdAt);
				return itemDate >= thisYear;
			});

			const analytics: SmsAnalyticsData = {
				totalCount: data.length,
				totalCost: data.reduce((sum: number, item: any) => sum + (item.cost || 0), 0),
				successCount: data.filter((item: any) => item.status === "Success").length,
				failedCount: data.filter((item: any) => item.status !== "Success").length,
				dailyCount: todayData.length,
				monthlyCount: monthData.length,
				yearlyCount: yearData.length,
				sinceInceptionCount: data.length,
			};

			setAnalyticsData(analytics);
			setRawSmsData(data); // Store raw data for filtering
		} catch (error: any) {
			console.error("Error fetching SMS analytics:", error);
			showToast({
				type: "error",
				message: "Failed to fetch SMS analytics",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	}, []);

	React.useEffect(() => {
		fetchAnalyticsData();
	}, [fetchAnalyticsData]);

	// Filter data based on selected time period
	const getFilteredData = useMemo(() => {
		if (!rawSmsData.length) return [];

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		let filteredData = [];
		switch (selectedFilter) {
			case "today":
				filteredData = rawSmsData.filter((item: any) => {
					const itemDate = new Date(item.createdAt);
					return itemDate >= today;
				});
				break;
			case "month-till-date":
				filteredData = rawSmsData.filter((item: any) => {
					const itemDate = new Date(item.createdAt);
					return itemDate >= thisMonth;
				});
				break;
			case "since-inception":
			case "all-data":
			default:
				filteredData = rawSmsData;
				break;
		}

		return filteredData;
	}, [selectedFilter, rawSmsData]);

	const getCurrentCount = useMemo(() => {
		return getFilteredData.length;
	}, [getFilteredData]);

	const getCurrentCost = useMemo(() => {
		return getFilteredData.reduce((sum: number, item: any) => sum + (item.cost || 0), 0);
	}, [getFilteredData]);

	const getCurrentSuccessCount = useMemo(() => {
		return getFilteredData.filter((item: any) => item.status === "Success").length;
	}, [getFilteredData]);

	const getCurrentFailedCount = useMemo(() => {
		return getFilteredData.filter((item: any) => item.status !== "Success").length;
	}, [getFilteredData]);

	const successRate = useMemo(() => {
		if (getCurrentCount === 0) return 0;
		return ((getCurrentSuccessCount / getCurrentCount) * 100).toFixed(1);
	}, [getCurrentSuccessCount, getCurrentCount]);

	return (
		<Card className="w-full">
			<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-3">
					<MessageSquare className="w-6 h-6 text-primary" />
					<div>
						<h3 className="text-lg font-semibold">SMS Analytics</h3>
						<p className="text-sm text-default-500">
							Track SMS performance and statistics
						</p>
						<p className="text-xs text-primary font-medium">
							Showing: {filterOptions.find(opt => opt.key === selectedFilter)?.label} ({getCurrentCount} records)
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Dropdown>
						<DropdownTrigger>
							<Button
								variant="bordered"
								endContent={<ChevronDown className="w-4 h-4" />}
								isLoading={isLoading}
							>
								{filterOptions.find(opt => opt.key === selectedFilter)?.label}
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							aria-label="Time filter"
							selectedKeys={[selectedFilter]}
							onAction={(key) => {
								const selected = key as TimeFilter;
								setSelectedFilter(selected);
							}}
						>
							{filterOptions.map((option) => (
								<DropdownItem key={option.key}>
									{option.label}
								</DropdownItem>
							))}
						</DropdownMenu>
					</Dropdown>
					{showTableButton && (
						<Button
							color="primary"
							variant="flat"
							startContent={<Table className="w-4 h-4" />}
							onPress={onShowTable}
						>
							View Details
						</Button>
					)}
				</div>
			</CardHeader>
			<CardBody className="pt-0">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Total SMS Count */}
					<div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-600 dark:text-blue-400">
									Total SMS
								</p>
								<p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
									{isLoading ? "..." : getCurrentCount.toLocaleString()}
								</p>
							</div>
							<MessageSquare className="w-8 h-8 text-blue-500" />
						</div>
						<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
							{selectedFilter === "today" ? "Today" : 
							 selectedFilter === "month-till-date" ? "This Month" :
							 selectedFilter === "since-inception" ? "Since Inception" : "All Data"}
						</p>
					</div>

					{/* Success Rate */}
					<div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-600 dark:text-green-400">
									Success Rate
								</p>
								<p className="text-2xl font-bold text-green-900 dark:text-green-100">
									{isLoading ? "..." : `${successRate}%`}
								</p>
							</div>
							<TrendingUp className="w-8 h-8 text-green-500" />
						</div>
						<p className="text-xs text-green-600 dark:text-green-400 mt-1">
							{getCurrentSuccessCount} successful
						</p>
					</div>

					{/* Total Cost */}
					<div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-600 dark:text-purple-400">
									Total Cost
								</p>
								<p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
									{isLoading ? "..." : `₦${getCurrentCost.toFixed(2)}`}
								</p>
							</div>
							<Calendar className="w-8 h-8 text-purple-500" />
						</div>
						<p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
							Average ₦{(getCurrentCost / Math.max(getCurrentCount, 1)).toFixed(2)} per SMS
						</p>
					</div>

					{/* Failed SMS */}
					<div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-red-600 dark:text-red-400">
									Failed SMS
								</p>
								<p className="text-2xl font-bold text-red-900 dark:text-red-100">
									{isLoading ? "..." : getCurrentFailedCount.toLocaleString()}
								</p>
							</div>
							<MessageSquare className="w-8 h-8 text-red-500" />
						</div>
						<p className="text-xs text-red-600 dark:text-red-400 mt-1">
							{getCurrentFailedCount > 0 ? "Needs attention" : "All successful"}
						</p>
					</div>
				</div>

				{/* Additional Stats Row */}
				{/* <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
					<div className="text-center p-3 bg-default-50 rounded-lg">
						<p className="text-sm text-default-600">Today</p>
						<p className="text-lg font-semibold">{analyticsData.dailyCount}</p>
					</div>
					<div className="text-center p-3 bg-default-50 rounded-lg">
						<p className="text-sm text-default-600">Month Till Date</p>
						<p className="text-lg font-semibold">{analyticsData.monthlyCount}</p>
					</div>
					<div className="text-center p-3 bg-default-50 rounded-lg">
						<p className="text-sm text-default-600">Since Inception</p>
						<p className="text-lg font-semibold">{analyticsData.sinceInceptionCount}</p>
					</div>
					<div className="text-center p-3 bg-default-50 rounded-lg">
						<p className="text-sm text-default-600">All Data</p>
						<p className="text-lg font-semibold">{analyticsData.totalCount}</p>
					</div>
				</div> */}
			</CardBody>
		</Card>
	);
};

export default SmsAnalyticsCard;
