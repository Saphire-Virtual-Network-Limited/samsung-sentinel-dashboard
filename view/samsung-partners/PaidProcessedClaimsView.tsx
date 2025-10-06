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
import { useProcessedClaims } from "@/hooks/samsung-partners/useProcessedClaims";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { MoreHorizontal, Eye, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib";

const PaidProcessedClaimsView = () => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [dateRange, setDateRange] = useState({ start: "", end: "" });

	const { claims, isLoading, error } = useProcessedClaims({
		paymentStatus: "paid",
		search: searchQuery,
		dateRange,
	});

	const handleView = (claimId: string) => {
		router.push(`/access/samsung-partners/repair-claims/view/${claimId}`);
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
			header: "Service Center",
			accessorKey: "serviceCenterName",
		},
		{
			header: "IMEI",
			accessorKey: "imei",
		},
		{
			header: "Commission",
			accessorKey: "commission",
			cell: ({ row }: any) => (
				<span className="font-medium text-green-600">
					₦{Number(row.original.commission).toLocaleString()}
				</span>
			),
		},
		{
			header: "Payment Status",
			accessorKey: "paymentStatus",
			cell: ({ row }: any) => (
				<Chip color="success" variant="flat">
					<CheckCircle className="w-3 h-3 mr-1" />
					PAID
				</Chip>
			),
		},
		{
			header: "Date Paid",
			accessorKey: "paidAt",
			cell: ({ row }: any) => formatDate(row.original.paidAt),
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
		{ label: "Service Center", value: "serviceCenterName" },
		{ label: "Customer", value: "customerName" },
		{ label: "IMEI", value: "imei" },
		{ label: "Claim ID", value: "claimId" },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Paid Processed Claims</h1>
					<p className="text-muted-foreground">View paid commission claims</p>
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
			/>
		</div>
	);
};

export default PaidProcessedClaimsView;
