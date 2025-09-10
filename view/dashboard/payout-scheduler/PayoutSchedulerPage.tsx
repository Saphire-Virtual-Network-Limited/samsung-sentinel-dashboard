"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { showToast, useAuth, getUserRole } from "@/lib";
import {
	scheduleCustomTestPayout,
	cancelCustomTestPayout,
	triggerTestPayout,
	triggerWeeklyMbePayout,
	triggerMonthlyPartnerPayout,
	resetAllPayoutSchedules,
	safeRestartPayoutScheduler,
	clearAllPayoutSchedules,
	PayoutJobInfo,
} from "@/lib/api";
import {
	usePayoutSchedulerStatus,
	usePayoutSchedulerActions,
} from "@/hooks/usePayoutScheduler";
import { hasPermission } from "@/lib/permissions";

export default function PayoutSchedulerPage() {
	const [customScheduleDate, setCustomScheduleDate] = useState("");
	const [customScheduleTime, setCustomScheduleTime] = useState("");

	// Auth and permission checks
	const { userResponse } = useAuth();
	const userRole = getUserRole(userResponse?.data?.role);
	const hasPayoutAccess = hasPermission(
		userRole,
		"canAccessPayoutScheduler",
		userResponse?.data?.email
	);

	// Use custom hooks for data fetching and actions with SWR
	const {
		data: payoutStatus,
		error,
		isLoading,
		isValidating,
		mutate,
	} = usePayoutSchedulerStatus();

	const { executeActionWithRevalidation } = usePayoutSchedulerActions();

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

	// Action states
	const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
		{}
	);
	const [confirmAction, setConfirmAction] = useState<{
		type: string;
		title: string;
		description: string;
		action: () => Promise<void>;
	} | null>(null);

	const setActionLoadingState = (action: string, loading: boolean) => {
		setActionLoading((prev) => ({ ...prev, [action]: loading }));
	};

	const handleScheduleCustomTest = async () => {
		if (!customScheduleDate || !customScheduleTime) {
			showToast({
				type: "error",
				message: "Please select both date and time",
				duration: 5000,
			});
			return;
		}

		setActionLoadingState("schedule-custom", true);
		try {
			const dateTimeString = `${customScheduleDate}T${customScheduleTime}:00.000Z`;

			await executeActionWithRevalidation(
				() =>
					scheduleCustomTestPayout({
						scheduledDateTime: dateTimeString,
						scheduledBy: "admin-dashboard",
					}),
				"schedule-custom",
				// Optimistic update: mark test as custom scheduled
				(current) =>
					current
						? {
								...current,
								test: {
									...current.test,
									isCustomSchedule: true,
									scheduled: true,
								},
						  }
						: current
			);

			onScheduleModalClose();
			setCustomScheduleDate("");
			setCustomScheduleTime("");
		} finally {
			setActionLoadingState("schedule-custom", false);
		}
	};

	const handleCancelCustomTest = async () => {
		setActionLoadingState("cancel-custom", true);
		try {
			await executeActionWithRevalidation(
				cancelCustomTestPayout,
				"cancel-custom",
				// Optimistic update: mark test as not custom scheduled
				(current) =>
					current
						? {
								...current,
								test: {
									...current.test,
									isCustomSchedule: false,
								},
						  }
						: current
			);
		} finally {
			setActionLoadingState("cancel-custom", false);
		}
	};

	const handleTriggerAction = async (
		action: () => Promise<any>,
		actionName: string
	) => {
		setActionLoadingState(actionName, true);
		try {
			await executeActionWithRevalidation(action, actionName);
		} finally {
			setActionLoadingState(actionName, false);
		}
	};

	const getStatusColor = (jobInfo: PayoutJobInfo) => {
		if (!jobInfo.scheduled) return "default";
		if (jobInfo.countdown?.isOverdue) return "danger";
		if (jobInfo.countdown?.isPending) return "warning";
		return "success";
	};

	const getStatusText = (jobInfo: PayoutJobInfo) => {
		if (!jobInfo.scheduled) return "Not Scheduled";
		if (jobInfo.countdown?.isOverdue) return "Overdue";
		if (jobInfo.countdown?.isPending) return "Pending";
		return "Scheduled";
	};

	const openConfirmModal = (
		type: string,
		title: string,
		description: string,
		action: () => Promise<void>
	) => {
		setConfirmAction({ type, title, description, action });
		onConfirmModalOpen();
	};

	const executeConfirmAction = async () => {
		if (confirmAction) {
			await confirmAction.action();
			setConfirmAction(null);
			onConfirmModalClose();
		}
	};

	// Permission check
	if (!hasPayoutAccess) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="text-danger-500 mb-4">
						<Shield className="w-12 h-12 mx-auto mb-2" />
						<p className="text-lg font-semibold">Access Denied</p>
						<p className="text-sm text-default-500 mt-1">
							You don&apos;t have permission to access the payout scheduler
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<Spinner size="lg" />
					<p className="mt-4 text-default-500">Loading payout scheduler...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="text-danger-500 mb-4">
						<AlertTriangle className="w-12 h-12 mx-auto mb-2" />
						<p className="text-lg font-semibold">
							Failed to load payout scheduler
						</p>
						<p className="text-sm text-default-500 mt-1">{error.message}</p>
					</div>
					<Button
						color="primary"
						onPress={() => mutate()}
						startContent={<RefreshCw className="w-4 h-4" />}
					>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-default-50 p-6">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-default-900">
							Payout Scheduler
						</h1>
						<p className="text-default-600 mt-1">
							Manage automated payout schedules and trigger manual payouts
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="flat"
							startContent={
								<RefreshCw
									className={`w-4 h-4 ${isValidating ? "animate-spin" : ""}`}
								/>
							}
							onPress={() => mutate()}
							isDisabled={isValidating}
						>
							{isValidating ? "Refreshing..." : "Refresh"}
						</Button>
						<Button
							color="primary"
							startContent={<Calendar className="w-4 h-4" />}
							onPress={onScheduleModalOpen}
						>
							Schedule Custom Test
						</Button>
					</div>
				</div>
			</div>

			{payoutStatus && (
				<>
					{/* Status Overview */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
						{/* Test Payout */}
						<Card className="p-4">
							<CardHeader className="flex gap-3 pb-3">
								<div className="bg-blue-100 rounded-full p-2">
									<Settings className="w-5 h-5 text-blue-600" />
								</div>
								<div className="flex flex-col">
									<p className="text-md font-semibold">Test Payout</p>
									<p className="text-small text-default-500">
										Development Testing
									</p>
								</div>
								<Chip
									color={getStatusColor(payoutStatus.test)}
									variant="flat"
									size="sm"
									className="ml-auto"
								>
									{getStatusText(payoutStatus.test)}
								</Chip>
							</CardHeader>
							<CardBody className="pt-0">
								<div className="space-y-3">
									<div>
										<p className="text-sm text-default-500">Description</p>
										<p className="text-sm font-medium">
											{payoutStatus.test.description}
										</p>
									</div>
									{payoutStatus.test.countdown && (
										<div>
											<p className="text-sm text-default-500">Countdown</p>
											<p className="text-lg font-mono font-bold text-primary">
												{payoutStatus.test.countdown.humanReadable}
											</p>
										</div>
									)}
									<div className="flex gap-2">
										<Button
											size="sm"
											color="primary"
											variant="flat"
											startContent={<Play className="w-3 h-3" />}
											onPress={() =>
												handleTriggerAction(triggerTestPayout, "trigger-test")
											}
											isLoading={actionLoading["trigger-test"]}
										>
											Trigger Now
										</Button>
										{payoutStatus.test.isCustomSchedule && (
											<Button
												size="sm"
												color="warning"
												variant="flat"
												startContent={<Pause className="w-3 h-3" />}
												onPress={handleCancelCustomTest}
												isLoading={actionLoading["cancel-custom"]}
											>
												Cancel Custom
											</Button>
										)}
									</div>
								</div>
							</CardBody>
						</Card>

						{/* Weekly MBE Payout */}
						<Card className="p-4">
							<CardHeader className="flex gap-3 pb-3">
								<div className="bg-green-100 rounded-full p-2">
									<Users className="w-5 h-5 text-green-600" />
								</div>
								<div className="flex flex-col">
									<p className="text-md font-semibold">Weekly MBE</p>
									<p className="text-small text-default-500">
										Mobile Business Executives
									</p>
								</div>
								<Chip
									color={getStatusColor(payoutStatus.weeklyMbe)}
									variant="flat"
									size="sm"
									className="ml-auto"
								>
									{getStatusText(payoutStatus.weeklyMbe)}
								</Chip>
							</CardHeader>
							<CardBody className="pt-0">
								<div className="space-y-3">
									<div>
										<p className="text-sm text-default-500">Description</p>
										<p className="text-sm font-medium">
											{payoutStatus.weeklyMbe.description}
										</p>
									</div>
									{payoutStatus.weeklyMbe.countdown && (
										<div>
											<p className="text-sm text-default-500">Countdown</p>
											<p className="text-lg font-mono font-bold text-success">
												{payoutStatus.weeklyMbe.countdown.humanReadable}
											</p>
										</div>
									)}
									<Button
										size="sm"
										color="success"
										variant="flat"
										startContent={<Play className="w-3 h-3" />}
										onPress={() =>
											openConfirmModal(
												"trigger-weekly-mbe",
												"Trigger Weekly MBE Payout",
												"Are you sure you want to trigger the weekly MBE payout immediately? This will process real payments.",
												() =>
													handleTriggerAction(
														triggerWeeklyMbePayout,
														"trigger-weekly-mbe"
													)
											)
										}
										isLoading={actionLoading["trigger-weekly-mbe"]}
									>
										Trigger Now
									</Button>
								</div>
							</CardBody>
						</Card>

						{/* Monthly Partner Payout */}
						<Card className="p-4">
							<CardHeader className="flex gap-3 pb-3">
								<div className="bg-purple-100 rounded-full p-2">
									<Building className="w-5 h-5 text-purple-600" />
								</div>
								<div className="flex flex-col">
									<p className="text-md font-semibold">Monthly Partner</p>
									<p className="text-small text-default-500">
										Business Partners
									</p>
								</div>
								<Chip
									color={getStatusColor(payoutStatus.monthlyPartner)}
									variant="flat"
									size="sm"
									className="ml-auto"
								>
									{getStatusText(payoutStatus.monthlyPartner)}
								</Chip>
							</CardHeader>
							<CardBody className="pt-0">
								<div className="space-y-3">
									<div>
										<p className="text-sm text-default-500">Description</p>
										<p className="text-sm font-medium">
											{payoutStatus.monthlyPartner.description}
										</p>
									</div>
									{payoutStatus.monthlyPartner.countdown && (
										<div>
											<p className="text-sm text-default-500">Countdown</p>
											<p className="text-lg font-mono font-bold text-secondary">
												{payoutStatus.monthlyPartner.countdown.humanReadable}
											</p>
										</div>
									)}
									<Button
										size="sm"
										color="secondary"
										variant="flat"
										startContent={<Play className="w-3 h-3" />}
										onPress={() =>
											openConfirmModal(
												"trigger-monthly-partner",
												"Trigger Monthly Partner Payout",
												"Are you sure you want to trigger the monthly partner payout immediately? This will process real payments.",
												() =>
													handleTriggerAction(
														triggerMonthlyPartnerPayout,
														"trigger-monthly-partner"
													)
											)
										}
										isLoading={actionLoading["trigger-monthly-partner"]}
									>
										Trigger Now
									</Button>
								</div>
							</CardBody>
						</Card>
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
										{new Date(payoutStatus.currentTime).toLocaleString()} (
										{payoutStatus.timezone})
									</p>
								</div>
							</div>
						</CardHeader>
						<CardBody>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="text-center p-4 bg-blue-50 rounded-lg">
									<p className="text-2xl font-bold text-blue-600">
										{payoutStatus.queue.waiting}
									</p>
									<p className="text-sm text-blue-500">Waiting</p>
								</div>
								<div className="text-center p-4 bg-green-50 rounded-lg">
									<p className="text-2xl font-bold text-green-600">
										{payoutStatus.queue.active}
									</p>
									<p className="text-sm text-green-500">Active</p>
								</div>
								<div className="text-center p-4 bg-gray-50 rounded-lg">
									<p className="text-2xl font-bold text-gray-600">
										{payoutStatus.queue.total}
									</p>
									<p className="text-sm text-gray-500">Total</p>
								</div>
							</div>
						</CardBody>
					</Card>

					{/* Maintenance Actions */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<Settings className="w-5 h-5 text-warning" />
								<div className="flex flex-col">
									<p className="text-md font-semibold">Maintenance Actions</p>
									<p className="text-small text-default-500">
										Use these actions carefully
									</p>
								</div>
							</div>
						</CardHeader>
						<CardBody>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Button
									color="primary"
									variant="flat"
									startContent={<RotateCcw className="w-4 h-4" />}
									onPress={() =>
										openConfirmModal(
											"safe-restart",
											"Safe Restart Scheduler",
											"This will safely restart the scheduler, preserving existing jobs and only adding missing ones.",
											() =>
												handleTriggerAction(
													safeRestartPayoutScheduler,
													"safe-restart"
												)
										)
									}
									isLoading={actionLoading["safe-restart"]}
								>
									Safe Restart
								</Button>
								<Button
									color="warning"
									variant="flat"
									startContent={<RefreshCw className="w-4 h-4" />}
									onPress={() =>
										openConfirmModal(
											"reset-all",
											"Reset All Schedules",
											"⚠️ DANGEROUS: This will clear ALL existing jobs and recreate default schedules. Use only for maintenance.",
											() =>
												handleTriggerAction(
													resetAllPayoutSchedules,
													"reset-all"
												)
										)
									}
									isLoading={actionLoading["reset-all"]}
								>
									Reset All
								</Button>
								<Button
									color="danger"
									variant="flat"
									startContent={<Trash2 className="w-4 h-4" />}
									onPress={onDangerModalOpen}
								>
									Clear All (Nuclear)
								</Button>
							</div>
						</CardBody>
					</Card>
				</>
			)}

			{/* Schedule Custom Test Modal */}
			<Modal
				isOpen={isScheduleModalOpen}
				onClose={onScheduleModalClose}
				size="2xl"
			>
				<ModalContent>
					<ModalHeader>Schedule Custom Test Payout</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<p className="text-default-600">
								Schedule a test payout for a specific date and time. This will
								replace any existing test payout schedule.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-default-700 mb-2">
										Date
									</label>
									<Input
										type="date"
										value={customScheduleDate}
										onChange={(e) => setCustomScheduleDate(e.target.value)}
										min={new Date().toISOString().split("T")[0]}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-default-700 mb-2">
										Time
									</label>
									<Input
										type="time"
										value={customScheduleTime}
										onChange={(e) => setCustomScheduleTime(e.target.value)}
									/>
								</div>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							color="danger"
							variant="light"
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
							color="danger"
							variant="light"
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

			{/* Danger Zone Modal */}
			<Modal isOpen={isDangerModalOpen} onClose={onDangerModalClose}>
				<ModalContent>
					<ModalHeader className="text-danger">
						🚨 Nuclear Option - Clear All
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
								<p className="text-danger-700 font-medium">
									This will completely clear ALL jobs from the payout queue
									across all states.
								</p>
								<p className="text-danger-600 text-sm mt-2">
									Only use when switching Redis instances or performing major
									maintenance.
								</p>
							</div>
							<p className="text-default-600">
								This action cannot be undone and will remove all scheduled
								payouts.
							</p>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							color="default"
							variant="light"
							onPress={onDangerModalClose}
						>
							Cancel
						</Button>
						<Button
							color="danger"
							onPress={() => {
								onDangerModalClose();
								openConfirmModal(
									"clear-all",
									"Clear All Schedules",
									"🚨 FINAL WARNING: This will completely destroy all payout schedules. Are you absolutely sure?",
									() =>
										handleTriggerAction(clearAllPayoutSchedules, "clear-all")
								);
							}}
						>
							Proceed to Final Confirmation
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
}
