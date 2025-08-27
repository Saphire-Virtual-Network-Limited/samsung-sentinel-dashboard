"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn } from "@/lib";
import { Card, CardBody, CardHeader } from "@heroui/react";
import Link from "next/link";
import { getDropOffReport } from "@/lib";
import {
	TrendingDown,
	TrendingUp,
	BarChart3,
	AlertTriangle,
	CheckCircle,
	Clock,
	UserCheck,
	CreditCard,
	FileText,
	Shield,
	DollarSign,
	Smartphone,
} from "lucide-react";
import { useState } from "react";

const ScreenReport = () => {
	const [hasNoRecords, setHasNoRecords] = useState(false);

	const screens = [
		"BVN Credit Check",
		"Loan Eligibility Check",
		"Card Tokenization",
		"Loan Data Submission",
		"KYC Submission",
		"Mandate Creation",
		"Mandate Approved",
		"Down Payment",
		"Virtual Account Creation",
		"Device Enrollment Started",
		"Device Enrollment Completed",
	];

	// Fetch data for all channels in parallel

	const { data: reports = [], isLoading } = useSWR(
		["screen-report", ...screens],
		async () => {
			try {
				const results = await Promise.all(
					screens.map((screen) =>
						getDropOffReport(screen)
							.then((r) => r.data || {})
							.catch((error) => {
								console.error(`Error fetching data for ${screen}:`, error);
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
				console.error("Error fetching screen reports:", error);
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

	// console.log("screenreports", reports);

	// Extract data for each channel
	const bvn = reports[0] || {};
	const loanEligibility = reports[1] || {};
	const cardTokenization = reports[2] || {};
	const loanDataSubmission = reports[3] || {};
	const kycSubmission = reports[4] || {};
	const mandateCreation = reports[5] || {};
	const mandateApproved = reports[6] || {};
	const downPayment = reports[7] || {};
	const virtualAccountCreation = reports[8] || {};
	const deviceEnrollmentStarted = reports[9] || {};
	const deviceEnrollmentCompleted = reports[10] || {};

	// Helper to format numbers with commas
	const formatNumber = (num: string | number) => {
		if (typeof num === "string" && num.includes(".")) {
			// Format decimals with commas
			const [intPart, decPart] = num.split(".");
			return `${Number(intPart).toLocalString("en-GB")}.${decPart}`;
		}
		return Number(num).toLocalString("en-GB");
	};

	// Helper to get channel data
	const getScreenData = (screenData: any, screenName: string) => {
		// Log the raw data for each screen
		//   console.log(`Raw data for ${screenName}:`, screenData);

		// Extract the relevant fields based on screen name
		const dailyField = `Daily_${screenName.replace(/\s+/g, "_")}_Drop_Offs`;
		const mtdField = `MTD_${screenName.replace(/\s+/g, "_")}_Drop_Offs`;
		const ytdField = `YTD_${screenName.replace(/\s+/g, "_")}_Drop_Offs`;

		const data = {
			daily: screenData[dailyField] || 0,
			mtd: screenData[mtdField] || "0",
			ytd: screenData[ytdField] || "0",
		};

		//   console.log(`Processed data for ${screenName}:`, data);
		return data;
	};

	// Get data for each channel
	const bvnData = getScreenData(bvn, "BVN Credit Check");
	const loanEligibilityData = getScreenData(
		loanEligibility,
		"Loan Eligibility Check"
	);
	const cardTokenizationData = getScreenData(
		cardTokenization,
		"Card Tokenization"
	);
	const loanDataSubmissionData = getScreenData(
		loanDataSubmission,
		"Loan Data Submission"
	);
	const kycSubmissionData = getScreenData(kycSubmission, "KYC Submission");
	const mandateCreationData = getScreenData(
		mandateCreation,
		"Mandate Creation"
	);
	const mandateApprovedData = getScreenData(
		mandateApproved,
		"Mandate Approved"
	);
	const downPaymentData = getScreenData(downPayment, "Down Payment");
	const virtualAccountCreationData = getScreenData(
		virtualAccountCreation,
		"Virtual Account Creation"
	);
	const deviceEnrollmentStartedData = getScreenData(
		deviceEnrollmentStarted,
		"Device Enrollment Started"
	);
	const deviceEnrollmentCompletedData = getScreenData(
		deviceEnrollmentCompleted,
		"Device Enrollment Completed"
	);

	// Screen configuration with colors and icons
	const screenConfig = {
		"BVN Credit Check": {
			color: "from-blue-500 to-blue-600",
			bgColor: "bg-blue-50",
			borderColor: "border-blue-200",
			icon: <UserCheck className="w-5 h-5 text-blue-600" />,
		},
		"Loan Eligibility Check": {
			color: "from-purple-500 to-purple-600",
			bgColor: "bg-purple-50",
			borderColor: "border-purple-200",
			icon: <CheckCircle className="w-5 h-5 text-purple-600" />,
		},
		"Card Tokenization": {
			color: "from-green-500 to-green-600",
			bgColor: "bg-green-50",
			borderColor: "border-green-200",
			icon: <CreditCard className="w-5 h-5 text-green-600" />,
		},
		"Loan Data Submission": {
			color: "from-orange-500 to-orange-600",
			bgColor: "bg-orange-50",
			borderColor: "border-orange-200",
			icon: <FileText className="w-5 h-5 text-orange-600" />,
		},
		"KYC Submission": {
			color: "from-red-500 to-red-600",
			bgColor: "bg-red-50",
			borderColor: "border-red-200",
			icon: <Shield className="w-5 h-5 text-red-600" />,
		},
		"Mandate Creation": {
			color: "from-indigo-500 to-indigo-600",
			bgColor: "bg-indigo-50",
			borderColor: "border-indigo-200",
			icon: <Clock className="w-5 h-5 text-indigo-600" />,
		},
		"Mandate Approved": {
			color: "from-emerald-500 to-emerald-600",
			bgColor: "bg-emerald-50",
			borderColor: "border-emerald-200",
			icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
		},
		"Down Payment": {
			color: "from-yellow-500 to-yellow-600",
			bgColor: "bg-yellow-50",
			borderColor: "border-yellow-200",
			icon: <DollarSign className="w-5 h-5 text-yellow-600" />,
		},
		"Virtual Account Creation": {
			color: "from-pink-500 to-pink-600",
			bgColor: "bg-pink-50",
			borderColor: "border-pink-200",
			icon: <BarChart3 className="w-5 h-5 text-pink-600" />,
		},
		"Device Enrollment Started": {
			color: "from-teal-500 to-teal-600",
			bgColor: "bg-teal-50",
			borderColor: "border-teal-200",
			icon: <Smartphone className="w-5 h-5 text-teal-600" />,
		},
		"Device Enrollment Completed": {
			color: "from-cyan-500 to-cyan-600",
			bgColor: "bg-cyan-50",
			borderColor: "border-cyan-200",
			icon: <Smartphone className="w-5 h-5 text-cyan-600" />,
		},
	};

	// Create an array of screen data in the exact order of the screens array
	const screenDataArray = [
		{ name: "BVN Credit Check", data: bvnData },
		{ name: "Loan Eligibility Check", data: loanEligibilityData },
		{ name: "Card Tokenization", data: cardTokenizationData },
		{ name: "Loan Data Submission", data: loanDataSubmissionData },
		{ name: "KYC Submission", data: kycSubmissionData },
		{ name: "Mandate Creation", data: mandateCreationData },
		{ name: "Mandate Approved", data: mandateApprovedData },
		{ name: "Down Payment", data: downPaymentData },
		{ name: "Virtual Account Creation", data: virtualAccountCreationData },
		{ name: "Device Enrollment Started", data: deviceEnrollmentStartedData },
		{
			name: "Device Enrollment Completed",
			data: deviceEnrollmentCompletedData,
		},
	];

	const renderMetricRow = (label: string, value: string | number) => (
		<div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
			<span
				className={cn("text-xs text-gray-600", GeneralSans_Meduim.className)}
			>
				{label}
			</span>
			<span
				className={cn(
					"text-sm font-semibold text-gray-900",
					GeneralSans_SemiBold.className
				)}
			>
				{formatNumber(value)}
			</span>
		</div>
	);

	const renderScreenCard = (screen: { name: string; data: any }) => {
		const config = screenConfig[screen.name as keyof typeof screenConfig];

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
									"text-white font-semibold text-sm sm:text-base",
									GeneralSans_SemiBold.className
								)}
							>
								{screen.name}
							</h2>
						</div>
						<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							<div className="w-2 h-2 bg-white rounded-full"></div>
						</div>
					</div>
				</div>

				{/* Card body */}
				<CardBody className="p-4 space-y-1">
					{renderMetricRow("Today", screen.data.daily)}
					{renderMetricRow("MTD", screen.data.mtd)}
					{renderMetricRow("YTD", screen.data.ytd)}
				</CardBody>

				{/* Hover effect overlay */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
			</Card>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="text-center sm:text-left">
				<h1
					className={cn(
						"text-2xl sm:text-3xl font-bold text-gray-900 mb-2",
						GeneralSans_SemiBold.className
					)}
				>
					Screen Drop-Off Reports
				</h1>
				<p className="text-gray-600 text-sm sm:text-base">
					Track user drop-offs across different stages of the loan application
					process
				</p>
			</div>

			{/* Cards Grid */}
			{!isLoading && !hasNoRecords && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
					{screenDataArray.map((screen, index) => (
						<div key={index}>{renderScreenCard(screen)}</div>
					))}
				</div>
			)}

			{/* Loading state */}
			{isLoading && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
					{[...Array(11)].map((_, i) => (
						<div key={i} className="animate-pulse">
							<div className="bg-gray-200 h-16 rounded-t-2xl"></div>
							<div className="bg-white p-4 space-y-3 rounded-b-2xl border">
								{[...Array(3)].map((_, j) => (
									<div key={j} className="flex justify-between">
										<div className="h-3 bg-gray-200 rounded w-16"></div>
										<div className="h-3 bg-gray-200 rounded w-12"></div>
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
						<AlertTriangle className="w-8 h-8 text-gray-400" />
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
						There are no screen drop-off records available for the selected date
						range.
					</p>
				</div>
			)}
		</div>
	);
};

export default ScreenReport;
