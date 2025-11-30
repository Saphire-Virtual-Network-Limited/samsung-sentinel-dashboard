"use client";

import React, { useState, useMemo } from "react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Avatar,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Select,
	SelectItem,
} from "@heroui/react";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { StatCard } from "@/components/atoms/StatCard";
import {
	EllipsisVertical,
	Eye,
	Edit,
	Power,
	PowerOff,
	Star,
	Users,
	Wrench,
	TrendingUp,
	Award,
	Trash2,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib";
import { useRepairStoreEngineers } from "@/hooks/repair-store/useRepairStoreEngineers";
import type { Engineer } from "@/lib/api";

const columns: ColumnDef[] = [
	{ name: "Engineer", uid: "engineer", sortable: true },
	{ name: "Service Center", uid: "serviceCenter", sortable: true },
	{ name: "Contact", uid: "contact", sortable: true },
	{ name: "Description", uid: "description", sortable: false },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

export default function RepairStoreEngineersView() {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split("/")[2];

	// Filter states
	const [filterValue, setFilterValue] = useState("");
	const [serviceCenterFilter, setServiceCenterFilter] = useState("");
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
	const [page, setPage] = useState(1);

	// Use API hook
	const { engineers, isLoading, error, isDeleting, handleDelete } =
		useRepairStoreEngineers({
			...(serviceCenterFilter && { service_center_id: serviceCenterFilter }),
			...(filterValue && { search: filterValue }),
			page,
			limit: 25,
		}); // Get unique service centers for filter
	const serviceCenters = useMemo(() => {
		const centers = new Map();
		engineers.forEach((eng: any) => {
			if (eng.service_center?.id && eng.service_center?.name) {
				centers.set(eng.service_center.id, eng.service_center.name);
			}
		});
		return Array.from(centers, ([id, name]) => ({ id, name }));
	}, [engineers]);

	// Statistics
	const stats = useMemo(
		() => ({
			totalEngineers: engineers.length,
		}),
		[engineers]
	);

	const handleDeleteEngineer = async (engineerId: string) => {
		if (
			confirm(
				"Are you sure you want to delete this engineer? This action cannot be undone."
			)
		) {
			try {
				await handleDelete(engineerId);
			} catch (error) {
				// Error already handled in hook
			}
		}
	};

	// Export function
	const exportFn = async (data: Engineer[]) => {
		// Export all engineers
		const ExcelJS = (await import("exceljs")).default;
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Engineers");
		worksheet.columns = [
			{ header: "Name", key: "name", width: 25 },
			{ header: "Service Center", key: "service_center", width: 25 },
			{ header: "Phone", key: "phone", width: 18 },
			{ header: "Email", key: "email", width: 30 },
			{ header: "Description", key: "description", width: 30 },
			{ header: "Status", key: "status", width: 12 },
		];
		worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF4472C4" },
		};
		worksheet.getRow(1).alignment = {
			vertical: "middle",
			horizontal: "center",
		};
		(data || []).forEach((item: any) => {
			worksheet.addRow({
				name: item.user?.name || item.name || "N/A",
				service_center: item.service_center?.name || "N/A",
				phone: item.user?.phone || item.phone || "N/A",
				email: item.user?.email || item.email || "N/A",
				description: item.description || "",
				status: item.status,
			});
		});
		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `engineers-${new Date().toISOString().split("T")[0]}.xlsx`;
		link.click();
		URL.revokeObjectURL(url);
	};

	// Render cell content
	const renderCell = (row: Engineer, key: string) => {
		switch (key) {
			case "engineer":
				return (
					<div className="flex items-center gap-3">
						<Avatar
							name={row.user?.name || row.name || "N/A"}
							size="sm"
							className="flex-shrink-0"
						/>
						<div className="flex flex-col">
							<p className="text-bold text-sm">
								{row.user?.name || row.name || "N/A"}
							</p>
							<p className="text-bold text-xs text-default-400">
								ID: {row.id.slice(0, 8)}...
							</p>
						</div>
					</div>
				);
			case "serviceCenter":
				return (
					<div className="flex flex-col">
						<p className="text-sm font-medium">
							{(row as any).service_center?.name || "N/A"}
						</p>
					</div>
				);
			case "contact":
				return (
					<div className="flex flex-col">
						<p className="text-sm">{row.user?.phone || row.phone || "N/A"}</p>
						<p className="text-xs text-default-400">
							{row.user?.email || row.email || "N/A"}
						</p>
					</div>
				);
			case "description":
				return (
					<p className="text-sm text-gray-600">
						{row.description || "No description"}
					</p>
				);
			case "status":
				return (
					<Chip
						color={
							row.user?.status === "ACTIVE"
								? "success"
								: row.user?.status === "SUSPENDED"
								? "warning"
								: "danger"
						}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.user?.status || "N/A"}
					</Chip>
				);
			case "actions":
				return (
					<div className="flex justify-end">
						<Dropdown>
							<DropdownTrigger>
								<Button isIconOnly size="sm" variant="light">
									<EllipsisVertical className="text-default-300" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem
									key="delete"
									startContent={<Trash2 size={16} />}
									className="text-danger"
									color="danger"
									onPress={() => handleDeleteEngineer(row.id)}
								>
									Delete Engineer
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return <p className="text-sm">{(row as any)[key]}</p>;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Engineers</h1>
					<p className="text-gray-600">
						Manage and monitor all engineers across your service centers
					</p>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<StatCard
					title="Total Engineers"
					value={stats.totalEngineers.toString()}
					icon={<Users className="w-5 h-5" />}
				/>
				<StatCard
					title="Service Centers"
					value={serviceCenters.length.toString()}
					icon={<Wrench className="w-5 h-5" />}
				/>
			</div>

			{/* Engineers Table */}
			<div className="space-y-4">
				{serviceCenters.length > 0 && (
					<Select
						label="Filter by Service Center"
						placeholder="All Service Centers"
						className="max-w-xs"
						selectedKeys={serviceCenterFilter ? [serviceCenterFilter] : []}
						onSelectionChange={(keys) => {
							const selected = Array.from(keys)[0] as string;
							setServiceCenterFilter(selected || "");
						}}
					>
						{serviceCenters.map((center) => (
							<SelectItem key={center.id} value={center.id}>
								{center.name}
							</SelectItem>
						))}
					</Select>
				)}

				<GenericTable<Engineer>
					columns={columns}
					data={engineers}
					allCount={engineers.length}
					exportData={engineers}
					isLoading={isLoading}
					filterValue={filterValue}
					onFilterChange={setFilterValue}
					sortDescriptor={{ column: "createdAt", direction: "descending" }}
					onSortChange={() => {}}
					page={1}
					pages={1}
					onPageChange={() => {}}
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={engineers.length === 0}
					searchPlaceholder="Search engineers by name or email..."
					showRowsPerPageSelector={true}
				/>
			</div>
		</div>
	);
}
