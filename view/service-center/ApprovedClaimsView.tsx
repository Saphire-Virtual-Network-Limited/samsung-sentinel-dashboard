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
import { useServiceCenterClaims } from "@/hooks/service-center/useClaims";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import DocumentsCell from "@/components/reususables/DocumentsCell";
import { MoreHorizontal, Eye, Settings } from "lucide-react";
import { formatDate } from "@/lib";

const ApprovedClaimsView = () => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [dateRange, setDateRange] = useState({ start: "", end: "" });

	const {
		data: claims,
		isLoading,
		error,
	} = useServiceCenterClaims({
		status: "approved",
		search: searchQuery,
		dateRange: {
			from: dateRange.start,
			to: dateRange.end,
		},
	});

	const handleView = (claimId: string) => {
		router.push(`/access/service-center/claims/view/${claimId}`);
	};

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
			header: "IMEI",
			accessorKey: "imei",
		},
		{
			header: "Device",
			accessorKey: "deviceName",
			cell: ({ row }: any) => (
				<div>
					<div className="font-medium">{row.original.deviceName}</div>
					<div className="text-sm text-muted-foreground">
						{row.original.brand} {row.original.model}
					</div>
				</div>
			),
		},
		{
			header: "Repair Status",
			accessorKey: "repairStatus",
			cell: ({ row }: any) => {
				const status = row.original.repairStatus;
				const statusColors = {
					pending: "bg-yellow-100 text-yellow-800",
					"in-progress": "bg-blue-100 text-blue-800",
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
			header: "Repair Cost",
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
						claimId={claim.claimId}
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
							<DropdownItem key="update" onClick={() => handleView(claim.id)}>
								<Settings className="mr-2 h-4 w-4" />
								Update Status
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				);
			},
		},
	];

	const searchFields = [
		{ label: "Customer", value: "customerName" },
		{ label: "IMEI", value: "imei" },
		{ label: "Claim ID", value: "claimId" },
		{ label: "Device", value: "deviceName" },
	];

	const statusOptions = [
		{ label: "All Statuses", value: "" },
		{ label: "Pending Repair", value: "pending" },
		{ label: "Under Repair", value: "under-repair" },
		{ label: "Repaired", value: "repaired" },
		{ label: "Delivered", value: "delivered" },
		{ label: "Closed", value: "closed" },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Approved Claims</h1>
					<p className="text-muted-foreground">
						Manage and track approved repair claims
					</p>
				</div>
			</div>

			<GenericTable
				data={claims || []}
				columns={columns.map((col) => ({
					name: typeof col.header === "string" ? col.header : "",
					uid: col.accessorKey || col.id || "",
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
					const column = columns.find(
						(c) => (c.accessorKey || c.id) === columnKey
					);
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

export default ApprovedClaimsView;
