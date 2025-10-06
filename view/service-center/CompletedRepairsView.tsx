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
import { MoreHorizontal, Eye, CheckCircle, Clock, Receipt } from "lucide-react";
import { formatDate } from "@/lib";

interface CompletedRepairsViewProps {
	paymentFilter?: "paid" | "unpaid" | "all";
}

const CompletedRepairsView: React.FC<CompletedRepairsViewProps> = ({
	paymentFilter = "all",
}) => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [dateRange, setDateRange] = useState({ start: "", end: "" });

	const {
		data: repairs,
		isLoading,
		error,
	} = useServiceCenterClaims({
		status: "completed",
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
			header: "Commission",
			accessorKey: "commission",
			cell: ({ row }: any) => (
				<span className="font-medium">
					₦{Number(row.original.commission || 0).toLocaleString()}
				</span>
			),
		},
		{
			header: "Payment Status",
			accessorKey: "paymentStatus",
			cell: ({ row }: any) => {
				const status = row.original.paymentStatus;
				const isPaid = status === "paid";
				return (
					<Chip
						color={isPaid ? "success" : "warning"}
						variant="flat"
						startContent={
							isPaid ? (
								<CheckCircle className="w-3 h-3" />
							) : (
								<Clock className="w-3 h-3" />
							)
						}
					>
						{isPaid ? "PAID" : "PENDING PAYMENT"}
					</Chip>
				);
			},
		},
		{
			header: "Amount Paid",
			accessorKey: "paidAmount",
			cell: ({ row }: any) => {
				const amount = row.original.paidAmount;
				return (
					<span
						className={
							amount > 0
								? "font-medium text-green-600"
								: "text-muted-foreground"
						}
					>
						{amount > 0 ? `₦${Number(amount).toLocaleString()}` : "-"}
					</span>
				);
			},
		},
		{
			header: "Date Completed",
			accessorKey: "completedAt",
			cell: ({ row }: any) => formatDate(row.original.completedAt),
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
				const repair = row.original;
				return (
					<Dropdown>
						<DropdownTrigger>
							<Button variant="light" size="sm" isIconOnly>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem key="view" onClick={() => handleView(repair.id)}>
								<Eye className="mr-2 h-4 w-4" />
								View Details
							</DropdownItem>
							{repair.paymentReceipt ? (
								<DropdownItem
									key="receipt"
									onClick={() => window.open(repair.paymentReceipt, "_blank")}
								>
									<Receipt className="mr-2 h-4 w-4" />
									View Receipt
								</DropdownItem>
							) : null}
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

	const paymentStatusOptions = [
		{ label: "All Payments", value: "" },
		{ label: "Paid", value: "paid" },
		{ label: "Pending Payment", value: "unpaid" },
	];

	const getTitle = () => {
		switch (paymentFilter) {
			case "paid":
				return "Paid Repairs";
			case "unpaid":
				return "Unpaid Repairs";
			default:
				return "Completed Repairs";
		}
	};

	const getDescription = () => {
		switch (paymentFilter) {
			case "paid":
				return "Repairs with authorized payments";
			case "unpaid":
				return "Repairs awaiting payment authorization";
			default:
				return "All completed repairs and their payment status";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{getTitle()}</h1>
					<p className="text-muted-foreground">{getDescription()}</p>
				</div>
			</div>

			<GenericTable
				data={repairs || []}
				columns={columns.map((col) => ({
					name: typeof col.header === "string" ? col.header : "",
					uid: col.accessorKey || col.id || "",
					sortable: true,
				}))}
				allCount={repairs?.length || 0}
				exportData={repairs || []}
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
				hasNoRecords={!repairs || repairs.length === 0}
			/>
		</div>
	);
};

export default CompletedRepairsView;
