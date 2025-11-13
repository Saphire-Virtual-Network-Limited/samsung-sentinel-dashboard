"use client";

import React, { useState, useMemo } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Chip,
	Button,
	Select,
	SelectItem,
	Input,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import {
	Search,
	Filter,
	UserPlus,
	MoreVertical,
	Eye,
	Edit,
	Trash2,
	UserCheck,
	UserX,
	RotateCcw,
	Mail,
} from "lucide-react";
import { useUsersManagement } from "@/hooks/admin/useUsersManagement";
import { GenericTable } from "@/components/reususables";
import { cn, GeneralSans_SemiBold, type User, UserRole } from "@/lib";

// Role options for filter
const ROLE_OPTIONS: { value: string; label: string }[] = [
	{ value: UserRole.ADMIN, label: "Admin" },
	{ value: UserRole.REPAIR_STORE_ADMIN, label: "Repair Store Admin" },
	{ value: UserRole.SERVICE_CENTER_ADMIN, label: "Service Center Admin" },
	{ value: UserRole.ENGINEER, label: "Engineer" },
	{ value: UserRole.SAMSUNG_PARTNER, label: "Samsung Partner" },
	{ value: UserRole.FINANCE, label: "Finance" },
	{ value: UserRole.AUDITOR, label: "Auditor" },
];

// Status options for filter
const STATUS_OPTIONS = [
	{ value: "ACTIVE", label: "Active" },
	{ value: "INACTIVE", label: "Inactive" },
];

export default function SamsungSentinelUsersView() {
	const {
		users,
		totalUsers,
		totalPages,
		isLoading,
		filters,
		handleRoleChange,
		handleStatusChange,
		handleSearchChange,
		handlePageChange,
		handleActivateUser,
		handleDeactivateUser,
		handleDeleteUser,
		handleRestoreUser,
		handleUpdateUser,
		handleResendInvitation,
	} = useUsersManagement();

	const [searchValue, setSearchValue] = useState("");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [sortDescriptor, setSortDescriptor] = useState<{
		column: string;
		direction: "ascending" | "descending";
	}>({
		column: "createdAt",
		direction: "descending",
	});

	// Debounced search
	React.useEffect(() => {
		const timer = setTimeout(() => {
			handleSearchChange(searchValue);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchValue, handleSearchChange]);

	// Table columns
	const columns = [
		{ name: "NAME", uid: "name", sortable: true },
		{ name: "EMAIL", uid: "email", sortable: true },
		{ name: "PHONE", uid: "phone", sortable: false },
		{ name: "ROLE", uid: "role", sortable: true },
		{ name: "STATUS", uid: "status", sortable: true },
		{ name: "CREATED", uid: "createdAt", sortable: true },
		{ name: "ACTIONS", uid: "actions", sortable: false },
	];

	// Get role color
	const getRoleColor = (role: string) => {
		switch (role) {
			case "admin":
				return "danger";
			case "repair_store_admin":
			case "service_center_admin":
				return "primary";
			case "engineer":
				return "secondary";
			case "samsung_partner":
				return "warning";
			case "finance":
				return "success";
			case "auditor":
				return "default";
			default:
				return "default";
		}
	};

	// Get status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return "success";
			case "INACTIVE":
				return "danger";
			default:
				return "default";
		}
	};

	// Format role label
	const formatRoleLabel = (role: string) => {
		return role
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	// Format date to relative time
	const formatRelativeTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "just now";
		if (diffMins < 60)
			return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
		if (diffHours < 24)
			return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
		if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
		if (diffDays < 30) {
			const weeks = Math.floor(diffDays / 7);
			return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
		}
		if (diffDays < 365) {
			const months = Math.floor(diffDays / 30);
			return `${months} month${months > 1 ? "s" : ""} ago`;
		}
		const years = Math.floor(diffDays / 365);
		return `${years} year${years > 1 ? "s" : ""} ago`;
	};

	// Handle user actions
	const handleAction = async (user: User, action: string) => {
		setSelectedUser(user);

		switch (action) {
			case "view":
				setIsViewModalOpen(true);
				break;
			case "edit":
				setIsEditModalOpen(true);
				break;
			case "activate":
				await handleActivateUser(user.id);
				break;
			case "deactivate":
				await handleDeactivateUser(user.id);
				break;
			case "delete":
				if (confirm(`Are you sure you want to delete ${user.name}?`)) {
					await handleDeleteUser(user.id);
				}
				break;
			case "restore":
				await handleRestoreUser(user.id);
				break;
			case "resend":
				await handleResendInvitation(user.email);
				break;
		}
	};

	// Render cell content
	const renderCell = (user: User, columnKey: string) => {
		switch (columnKey) {
			case "name":
				return (
					<div className="flex flex-col">
						<p className="font-medium">{user.name}</p>
					</div>
				);
			case "email":
				return <p className="text-sm">{user.email}</p>;
			case "phone":
				return <p className="text-sm">{user.phone || "N/A"}</p>;
			case "role":
				return (
					<Chip color={getRoleColor(user.role)} variant="flat" size="sm">
						{formatRoleLabel(user.role)}
					</Chip>
				);
			case "status":
				return (
					<Chip color={getStatusColor(user.status)} variant="flat" size="sm">
						{user.status}
					</Chip>
				);
			case "createdAt":
				return <p className="text-sm">{formatRelativeTime(user.createdAt)}</p>;
			case "actions":
				return (
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly size="sm" variant="light">
								<MoreVertical className="w-4 h-4" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu aria-label="User actions">
							<DropdownItem
								key="view"
								startContent={<Eye className="w-4 h-4" />}
								onPress={() => handleAction(user, "view")}
							>
								View Details
							</DropdownItem>
							<DropdownItem
								key="edit"
								startContent={<Edit className="w-4 h-4" />}
								onPress={() => handleAction(user, "edit")}
							>
								Edit User
							</DropdownItem>
							{user.status === "ACTIVE" ? (
								<DropdownItem
									key="deactivate"
									startContent={<UserX className="w-4 h-4" />}
									onPress={() => handleAction(user, "deactivate")}
									className="text-warning"
								>
									Deactivate
								</DropdownItem>
							) : (
								<DropdownItem
									key="activate"
									startContent={<UserCheck className="w-4 h-4" />}
									onPress={() => handleAction(user, "activate")}
									className="text-success"
								>
									Activate
								</DropdownItem>
							)}
							<DropdownItem
								key="resend"
								startContent={<Mail className="w-4 h-4" />}
								onPress={() => handleAction(user, "resend")}
							>
								Resend Invitation
							</DropdownItem>
							<DropdownItem
								key="delete"
								startContent={<Trash2 className="w-4 h-4" />}
								onPress={() => handleAction(user, "delete")}
								className="text-danger"
								color="danger"
							>
								Delete User
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				);
			default:
				return null;
		}
	};

	// Export function (placeholder)
	const handleExport = (data: User[]) => {
		console.log("Exporting users:", data);
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1
						className={cn(
							"text-2xl font-semibold",
							GeneralSans_SemiBold.className
						)}
					>
						User Management
					</h1>
					<p className="text-gray-600 text-sm mt-1">
						Manage system users, roles, and permissions
					</p>
				</div>
				<Button
					color="primary"
					startContent={<UserPlus className="w-4 h-4" />}
					className="w-full sm:w-auto"
				>
					Add New User
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardBody>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{/* Search */}
						<Input
							placeholder="Search by name or email..."
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							startContent={<Search className="w-4 h-4 text-default-400" />}
							isClearable
							onClear={() => setSearchValue("")}
						/>

						{/* Role Filter */}
						<Select
							placeholder="Filter by role"
							selectedKeys={filters.role ? [filters.role] : []}
							onChange={(e) => handleRoleChange(e.target.value)}
							startContent={<Filter className="w-4 h-4 text-default-400" />}
						>
							{ROLE_OPTIONS.map((role) => (
								<SelectItem key={role.value} value={role.value}>
									{role.label}
								</SelectItem>
							))}
						</Select>

						{/* Status Filter */}
						<Select
							placeholder="Filter by status"
							selectedKeys={filters.status ? [filters.status] : []}
							onChange={(e) => handleStatusChange(e.target.value)}
							startContent={<Filter className="w-4 h-4 text-default-400" />}
						>
							{STATUS_OPTIONS.map((status) => (
								<SelectItem key={status.value} value={status.value}>
									{status.label}
								</SelectItem>
							))}
						</Select>
					</div>
				</CardBody>
			</Card>

			{/* Users Table */}
			<Card>
				<CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
					<h3
						className={cn(
							"text-lg font-semibold",
							GeneralSans_SemiBold.className
						)}
					>
						All Users ({totalUsers})
					</h3>
				</CardHeader>
				<CardBody>
					<GenericTable
						columns={columns}
						data={users}
						allCount={totalUsers}
						exportData={users}
						isLoading={isLoading}
						hasNoRecords={users.length === 0 && !isLoading}
						filterValue={searchValue}
						onFilterChange={setSearchValue}
						sortDescriptor={sortDescriptor}
						onSortChange={(descriptor: any) => setSortDescriptor(descriptor)}
						page={filters.page || 1}
						pages={totalPages}
						onPageChange={handlePageChange}
						renderCell={renderCell}
						exportFn={handleExport}
						searchPlaceholder="Search users by name or email..."
					/>
				</CardBody>
			</Card>
		</div>
	);
}
