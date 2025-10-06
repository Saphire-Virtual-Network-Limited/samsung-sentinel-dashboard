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
import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib";

const ApprovedClaimsView = () => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [dateRange, setDateRange] = useState({ from: "", to: "" });

	const {
		data: claims,
		isLoading,
		error,
		mutate,
	} = useServiceCenterClaims({
		status: "approved",
		search: searchQuery,
		dateRange: {
			from: dateRange.from,
			to: dateRange.to,
		},
	});

	const handleView = (claimId: string) => {
		router.push(`/access/service-center/claims/view/${claimId}`);
	};

	const columns = [
		{
			name: "Claim ID",
			uid: "claimId",
			sortable: true,
		},
		{
			name: "Customer",
			uid: "customerName",
			sortable: true,
		},
		{
			name: "Device",
			uid: "deviceName",
			sortable: true,
		},
		{
			name: "IMEI",
			uid: "imei",
			sortable: true,
		},
		{
			name: "Repair Cost",
			uid: "repairCost",
			sortable: true,
		},
		{
			name: "Status",
			uid: "status",
			sortable: true,
		},
		{
			name: "Approved Date",
			uid: "approvedAt",
			sortable: true,
		},
		{
			name: "Actions",
			uid: "actions",
			sortable: false,
		},
	];

	const renderCell = (item: any, columnKey: any) => {
		const cellValue = item[columnKey as keyof typeof item];

		switch (columnKey) {
			case "status":
				return (
					<Chip color="success" variant="flat">
						<CheckCircle className="w-3 h-3 mr-1" />
						APPROVED
					</Chip>
				);
			case "repairCost":
				return `₦${Number(cellValue).toLocaleString()}`;
			case "approvedAt":
				return formatDate(cellValue);
			case "actions":
				return (
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly variant="ghost" size="sm">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem key="view" onClick={() => handleView(item.id)}>
								<Eye className="mr-2 h-4 w-4" />
								View Details
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				);
			default:
				return cellValue || "-";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Approved Claims</h1>
					<p className="text-muted-foreground">
						Manage approved repair claims ready for processing
					</p>
				</div>
			</div>

			<GenericTable
				data={claims || []}
				columns={columns.map((col) => ({
					name: col.name,
					uid: col.uid,
					sortable: col.sortable || false,
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
				renderCell={renderCell}
				hasNoRecords={!claims || claims.length === 0}
			/>
		</div>
	);
};

export default ApprovedClaimsView;
