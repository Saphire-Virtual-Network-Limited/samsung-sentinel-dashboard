"use client";

import { GeneralSans_Meduim, GeneralSans_SemiBold, cn } from "@/lib";
import { Card, CardBody } from "@heroui/react";
import {
	Mail,
	MessageSquare,
	Phone,
	Lock,
	CheckCircle,
	XCircle,
} from "lucide-react";

const CommunicationLockReport = () => {
	// Dummy data - replace with actual API data when endpoint is ready
	const dummyData = {
		sms: {
			sent: 1250,
			notSent: 89,
			total: 1339,
		},
		email: {
			sent: 890,
			notSent: 45,
			total: 935,
		},
		phoneCalls: {
			made: 567,
			notMade: 123,
			total: 690,
		},
		lock: {
			locked: 234,
			notLocked: 56,
			total: 290,
		},
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
		phoneCalls: {
			icon: Phone,
			color: "from-purple-500 to-purple-600",
			bgColor: "bg-purple-50",
			borderColor: "border-purple-200",
			iconColor: "text-purple-600",
		},
		lock: {
			icon: Lock,
			color: "from-red-500 to-red-600",
			bgColor: "bg-red-50",
			borderColor: "border-red-200",
			iconColor: "text-red-600",
		},
	};

	const renderMetricCard = (key: keyof typeof dummyData, data: any) => {
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
							{key === "phoneCalls" ? "Phone Calls" : key.toUpperCase()}
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
							{data.total.toLocalString("en-GB")}
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
								{key === "phoneCalls"
									? "Made"
									: key === "lock"
									? "Locked"
									: "Sent"}
							</span>
						</div>
						<span
							className={cn(
								"text-sm font-semibold text-green-600",
								GeneralSans_SemiBold.className
							)}
						>
							{data.sent || data.made || data.locked}
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
								{key === "phoneCalls"
									? "Not Made"
									: key === "lock"
									? "Not Locked"
									: "Not Sent"}
							</span>
						</div>
						<span
							className={cn(
								"text-sm font-semibold text-red-600",
								GeneralSans_SemiBold.className
							)}
						>
							{data.notSent || data.notMade || data.notLocked}
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
								{Math.round(
									((data.sent || data.made || data.locked) / data.total) * 100
								)}
								%
							</span>
						</div>
						{/* Progress bar */}
						<div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
							<div
								className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
								style={{
									width: `${
										((data.sent || data.made || data.locked) / data.total) * 100
									}%`,
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
			<div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200">
				<div className="flex items-center space-x-2">
					<MessageSquare className="w-4 h-4 text-gray-600" />
					<h3
						className={cn(
							"text-base font-semibold text-gray-900",
							GeneralSans_SemiBold.className
						)}
					>
						Communication & Lock Status Report
					</h3>
				</div>
				<p className="text-xs text-gray-600 mt-1">
					Overview of SMS, Email, Phone Calls, and Device Lock Status
				</p>
			</div>

			<CardBody className="p-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{renderMetricCard("sms", dummyData.sms)}
					{renderMetricCard("email", dummyData.email)}
					{renderMetricCard("phoneCalls", dummyData.phoneCalls)}
					{renderMetricCard("lock", dummyData.lock)}
				</div>
			</CardBody>
		</Card>
	);
};

export default CommunicationLockReport;
