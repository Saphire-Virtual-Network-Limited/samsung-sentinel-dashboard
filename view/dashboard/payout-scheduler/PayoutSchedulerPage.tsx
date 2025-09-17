"use client";

import React, { useState, useEffect } from "react";
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Chip,
	Input,
	Spinner,
	Progress,
	Badge,
	Divider,
} from "@heroui/react";
import {
	Clock,
	Calendar,
	Play,
	Pause,
	RefreshCw,
	AlertTriangle,
	Timer,
	DollarSign,
	Users,
	Building,
	Settings,
	Trash2,
	RotateCcw,
	Shield,
	Activity,
	CheckCircle,
	AlertCircle,
	XCircle,
	Zap,
} from "lucide-react";
import { showToast } from "@/lib/showNotification";
import { useAuth } from "@/hooks/useAuth";
import { getUserRole } from "@/lib";
import {
	scheduleCustomTestPayout,
	cancelCustomTestPayout,
	triggerTestPayout,
	triggerWeeklyMbePayout,
	triggerMonthlyPartnerPayout,
	resetAllPayoutSchedules,
	clearAllPayoutSchedules,
	getPayoutSchedulerStatus,
} from "@/lib/api";

interface PayoutJob {
	jobId?: string;
	schedule?: string;
	nextRun?: string;
	status?: string;
	executionTime?: string;
	countdown?: {
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
		humanReadable: string;
		totalSeconds: number;
		isOverdue: boolean;
		isPending: boolean;
	};
	description?: string;
	scheduledBy?: string;
	data?: any;
	isCustomSchedule?: boolean;
}

interface PayoutStatusResponse {
	data: {
		test?: PayoutJob;
		weeklyMbe?: PayoutJob;
		monthlyPartner?: PayoutJob;
		serverInfo?: {
			schedulerEnabled: boolean;
			canScheduleJobs: boolean;
		};
		queueStats?: {
			active: number;
			waiting: number;
			completed: number;
			failed: number;
		};
		currentTime?: string;
	};
}

// Enhanced Countdown Display Component
const CountdownDisplay: React.FC<{ countdown: any }> = ({ countdown }) => {
	const [currentSeconds, setCurrentSeconds] = useState(countdown?.seconds || 0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSeconds((prev: number) => (prev > 0 ? prev - 1 : 59));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	if (!countdown)
		return <span className="text-default-400">No countdown available</span>;

	const getStatusColor = () => {
		if (countdown.isOverdue) return "danger";
		if (countdown.isPending) return "warning";
		return "success";
	};

	return (
		<div className="space-y-3">
			{/* Main countdown display */}
			<div className="grid grid-cols-4 gap-2">
				{[
					{ label: "Days", value: countdown.days, color: "primary" },
					{ label: "Hours", value: countdown.hours, color: "secondary" },
					{ label: "Minutes", value: countdown.minutes, color: "success" },
					{ label: "Seconds", value: currentSeconds, color: "warning" },
				].map(({ label, value, color }) => (
					<div
						key={label}
						className={`text-center p-3 rounded-lg bg-gradient-to-br from-${color}-50 to-${color}-100 border border-${color}-200`}
					>
						<div className={`text-2xl font-bold text-${color}-700`}>
							{String(value).padStart(2, "0")}
						</div>
						<div className={`text-sm text-${color}-600`}>{label}</div>
					</div>
				))}
			</div>

			{/* Status indicators */}
			<div className="flex gap-2 justify-center">
				<Badge color={getStatusColor()} variant="flat">
					{countdown.isOverdue
						? "Overdue"
						: countdown.isPending
						? "Pending"
						: "Active"}
				</Badge>
				<Badge color="default" variant="flat">
					{countdown.humanReadable}
				</Badge>
			</div>
		</div>
	);
};

// Enhanced Job Card Component
const JobCard: React.FC<{
	title: string;
	icon: React.ReactNode;
	jobInfo: any;
	color: "primary" | "secondary" | "success" | "warning" | "danger";
	onTrigger: () => void;
	onCancel?: () => void;
	isLoading?: boolean;
	className?: string;
}> = ({
	title,
	icon,
	jobInfo,
	color,
	onTrigger,
	onCancel,
	isLoading = false,
	className = "",
}) => {
	const getStatusIcon = () => {
		if (jobInfo?.countdown?.isOverdue) return <XCircle className="w-4 h-4" />;
		if (jobInfo?.countdown?.isPending)
			return <AlertCircle className="w-4 h-4" />;
		if (jobInfo?.scheduled) return <CheckCircle className="w-4 h-4" />;
		return <XCircle className="w-4 h-4" />;
	};

	const getStatusColor = () => {
		if (jobInfo?.countdown?.isOverdue) return "danger";
		if (jobInfo?.countdown?.isPending) return "warning";
		if (jobInfo?.scheduled) return "success";
		return "default";
	};

	return (
		<Card
			className={`p-6 hover:shadow-lg transition-all duration-300 ${className}`}
		>
			<CardHeader className="flex gap-4 pb-4">
				<div className={`bg-${color}-100 rounded-full p-3 shadow-md`}>
					{icon}
				</div>
				<div className="flex flex-col flex-grow">
					<h3 className="text-lg font-bold text-gray-800">{title}</h3>
					<p className="text-sm text-gray-500">
						{jobInfo?.jobId ||
							`${title.toLowerCase().replace(/\s+/g, "-")}-job`}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{getStatusIcon()}
					<Chip color={getStatusColor()} variant="flat" size="sm">
						{jobInfo ? "Active" : "Inactive"}
					</Chip>
				</div>
			</CardHeader>

			<CardBody className="pt-0 space-y-4">
				{/* Description */}
				<div>
					<p className="text-sm font-medium text-gray-600">Description</p>
					<p className="text-gray-800">
						{jobInfo?.description || "No description available"}
					</p>
				</div>

				{/* Job Details Grid */}
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<p className="text-gray-500">Job ID</p>
						<p className={`font-mono text-${color}-600 font-medium`}>
							{jobInfo?.jobId || "N/A"}
						</p>
					</div>
					<div>
						<p className="text-gray-500">Scheduled By</p>
						<p className="font-medium">{jobInfo?.scheduledBy || "System"}</p>
					</div>
				</div>

				{/* Schedule Pattern */}
				<div>
					<p className="text-sm font-medium text-gray-600">Schedule Pattern</p>
					<p className="text-sm text-gray-500">
						{jobInfo?.schedule || "No schedule defined"}
					</p>
				</div>

				{/* Next Execution */}
				{jobInfo?.executionTime && (
					<div>
						<p className="text-sm font-medium text-gray-600">Next Execution</p>
						<p className={`font-mono text-${color}-600 font-medium`}>
							{new Date(jobInfo.executionTime).toLocaleString()}
						</p>
					</div>
				)}

				{/* Enhanced Countdown */}
				{jobInfo?.countdown && (
					<div>
						<p className="text-sm font-medium text-gray-600 mb-3">Countdown</p>
						<CountdownDisplay countdown={jobInfo.countdown} />
					</div>
				)}

				{/* Job Data */}
				{jobInfo?.data && (
					<div>
						<p className="text-sm font-medium text-gray-600">
							Job Configuration
						</p>
						<div className="bg-gray-50 p-3 rounded-lg space-y-2">
							<div className="flex justify-between">
								<span className="font-medium">Type:</span>
								<span>{jobInfo.data.type}</span>
							</div>
							{jobInfo.data.testMode && (
								<Chip color="secondary" size="sm" variant="flat">
									Test Mode
								</Chip>
							)}
							{jobInfo.data.scheduledFor && (
								<div className="flex justify-between">
									<span className="font-medium">Scheduled For:</span>
									<span className="font-mono text-sm">
										{new Date(jobInfo.data.scheduledFor).toLocaleString()}
									</span>
								</div>
							)}
							<div className="flex gap-2 mt-2">
								{jobInfo.isCustomSchedule ? (
									<Chip color="primary" size="sm" variant="flat">
										Custom Schedule
									</Chip>
								) : (
									<Chip color="default" size="sm" variant="flat">
										System Schedule
									</Chip>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<Divider />
				<div className="flex gap-2">
					<Button
						color={color}
						variant="flat"
						startContent={<Play className="w-4 h-4" />}
						onPress={onTrigger}
						isLoading={isLoading}
						className="flex-grow"
					>
						Trigger Now
					</Button>
					{onCancel && (
						<Button
							color="warning"
							variant="flat"
							startContent={<Pause className="w-4 h-4" />}
							onPress={onCancel}
							isLoading={isLoading}
						>
							Cancel
						</Button>
					)}
				</div>
			</CardBody>
		</Card>
	);
};

export default function PayoutSchedulerPage() {
	const { user } = useAuth();
	const userRole = getUserRole(user?.role);
	const [payoutStatus, setPayoutStatus] = useState<PayoutStatusResponse | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState<{
		[key: string]: boolean;
	}>({});

	// Modal states
	const {
		isOpen: isScheduleModalOpen,
		onOpen: onScheduleModalOpen,
		onClose: onScheduleModalClose,
	} = useDisclosure();
	const {
		isOpen: isConfirmModalOpen,
		onOpen: onConfirmModalOpen,
		onClose: onConfirmModalClose,
	} = useDisclosure();
	const {
		isOpen: isDangerModalOpen,
		onOpen: onDangerModalOpen,
		onClose: onDangerModalClose,
	} = useDisclosure();

	// Form states
	const [customScheduleDate, setCustomScheduleDate] = useState("");
	const [customScheduleTime, setCustomScheduleTime] = useState("");
	const [confirmAction, setConfirmAction] = useState<{
		title: string;
		description: string;
		action: () => Promise<void>;
		type: string;
	} | null>(null);

	// Fetch payout status
	const fetchPayoutStatus = async () => {
		try {
			setLoading(true);
			setError(null);

			// Check if the function is available
			if (typeof getPayoutSchedulerStatus !== "function") {
				throw new Error(
					"Payout scheduler service is temporarily unavailable. This can happen when switching tabs. Please try again."
				);
			}

			const response = await getPayoutSchedulerStatus();
			console.log("Raw API Response:", response);

			// Handle nested data structure
			const data = response?.data || response;
			console.log("Processed data:", data);

			setPayoutStatus({ data } as PayoutStatusResponse);
		} catch (err) {
			console.error("Error fetching payout status:", err);
			setError(
				err instanceof Error ? err.message : "Failed to fetch payout status"
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		let isMounted = true;
		let interval: NodeJS.Timeout | null = null;

		const safeFetchPayoutStatus = async () => {
			if (isMounted && !document.hidden) {
				await fetchPayoutStatus();
			}
		};

		const startInterval = () => {
			if (interval) clearInterval(interval);
			interval = setInterval(() => {
				if (isMounted && !document.hidden) {
					safeFetchPayoutStatus();
				}
			}, 30000);
		};

		const handleVisibilityChange = () => {
			if (document.hidden) {
				// Tab is not visible, clear interval
				if (interval) {
					clearInterval(interval);
					interval = null;
				}
			} else {
				// Tab is visible, restart interval and fetch immediately
				safeFetchPayoutStatus();
				startInterval();
			}
		};

		// Initial fetch
		safeFetchPayoutStatus();

		// Start interval
		startInterval();

		// Listen for visibility changes
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			isMounted = false;
			if (interval) {
				clearInterval(interval);
			}
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	// Action handlers
	const handleTriggerAction = async (
		action: () => Promise<any>,
		actionType: string
	) => {
		try {
			setActionLoading((prev) => ({ ...prev, [actionType]: true }));
			await action();
			showToast({ type: "success", message: "Action triggered successfully" });
			await fetchPayoutStatus();
		} catch (error) {
			console.error(`Error triggering ${actionType}:`, error);
			showToast({
				type: "error",
				message:
					error instanceof Error ? error.message : "Failed to trigger action",
			});
		} finally {
			setActionLoading((prev) => ({ ...prev, [actionType]: false }));
		}
	};

	const openConfirmModal = (
		type: string,
		title: string,
		description: string,
		action: () => Promise<void>
	) => {
		setConfirmAction({ title, description, action, type });
		onConfirmModalOpen();
	};

	const executeConfirmAction = async () => {
		if (confirmAction) {
			await confirmAction.action();
			onConfirmModalClose();
		}
	};

	const handleScheduleCustomTest = async () => {
		if (!customScheduleDate || !customScheduleTime) {
			showToast({ type: "error", message: "Please select both date and time" });
			return;
		}

		const scheduledFor = new Date(
			`${customScheduleDate}T${customScheduleTime}`
		);
		if (scheduledFor <= new Date()) {
			showToast({
				type: "error",
				message: "Scheduled time must be in the future",
			});
			return;
		}

		try {
			await handleTriggerAction(
				() =>
					scheduleCustomTestPayout({
						scheduledDateTime: scheduledFor.toISOString(),
					}),
				"schedule-custom"
			);
			onScheduleModalClose();
			setCustomScheduleDate("");
			setCustomScheduleTime("");
		} catch (error) {
			console.error("Error scheduling custom test:", error);
		}
	};

	const handleCancelCustomTest = async () => {
		await handleTriggerAction(cancelCustomTestPayout, "cancel-custom");
	};

	// Robust retry function with delay
	const handleRetry = async () => {
		setError(null);
		// Small delay to ensure all imports are loaded
		await new Promise((resolve) => setTimeout(resolve, 100));
		await fetchPayoutStatus();
	};

	if (loading) {
		return (
			<div className="min-h-screen  p-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-center h-64">
						<div className="text-center">
							<Spinner size="lg" color="primary" />
							<p className="mt-4 text-gray-600">Loading payout scheduler...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen  p-6">
				<div className="max-w-7xl mx-auto">
					<Card className="p-8 text-center">
						<div className="text-red-600 mb-4">
							<AlertTriangle className="w-16 h-16 mx-auto" />
						</div>
						<h2 className="text-2xl font-bold text-gray-800 mb-4">
							Error Loading Data
						</h2>
						<p className="text-gray-600 mb-6">{error}</p>
						<Button color="primary" onPress={handleRetry} isLoading={loading}>
							Retry
						</Button>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen  p-6">
			<div className="max-w-7xl mx-auto space-y-8">
				<Card className="p-6 bg-gradient-to-r from-white to-gray-50">
					<CardHeader>
						<div className="flex items-center gap-3">
							<Shield className="w-6 h-6 text-blue-600" />
							<h2 className="text-xl font-bold text-gray-800">System Status</h2>
						</div>
					</CardHeader>
					<CardBody>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="text-center p-4 bg-blue-50 rounded-lg">
								<p className="text-sm text-blue-600 font-medium">
									Current Time (UTC)
								</p>
								<p className="text-xl font-mono font-bold text-blue-700">
									{payoutStatus?.data?.currentTime
										? new Date(payoutStatus.data.currentTime).toLocaleString()
										: "N/A"}
								</p>
							</div>
							<div className="text-center p-4 bg-green-50 rounded-lg">
								<p className="text-sm text-green-600 font-medium">
									Scheduler Status
								</p>
								<div className="flex items-center justify-center mt-2">
									<Chip
										color={
											payoutStatus?.data?.serverInfo?.schedulerEnabled
												? "success"
												: "danger"
										}
										variant="flat"
										size="lg"
									>
										{payoutStatus?.data?.serverInfo?.schedulerEnabled
											? "Active"
											: "Inactive"}
									</Chip>
								</div>
							</div>
							<div className="text-center p-4 bg-purple-50 rounded-lg">
								<p className="text-sm text-purple-600 font-medium">
									Job Permissions
								</p>
								<div className="flex items-center justify-center mt-2">
									<Chip
										color={
											payoutStatus?.data?.serverInfo?.canScheduleJobs
												? "success"
												: "danger"
										}
										variant="flat"
										size="lg"
									>
										{payoutStatus?.data?.serverInfo?.canScheduleJobs
											? "Allowed"
											: "Blocked"}
									</Chip>
								</div>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Payout Jobs */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold text-gray-800">
							Scheduled Payouts
						</h2>
						<div className="flex gap-3">
							<Button
								color="primary"
								variant="flat"
								startContent={<RefreshCw className="w-4 h-4" />}
								onPress={fetchPayoutStatus}
								isLoading={loading}
							>
								Refresh
							</Button>
							<Button
								color="secondary"
								variant="flat"
								startContent={<Calendar className="w-4 h-4" />}
								onPress={onScheduleModalOpen}
							>
								Custom Schedule
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
						{/* Test Payout Job Card */}
						<JobCard
							title="Test Payout"
							icon={<Settings className="w-6 h-6 text-primary-600" />}
							jobInfo={payoutStatus?.data?.test}
							color="primary"
							onTrigger={() =>
								handleTriggerAction(triggerTestPayout, "trigger-test")
							}
							onCancel={
								payoutStatus?.data?.test?.isCustomSchedule
									? () =>
											handleTriggerAction(
												handleCancelCustomTest,
												"cancel-custom"
											)
									: undefined
							}
							isLoading={actionLoading["trigger-test"]}
						/>

						{/* Weekly MBE Payout Job Card */}
						<JobCard
							title="Weekly MBE Payout"
							icon={<Users className="w-6 h-6 text-success-600" />}
							jobInfo={payoutStatus?.data?.weeklyMbe}
							color="success"
							onTrigger={() =>
								openConfirmModal(
									"trigger-weekly-mbe",
									"Trigger Weekly MBE Payout",
									"Are you sure you want to trigger the weekly MBE payout immediately? This will process real payments.",
									async () => {
										await handleTriggerAction(
											triggerWeeklyMbePayout,
											"trigger-weekly-mbe"
										);
									}
								)
							}
							isLoading={actionLoading["trigger-weekly-mbe"]}
						/>

						{/* Monthly Partner Payout Job Card */}
						<JobCard
							title="Monthly Partner Payout"
							icon={<Building className="w-6 h-6 text-warning-600" />}
							jobInfo={payoutStatus?.data?.monthlyPartner}
							color="warning"
							onTrigger={() =>
								openConfirmModal(
									"trigger-monthly-partner",
									"Trigger Monthly Partner Payout",
									"Are you sure you want to trigger the monthly partner payout immediately? This will process real payments.",
									async () => {
										await handleTriggerAction(
											triggerMonthlyPartnerPayout,
											"trigger-monthly-partner"
										);
									}
								)
							}
							isLoading={actionLoading["trigger-monthly-partner"]}
						/>
					</div>
				</div>

				{/* Queue Statistics */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center gap-3">
							<Timer className="w-5 h-5 text-primary" />
							<div className="flex flex-col">
								<p className="text-md font-semibold">Queue Statistics</p>
								<p className="text-small text-default-500">
									Current time:{" "}
									{payoutStatus?.data?.currentTime
										? new Date(payoutStatus.data.currentTime).toLocaleString()
										: "N/A"}{" "}
									UTC
								</p>
							</div>
						</div>
					</CardHeader>
					<CardBody>
						{payoutStatus?.data?.queueStats ? (
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{[
									{
										label: "Active Jobs",
										value: payoutStatus.data.queueStats.active,
										color: "success",
									},
									{
										label: "Waiting",
										value: payoutStatus.data.queueStats.waiting,
										color: "warning",
									},
									{
										label: "Completed",
										value: payoutStatus.data.queueStats.completed,
										color: "primary",
									},
									{
										label: "Failed",
										value: payoutStatus.data.queueStats.failed,
										color: "danger",
									},
								].map(({ label, value, color }) => (
									<div key={label} className="text-center">
										<div className={`text-2xl font-bold text-${color}`}>
											{value}
										</div>
										<div className="text-sm text-default-500">{label}</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-default-500">
								No queue statistics available
							</div>
						)}
					</CardBody>
				</Card>

				{/* Danger Zone */}
				{(userRole === "superadmin" || userRole === "admin") && (
					<Card className="border-2 border-red-200 bg-red-50">
						<CardHeader>
							<div className="flex items-center gap-3">
								<AlertTriangle className="w-5 h-5 text-red-600" />
								<div className="flex flex-col">
									<p className="text-md font-semibold text-red-800">
										Danger Zone
									</p>
									<p className="text-small text-red-600">
										These actions are irreversible and will affect all scheduled
										payouts
									</p>
								</div>
							</div>
						</CardHeader>
						<CardBody>
							<div className="flex gap-3">
								<Button
									color="danger"
									variant="flat"
									startContent={<RotateCcw className="w-4 h-4" />}
									onPress={() =>
										openConfirmModal(
											"reset-all",
											"Reset All Schedules",
											"Are you sure you want to reset ALL payout schedules? This will restore default scheduling for all payout types.",
											async () => {
												await handleTriggerAction(
													resetAllPayoutSchedules,
													"reset-all"
												);
											}
										)
									}
									isLoading={actionLoading["reset-all"]}
								>
									Reset All Schedules
								</Button>
								<Button
									color="danger"
									variant="bordered"
									startContent={<Trash2 className="w-4 h-4" />}
									onPress={onDangerModalOpen}
								>
									Clear All Schedules
								</Button>
							</div>
						</CardBody>
					</Card>
				)}
			</div>

			{/* Schedule Custom Test Modal */}
			<Modal isOpen={isScheduleModalOpen} onClose={onScheduleModalClose}>
				<ModalContent>
					<ModalHeader>Schedule Custom Test Payout</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<p className="text-default-600">
								Schedule a test payout to run at a specific date and time.
							</p>
							<div className="grid grid-cols-2 gap-4">
								<Input
									type="date"
									label="Date"
									value={customScheduleDate}
									onChange={(e) => setCustomScheduleDate(e.target.value)}
									isRequired
								/>
								<Input
									type="time"
									label="Time"
									value={customScheduleTime}
									onChange={(e) => setCustomScheduleTime(e.target.value)}
									isRequired
								/>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							color="default"
							variant="flat"
							onPress={onScheduleModalClose}
						>
							Cancel
						</Button>
						<Button
							color="primary"
							onPress={handleScheduleCustomTest}
							isLoading={actionLoading["schedule-custom"]}
						>
							Schedule Test
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Confirmation Modal */}
			<Modal isOpen={isConfirmModalOpen} onClose={onConfirmModalClose}>
				<ModalContent>
					<ModalHeader>{confirmAction?.title}</ModalHeader>
					<ModalBody>
						<p className="text-default-600">{confirmAction?.description}</p>
					</ModalBody>
					<ModalFooter>
						<Button
							color="default"
							variant="flat"
							onPress={onConfirmModalClose}
						>
							Cancel
						</Button>
						<Button
							color="primary"
							onPress={executeConfirmAction}
							isLoading={actionLoading[confirmAction?.type || ""]}
						>
							Confirm
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Danger Modal */}
			<Modal isOpen={isDangerModalOpen} onClose={onDangerModalClose}>
				<ModalContent>
					<ModalHeader className="text-red-600">
						⚠️ Clear All Payout Schedules
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<p className="text-default-600">
								<strong>WARNING:</strong> This action will completely remove ALL
								scheduled payouts from the system. This action cannot be undone.
							</p>
							<div className="bg-red-50 p-4 rounded-lg border border-red-200">
								<p className="text-red-800 font-medium">This will affect:</p>
								<ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
									<li>Test payout schedules</li>
									<li>Weekly MBE payout schedules</li>
									<li>Monthly partner payout schedules</li>
									<li>All custom scheduled payouts</li>
								</ul>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button color="default" variant="flat" onPress={onDangerModalClose}>
							Cancel
						</Button>
						<Button
							color="danger"
							onPress={() => {
								onDangerModalClose();
								openConfirmModal(
									"clear-all",
									"Final Confirmation",
									"Last chance: Are you absolutely sure you want to clear ALL payout schedules? This cannot be undone.",
									async () => {
										await handleTriggerAction(
											clearAllPayoutSchedules,
											"clear-all"
										);
									}
								);
							}}
						>
							Yes, Clear All
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
}
