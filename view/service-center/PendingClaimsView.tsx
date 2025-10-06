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
import DocumentsCell from "@/components/reususables/DocumentsCell";
import { MoreHorizontal, Eye, Plus } from "lucide-react";
import { formatDate } from "@/lib";

const PendingClaimsView = () => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [dateRange, setDateRange] = useState({ from: "", to: "" });

	const {
		data: claims,
		isLoading,
		error,
	} = useServiceCenterClaims({
		status: "pending",
		search: searchQuery,
		dateRange,
	});

	const handleView = (claimId: string) => {
		router.push(`/access/service-center/claims/view/${claimId}`);
	};

	const handleCreateClaim = () => {
		router.push("/access/service-center/validate-claims");
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
			header: "Fault Type",
			accessorKey: "faultType",
			cell: ({ row }: any) => (
				<Chip variant="bordered">
					{row.original.faultType?.replace("-", " ").toUpperCase()}
				</Chip>
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
				<Chip color="warning" variant="flat">
					PENDING APPROVAL
				</Chip>
			),
		},
		{
			header: "Date Submitted",
			accessorKey: "createdAt",
			cell: ({ row }: any) => formatDate(row.original.createdAt),
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
							<Button isIconOnly size="sm" variant="light">
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
					<h1 className="text-2xl font-bold">Pending Claims</h1>
					<p className="text-muted-foreground">
						Claims awaiting Samsung Partners approval
					</p>
				</div>
			</div>

			<GenericTable
				data={claims || []}
				allCount={claims?.length || 0}
				exportData={claims || []}
				columns={columns.map((col) => ({
					name: col.header,
					uid: col.accessorKey || "",
					sortable: true,
				}))}
				isLoading={isLoading}
				filterValue={searchQuery}
				onFilterChange={setSearchQuery}
				renderCell={(row: any, columnKey: string) => {
					const column = columns.find((col) => col.accessorKey === columnKey);
					return column?.cell
						? column.cell({ row: { original: row } })
						: row[columnKey];
				}}
				sortDescriptor={{ column: "", direction: "ascending" }}
				onSortChange={() => {}}
				page={1}
				pages={1}
				onPageChange={() => {}}
				exportFn={() => {}}
				hasNoRecords={!claims || claims.length === 0}
				createButton={{
					text: "Create New Claim",
					onClick: handleCreateClaim,
				}}
			/>
		</div>
	);
};

export default PendingClaimsView;
