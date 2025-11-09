"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Select,
	SelectItem,
	Textarea,
	useDisclosure,
} from "@heroui/react";
import { InfoField, InfoCard } from "@/components/reususables";
import {
	ArrowLeft,
	Upload,
	Eye,
	Calendar,
	User,
	Phone,
	Wrench,
	FileText,
} from "lucide-react";

import { showToast } from "@/lib/showNotification";
import {
	useServiceCenterClaim,
	useServiceCenterClaimActions,
} from "@/hooks/service-center/useServiceCenterClaim";

import { ConfirmationModal } from "@/components/reususables";

const ViewServiceCenterClaimView = () => {
	const params = useParams();
	const router = useRouter();
	const claimId = params?.id as string;

	const [newStatus, setNewStatus] = useState("");
	const [statusNotes, setStatusNotes] = useState("");
	const [newRepairStatus, setNewRepairStatus] = useState("");
	const [repairStatusNotes, setRepairStatusNotes] = useState("");

	const {
		isOpen: isStatusModalOpen,
		onOpen: onStatusModalOpen,
		onClose: onStatusModalClose,
	} = useDisclosure();


	// DEMO: Using dummy data instead of API call
	const claim = {
		id: claimId || "CLM-2024-001",
		status: "in-progress",
		deviceStatus: "Under Repair",
		// Customer fields (flat structure)
		customerName: "John Doe",
		customerEmail: "john.doe@example.com",
		customerPhone: "+234 801 234 5678",
		customerAddress: "123 Lagos Street, Victoria Island, Lagos, Nigeria",
		// Device fields (flat structure)
		imei: "352094561234567",
		deviceBrand: "Samsung",
		deviceModel: "Galaxy S23 Ultra",
		devicePrice: 850000,
		// Warranty fields
		warrantyStartDate: "2024-04-15",
		warrantyEndDate: "2025-10-15",
		// Repair fields
		faultType: "Screen Damage",
		faultDescription:
			"Cracked screen after accidental drop. Touch functionality partially affected. Customer reports the phone was dropped from approximately 4 feet height.",
		repairCost: 45000,
		customerCost: 15000,
		sapphireCost: 30000,
		engineer: "Mike Johnson",
		engineerPhone: "+234 803 456 7890",
		estimatedCompletionDate: "2024-10-25",
		// Parts required
		partsRequired: [
			{
				partName: "Screen Assembly",
				partCode: "SAM-S23U-SCREEN-001",
				cost: 35000,
				availability: "In Stock",
			},
			{
				partName: "Digitizer",
				partCode: "SAM-S23U-DIG-002",
				cost: 8000,
				availability: "In Stock",
			},
		],
		// Repair history
		repairHistory: [
			{
				id: "RH-001",
				date: "2024-10-15 10:30 AM",
				action: "Claim Submitted",
				engineer: "System",
				findings: "Customer submitted claim through online portal",
				status: "Completed",
			},
			{
				id: "RH-002",
				date: "2024-10-15 11:45 AM",
				action: "Initial Assessment",
				engineer: "Sarah Admin",
				findings: "Claim approved. Device eligible for warranty repair.",
				status: "Completed",
			},
			{
				id: "RH-003",
				date: "2024-10-16 09:00 AM",
				action: "Device Received",
				engineer: "Mike Johnson",
				findings:
					"Physical inspection completed. Screen cracked, digitizer partially functional.",
				status: "Completed",
			},
			{
				id: "RH-004",
				date: "2024-10-16 02:30 PM",
				action: "Parts Ordered",
				engineer: "Mike Johnson",
				findings: "Genuine Samsung parts ordered. ETA: 3-5 business days.",
				status: "In Progress",
			},
		],
		// Repair Status
		repairStatus: "awaiting-parts" as "pending" | "awaiting-parts" | "received-device" | "completed",
		// Status history
		statusHistory: [
			{
				id: "SH-001",
				date: "2024-10-15 10:30 AM",
				status: "submitted",
				user: "John Doe",
				notes: "Claim submitted by customer",
			},
			{
				id: "SH-002",
				date: "2024-10-15 11:45 AM",
				status: "approved",
				user: "Sarah Admin",
				notes: "Claim approved by warranty team",
			},
			{
				id: "SH-003",
				date: "2024-10-16 09:00 AM",
				status: "in-progress",
				user: "Mike Johnson",
				notes: "Device received at service center. Diagnostics in progress.",
			},
			{
				id: "SH-004",
				date: "2024-10-16 02:30 PM",
				status: "in-progress",
				user: "Mike Johnson",
				notes: "Screen replacement parts ordered",
			},
		],
		// Dates
		dateSubmitted: "2024-10-15",
		dateUpdated: "2024-10-16",
	};

	const isLoading = false;
	const error = null;
	const mutate = (updater?: any, options?: any) => {}; // Dummy mutate function

	const { updateStatus, updateRepairStatus } = useServiceCenterClaimActions();

	// Repair status modal
	const {
		isOpen: isRepairStatusOpen,
		onOpen: onRepairStatusOpen,
		onClose: onRepairStatusClose,
	} = useDisclosure();

	const statusOptions = [
		{ key: "in-progress", label: "In Progress" },
		{ key: "waiting-parts", label: "Waiting for Parts" },
		{ key: "repair-completed", label: "Repair Completed" },
		{ key: "ready-pickup", label: "Ready for Pickup" },
		{ key: "completed", label: "Completed" },
		{ key: "cancelled", label: "Cancelled" },
	];

	const repairStatusOptions = [

		{ key: "completed", label: "Completed" },
	];

	const handleStatusUpdate = async () => {
		if (!newStatus) {
			showToast({
				type: "error",
				message: "Please select a status",
			});
			return;
		}

		try {
			await updateStatus(claimId, newStatus, statusNotes);
			showToast({
				type: "success",
				message: "Status updated successfully",
			});
			onStatusModalClose();
			setNewStatus("");
			setStatusNotes("");
			mutate();
		} catch (error) {
			showToast({
				type: "error",
				message: "Failed to update status",
			});
		}
	};

	const handleRepairStatusUpdate = async () => {
		if (!newRepairStatus) {
			showToast({
				type: "error",
				message: "Please select a repair status",
			});
			return;
		}

		try {
			await updateRepairStatus(claimId, newRepairStatus as any, repairStatusNotes);
			showToast({
				type: "success",
				message: "Repair status updated successfully",
			});
			onRepairStatusClose();
			setNewRepairStatus("");
			setRepairStatusNotes("");
			mutate();
		} catch (error) {
			showToast({
				type: "error",
				message: "Failed to update repair status",
			});
		}
	};

	if (isLoading) {
		return (
			<div className="p-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
					<div className="space-y-4">
						<div className="h-32 bg-gray-200 rounded"></div>
						<div className="h-32 bg-gray-200 rounded"></div>
						<div className="h-32 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<p className="text-red-600">Failed to load claim details</p>
					<Button color="primary" onPress={() => mutate()} className="mt-4">
						Retry
					</Button>
				</div>
			</div>
		);
	}

	if (!claim) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<p className="text-gray-600">Claim not found</p>
					<Button
						color="primary"
						onPress={() => router.back()}
						className="mt-4"
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-6xl mx-auto">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center gap-4 mb-4">
					<Button isIconOnly variant="light" onPress={() => router.back()}>
						<ArrowLeft size={20} />
					</Button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900"></h1>
						<p className="text-gray-600">Claim ID: {claim?.id}</p>
					</div>
				</div>

				{/* Status and Actions */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Chip
							color={
								claim?.status === "completed"
									? "success"
									: claim?.status === "cancelled"
									? "danger"
									: "warning"
							}
							variant="flat"
							size="lg"
						>
							{claim?.status
								?.split("-")
								.map(
									(word: string) => word.charAt(0).toUpperCase() + word.slice(1)
								)
								.join(" ") || "N/A"}
						</Chip>
						<Chip color="primary" variant="flat" size="lg">
							{claim?.deviceStatus}
						</Chip>
					</div>

					<div className="flex gap-2">
						<Button color="primary" onPress={onStatusModalOpen}>
							Update Status
						</Button>
						<Button
							color="secondary"
							variant="bordered"
							onPress={onRepairStatusOpen}
							startContent={<Wrench size={16} />}
						>
							Update Repair Status
						</Button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Customer Information */}
					<InfoCard title="Customer Information" icon={<User size={20} />}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InfoField label="Full Name" value={claim?.customerName} />
							<InfoField label="Phone Number" value={claim?.customerPhone} />
							<InfoField label="Email Address" value={claim?.customerEmail} />
							<InfoField label="Address" value={claim?.customerAddress} />
						</div>
					</InfoCard>

					{/* Device Information */}
					<InfoCard title="Device Information" icon={<Phone size={20} />}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InfoField label="IMEI Number" value={claim?.imei} />
							<InfoField label="Device Brand" value={claim?.deviceBrand} />
							<InfoField label="Device Model" value={claim?.deviceModel} />
							<InfoField
								label="Device Price"
								value={`₦${claim?.devicePrice?.toLocaleString()}`}
							/>
							<InfoField
								label="Warranty Start"
								value={
									claim?.warrantyStartDate
										? new Date(claim.warrantyStartDate).toLocaleDateString()
										: "N/A"
								}
							/>
							<InfoField
								label="Warranty End"
								value={
									claim?.warrantyEndDate
										? new Date(claim.warrantyEndDate).toLocaleDateString()
										: "N/A"
								}
							/>
						</div>
					</InfoCard>

					{/* Repair Information */}
					<InfoCard title="Repair Information" icon={<Wrench size={20} />}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InfoField label="Fault Type" value={claim?.faultType} />
							<InfoField
								label="Total Repair Cost"
								value={`₦${claim?.repairCost?.toLocaleString()}`}
							/>
							<InfoField
								label="Customer Cost"
								value={`₦${claim?.customerCost?.toLocaleString()}`}
							/>
							<InfoField
								label="Sapphire Cost"
								value={`₦${claim?.sapphireCost?.toLocaleString()}`}
							/>
							<InfoField label="Assigned Engineer" value={claim?.engineer} />
							<InfoField label="Engineer Phone" value={claim?.engineerPhone} />
						</div>
						{claim?.faultDescription && (
							<div className="mt-4">
								<InfoField
									label="Fault Description"
									value={claim.faultDescription}
								/>
							</div>
						)}
					</InfoCard>

					{/* Parts Required 
					claim?.partsRequired && claim.partsRequired.length > 0 && (
						<InfoCard title="Parts Required" icon={<Wrench size={20} />}>
							<div className="space-y-3">
								{claim.partsRequired.map((part: any, index: number) => (
									<div key={index} className="p-3 bg-gray-50 rounded-lg">
										<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
											<InfoField label="Part Name" value={part.partName} />
											<InfoField label="Part Code" value={part.partCode} />
											<InfoField
												label="Cost"
												value={`₦${part.cost?.toLocaleString()}`}
											/>
											<div>
												<p className="text-sm font-medium text-gray-600 mb-1">
													Availability
												</p>
												<Chip
													size="sm"
													color={
														part.availability === "In Stock"
															? "success"
															: "warning"
													}
													variant="flat"
												>
													{part.availability}
												</Chip>
											</div>
										</div>
									</div>
								))}
							</div>
						</InfoCard>
					)*/}

					{/* Repair History */}
					<InfoCard title="Repair History" icon={<FileText size={20} />}>
						<div className="space-y-4">
							{claim?.repairHistory?.map((repair: any, index: number) => (
								<div
									key={repair.id}
									className="relative border-l-2 border-blue-200 pl-4"
								>
									{index < (claim?.repairHistory?.length || 0) - 1 && (
										<div className="absolute left-0 top-8 w-0.5 h-12 bg-blue-200"></div>
									)}
									<div className="absolute left-0 top-2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1"></div>
									<div>
										<p className="font-medium text-gray-900">{repair.action}</p>
										<p className="text-sm text-gray-600">{repair.engineer}</p>
										<p className="text-sm text-gray-700 mt-1">
											{repair.findings}
										</p>
										<div className="flex items-center gap-2 mt-2">
											<p className="text-xs text-gray-500">
												{new Date(repair.date).toLocaleString()}
											</p>
											<Chip size="sm" color="success" variant="flat">
												{repair.status}
											</Chip>
										</div>
									</div>
								</div>
							))}
						</div>
					</InfoCard>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Timeline */}
					<Card>
						<CardHeader>
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Calendar size={20} />
								Timeline
							</h3>
						</CardHeader>
						<CardBody>
							<div className="space-y-4">
								<div className="text-sm">
									<p className="font-medium text-gray-900">Submitted</p>
									<p className="text-gray-600">
										{claim?.dateSubmitted
											? new Date(claim.dateSubmitted).toLocaleDateString()
											: "N/A"}
									</p>
								</div>
								{claim?.dateUpdated && (
									<div className="text-sm">
										<p className="font-medium text-gray-900">Last Updated</p>
										<p className="text-gray-600">
											{new Date(claim.dateUpdated).toLocaleDateString()}
										</p>
									</div>
								)}
							</div>
						</CardBody>
					</Card>

					{/* Repair Status Management */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div className="flex items-center gap-3">
								<Wrench className="w-5 h-5 text-primary" />
								<h3 className="text-lg font-semibold">Repair Status</h3>
							</div>
							<Button
								size="sm"
								color="primary"
								variant="flat"
								startContent={<Wrench size={16} />}
								onPress={onRepairStatusOpen}
							>
								Update Status
							</Button>
						</CardHeader>
						<CardBody>
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
										Current Status:
									</span>
									<Chip
										color={
											claim?.repairStatus === "completed"
												? "success"
												: claim?.repairStatus === "awaiting-parts"
												? "warning"
												: "primary"
										}
										variant="flat"
										startContent={<Wrench size={12} />}
									>
										{claim?.repairStatus?.toUpperCase().replace("-", " ") || "PENDING"}
									</Chip>
								</div>
							</div>
						</CardBody>
					</Card>

					{/* Status History */}
					<Card>
						<CardHeader>
							<h3 className="text-lg font-semibold">Status History</h3>
						</CardHeader>
						<CardBody>
							<div className="space-y-3">
								{claim?.statusHistory?.map((status: any, index: number) => (
									<div key={status.id} className="relative">
										{index < (claim?.statusHistory?.length || 0) - 1 && (
											<div className="absolute left-2 top-6 w-0.5 h-8 bg-gray-200"></div>
										)}
										<div className="flex gap-3">
											<div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
											<div className="flex-1">
												<p className="font-medium text-sm capitalize">
													{status.status.split("-").join(" ")}
												</p>
												<p className="text-xs text-gray-600">{status.user}</p>
												<p className="text-xs text-gray-500">{status.notes}</p>
												<p className="text-xs text-gray-400 mt-1">
													{new Date(status.date).toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardBody>
					</Card>
				</div>
			</div>

			{/* Status Update Modal */}
			<Modal isOpen={isStatusModalOpen} onClose={onStatusModalClose} size="md">
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Update Claim Status</h3>
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<Select
								label="New Status"
								placeholder="Select new status"
								selectedKeys={newStatus ? [newStatus] : []}
								onSelectionChange={(keys) =>
									setNewStatus(Array.from(keys)[0] as string)
								}
							>
								{statusOptions.map((option) => (
									<SelectItem key={option.key} value={option.key}>
										{option.label}
									</SelectItem>
								))}
							</Select>
							<Textarea
								label="Notes (Optional)"
								placeholder="Add any notes about this status change..."
								value={statusNotes}
								onValueChange={setStatusNotes}
								rows={3}
							/>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button color="danger" variant="light" onPress={onStatusModalClose}>
							Cancel
						</Button>
						<Button color="primary" onPress={handleStatusUpdate}>
							Update Status
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Repair Status Update Modal */}
			<Modal isOpen={isRepairStatusOpen} onClose={onRepairStatusClose} size="md">
				<ModalContent>
					<ModalHeader>
						<div className="flex items-center gap-2">
							<Wrench className="w-5 h-5 text-secondary" />
							<h3 className="text-lg font-semibold">Update Repair Status</h3>
						</div>
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<div>
								<Select
									label="New Repair Status"
									placeholder="Select repair status"
									selectedKeys={newRepairStatus ? [newRepairStatus] : []}
									onSelectionChange={(keys) => {
										const selected = Array.from(keys)[0] as string;
										setNewRepairStatus(selected);
									}}
								>
									{repairStatusOptions.map((option) => (
										<SelectItem key={option.key} value={option.key}>
											{option.label}
										</SelectItem>
									))}
								</Select>
							</div>

							<div>
								<Textarea
									label="Notes (Optional)"
									placeholder="Add any notes about this status update..."
									value={repairStatusNotes}
									onValueChange={setRepairStatusNotes}
									minRows={3}
								/>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button color="danger" variant="light" onPress={onRepairStatusClose}>
							Cancel
						</Button>
						<Button color="secondary" onPress={handleRepairStatusUpdate}>
							Update Status
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>


		</div>
	);
};

export default ViewServiceCenterClaimView;
