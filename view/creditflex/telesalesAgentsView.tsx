"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  SortDescriptor,
  useDisclosure,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  MoreVertical,
  Download,
  Eye,
  UserPlus,
  Edit,
  Trash2,
} from "lucide-react";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { useTelemarketers } from "@/hooks/creditflex/useTelemarketers";
import { TelemarketerModal } from "@/components/modals/TelemarketerModal";
import { OnboardTelemarketerModal } from "@/components/modals/OnboardTelemarketerModal";
import { capitalize, showToast } from "@/lib";
import { cdfAdminDeleteAgent } from "@/lib/api";
import { getColor } from "@/lib/utils";
import { TeleMarketer, searchFilterOptions } from "./telesales/types";
import { columns, statusOptions, statusColorMap } from "./telesales/constants";

// Status color mapping for Excel export
const STATUS_COLOR_MAP: Record<string, string> = {
  success: "FF28A745",
  warning: "FFFFC107",
  primary: "FF0D6EFD",
  danger: "FFDC3545",
  default: "FFE0E0E0",
};

const CreditflexTelesalesAgentsView = () => {
  const router = useRouter();
  const pathname = usePathname();

  const role = pathname.split("/")[2];

  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [hasNoRecords, setHasNoRecords] = useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilterValue, setDebouncedFilterValue] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "fullName",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedTelemarketer, setSelectedTelemarketer] =
    useState<TeleMarketer | null>(null);

  // Modal states
  const {
    isOpen: isTelemarketerModalOpen,
    onOpen: openTelemarketerModal,
    onClose: closeTelemarketerModal,
  } = useDisclosure();

  const {
    isOpen: isOnboardModalOpen,
    onOpen: openOnboardModal,
    onClose: closeOnboardModal,
  } = useDisclosure();

  // Debounce the filter value to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilterValue(filterValue);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [filterValue]);

  // Reset page when debounced filter value changes
  useEffect(() => {
    setPage(1);
  }, [debouncedFilterValue, filterBy, statusFilter]);

  // Fetch telemarketers data
  const { data: response, error, isLoading, mutate } = useTelemarketers();

  const telemarketersData = useMemo(() => {
    // Debug: Log the response structure
    if (response) {
      console.log("Telemarketers API Response:", response);
    }

    // Handle different possible response structures
    let rawData: TeleMarketer[] = [];

    if (response?.data) {
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (typeof response.data === "object") {
        // Access properties safely
        const dataObj = response.data as any;
        rawData = dataObj.telemarketers || dataObj.telemarketer || [];
      }
    }

    return Array.isArray(rawData) ? rawData : [];
  }, [response]);

  // Handle URL telemarketer ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const agentId = urlParams.get("agentId");

      if (agentId && telemarketersData.length > 0) {
        const telemarketer = telemarketersData.find(
          (agent) => agent.teleMarketerId === agentId
        );

        if (telemarketer) {
          setSelectedTelemarketer(telemarketer);
          openTelemarketerModal();

          // Clean URL without causing page reload
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        }
      }
    }
  }, [telemarketersData, openTelemarketerModal]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getFullName = (telemarketer: TeleMarketer) => {
    return `${telemarketer.firstname} ${telemarketer.lastname}`.trim();
  };

  // Filter and search logic (memoized to prevent unnecessary recalculations)
  const filtered = useMemo(() => {
    let list = [...telemarketersData];

    // Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      list = list.filter((telemarketer: TeleMarketer) => {
        if (!telemarketer.createdAt) return true;
        const agentDate = new Date(telemarketer.createdAt);
        return agentDate >= start && agentDate <= end;
      });
    }

    // Status filter
    if (statusFilter.size > 0 && !statusFilter.has("all")) {
      list = list.filter((telemarketer: TeleMarketer) =>
        statusFilter.has(telemarketer.accountStatus?.toUpperCase() || "")
      );
    }

    // Search filter (only apply if debounced value exists)
    if (debouncedFilterValue.trim()) {
      const searchValue = debouncedFilterValue.toLowerCase();

      if (filterBy && filterBy !== "all") {
        // Filter by specific field
        list = list.filter((telemarketer: TeleMarketer) => {
          switch (filterBy) {
            case "full-name":
              return getFullName(telemarketer)
                .toLowerCase()
                .includes(searchValue);
            case "email":
              return telemarketer.email?.toLowerCase().includes(searchValue);
            case "phone":
              return telemarketer.phone?.toLowerCase().includes(searchValue);
            case "agent-id":
              return telemarketer.teleMarketerId
                ?.toLowerCase()
                .includes(searchValue);
            case "address":
              return telemarketer.address?.toLowerCase().includes(searchValue);
            default:
              return true;
          }
        });
      } else {
        // Default search across multiple fields
        list = list.filter(
          (telemarketer: TeleMarketer) =>
            getFullName(telemarketer).toLowerCase().includes(searchValue) ||
            telemarketer.email?.toLowerCase().includes(searchValue) ||
            telemarketer.phone?.toLowerCase().includes(searchValue) ||
            telemarketer.teleMarketerId?.toLowerCase().includes(searchValue) ||
            telemarketer.address?.toLowerCase().includes(searchValue) ||
            telemarketer.accountStatus?.toLowerCase().includes(searchValue)
        );
      }
    }

    return list;
  }, [
    telemarketersData,
    debouncedFilterValue,
    filterBy,
    statusFilter,
    startDate,
    endDate,
  ]);

  const pages = Math.ceil(filtered.length / rowsPerPage) || 1;

  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const sorted = useMemo(() => {
    return [...paged].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      // Handle special cases for nested properties
      if (sortDescriptor.column === "fullName") {
        aVal = getFullName(a);
        bVal = getFullName(b);
      } else {
        aVal = a[sortDescriptor.column as keyof TeleMarketer];
        bVal = b[sortDescriptor.column as keyof TeleMarketer];
      }

      let cmp = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        cmp = aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paged, sortDescriptor]);

  // Handle date filter
  const handleDateFilter = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setPage(1);
  }, []);

  // Handle telemarketer view
  const handleViewTelemarketer = useCallback(
    (telemarketer: TeleMarketer) => {
      setSelectedTelemarketer(telemarketer);
      openTelemarketerModal();
    },
    [openTelemarketerModal]
  );

  // Handle edit telemarketer
  const handleEditTelemarketer = useCallback(
    (telemarketer: TeleMarketer) => {
      setSelectedTelemarketer(telemarketer);
      openTelemarketerModal();
    },
    [openTelemarketerModal]
  );

  // Handle delete telemarketer
  const handleDeleteTelemarketer = useCallback(
    async (telemarketer: TeleMarketer) => {
      if (!telemarketer.teleMarketerId) {
        showToast({
          message: "Invalid agent ID",
          type: "error",
        });
        return;
      }

      const confirmDelete = window.confirm(
        `Are you sure you want to delete agent ${getFullName(telemarketer)}?`
      );

      if (!confirmDelete) return;

      try {
        const response = await cdfAdminDeleteAgent({
          telemarketerId: telemarketer.teleMarketerId,
        });

        if (response.success) {
          showToast({
            message: "Agent deleted successfully",
            type: "success",
          });
          mutate(); // Refresh the data
        } else {
          throw new Error(response.message || "Delete failed");
        }
      } catch (error: any) {
        console.error(error);
        showToast({
          message: error.message || "Failed to delete agent",
          type: "error",
        });
      }
    },
    [mutate]
  );

  // Handle copy shareable link
  const handleCopyLink = useCallback((telemarketer: TeleMarketer) => {
    const currentUrl = window.location.origin + window.location.pathname;
    const shareableLink = `${currentUrl}?agentId=${telemarketer.teleMarketerId}`;

    navigator.clipboard.writeText(shareableLink);
    showToast({
      message: "Shareable link copied to clipboard!",
      type: "success",
    });
  }, []);

  // Excel export function
  const exportFn = useCallback(async (data: TeleMarketer[]) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Telesales Agents");

      // Define columns
      worksheet.columns = [
        { header: "Agent ID", key: "teleMarketerId", width: 20 },
        { header: "Full Name", key: "fullName", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Address", key: "address", width: 30 },
        { header: "Status", key: "accountStatus", width: 15 },
        { header: "Email Verified", key: "emailVerified", width: 15 },
        { header: "Channel", key: "channel", width: 15 },
        { header: "Created Date", key: "createdAt", width: 15 },
      ];

      // Style the header
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "366092" },
      };

      // Add data
      data.forEach((telemarketer) => {
        const row = worksheet.addRow({
          teleMarketerId: telemarketer.teleMarketerId,
          fullName: getFullName(telemarketer),
          email: telemarketer.email,
          phone: telemarketer.phone,
          address: telemarketer.address || "N/A",
          accountStatus: telemarketer.accountStatus,
          emailVerified: telemarketer.emailVerified ? "Yes" : "No",
          channel: telemarketer.channel || "N/A",
          createdAt: telemarketer.createdAt
            ? formatDate(telemarketer.createdAt)
            : "",
        });

        // Color code status
        const statusColor =
          STATUS_COLOR_MAP[getColor(telemarketer.accountStatus)] ||
          STATUS_COLOR_MAP.default;
        const statusCell = row.getCell("accountStatus");
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: statusColor },
        };
      });

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const timestamp = new Date().toISOString().split("T")[0];
      saveAs(blob, `telesales-agents-${timestamp}.xlsx`);

      showToast({
        message: "Export completed successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      showToast({
        message: "Export failed. Please try again.",
        type: "error",
      });
    }
  }, []);

  // Render cell content
  const renderCell = useCallback(
    (telemarketer: TeleMarketer, columnKey: string) => {
      if (columnKey === "serialNumber") {
        const index = sorted.indexOf(telemarketer);
        const serialNumber = (page - 1) * rowsPerPage + index + 1;
        return <span className="text-sm">{serialNumber}</span>;
      }

      switch (columnKey) {
        case "teleMarketerId":
          return (
            <span className="text-sm font-mono">
              {telemarketer.teleMarketerId}
            </span>
          );

        case "fullName":
          return (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">
                    {telemarketer.firstname?.[0]}
                    {telemarketer.lastname?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {getFullName(telemarketer)}
                </p>
              </div>
            </div>
          );

        case "email":
          return (
            <div className="flex flex-col">
              <span className="text-sm">{telemarketer.email}</span>
              {telemarketer.emailVerified && (
                <Chip
                  color="success"
                  size="sm"
                  variant="flat"
                  className="w-fit mt-1"
                >
                  Verified
                </Chip>
              )}
            </div>
          );

        case "phone":
          return <span className="text-sm">{telemarketer.phone || "N/A"}</span>;

        case "address":
          return (
            <span className="text-sm truncate max-w-xs">
              {telemarketer.address || "N/A"}
            </span>
          );

        case "accountStatus":
          return (
            <Chip
              className="capitalize"
              color={getColor(telemarketer.accountStatus)}
              size="sm"
              variant="flat"
            >
              {telemarketer.accountStatus.replace("_", " ")}
            </Chip>
          );

        case "createdAt":
          return (
            <span className="text-sm">
              {telemarketer.createdAt
                ? formatDate(telemarketer.createdAt)
                : "N/A"}
            </span>
          );

        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <MoreVertical className="w-4 h-4 text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Telemarketer actions">
                  <DropdownItem
                    key="view"
                    startContent={<Eye className="w-4 h-4" />}
                    onPress={() => handleViewTelemarketer(telemarketer)}
                  >
                    View Details
                  </DropdownItem>
                  <DropdownItem
                    key="edit"
                    startContent={<Edit className="w-4 h-4" />}
                    onPress={() => handleEditTelemarketer(telemarketer)}
                  >
                    Edit Agent
                  </DropdownItem>
                  <DropdownItem
                    key="copy-link"
                    startContent={<Download className="w-4 h-4" />}
                    onPress={() => handleCopyLink(telemarketer)}
                  >
                    Copy Shareable Link
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    startContent={<Trash2 className="w-4 h-4" />}
                    onPress={() => handleDeleteTelemarketer(telemarketer)}
                    className="text-danger"
                    color="danger"
                  >
                    Delete Agent
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return (
            <span className="text-sm">
              {String(telemarketer[columnKey as keyof TeleMarketer] || "")}
            </span>
          );
      }
    },
    [
      sorted,
      page,
      handleViewTelemarketer,
      handleEditTelemarketer,
      handleDeleteTelemarketer,
      handleCopyLink,
    ]
  );

  // Set no records state
  React.useEffect(() => {
    setHasNoRecords(!isLoading && filtered.length === 0);
  }, [isLoading, filtered.length]);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">Failed to load telesales agents</p>
          <Button color="primary" onPress={() => mutate()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className=" space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Agents
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {telemarketersData.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Active Agents
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {
              telemarketersData.filter(
                (agent) => agent.accountStatus === "ACTIVE"
              ).length
            }
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pending Agents
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {
              telemarketersData.filter(
                (agent) => agent.accountStatus === "PENDING"
              ).length
            }
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            New Agents This Month
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {
              telemarketersData.filter((agent) => {
                if (!agent.createdAt) return false;
                const agentDate = new Date(agent.createdAt);
                const currentDate = new Date();
                return (
                  agentDate.getMonth() === currentDate.getMonth() &&
                  agentDate.getFullYear() === currentDate.getFullYear()
                );
              }).length
            }
          </p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Select
            label="Search By"
            placeholder="Select field to search"
            selectedKeys={filterBy ? [filterBy] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              setFilterBy(value);
            }}
            className="w-full sm:w-48"
          >
            {searchFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={10} />
      ) : (
        <GenericTable<TeleMarketer>
          columns={columns}
          data={sorted}
          allCount={filtered.length}
          exportData={filtered}
          isLoading={isLoading}
          filterValue={filterValue}
          onFilterChange={(v) => {
            setFilterValue(v);
          }}
          statusOptions={statusOptions}
          statusFilter={statusFilter}
          onStatusChange={(status) => {
            setStatusFilter(status);
          }}
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
          createButton={{ text: "Onboard Agent", onClick: openOnboardModal }}
        />
      )}

      {/* Modals */}
      <TelemarketerModal
        isOpen={isTelemarketerModalOpen}
        onClose={closeTelemarketerModal}
        telemarketer={selectedTelemarketer}
        onUpdate={() => mutate()}
      />

      <OnboardTelemarketerModal
        isOpen={isOnboardModalOpen}
        onClose={closeOnboardModal}
        onSubmit={() => mutate()}
      />
    </div>
  );
};

export default CreditflexTelesalesAgentsView;
