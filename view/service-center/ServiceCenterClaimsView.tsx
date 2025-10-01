"use client";

import React, { useState } from "react";
import { Button, Input, Select, SelectItem, Chip } from "@heroui/react";
import SimpleTable from "@/components/reususables/custom-ui/SimpleTable";
import { Search, Eye, Edit, FileText } from "lucide-react";
import { useServiceCenterClaims } from "@/hooks/service-center/useServiceCenterClaims";
import { useRouter } from "next/navigation";

const ServiceCenterClaimsView = () => {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [dateRange, setDateRange] = useState<
		{ start: string; end: string } | undefined
	>();

	const { claims, isLoading, mutate } = useServiceCenterClaims({
		status: statusFilter,
		search: searchTerm,
		dateRange,
	});

	const columns = [
		{ key: "id", label: "Claim ID" },
		{ key: "imei", label: "IMEI" },
		{ key: "customerName", label: "Customer Name" },
		{ key: "customerPhone", label: "Phone" },
		{ key: "deviceModel", label: "Device Model" },
		{ key: "faultType", label: "Fault Type" },
		{ key: "dateSubmitted", label: "Date Submitted" },
		{ key: "status", label: "Status" },
		{ key: "engineer", label: "Engineer" },
		{ key: "actions", label: "Actions" },
	];

	const handleViewClaim = (claimId: string) => {
		router.push(`/access/service-center/claims/view/${claimId}`);
	};

	const handleEditClaim = (claimId: string) => {
		router.push(`/access/service-center/claims/edit/${claimId}`);
	};

	const renderCell = (item: any, columnKey: string) => {
		switch (columnKey) {
			case "dateSubmitted":
				return new Date(item.dateSubmitted).toLocaleDateString();
			case "status":
				const getStatusColor = (status: string) => {
					switch (status) {
						case "completed":
							return "success";
						case "cancelled":
							return "danger";
						case "in-progress":
							return "primary";
						case "waiting-parts":
							return "warning";
						default:
							return "default";
					}
				};
				return (
					<Chip color={getStatusColor(item.status)} variant="flat" size="sm">
						{item.status
							.split("-")
							.map(
								(word: string) => word.charAt(0).toUpperCase() + word.slice(1)
							)
							.join(" ")}
					</Chip>
				);
			case "actions":
				return (
					<div className="flex items-center gap-2">
						<Button
							isIconOnly
							size="sm"
							variant="light"
							onPress={() => handleViewClaim(item.id)}
						>
							<Eye size={16} />
						</Button>
						<Button
							isIconOnly
							size="sm"
							variant="light"
							color="primary"
							onPress={() => handleEditClaim(item.id)}
						>
							<Edit size={16} />
						</Button>
					</div>
				);
			default:
				return item[columnKey];
		}
	};

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Claims Management
				</h1>
				<p className="text-gray-600">
					Track and manage repair claims status and progress
				</p>
			</div>

			{/* Filters */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Input
					placeholder="Search claims..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					startContent={<Search size={18} className="text-gray-400" />}
					variant="bordered"
				/>
				<Select
					label="Status"
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					variant="bordered"
				>
					<SelectItem key="all" value="all">
						All Status
					</SelectItem>
					<SelectItem key="submitted" value="submitted">
						Submitted
					</SelectItem>
					<SelectItem key="in-progress" value="in-progress">
						In Progress
					</SelectItem>
					<SelectItem key="waiting-parts" value="waiting-parts">
						Waiting Parts
					</SelectItem>
					<SelectItem key="repair-completed" value="repair-completed">
						Repair Completed
					</SelectItem>
					<SelectItem key="ready-pickup" value="ready-pickup">
						Ready for Pickup
					</SelectItem>
					<SelectItem key="completed" value="completed">
						Completed
					</SelectItem>
					<SelectItem key="cancelled" value="cancelled">
						Cancelled
					</SelectItem>
				</Select>
				<Button
					color="primary"
					startContent={<FileText size={18} />}
					onPress={() => router.push("/access/service-center/validate-claims")}
				>
					New Claim
				</Button>
			</div>

			<SimpleTable
				data={claims}
				columns={columns}
				isLoading={isLoading}
				searchable={true}
				searchPlaceholder="Search by customer name, IMEI, or device model..."
				emptyMessage="No claims found"
				selectable={false}
			/>
		</div>
	);
};

export default ServiceCenterClaimsView;
