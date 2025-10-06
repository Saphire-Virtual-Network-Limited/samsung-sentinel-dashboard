"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import {
	Button,
	Chip,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import { useRepairClaims } from "@/hooks/samsung-partners/useRepairClaims";

import GenericTable from "@/components/reususables/custom-ui/tableUi";
import DocumentsCell from "@/components/reususables/DocumentsCell";
import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib";

const ApprovedRepairClaimsView = () => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [dateRange, setDateRange] = useState({ start: "", end: "" });

	const { claims, isLoading, error, mutate } = useRepairClaims({
		status: "approved",
		search: searchQuery,
		dateRange,
	});

	// const { updateStatus, isUpdating } = useUpdateClaimStatus(); // Not implemented

	const handleView = (claimId: string) => {
		router.push(`/access/samsung-partners/repair-claims/view/${claimId}`);
	};

	// const handleStatusUpdate = async (
	//		claimId: string,
	//		newStatus: string,
	//		reason?: string
	// ) => {
	//		try {
	//			await updateStatus(claimId, newStatus, reason);
	//			mutate(); // Refresh data
	//		} catch (error) {
	//			console.error("Failed to update claim status:", error);
	//		}
	// };

	const columns = [
		{
			header: "Claim ID",
			accessorKey: "claimId",
			cell: ({ row }: any) => (
				<span className="font-medium">{row.original.claimId}</span>
			),
		},
		{
			header: "Customer",
			accessorKey: "customerName",
		},
		{
			header: "Service Center",
			accessorKey: "serviceCenterName",
		},
		{
			header: "IMEI",
			accessorKey: "imei",
		},
		{
			header: "Device Status",
			accessorKey: "deviceStatus",
			cell: ({ row }: any) => {
				const status = row.original.deviceStatus;
				const statusColors = {
					"under-repair": "bg-blue-100 text-blue-800",
					repaired: "bg-green-100 text-green-800",
					delivered: "bg-purple-100 text-purple-800",
					closed: "bg-gray-100 text-gray-800",
				};
				return (
					<Chip
						color={
							status === "repaired"
								? "success"
								: status === "under-repair"
								? "primary"
								: "default"
						}
						variant="flat"
					>
						{status?.replace("-", " ").toUpperCase()}
					</Chip>
				);
			},
		},
		{
			header: "Amount",
			accessorKey: "repairCost",
			cell: ({ row }: any) => (
				<span className="font-medium">
					₦{Number(row.original.repairCost).toLocaleString()}
				</span>
			),
		},
		{
			header: "Date Approved",
			accessorKey: "approvedAt",
			cell: ({ row }: any) => formatDate(row.original.approvedAt),
		},
		{
			header: "Documents",
			id: "documents",
			cell: ({ row }: any) => {
				const claim = row.original;
				return (
					<DocumentsCell
						documents={claim.documents || []}
						deviceImages={claim.deviceImages || []}
						claimId={claim.id}
					/>
				);
			},
		},
		{
			header: "Actions",
			id: "actions",
			cell: ({ row }: any) => {
				const claim = row.original;
				return (
					<Dropdown>
						<DropdownTrigger>
							<Button variant="light" size="sm" isIconOnly>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem key="view" onClick={() => handleView(claim.id)}>
								<Eye className="mr-2 h-4 w-4" />
								View Details
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				);
			},
		},
	];

	const searchFields = [
		{ label: "Service Center", value: "serviceCenterName" },
		{ label: "Customer", value: "customerName" },
		{ label: "IMEI", value: "imei" },
		{ label: "Claim ID", value: "claimId" },
	];

	const statusOptions = [
		{ label: "All Statuses", value: "" },
		{ label: "Under Repair", value: "under-repair" },
		{ label: "Repaired", value: "repaired" },
		{ label: "Delivered", value: "delivered" },
		{ label: "Closed", value: "closed" },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Approved Repair Claims</h1>
					<p className="text-muted-foreground">
						Manage and track approved repair claims
					</p>
				</div>
			</div>

			<GenericTable
				data={claims || []}
				columns={columns.map((col) => ({
					name: typeof col.header === "string" ? col.header : "",
					uid: col.accessorKey || "",
					sortable: true,
				}))}
				allCount={claims?.length || 0}
				exportData={claims || []}
				isLoading={isLoading}
				filterValue=""
				onFilterChange={() => {}}
				sortDescriptor={{ column: "claimId", direction: "ascending" }}
				onSortChange={() => {}}
				page={1}
				pages={1}
				onPageChange={() => {}}
				exportFn={() => {}}
				renderCell={(item: any, columnKey: any) => {
					const column = columns.find((c) => c.accessorKey === columnKey);
					if (column?.cell) {
						return column.cell({ row: { original: item } });
					}
					return item[columnKey as keyof typeof item] || "-";
				}}
				hasNoRecords={!claims || claims.length === 0}
			/>
		</div>
	);
};

export default ApprovedRepairClaimsView;
