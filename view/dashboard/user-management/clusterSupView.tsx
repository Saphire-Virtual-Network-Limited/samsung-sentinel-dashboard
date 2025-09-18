"use client";

import { TableSkeleton } from "@/components/reususables/custom-ui";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import {
  calculateAge,
  capitalize,
  getClusterSupervisors,
  updateAdminPasswordForDev,
  suspendUser,
  useAuth,
  showToast,
  assignClusterSupervisorToCluster,
  getClustersForAssignment,
} from "@/lib";
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
import CreateClusterSupervisorView from "./createClusterSupervisorView";
import PasswordChangeModal from "./components/PasswordChangeModal";
import SuspendUserModal from "./components/SuspendUserModal";
import ViewUserModal from "./components/ViewUserModal";
import type { User, UsersResponse, AccountStatus, clusterSupervisor, UserOrClusterSupervisor  } from "./types";

export default function ClusterSupView() {
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
  const {
    isOpen: isAssignModalOpen,
    onOpen: onAssignModalOpen,
    onClose: onAssignModalClose,
  } = useDisclosure();

  const [selectedUser, setSelectedUser] = useState<UserOrClusterSupervisor | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [suspendForm, setSuspendForm] = useState({
    status: "SUSPENDED" as "SUSPENDED" | "ACTIVE",
    reason: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isAssignLoading, setIsAssignLoading] = useState(false);
  const [clusters, setClusters] = useState<any[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string>("");

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
    "all-cluster-supervisors",
    () =>
      getClusterSupervisors()
        .then((r: any) => {
          const data = r?.data || r;
          if (!data || data?.length === 0) {
            setHasNoRecords(true);
            return [];
          }
          setHasNoRecords(false);
          return data;
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

  // Fetch clusters for assignment
  const { data: clustersData } = useSWR(
    "clusters-for-assignment",
    () => getClustersForAssignment().then((r: any) => r?.data || r),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  // Update clusters state when data changes
  React.useEffect(() => {
    if (clustersData && Array.isArray(clustersData)) {
      setClusters(clustersData);
    }
  }, [clustersData]);

  // Handle cluster assignment
  const handleAssignToCluster = async () => {
    if (!selectedUser || !selectedClusterId) return;

    setIsAssignLoading(true);
    try {
      const response = await assignClusterSupervisorToCluster(selectedUser.userId);
      if (response) {
        showToast({
          type: "success",
          message: "Cluster supervisor assigned to cluster successfully",
          duration: 5000,
        });
        onAssignModalClose();
        setSelectedClusterId("");
        mutate(); // Refresh the data
      }
    } catch (error: any) {
      showToast({
        type: "error",
        message: error.message || "Failed to assign cluster supervisor",
        duration: 5000,
      });
    } finally {
      setIsAssignLoading(false);
    }
  };

  const users = useMemo(() => {
    if (!Array.isArray(raw)) return [];

    return raw.map((user: clusterSupervisor) => ({
      ...user,
      fullName: `${capitalize(user.firstName)} ${capitalize(user.lastName)}`,
      age: user.dob ? calculateAge(user.dob) : "N/A",
      telephoneNumber: user.phone, // Map phone to telephoneNumber for compatibility
      stateName: user.stateName, // Preserve stateName from API
      clusterName: user.clusterName, // Preserve clusterName from API
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
        (user: clusterSupervisor & { fullName: string }) =>
          user.firstName.toLowerCase().includes(f) ||
          user.lastName.toLowerCase().includes(f) ||
          user.email.toLowerCase().includes(f) ||
          user.phone?.toLowerCase().includes(f) ||
          user.fullName.toLowerCase().includes(f) ||
          user.clusterName?.toLowerCase().includes(f) ||
          user.stateName?.toLowerCase().includes(f)
      );
    }

    if (statusFilter.size > 0) {
      list = list.filter((user) => statusFilter.has(user.accountStatus || "PENDING"));
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
      const aVal = a[sortDescriptor.column as keyof clusterSupervisor];
      const bVal = b[sortDescriptor.column as keyof clusterSupervisor];
      const cmp = aVal && bVal ? (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paged, sortDescriptor]);

  const exportFn = async (data: (clusterSupervisor & { fullName: string; age: string | number; telephoneNumber: string })[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Users");

    ws.columns = columns
      .filter((c) => c.uid !== "actions")
      .map((c) => ({ header: c.name, key: c.uid, width: 20 }));

    data.forEach((user) =>
      ws.addRow({
        ...user,
        accountStatus: capitalize(user.accountStatus || "PENDING"),
        isActive: user.isActive ? "Yes" : "No",
        createdAt: new Date(user.createdAt).toLocaleDateString(),
        telephoneNumber: user.phone,
        companyState: user.stateName || "N/A",
        clusterName: user.clusterName || "N/A",
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
      await updateAdminPasswordForDev(
        selectedUser.Admins.adminid,
        passwordForm.password,
        passwordForm.confirmPassword
      );

      showToast({
        type: "success",
        message: "Password updated successfully",
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
      await suspendUser({
        adminId: selectedUser.Admins.adminid,
        status: suspendForm.status,
      });

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

  const canSuspendUsers = currentUser?.data?.role
    ? hasPermission(
        currentUser?.data.role,
        "suspendDashboardUser",
        currentUser?.data.email
      )
    : false;
  const canChangePasswords = hasPermission(
    currentUser?.data?.role,
    "canChangeDashboardUserPassword",
    currentUser?.data?.email
  );
  console.log("curent user is: ", canChangePasswords);

  const renderCell = (row: clusterSupervisor & { fullName: string; age: string | number; telephoneNumber: string }, key: string) => {
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
          currentUser?.data?.role,
          "canChangeDashboardUserPassword",
          currentUser?.data?.email
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

      // Add Assign to Cluster option
      dropdownItems.push(
        <DropdownItem
          key="assign-cluster"
          onPress={() => {
            setSelectedUser(row);
            setSelectedClusterId("");
            onAssignModalOpen();
          }}
          startContent={<UserPlus className="h-4 w-4" />}
        >
          Assign to Cluster
        </DropdownItem>
      );

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
        <div className="text-small capitalize">{"N/A"}</div>
      );
    }

    if (key === "companyState") {
      return (
        <div className="text-small capitalize">{row.stateName || "N/A"}</div>
      );
    }

    if (key === "companyCity") {
      return (
        <div className="text-small capitalize">{"N/A"}</div>
      );
    }

    if (key === "clusterName") {
      return (
        <div className="text-small capitalize">{row.clusterName || "N/A"}</div>
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
        <GenericTable<clusterSupervisor & { fullName: string; age: string | number; telephoneNumber: string }>
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
              <CreateClusterSupervisorView onSuccess={handleCreateSuccess} />
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

      {/* Assign to Cluster Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={onAssignModalClose} size="md">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Assign to Cluster</h3>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Assign <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> to a cluster
              </p>
              <select
                value={selectedClusterId}
                onChange={(e) => setSelectedClusterId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAssignLoading}
              >
                <option value="">Select a cluster</option>
                {clusters.map((cluster) => (
                  <option key={cluster.id} value={cluster.id}>
                    {cluster.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="light"
                onPress={onAssignModalClose}
                disabled={isAssignLoading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleAssignToCluster}
                isLoading={isAssignLoading}
                isDisabled={!selectedClusterId || isAssignLoading}
              >
                {isAssignLoading ? "Assigning..." : "Assign to Cluster"}
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
