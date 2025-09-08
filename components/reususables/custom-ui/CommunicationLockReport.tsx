"use client";

import { GeneralSans_Meduim, GeneralSans_SemiBold, cn, getCustomerSmsTotalSent, getCustomerEmailTotalSent } from "@/lib";
import { Card, CardBody, CardHeader, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import {
	Mail,
	MessageSquare,
	Phone,
	Lock,
	CheckCircle,
	XCircle,
	ChevronDown,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";

interface SmsData {
	sent: number;
	notSent: number;
	total: number;
}

type TimeFilter = "today" | "month-till-date" | "since-inception";

const CommunicationLockReport = () => {
	const [smsData, setSmsData] = useState<SmsData>({
		sent: 0,
		notSent: 0,
		total: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [selectedFilter, setSelectedFilter] = useState<TimeFilter>("since-inception");
	const [rawSmsData, setRawSmsData] = useState<any[]>([]);

	const filterOptions = [
		{ key: "today", label: "Today" },
		{ key: "month-till-date", label: "Month Till Date" },
		{ key: "since-inception", label: "Since Inception" },
	];

	// Fetch SMS data
	const fetchSmsData = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await getCustomerSmsTotalSent();
			
			if (response?.data?.numbers?.data) {
				const smsMessages = response.data.numbers.data;
				setRawSmsData(smsMessages);
			}
		} catch (error) {
			console.error("Error fetching SMS data:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSmsData();
	}, [fetchSmsData]);

	// Fetch Email data
	const fetchEmailData = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await getCustomerEmailTotalSent();
			console.log('Email data:', response);
			console.log('Email data:', response.data);
		} catch (error: any) {
			console.error("Error fetching Email data:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchEmailData();
	}, [fetchEmailData]);

	// Filter data based on selected time period
	const getFilteredSmsData = useMemo(() => {
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
			default:
				filteredData = rawSmsData;
				break;
		}

		return filteredData;
	}, [selectedFilter, rawSmsData]);

	// Calculate SMS metrics from filtered data
	const currentSmsData = useMemo(() => {
		const sent = getFilteredSmsData.filter((msg: any) => msg.status === "Success").length;
		const notSent = getFilteredSmsData.filter((msg: any) => msg.status !== "Success").length;
		const total = getFilteredSmsData.length;

		return {
			sent,
			notSent,
			total,
		};
	}, [getFilteredSmsData]);

	// Dummy data for email - replace with actual API data when endpoint is ready
	const emailData = {
		sent: 0,
		notSent: 0,
		total: 0,
	};

	// Configuration for each metric type
	const metricConfig = {
		sms: {
			icon: MessageSquare,
			color: "from-blue-500 to-blue-600",
			bgColor: "bg-blue-50",
			borderColor: "border-blue-200",
			iconColor: "text-blue-600",
		},
		email: {
			icon: Mail,
			color: "from-green-500 to-green-600",
			bgColor: "bg-green-50",
			borderColor: "border-green-200",
			iconColor: "text-green-600",
		},
		// phoneCalls: {
		// 	icon: Phone,
		// 	color: "from-purple-500 to-purple-600",
		// 	bgColor: "bg-purple-50",
		// 	borderColor: "border-purple-200",
		// 	iconColor: "text-purple-600",
		// },
		// lock: {
		// 	icon: Lock,
		// 	color: "from-red-500 to-red-600",
		// 	bgColor: "bg-red-50",
		// 	borderColor: "border-red-200",
		// 	iconColor: "text-red-600",
		// },
	};

	const renderMetricCard = (key: "sms" | "email", data: any) => {
		const config = metricConfig[key];
		const IconComponent = config.icon;

		return (
			<Card className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
				{/* Header */}
				<div className={cn("bg-gradient-to-r p-3", config.color)}>
					<div className="flex items-center space-x-2">
						<div className={cn("p-1.5 rounded-lg", config.bgColor)}>
							<IconComponent className={cn("w-4 h-4", config.iconColor)} />
						</div>
						<h3
							className={cn(
								"text-white font-semibold text-sm capitalize",
								GeneralSans_SemiBold.className
							)}
						>
							{key.toUpperCase()}
						</h3>
					</div>
				</div>

				{/* Body */}
				<CardBody className="p-4 space-y-3">
					{/* Total */}
					<div className="text-center pb-2 border-b border-gray-100">
						<p
							className={cn(
								"text-2xl font-bold text-gray-900",
								GeneralSans_SemiBold.className
							)}
						>
							{data.total.toLocaleString("en-GB")}
						</p>
						<p
							className={cn(
								"text-xs text-gray-600",
								GeneralSans_Meduim.className
							)}
						>
							Total
						</p>
					</div>

					{/* Sent/Made/Locked */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<CheckCircle className="w-4 h-4 text-green-500" />
							<span
								className={cn(
									"text-xs text-gray-600",
									GeneralSans_Meduim.className
								)}
							>
								Sent
							</span>
						</div>
						<span
							className={cn(
								"text-sm font-semibold text-green-600",
								GeneralSans_SemiBold.className
							)}
						>
							{data.sent}
						</span>
					</div>

					{/* Not Sent/Not Made/Not Locked */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<XCircle className="w-4 h-4 text-red-500" />
							<span
								className={cn(
									"text-xs text-gray-600",
									GeneralSans_Meduim.className
								)}
							>
								Not Sent
							</span>
						</div>
						<span
							className={cn(
								"text-sm font-semibold text-red-600",
								GeneralSans_SemiBold.className
							)}
						>
							{data.notSent}
						</span>
					</div>

					{/* Percentage */}
					<div className="pt-2 border-t border-gray-100">
						<div className="flex justify-between items-center">
							<span
								className={cn(
									"text-xs text-gray-600",
									GeneralSans_Meduim.className
								)}
							>
								Success Rate
							</span>
							<span
								className={cn(
									"text-xs font-semibold text-gray-900",
									GeneralSans_SemiBold.className
								)}
							>
								{Math.round((data.sent / data.total) * 100)}
								%
							</span>
						</div>
						{/* Progress bar */}
						<div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
							<div
								className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
								style={{
									width: `${(data.sent / data.total) * 100}%`,
								}}
							></div>
						</div>
					</div>
				</CardBody>
			</Card>
		);
	};

	return (
		<Card className="border border-gray-200 rounded-xl overflow-hidden">
			<CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
					<div className="flex items-center space-x-2">
						<MessageSquare className="w-4 h-4 text-gray-600" />
						<div>
							<h3
								className={cn(
									"text-base font-semibold text-gray-900",
									GeneralSans_SemiBold.className
								)}
							>
								Communication & Lock Status Report
							</h3>
							<p className="text-xs text-gray-600 mt-1">
								Overview of SMS and Email Communication Status
							</p>
							
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Dropdown>
							<DropdownTrigger>
								<Button
									variant="bordered"
									size="sm"
									endContent={<ChevronDown className="w-3 h-3" />}
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
					</div>
				</div>
			</CardHeader>

			<CardBody className="p-4">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="text-sm text-gray-500">Loading SMS data...</div>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
						{renderMetricCard("sms", currentSmsData)}
						{renderMetricCard("email", emailData)}
						{/* {renderMetricCard("phoneCalls", dummyData.phoneCalls)} */}
						{/* {renderMetricCard("lock", dummyData.lock)} */}
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default CommunicationLockReport;
