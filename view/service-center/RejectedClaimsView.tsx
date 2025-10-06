"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Chip,
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import { useServiceCenterClaims } from "@/hooks/service-center/useClaims";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { MoreHorizontal, Eye } from "lucide-react";
import { formatDate } from "@/lib";

const RejectedClaimsView = () => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [dateRange, setDateRange] = useState({ from: "", to: "" });

	const {
		data: claims,
		isLoading,
		error,
	} = useServiceCenterClaims({
		status: "rejected",
		search: searchQuery,
		dateRange,
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
			header: "Rejection Reason",
			accessorKey: "rejectionReason",
			cell: ({ row }: any) => (
				<div className="max-w-xs truncate" title={row.original.rejectionReason}>
					{row.original.rejectionReason}
				</div>
			),
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
			header: "Status",
			accessorKey: "status",
			cell: ({ row }: any) => (
				<Chip color="danger" variant="flat">
					REJECTED
				</Chip>
			),
		},
		{
			header: "Date Rejected",
			accessorKey: "rejectedAt",
			cell: ({ row }: any) => formatDate(row.original.rejectedAt),
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
		{ label: "Customer", value: "customerName" },
		{ label: "IMEI", value: "imei" },
		{ label: "Claim ID", value: "claimId" },
		{ label: "Device", value: "deviceName" },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Rejected Claims</h1>
					<p className="text-muted-foreground">
						View rejected claims and reasons for rejection
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

export default RejectedClaimsView;
