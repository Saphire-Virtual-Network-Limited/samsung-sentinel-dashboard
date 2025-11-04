"use client";

import React, { useState, useMemo } from "react";
import {
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Input,
	Chip,
	SortDescriptor,
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
	Plus,
	Eye,
	Edit,
	Trash2,
	Power,
	PowerOff,
	EllipsisVertical,
	MapPin,
	Users,
	CreditCard,
	Wrench,
	Building2,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib";

interface RepairCenter {
	id: string;
	name: string;
	address: string;
	state: string;
	lga: string;
	phoneNumber: string;
	email: string;
	serviceCentersCount: number;
	totalRepairs: number;
	monthlyRevenue: number;
	status: "active" | "inactive" | "suspended";
	createdBy: string;
	createdAt: string;
	lastUpdatedAt: string;
}

const columns: ColumnDef[] = [
	{ name: "Repair Center", uid: "name", sortable: true },
	{ name: "Location", uid: "location", sortable: true },
	{ name: "Service Centers", uid: "serviceCentersCount", sortable: true },
	{ name: "Total Repairs", uid: "totalRepairs", sortable: true },
	{ name: "Monthly Revenue", uid: "monthlyRevenue", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Created", uid: "createdAt", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusOptions = [
	{ name: "Active", uid: "active" },
	{ name: "Inactive", uid: "inactive" },
	{ name: "Suspended", uid: "suspended" },
];

const statusColorMap = {
	active: "success" as const,
	inactive: "default" as const,
	suspended: "danger" as const,
};

export default function SubAdminRepairCentersView() {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split("/")[2];

	// Filter and selection states (pagination/sorting handled by GenericTable)
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

	// Mock data (sub-admin might have limited access)
	const repairCenters: RepairCenter[] = useMemo(
		() => [
			{
				id: "rc_001",
				name: "Sapphire Repair Center Lagos",
				address: "Plot 15, Admiralty Way, Lekki Phase 1",
				state: "Lagos",
				lga: "Eti-Osa",
				phoneNumber: "+234-903-123-4567",
				email: "lagos@sapphire-repair.com",
				serviceCentersCount: 12,
				totalRepairs: 2450,
				monthlyRevenue: 15750000,
				status: "active" as const,
				createdBy: "admin@sapphire.com",
				createdAt: "2024-01-15T10:30:00Z",
				lastUpdatedAt: "2024-12-20T14:45:00Z",
			},
			{
				id: "rc_002",
				name: "TechFix Repair Center Abuja",
				address: "Suite 203, Central Business District",
				state: "FCT",
				lga: "Abuja Municipal",
				phoneNumber: "+234-803-987-6543",
				email: "abuja@techfix-repair.com",
				serviceCentersCount: 8,
				totalRepairs: 1890,
				monthlyRevenue: 12300000,
				status: "active" as const,
				createdBy: "admin@sapphire.com",
				createdAt: "2024-02-10T09:15:00Z",
				lastUpdatedAt: "2024-12-19T16:20:00Z",
			},
		],
		[]
	);

	// Statistics
	const stats = useMemo(
		() => ({
			totalCenters: repairCenters.length,
			activeCenters: repairCenters.filter((c) => c.status === "active").length,
			totalServiceCenters: repairCenters.reduce(
				(sum, c) => sum + c.serviceCentersCount,
				0
			),
			totalRevenue: repairCenters.reduce((sum, c) => sum + c.monthlyRevenue, 0),
		}),
		[repairCenters]
	);

	const handleSelectionChange = (keys: any) => {
		setSelectedKeys(new Set(keys));
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// Export function
	const exportFn = () => {
		// Export logic
		showToast({
			message: "Repair centers data exported successfully",
			type: "success",
		});
	};

	// Render cell content
	const renderCell = (item: RepairCenter, columnKey: React.Key) => {
		switch (columnKey) {
			case "name":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm capitalize">{item.name}</p>
						<p className="text-bold text-sm capitalize text-default-400">
							{item.email}
						</p>
					</div>
				);
			case "location":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">
							{item.state}, {item.lga}
						</p>
						<p className="text-sm text-default-400">{item.address}</p>
					</div>
				);
			case "serviceCentersCount":
				return (
					<div className="flex items-center gap-2">
						<Building2 size={16} className="text-default-400" />
						<span className="text-sm">{item.serviceCentersCount}</span>
					</div>
				);
			case "totalRepairs":
				return (
					<div className="flex items-center gap-2">
						<Wrench size={16} className="text-default-400" />
						<span className="text-sm">
							{item.totalRepairs.toLocaleString()}
						</span>
					</div>
				);
			case "monthlyRevenue":
				return (
					<span className="text-sm font-semibold text-success">
						{formatCurrency(item.monthlyRevenue)}
					</span>
				);
			case "status":
				return (
					<Chip
						className="capitalize"
						color={statusColorMap[item.status]}
						size="sm"
						variant="flat"
					>
						{item.status}
					</Chip>
				);
			case "createdAt":
				return (
					<span className="text-sm">
						{new Date(item.createdAt).toLocaleDateString()}
					</span>
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
									key="view"
									startContent={<Eye size={16} />}
									onPress={() =>
										router.push(`/access/${role}/repair-centers/${item.id}`)
									}
								>
									View Details
								</DropdownItem>
								{/* Sub-admin might have limited edit permissions */}
								<DropdownItem
									key="edit"
									startContent={<Edit size={16} />}
									onPress={() => {
										showToast({
											message: "Contact admin for editing permissions",
											type: "warning",
										});
									}}
								>
									Request Edit
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return <span>{String(item[columnKey as keyof RepairCenter])}</span>;
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Repair Centers Overview</h1>
					<p className="text-default-500">
						View and monitor repair centers and their service locations
					</p>
				</div>
				<div className="flex items-center gap-3">
					{selectedKeys.size > 0 && (
						<Button
							variant="flat"
							onPress={() => setSelectedKeys(new Set())}
							size="sm"
						>
							Clear Selection ({selectedKeys.size})
						</Button>
					)}
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<StatCard
					title="Total Centers"
					value={stats.totalCenters.toString()}
					icon={<MapPin className="w-5 h-5" />}
				/>
				<StatCard
					title="Active Centers"
					value={stats.activeCenters.toString()}
					icon={<Power className="w-5 h-5" />}
				/>
				<StatCard
					title="Service Locations"
					value={stats.totalServiceCenters.toString()}
					icon={<Building2 className="w-5 h-5" />}
				/>
				<StatCard
					title="Monthly Revenue"
					value={formatCurrency(stats.totalRevenue)}
					icon={<CreditCard className="w-5 h-5" />}
				/>
			</div>

			{/* Repair Centers Table */}
			<GenericTable<RepairCenter>
				columns={columns}
				data={repairCenters}
				allCount={repairCenters.length}
				exportData={repairCenters}
				isLoading={false}
				filterValue={filterValue}
				onFilterChange={setFilterValue}
				statusOptions={statusOptions}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				statusColorMap={statusColorMap}
				showStatus={true}
				sortDescriptor={{ column: "createdAt", direction: "descending" }}
				onSortChange={() => {}}
				page={1}
				pages={1}
				onPageChange={() => {}}
				exportFn={exportFn}
				renderCell={renderCell}
				hasNoRecords={repairCenters.length === 0}
				searchPlaceholder="Search repair centers by name, location, or email..."
				selectedKeys={selectedKeys}
				onSelectionChange={handleSelectionChange}
				selectionMode="multiple"
				showRowsPerPageSelector={true}
			/>
		</div>
	);
}
