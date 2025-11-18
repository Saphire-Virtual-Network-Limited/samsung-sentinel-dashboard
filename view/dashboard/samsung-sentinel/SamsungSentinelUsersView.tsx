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
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
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
import {
	cn,
	GeneralSans_SemiBold,
	type User,
	UserRole,
	showToast,
	register,
} from "@/lib";
import { createEngineer } from "@/lib/api/engineers";
import { getAllServiceCenters } from "@/lib/api/service-centers";
import { createRepairStore } from "@/lib/api/repair-partners";
import useSWR from "swr";

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

// Role options for user creation (excludes Service Center Admin)
const CREATE_USER_ROLE_OPTIONS: { value: string; label: string }[] = [
	{ value: UserRole.ADMIN, label: "Admin" },
	{ value: UserRole.REPAIR_STORE_ADMIN, label: "Repair Store Admin" },
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

// Generate random password
const generateRandomPassword = () => {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
	let password = "";
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
};

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
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editFormData, setEditFormData] = useState({
		name: "",
		phone: "",
	});
	const [createFormData, setCreateFormData] = useState({
		email: "",
		name: "",
		phone: "",
		role: "",
		password: generateRandomPassword(), // Random password for admin/finance/auditor
		service_center_id: "",
		description: "",
		location: "",
	});
	const [isSaving, setIsSaving] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [serviceCenterSearch, setServiceCenterSearch] = useState("");

	// Fetch service centers for engineer assignment
	const { data: serviceCentersData } = useSWR(
		["service-centers-list", serviceCenterSearch],
		() => getAllServiceCenters({ search: serviceCenterSearch, limit: 50 })
	);

	const serviceCenters = serviceCentersData?.data || [];
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
				setEditFormData({
					name: user.name,
					phone: user.phone || "",
				});
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
				return (
					<p className="text-sm">
						{new Date(user.createdAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
					</p>
				);
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

	// Handle save user edit
	const handleSaveEdit = async () => {
		if (!selectedUser) return;

		setIsSaving(true);
		const success = await handleUpdateUser(selectedUser.id, editFormData);
		setIsSaving(false);

		if (success) {
			setIsEditModalOpen(false);
			setSelectedUser(null);
		}
	};

	// Handle create user
	const handleCreateUser = async () => {
		if (
			!createFormData.email ||
			!createFormData.name ||
			!createFormData.phone ||
			!createFormData.role
		) {
			showToast({
				type: "error",
				message: "Please fill in all required fields",
			});
			return;
		}

		// Validate role-specific fields
		if (
			createFormData.role === "engineer" &&
			!createFormData.service_center_id
		) {
			showToast({
				type: "error",
				message: "Please select a service center for engineer",
			});
			return;
		}

		if (
			createFormData.role === "repair_store_admin" &&
			!createFormData.location
		) {
			showToast({
				type: "error",
				message: "Please enter a location for repair store",
			});
			return;
		}

		try {
			setIsCreating(true);

			// Handle different role types
			if (createFormData.role === "repair_store_admin") {
				// Use createRepairStore for repair store admin
				await createRepairStore({
					name: createFormData.name,
					email: createFormData.email,
					phone: createFormData.phone,
					location: createFormData.location,
					...(createFormData.description && {
						description: createFormData.description,
					}),
				});
			} else if (createFormData.role === "engineer") {
				// Use createEngineer for engineers
				await createEngineer({
					name: createFormData.name,
					email: createFormData.email,
					phone: createFormData.phone,
					service_center_id: createFormData.service_center_id,
					...(createFormData.description && {
						description: createFormData.description,
					}),
				});
			} else if (createFormData.role === "samsung_partner") {
				// Samsung partner - use random generated password
				await register({
					email: createFormData.email,
					name: createFormData.name,
					phone: createFormData.phone,
					role: createFormData.role,
					password: generateRandomPassword(),
				});
			} else {
				// Admin, finance, auditor - with password
				await register({
					email: createFormData.email,
					name: createFormData.name,
					phone: createFormData.phone,
					role: createFormData.role,
					password: createFormData.password,
				});
			}

			showToast({
				type: "success",
				message: "User created successfully! An invitation email will be sent.",
			});

			setIsCreateModalOpen(false);
			setCreateFormData({
				email: "",
				name: "",
				phone: "",
				role: "",
				password: generateRandomPassword(),
				service_center_id: "",
				description: "",
				location: "",
			});
			setServiceCenterSearch("");
			// Refresh the users list
			window.location.reload();
		} catch (err: any) {
			console.error("Error creating user:", err);
			showToast({
				type: "error",
				message: err?.message || "Failed to create user",
			});
		} finally {
			setIsCreating(false);
		}
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
					onPress={() => setIsCreateModalOpen(true)}
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

			{/* View User Modal */}
			<Modal
				isOpen={isViewModalOpen}
				onClose={() => {
					setIsViewModalOpen(false);
					setSelectedUser(null);
				}}
				size="2xl"
			>
				<ModalContent>
					<ModalHeader>
						<h3 className="text-xl font-semibold">User Details</h3>
					</ModalHeader>
					<ModalBody>
						{selectedUser && (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm text-gray-500">Name</label>
										<p className="font-medium">{selectedUser.name}</p>
									</div>
									<div>
										<label className="text-sm text-gray-500">Email</label>
										<p className="font-medium">{selectedUser.email}</p>
									</div>
									<div>
										<label className="text-sm text-gray-500">Phone</label>
										<p className="font-medium">{selectedUser.phone || "N/A"}</p>
									</div>
									<div>
										<label className="text-sm text-gray-500">Role</label>
										<Chip
											color={getRoleColor(selectedUser.role)}
											variant="flat"
											size="sm"
											className="mt-1"
										>
											{formatRoleLabel(selectedUser.role)}
										</Chip>
									</div>
									<div>
										<label className="text-sm text-gray-500">Status</label>
										<Chip
											color={getStatusColor(selectedUser.status)}
											variant="flat"
											size="sm"
											className="mt-1"
										>
											{selectedUser.status}
										</Chip>
									</div>
									<div>
										<label className="text-sm text-gray-500">User ID</label>
										<p className="font-mono text-sm text-gray-600">
											{selectedUser.id}
										</p>
									</div>
									<div>
										<label className="text-sm text-gray-500">Created At</label>
										<p className="text-sm">
											{new Date(selectedUser.createdAt).toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												}
											)}
										</p>
									</div>
									<div>
										<label className="text-sm text-gray-500">
											Last Updated
										</label>
										<p className="text-sm">
											{new Date(selectedUser.updatedAt).toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												}
											)}
										</p>
									</div>
								</div>
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button
							color="default"
							variant="light"
							onPress={() => {
								setIsViewModalOpen(false);
								setSelectedUser(null);
							}}
						>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Edit User Modal */}
			<Modal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedUser(null);
				}}
				size="lg"
			>
				<ModalContent>
					<ModalHeader>
						<h3 className="text-xl font-semibold">Edit User</h3>
					</ModalHeader>
					<ModalBody>
						{selectedUser && (
							<div className="space-y-4">
								<div>
									<label className="text-sm text-gray-500 mb-1 block">
										Email (Read-only)
									</label>
									<Input
										value={selectedUser.email}
										isReadOnly
										variant="flat"
										classNames={{
											input: "bg-gray-100",
										}}
									/>
								</div>
								<div>
									<label className="text-sm text-gray-500 mb-1 block">
										Name <span className="text-red-500">*</span>
									</label>
									<Input
										value={editFormData.name}
										onChange={(e) =>
											setEditFormData((prev) => ({
												...prev,
												name: e.target.value,
											}))
										}
										placeholder="Enter user name"
										variant="bordered"
									/>
								</div>
								<div>
									<label className="text-sm text-gray-500 mb-1 block">
										Phone
									</label>
									<Input
										value={editFormData.phone}
										onChange={(e) =>
											setEditFormData((prev) => ({
												...prev,
												phone: e.target.value,
											}))
										}
										placeholder="Enter phone number"
										variant="bordered"
									/>
								</div>
								<div>
									<label className="text-sm text-gray-500 mb-1 block">
										Role (Read-only)
									</label>
									<Chip
										color={getRoleColor(selectedUser.role)}
										variant="flat"
										size="md"
									>
										{formatRoleLabel(selectedUser.role)}
									</Chip>
								</div>
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button
							color="default"
							variant="light"
							onPress={() => {
								setIsEditModalOpen(false);
								setSelectedUser(null);
							}}
						>
							Cancel
						</Button>
						<Button
							color="primary"
							onPress={handleSaveEdit}
							isLoading={isSaving}
							isDisabled={!editFormData.name.trim()}
						>
							Save Changes
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Create User Modal */}
			<Modal
				isOpen={isCreateModalOpen}
				onClose={() => {
					setIsCreateModalOpen(false);
					setCreateFormData({
						email: "",
						name: "",
						phone: "",
						role: "",
						password: generateRandomPassword(),
						service_center_id: "",
						description: "",
						location: "",
					});
					setServiceCenterSearch("");
				}}
				size="2xl"
			>
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">
						Create New User
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<Input
								label="Full Name"
								placeholder="Enter full name"
								value={createFormData.name}
								onChange={(e) =>
									setCreateFormData((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
								variant="bordered"
								isRequired
							/>
							<Input
								label="Email"
								type="email"
								placeholder="user@example.com"
								value={createFormData.email}
								onChange={(e) =>
									setCreateFormData((prev) => ({
										...prev,
										email: e.target.value,
									}))
								}
								variant="bordered"
								isRequired
							/>
							<Input
								label="Phone Number"
								type="tel"
								placeholder="+2348012345678"
								value={createFormData.phone}
								onChange={(e) =>
									setCreateFormData((prev) => ({
										...prev,
										phone: e.target.value,
									}))
								}
								variant="bordered"
								isRequired
							/>
							<Select
								label="Role"
								placeholder="Select a role"
								selectedKeys={createFormData.role ? [createFormData.role] : []}
								onChange={(e) =>
									setCreateFormData((prev) => ({
										...prev,
										role: e.target.value,
										service_center_id: "", // Reset service center when role changes
										description: "",
										location: "", // Reset location when role changes
										password:
											e.target.value === "admin" ||
											e.target.value === "finance" ||
											e.target.value === "auditor"
												? generateRandomPassword()
												: prev.password,
									}))
								}
								variant="bordered"
								isRequired
							>
								{CREATE_USER_ROLE_OPTIONS.map((role) => (
									<SelectItem key={role.value} value={role.value}>
										{role.label}
									</SelectItem>
								))}
							</Select>
							{/* Location for Repair Store Admin */}
							{createFormData.role === "repair_store_admin" && (
								<Input
									label="Location"
									placeholder="e.g., Lagos, Nigeria"
									value={createFormData.location}
									onChange={(e) =>
										setCreateFormData((prev) => ({
											...prev,
											location: e.target.value,
										}))
									}
									variant="bordered"
									isRequired
								/>
							)}
							{/* Service Center Selection for Engineers */}
							{createFormData.role === "engineer" && (
								<>
									<Select
										label="Service Center"
										placeholder="Select a service center"
										selectedKeys={
											createFormData.service_center_id
												? [createFormData.service_center_id]
												: []
										}
										onChange={(e) =>
											setCreateFormData((prev) => ({
												...prev,
												service_center_id: e.target.value,
											}))
										}
										variant="bordered"
										isRequired
									>
										{serviceCenters.map((sc: any) => (
											<SelectItem key={sc.id} value={sc.id}>
												{sc.name}
											</SelectItem>
										))}
									</Select>
									<Input
										label="Description/Specialization"
										placeholder="e.g., Specialized in Samsung Galaxy repairs"
										value={createFormData.description}
										onChange={(e) =>
											setCreateFormData((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										variant="bordered"
									/>
								</>
							)}
							{/* Password for Admin, Finance, Auditor */}
							{(createFormData.role === "admin" ||
								createFormData.role === "finance" ||
								createFormData.role === "auditor") && (
								<Input
									label="Password"
									type="text"
									placeholder="Auto-generated password"
									value={createFormData.password}
									onChange={(e) =>
										setCreateFormData((prev) => ({
											...prev,
											password: e.target.value,
										}))
									}
									variant="bordered"
									description="Default password for the user. They can change it later."
									isRequired
								/>
							)}
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
								<p className="text-sm text-blue-800">
									<strong>Note:</strong>{" "}
									{createFormData.role === "samsung_partner"
										? "Samsung partners will set their password via invitation email."
										: createFormData.role === "admin" ||
										  createFormData.role === "finance" ||
										  createFormData.role === "auditor"
										? "The specified password will be set for this user."
										: "An invitation email will be sent to complete registration."}
								</p>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							color="default"
							variant="light"
							onPress={() => {
								setIsCreateModalOpen(false);
								setCreateFormData({
									email: "",
									name: "",
									phone: "",
									role: "",
									password: generateRandomPassword(),
									service_center_id: "",
									description: "",
									location: "",
								});
								setServiceCenterSearch("");
							}}
							isDisabled={isCreating}
						>
							Cancel
						</Button>
						<Button
							color="primary"
							onPress={handleCreateUser}
							isLoading={isCreating}
							isDisabled={
								!createFormData.email ||
								!createFormData.name ||
								!createFormData.phone ||
								!createFormData.role ||
								(createFormData.role === "engineer" &&
									!createFormData.service_center_id) ||
								(createFormData.role === "repair_store_admin" &&
									!createFormData.location)
							}
						>
							{isCreating ? "Creating..." : "Create User"}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
}
