"use client";

import { TableSkeleton } from "@/components/reususables/custom-ui";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { calculateAge, capitalize, useAuth, showToast } from "@/lib";
import { getAllUsers, deactivateUser } from "@/lib/api/users";
import { hasPermission } from "@/lib/permissions";
import {
	Button,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	type SortDescriptor,
	useDisclosure,
} from "@heroui/react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { EllipsisVertical, UserPlus, KeyRound, UserX, Eye } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { columns, statusColorMap, statusOptions } from "./constants";
import CreateUserView from "./createUserView";
import PasswordChangeModal from "./components/PasswordChangeModal";
import SuspendUserModal from "./components/SuspendUserModal";
import ViewUserModal from "./components/ViewUserModal";
import type { User, UsersResponse, AccountStatus } from "./types";

export default function UsersPage() {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split("/")[2];
	const { userResponse: currentUser } = useAuth();

	const { isOpen, onOpen, onClose } = useDisclosure();
	const {
		isOpen: isPasswordModalOpen,
		onOpen: onPasswordModalOpen,
		onClose: onPasswordModalClose,
	} = useDisclosure();
	const {
		isOpen: isSuspendModalOpen,
		onOpen: onSuspendModalOpen,
		onClose: onSuspendModalClose,
	} = useDisclosure();
	const {
		isOpen: isViewModalOpen,
		onOpen: onViewModalOpen,
		onClose: onViewModalClose,
	} = useDisclosure();

	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [passwordForm, setPasswordForm] = useState({
		password: "",
		confirmPassword: "",
	});
	const [suspendForm, setSuspendForm] = useState({
		status: "SUSPENDED" as "SUSPENDED" | "ACTIVE",
		reason: "",
	});
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);

	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "fullName",
		direction: "ascending",
	});
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;

	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};

	const {
		data: raw,
		isLoading: isFetchingUsers,
		mutate,
	} = useSWR(
		"all-admins",
		() =>
			getAllUsers()
				.then((r: any) => {
					if (!r?.data || r.data?.length === 0) {
						setHasNoRecords(true);
						return [];
					}
					setHasNoRecords(false);
					return r?.data;
				})
				.catch((error: any) => {
					console.error("Error fetching users:", error);
					setHasNoRecords(true);
					return [];
				}),
		{
			revalidateOnFocus: true,
			dedupingInterval: 60000,
			refreshInterval: 60000,
			shouldRetryOnError: false,
			keepPreviousData: true,
			revalidateIfStale: true,
		}
	);

	const users = useMemo(() => {
		if (!Array.isArray(raw)) return [];

		return raw.map((user: User) => ({
			...user,
			fullName: `${capitalize(user.firstName)} ${capitalize(user.lastName)}`,
			age: user.dob ? calculateAge(user.dob) : "N/A",
		}));
	}, [raw]);

	const filtered = useMemo(() => {
		if (!users || !Array.isArray(users)) {
			return [];
		}

		let list = [...users];

		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter(
				(user: User & { fullName: string }) =>
					user.firstName.toLowerCase().includes(f) ||
					user.lastName.toLowerCase().includes(f) ||
					user.email.toLowerCase().includes(f) ||
					user.telephoneNumber?.toLowerCase().includes(f) ||
					user.userId.toLowerCase().includes(f) ||
					user.role?.toLowerCase().includes(f) ||
					user.fullName.toLowerCase().includes(f) ||
					user.companyName?.toLowerCase().includes(f)
			);
		}

		if (statusFilter.size > 0) {
			list = list.filter((user) => statusFilter.has(user.accountStatus || ""));
		}

		return list;
	}, [users, filterValue, statusFilter]);

	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;

	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page]);

	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = a[sortDescriptor.column as keyof User];
			const bVal = b[sortDescriptor.column as keyof User];
			const cmp = aVal && bVal ? (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	const exportFn = async (data: User[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Users");

		ws.columns = columns
			.filter((c) => c.uid !== "actions")
			.map((c) => ({ header: c.name, key: c.uid, width: 20 }));

		data.forEach((user) =>
			ws.addRow({
				...user,
				accountStatus: capitalize(user.accountStatus || ""),
				isActive: user.isActive ? "Yes" : "No",
				createdAt: new Date(user.createdAt).toLocaleDateString(),
			})
		);

		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Users_Records.xlsx");
	};

	const handleCreateSuccess = () => {
		mutate();
		onClose();
	};

	const handlePasswordChange = async () => {
		if (!selectedUser) return;

		if (passwordForm.password !== passwordForm.confirmPassword) {
			showToast({
				type: "error",
				message: "Passwords do not match",
			});
			return;
		}

		if (passwordForm.password.length < 6) {
			showToast({
				type: "error",
				message: "Password must be at least 6 characters long",
			});
			return;
		}

		// Check if user has Admins object with adminid
		if (!selectedUser.Admins?.adminid) {
			showToast({
				type: "error",
				message: "Unable to change password: Admin ID not found",
			});
			return;
		}

		setIsPasswordLoading(true);
		try {
			// TODO: Implement password change for admin users
			// await updateAdminPasswordForDev(
			// 	selectedUser.Admins.adminid,
			// 	passwordForm.password,
			// 	passwordForm.confirmPassword
			// );

			showToast({
				type: "warning",
				message: "Password change not implemented yet",
			});
			setPasswordForm({ password: "", confirmPassword: "" });
			onPasswordModalClose();
			mutate();
		} catch (error) {
			console.error("Error updating password:", error);
			showToast({
				type: "error",
				message: "Failed to update password",
			});
		} finally {
			setIsPasswordLoading(false);
		}
	};

	const handleSuspendUser = async () => {
		if (!selectedUser) return;

		// Check if user has Admins object with adminid
		if (!selectedUser.Admins?.adminid) {
			showToast({
				type: "error",
				message: "Unable to suspend/activate user: Admin ID not found",
			});
			return;
		}

		setIsPasswordLoading(true);
		try {
			// Use deactivateUser instead of suspendUser
			await deactivateUser(selectedUser.Admins.adminid);

			showToast({
				type: "success",
				message: `User ${
					suspendForm.status === "SUSPENDED" ? "suspended" : "activated"
				} successfully`,
			});
			setSuspendForm({ status: "SUSPENDED", reason: "" });
			onSuspendModalClose();
			mutate();
		} catch (error) {
			console.error("Error updating user status:", error);
			showToast({
				type: "error",
				message: "Failed to update user status",
			});
		} finally {
			setIsPasswordLoading(false);
		}
	};

	const canSuspendUsers = currentUser?.role
		? hasPermission(
				currentUser?.role,
				"suspendDashboardUser",
				currentUser?.email
		  )
		: false;
	const canChangePasswords = hasPermission(
		currentUser?.role || "",
		"canChangeDashboardUserPassword",
		currentUser?.email
	);
	console.log("curent user is: ", canChangePasswords);

	const renderCell = (row: User & { fullName: string }, key: string) => {
		if (key === "actions") {
			const dropdownItems = [
				<DropdownItem
					key="view"
					onPress={() => {
						setSelectedUser(row);
						onViewModalOpen();
					}}
					startContent={<Eye className="h-4 w-4" />}
				>
					View Details
				</DropdownItem>,
			];

			// Add Change Password option only for devs and if user has adminid
			if (
				canChangePasswords ||
				hasPermission(
					currentUser?.role || "",
					"canChangeDashboardUserPassword",
					currentUser?.email
				)
			) {
				dropdownItems.push(
					<DropdownItem
						key="change-password"
						onPress={() => {
							setSelectedUser(row);
							onPasswordModalOpen();
						}}
						startContent={<KeyRound className="h-4 w-4" />}
					>
						Change Password
					</DropdownItem>
				);
			}

			// Add Suspend/Activate option if user has permission and adminid
			if (canSuspendUsers && row.Admins?.adminid) {
				dropdownItems.push(
					<DropdownItem
						key="suspend"
						onPress={() => {
							setSelectedUser(row);
							setSuspendForm({
								status: row.accountStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
								reason: "",
							});
							onSuspendModalOpen();
						}}
						startContent={<UserX className="h-4 w-4" />}
						className={
							row.accountStatus === "ACTIVE" ? "text-danger" : "text-success"
						}
					>
						{row.accountStatus === "ACTIVE" ? "Suspend User" : "Activate User"}
					</DropdownItem>
				);
			}

			return (
				<div className="flex justify-end">
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly size="sm" variant="light">
								<EllipsisVertical className="text-default-300" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>{dropdownItems}</DropdownMenu>
					</Dropdown>
				</div>
			);
		}

		if (key === "accountStatus") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.accountStatus || ""]}
					size="sm"
					variant="flat"
				>
					{capitalize(row.accountStatus || "")}
				</Chip>
			);
		}

		if (key === "isActive") {
			return (
				<Chip
					className="capitalize"
					color={row.isActive ? "success" : "danger"}
					size="sm"
					variant="flat"
				>
					{row.isActive ? "Active" : "Inactive"}
				</Chip>
			);
		}

		if (key === "fullName") {
			return (
				<div
					className="capitalize cursor-pointer hover:underline font-medium"
					onClick={() => {
						// For scan partners, navigate to their specific route
						if (row.role === "SCAN_PARTNER") {
							router.push(`/access/${role}/staff/scan-partners/${row.userId}`);
						} else {
							// For other users, open the modal
							setSelectedUser(row);
							onViewModalOpen();
						}
					}}
				>
					{row.fullName}
				</div>
			);
		}

		if (key === "role") {
			return (
				<div className="text-small capitalize">
					{row.role?.replace(/_/g, " ").toLowerCase() || "N/A"}
				</div>
			);
		}

		if (key === "createdAt") {
			return (
				<div className="text-small">
					{new Date(row.createdAt).toLocaleDateString()}
				</div>
			);
		}

		if (key === "telephoneNumber") {
			return <div className="text-small">{row.telephoneNumber || "N/A"}</div>;
		}

		if (key === "companyName") {
			return (
				<div className="text-small capitalize">{row.companyName || "N/A"}</div>
			);
		}

		if (key === "companyState") {
			return (
				<div className="text-small capitalize">{row.companyState || "N/A"}</div>
			);
		}

		if (key === "companyCity") {
			return (
				<div className="text-small capitalize">{row.companyCity || "N/A"}</div>
			);
		}

		if (key === "userId") {
			return <div className="text-small font-mono">{row.userId}</div>;
		}

		return <div className="text-small">{(row as any)[key] || "N/A"}</div>;
	};

	return (
		<>
			<div className="mb-4 flex justify-center md:justify-end"></div>
			{isFetchingUsers ? (
				<TableSkeleton columns={columns.length} rows={10} />
			) : (
				<GenericTable<User & { fullName: string }>
					columns={columns}
					data={sorted}
					allCount={filtered.length}
					exportData={filtered}
					isLoading={isFetchingUsers}
					filterValue={filterValue}
					onFilterChange={(v) => {
						setFilterValue(v);
						setPage(1);
					}}
					statusOptions={statusOptions}
					statusFilter={statusFilter}
					onStatusChange={setStatusFilter}
					statusColorMap={statusColorMap}
					showStatus={true}
					sortDescriptor={sortDescriptor}
					onSortChange={setSortDescriptor}
					page={page}
					pages={pages}
					onPageChange={setPage}
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={hasNoRecords}
					onDateFilterChange={handleDateFilter}
					initialStartDate={startDate}
					initialEndDate={endDate}
					createButton={{
						text: "Create User",
						onClick: onOpen,
					}}
				/>
			)}

			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size="5xl"
				scrollBehavior="inside"
				classNames={{
					wrapper: "overflow-hidden",
					base: "max-h-[90vh]",
					body: "p-0",
					header: "border-b border-divider",
				}}
			>
				<ModalContent>
					<ModalHeader className="flex justify-between items-center px-6 py-4">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-blue-100 rounded-lg">
								<UserPlus className="h-5 w-5 text-blue-600" />
							</div>
							<div>
								<h2 className="text-lg font-semibold">Create New User</h2>
								<p className="text-sm text-gray-500">Add a new team member</p>
							</div>
						</div>
					</ModalHeader>
					<ModalBody className="p-0 overflow-y-auto">
						<div className="p-6">
							<CreateUserView onSuccess={handleCreateSuccess} />
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>

			<PasswordChangeModal
				isOpen={isPasswordModalOpen}
				onClose={onPasswordModalClose}
				selectedUser={selectedUser}
				passwordForm={passwordForm}
				setPasswordForm={setPasswordForm}
				onPasswordChange={handlePasswordChange}
				isLoading={isPasswordLoading}
			/>

			<SuspendUserModal
				isOpen={isSuspendModalOpen}
				onClose={onSuspendModalClose}
				selectedUser={selectedUser}
				suspendForm={suspendForm}
				onSuspendUser={handleSuspendUser}
				isLoading={isPasswordLoading}
			/>

			<ViewUserModal
				isOpen={isViewModalOpen}
				onClose={onViewModalClose}
				selectedUser={selectedUser}
				statusColorMap={statusColorMap}
			/>
		</>
	);
}
