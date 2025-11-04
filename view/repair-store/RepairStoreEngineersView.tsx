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
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib";

interface Engineer {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	avatar?: string;
	role: "Engineer" | "Senior Engineer" | "Lead Engineer";
	specialization: string;
	serviceCenterName: string;
	serviceCenterId: string;
	totalRepairs: number;
	monthlyRepairs: number;
	rating: number;
	status: "active" | "inactive" | "suspended";
	joinedDate: string;
	lastActiveDate: string;
}

const columns: ColumnDef[] = [
	{ name: "Engineer", uid: "engineer", sortable: true },
	{ name: "Service Center", uid: "serviceCenter", sortable: true },
	{ name: "Role", uid: "role", sortable: true },
	{ name: "Contact", uid: "contact", sortable: true },
	{ name: "Specialization", uid: "specialization", sortable: true },
	{ name: "Total Repairs", uid: "totalRepairs", sortable: true },
	{ name: "Monthly Repairs", uid: "monthlyRepairs", sortable: true },
	{ name: "Rating", uid: "rating", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap = {
	active: "success" as const,
	inactive: "danger" as const,
	suspended: "warning" as const,
};

const roleColorMap = {
	"Lead Engineer": "success" as const,
	"Senior Engineer": "warning" as const,
	Engineer: "default" as const,
};

export default function RepairStoreEngineersView() {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split("/")[2];

	// Filter states
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [roleFilter, setRoleFilter] = useState<Set<string>>(new Set());
	const [serviceCenterFilter, setServiceCenterFilter] = useState<Set<string>>(
		new Set()
	);
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

	// Selection handlers
	const handleServiceCenterFilterChange = (keys: any) => {
		if (keys === "all") {
			setServiceCenterFilter(new Set());
		} else {
			setServiceCenterFilter(new Set(Array.from(keys)));
		}
	};

	const handleRoleFilterChange = (keys: any) => {
		if (keys === "all") {
			setRoleFilter(new Set());
		} else {
			setRoleFilter(new Set(Array.from(keys)));
		}
	};

	// Mock data
	const engineers: Engineer[] = useMemo(
		() => [
			{
				id: "eng_001",
				firstName: "John",
				lastName: "Adebayo",
				email: "john.adebayo@sapphiretech.com",
				phoneNumber: "+234 801 111 2222",
				avatar: "",
				role: "Lead Engineer",
				specialization: "Mobile Repairs",
				serviceCenterName: "Sapphire Tech Hub Lagos",
				serviceCenterId: "sc_001",
				totalRepairs: 420,
				monthlyRepairs: 32,
				rating: 4.8,
				status: "active",
				joinedDate: "2024-01-20T09:00:00Z",
				lastActiveDate: "2024-10-15T16:30:00Z",
			},
			{
				id: "eng_002",
				firstName: "Sarah",
				lastName: "Ibrahim",
				email: "sarah.ibrahim@sapphiretech.com",
				phoneNumber: "+234 802 333 4444",
				avatar: "",
				role: "Senior Engineer",
				specialization: "Samsung Devices",
				serviceCenterName: "Sapphire Tech Hub Lagos",
				serviceCenterId: "sc_001",
				totalRepairs: 315,
				monthlyRepairs: 28,
				rating: 4.6,
				status: "active",
				joinedDate: "2024-02-10T10:15:00Z",
				lastActiveDate: "2024-10-15T15:45:00Z",
			},
			{
				id: "eng_003",
				firstName: "Michael",
				lastName: "Okafor",
				email: "michael.okafor@sapphiretech.com",
				phoneNumber: "+234 803 555 6666",
				avatar: "",
				role: "Engineer",
				specialization: "Screen Repairs",
				serviceCenterName: "Sapphire Tech Hub Abuja",
				serviceCenterId: "sc_002",
				totalRepairs: 256,
				monthlyRepairs: 24,
				rating: 4.4,
				status: "active",
				joinedDate: "2024-03-05T11:30:00Z",
				lastActiveDate: "2024-10-14T17:20:00Z",
			},
			{
				id: "eng_004",
				firstName: "Fatima",
				lastName: "Yusuf",
				email: "fatima.yusuf@sapphiretech.com",
				phoneNumber: "+234 804 777 8888",
				avatar: "",
				role: "Engineer",
				specialization: "Battery & Charging",
				serviceCenterName: "Sapphire Tech Hub Lagos",
				serviceCenterId: "sc_001",
				totalRepairs: 189,
				monthlyRepairs: 18,
				rating: 4.3,
				status: "suspended",
				joinedDate: "2024-04-12T14:00:00Z",
				lastActiveDate: "2024-10-10T12:15:00Z",
			},
			{
				id: "eng_005",
				firstName: "Ahmed",
				lastName: "Hassan",
				email: "ahmed.hassan@sapphiretech.com",
				phoneNumber: "+234 805 999 0000",
				avatar: "",
				role: "Senior Engineer",
				specialization: "Hardware Diagnostics",
				serviceCenterName: "Sapphire Tech Hub Port Harcourt",
				serviceCenterId: "sc_003",
				totalRepairs: 298,
				monthlyRepairs: 26,
				rating: 4.5,
				status: "active",
				joinedDate: "2024-02-28T12:45:00Z",
				lastActiveDate: "2024-10-15T14:10:00Z",
			},
			{
				id: "eng_006",
				firstName: "Grace",
				lastName: "Okoro",
				email: "grace.okoro@sapphiretech.com",
				phoneNumber: "+234 806 111 2222",
				avatar: "",
				role: "Engineer",
				specialization: "Water Damage",
				serviceCenterName: "Sapphire Tech Hub Kano",
				serviceCenterId: "sc_004",
				totalRepairs: 134,
				monthlyRepairs: 12,
				rating: 4.2,
				status: "active",
				joinedDate: "2024-05-15T08:30:00Z",
				lastActiveDate: "2024-10-13T16:55:00Z",
			},
		],
		[]
	);

	// Statistics
	const stats = useMemo(() => {
		const activeEngineers = engineers.filter((e) => e.status === "active");
		const totalRepairs = engineers.reduce((sum, e) => sum + e.totalRepairs, 0);
		const monthlyRepairs = engineers.reduce(
			(sum, e) => sum + e.monthlyRepairs,
			0
		);
		const averageRating =
			engineers.reduce((sum, e) => sum + e.rating, 0) / engineers.length;

		return {
			totalEngineers: engineers.length,
			activeEngineers: activeEngineers.length,
			totalRepairs,
			monthlyRepairs,
			averageRating: Number(averageRating.toFixed(1)),
		};
	}, [engineers]);

	// Get unique service centers for filter
	const serviceCenters = useMemo(() => {
		const centers = Array.from(
			new Set(engineers.map((e) => e.serviceCenterName))
		);
		return centers.map((name) => ({
			name: name,
			uid: name.toLowerCase().replace(/\s+/g, "-"),
		}));
	}, [engineers]);

	const handleToggleStatus = async (
		engineerId: string,
		currentStatus: string
	) => {
		const newStatus = currentStatus === "active" ? "suspended" : "active";
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			showToast({
				message: `Engineer status updated to ${newStatus}`,
				type: "success",
			});
		} catch (error) {
			showToast({ message: "Failed to update engineer status", type: "error" });
		}
	};

	// Bulk actions
	const handleBulkActivate = async () => {
		if (selectedKeys.size === 0) return;
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: `${selectedKeys.size} engineers activated successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
		} catch (error) {
			showToast({ message: "Failed to activate engineers", type: "error" });
		}
	};

	const handleBulkSuspend = async () => {
		if (selectedKeys.size === 0) return;
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: `${selectedKeys.size} engineers suspended successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
		} catch (error) {
			showToast({ message: "Failed to suspend engineers", type: "error" });
		}
	};

	// Selection handler
	const handleSelectionChange = (keys: any) => {
		if (keys === "all") {
			if (selectedKeys.size === engineers.length) {
				setSelectedKeys(new Set());
			} else {
				setSelectedKeys(new Set(engineers.map((item) => item.id)));
			}
		} else {
			setSelectedKeys(new Set(Array.from(keys)));
		}
	};

	// Export function
	const exportFn = async (data: Engineer[]) => {
		console.log("Exporting engineers:", data);
	};

	// Render cell content
	const renderCell = (row: Engineer, key: string) => {
		switch (key) {
			case "engineer":
				return (
					<div className="flex items-center gap-3">
						<Avatar
							name={`${row.firstName} ${row.lastName}`}
							size="sm"
							src={row.avatar}
							className="flex-shrink-0"
						/>
						<div className="flex flex-col">
							<p className="text-bold text-sm">
								{row.firstName} {row.lastName}
							</p>
							<p className="text-bold text-xs text-default-400">ID: {row.id}</p>
						</div>
					</div>
				);
			case "serviceCenter":
				return (
					<div className="flex flex-col">
						<p className="text-sm font-medium">{row.serviceCenterName}</p>
						<Button
							size="sm"
							variant="light"
							className="h-auto p-0 text-xs text-primary"
							onPress={() =>
								router.push(
									`/access/${role}/service-centers/${row.serviceCenterId}`
								)
							}
						>
							View Service Center
						</Button>
					</div>
				);
			case "role":
				return (
					<Chip
						color={roleColorMap[row.role]}
						variant="flat"
						size="sm"
						className="capitalize"
					>
						{row.role}
					</Chip>
				);
			case "contact":
				return (
					<div className="flex flex-col">
						<p className="text-sm">{row.phoneNumber}</p>
						<p className="text-xs text-default-400">{row.email}</p>
					</div>
				);
			case "specialization":
				return <p className="text-sm">{row.specialization}</p>;
			case "totalRepairs":
				return <p className="text-sm font-medium">{row.totalRepairs}</p>;
			case "monthlyRepairs":
				return <p className="text-sm font-medium">{row.monthlyRepairs}</p>;
			case "rating":
				return (
					<div className="flex items-center gap-1">
						<Star className="w-4 h-4 text-yellow-500 fill-current" />
						<p className="text-sm font-medium">{row.rating}</p>
					</div>
				);
			case "status":
				return (
					<Chip
						color={statusColorMap[row.status]}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.status}
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
								<DropdownItem key="view" startContent={<Eye size={16} />}>
									View Profile
								</DropdownItem>
								<DropdownItem key="edit" startContent={<Edit size={16} />}>
									Edit Engineer
								</DropdownItem>
								<DropdownItem
									key="view-center"
									startContent={<Eye size={16} />}
									onPress={() =>
										router.push(
											`/access/${role}/service-centers/${row.serviceCenterId}`
										)
									}
								>
									View Service Center
								</DropdownItem>
								<DropdownItem
									key="toggle"
									startContent={
										row.status === "active" ? (
											<PowerOff size={16} />
										) : (
											<Power size={16} />
										)
									}
									onPress={() => handleToggleStatus(row.id, row.status)}
								>
									Change Status
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return <p className="text-sm">{(row as any)[key]}</p>;
		}
	};

	const statusOptions = [
		{ name: "Active", uid: "active" },
		{ name: "Suspended", uid: "suspended" },
		{ name: "Inactive", uid: "inactive" },
	];

	const roleOptions = [
		{ name: "Lead Engineer", uid: "Lead Engineer" },
		{ name: "Senior Engineer", uid: "Senior Engineer" },
		{ name: "Engineer", uid: "Engineer" },
	];

	// Top performers section
	const topPerformers = useMemo(() => {
		return engineers
			.filter((e) => e.status === "active")
			.sort((a, b) => b.monthlyRepairs - a.monthlyRepairs)
			.slice(0, 5);
	}, [engineers]);

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
				{selectedKeys.size > 0 && (
					<div className="flex items-center gap-2">
						<Button
							color="success"
							variant="flat"
							startContent={<Power size={16} />}
							onPress={handleBulkActivate}
							size="sm"
						>
							Activate ({selectedKeys.size})
						</Button>
						<Button
							color="warning"
							variant="flat"
							startContent={<PowerOff size={16} />}
							onPress={handleBulkSuspend}
							size="sm"
						>
							Suspend ({selectedKeys.size})
						</Button>
						<Button
							variant="light"
							onPress={() => setSelectedKeys(new Set())}
							size="sm"
						>
							Clear Selection
						</Button>
					</div>
				)}
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<StatCard
					title="Total Engineers"
					value={stats.totalEngineers.toString()}
					icon={<Users className="w-5 h-5" />}
				/>
				<StatCard
					title="Active Engineers"
					value={stats.activeEngineers.toString()}
					icon={<Award className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Repairs"
					value={stats.totalRepairs.toString()}
					icon={<Wrench className="w-5 h-5" />}
				/>
				<StatCard
					title="Monthly Repairs"
					value={stats.monthlyRepairs.toString()}
					icon={<TrendingUp className="w-5 h-5" />}
				/>
				<StatCard
					title="Average Rating"
					value={stats.averageRating.toString()}
					icon={<Star className="w-5 h-5" />}
				/>
			</div>

			{/* Top Performers Section */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Top Performers This Month</h2>
				</CardHeader>
				<CardBody>
					<div className="space-y-3">
						{topPerformers.map((engineer, index) => (
							<div
								key={engineer.id}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
										{index + 1}
									</div>
									<Avatar
										name={`${engineer.firstName} ${engineer.lastName}`}
										size="sm"
										src={engineer.avatar}
									/>
									<div>
										<p className="font-medium">
											{engineer.firstName} {engineer.lastName}
										</p>
										<p className="text-sm text-gray-600">
											{engineer.serviceCenterName}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4">
									<div className="text-right">
										<p className="text-sm font-medium">
											{engineer.monthlyRepairs} repairs
										</p>
										<div className="flex items-center gap-1">
											<Star className="w-3 h-3 text-yellow-500 fill-current" />
											<p className="text-xs text-gray-600">{engineer.rating}</p>
										</div>
									</div>
									<Chip
										color={roleColorMap[engineer.role]}
										variant="flat"
										size="sm"
									>
										{engineer.role}
									</Chip>
								</div>
							</div>
						))}
					</div>
				</CardBody>
			</Card>

			{/* Engineers Table */}
			<div className="space-y-4">
				<div className="flex items-center gap-4">
					<Select
						label="Filter by Service Center"
						placeholder="All Service Centers"
						className="max-w-xs"
						selectedKeys={serviceCenterFilter}
						onSelectionChange={handleServiceCenterFilterChange}
						selectionMode="multiple"
					>
						{serviceCenters.map((center) => (
							<SelectItem key={center.uid} value={center.uid}>
								{center.name}
							</SelectItem>
						))}
					</Select>
					<Select
						label="Filter by Role"
						placeholder="All Roles"
						className="max-w-xs"
						selectedKeys={roleFilter}
						onSelectionChange={handleRoleFilterChange}
						selectionMode="multiple"
					>
						{roleOptions.map((role) => (
							<SelectItem key={role.uid} value={role.uid}>
								{role.name}
							</SelectItem>
						))}
					</Select>
				</div>

				<GenericTable<Engineer>
					columns={columns}
					data={engineers}
					allCount={engineers.length}
					exportData={engineers}
					isLoading={false}
					filterValue={filterValue}
					onFilterChange={setFilterValue}
					statusOptions={statusOptions}
					statusFilter={statusFilter}
					onStatusChange={setStatusFilter}
					statusColorMap={statusColorMap}
					showStatus={true}
					sortDescriptor={{ column: "monthlyRepairs", direction: "descending" }}
					onSortChange={() => {}}
					page={1}
					pages={1}
					onPageChange={() => {}}
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={engineers.length === 0}
					searchPlaceholder="Search engineers by name, email, or specialization..."
					selectedKeys={selectedKeys}
					onSelectionChange={handleSelectionChange}
					selectionMode="multiple"
					showRowsPerPageSelector={true}
				/>
			</div>
		</div>
	);
}
