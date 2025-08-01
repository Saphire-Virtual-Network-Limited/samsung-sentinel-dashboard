"use client";

import React, { useMemo, useState } from "react";
import {
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
  SortDescriptor,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Eye, Phone, Mail, Trash2, MoreVertical } from "lucide-react";
import {
  getAllAmbassadors,
  deleteAmbassador,
  Ambassador,
} from "../../../lib/api";
import useSWR from "swr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { showToast } from "../../../lib/showNotification";
import GenericTable, {
  ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Status color mapping for Excel export
const STATUS_COLOR_MAP: Record<string, string> = {
  success: "FF28A745",
  warning: "FFFFC107",
  primary: "FF0D6EFD",
  danger: "FFDC3545",
  default: "FFE0E0E0",
};

const AmbassadorsView = () => {
  const pathname = usePathname();
  const role = pathname.split("/")[2];

  const [selectedAmbassador, setSelectedAmbassador] =
    useState<Ambassador | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Fetch ambassadors data
  const { data, error, isLoading, mutate } = useSWR(
    "ambassadors",
    async () => {
      const response = await getAllAmbassadors();
      return response.data || [];
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  );

  const ambassadors = useMemo(() => data || [], [data]);

  // Filter ambassadors
  const filtered = useMemo(() => {
    if (!Array.isArray(ambassadors)) return [];

    let list = [...ambassadors];

    // Local text filtering
    if (filterValue) {
      const searchValue = filterValue.toLowerCase();

      if (filterBy) {
        // Filter by specific field
        list = list.filter((ambassador: Ambassador) => {
          switch (filterBy) {
            case "email":
              return ambassador.emailAddress
                ?.toLowerCase()
                .includes(searchValue);
            case "phone":
              return ambassador.phoneNumber?.includes(searchValue);
            case "institution":
              return ambassador.institution
                ?.toLowerCase()
                .includes(searchValue);
            default:
              return ambassador.fullName?.toLowerCase().includes(searchValue);
          }
        });
      } else {
        // Default search across multiple fields
        list = list.filter(
          (ambassador: Ambassador) =>
            ambassador.fullName?.toLowerCase().includes(searchValue) ||
            ambassador.emailAddress?.toLowerCase().includes(searchValue) ||
            ambassador.phoneNumber?.includes(searchValue) ||
            ambassador.institution?.toLowerCase().includes(searchValue) ||
            ambassador.ippisNumber?.toLowerCase().includes(searchValue)
        );
      }
    }

    return list;
  }, [ambassadors, filterValue, filterBy]);

  const pages = Math.ceil(filtered.length / rowsPerPage);

  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const sorted = useMemo(() => {
    return [...paged].sort((a, b) => {
      const aVal = a[sortDescriptor.column as keyof Ambassador];
      const bVal = b[sortDescriptor.column as keyof Ambassador];

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

  // Handle delete ambassador
  const handleDeleteAmbassador = async () => {
    if (!selectedAmbassador) return;

    setIsDeleting(true);
    try {
      await deleteAmbassador(selectedAmbassador.id);
      showToast({
        type: "success",
        message: "Ambassador deleted successfully",
        duration: 3000,
      });
      mutate();
      onDeleteClose();
    } catch (error: any) {
      showToast({
        type: "error",
        message:
          error?.response?.data?.message || "Failed to delete ambassador",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export function
  const exportFn = async (data: Ambassador[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Ambassadors");

    ws.columns = [
      { header: "S/N", key: "serialNumber", width: 8 },
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Email Address", key: "emailAddress", width: 30 },
      { header: "Phone Number", key: "phoneNumber", width: 15 },
      { header: "Institution", key: "institution", width: 20 },
      { header: "IPPIS Number", key: "ippisNumber", width: 15 },
      { header: "Total Leads", key: "totalLeads", width: 12 },
      { header: "Created Date", key: "createdAt", width: 18 },
    ];

    data.forEach((ambassador, index) => {
      const row = ws.addRow({
        serialNumber: index + 1,
        fullName: ambassador.fullName,
        emailAddress: ambassador.emailAddress,
        phoneNumber: ambassador.phoneNumber,
        institution: ambassador.institution,
        ippisNumber: ambassador.ippisNumber,
        totalLeads: ambassador.PaydayLead?.length || 0,
        createdAt: new Date(ambassador.createdAt).toLocaleDateString(),
      });
    });

    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6E6E6" },
    };

    const buf = await wb.xlsx.writeBuffer();
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const fileName = `Creditflex_Ambassadors_${formattedDate.replace(
      / /g,
      "_"
    )}_${formattedTime.replace(/:/g, "-")}.xlsx`;
    saveAs(new Blob([buf]), fileName);
  };

  // Render cell function
  const renderCell = (ambassador: Ambassador, key: string) => {
    if (key === "serialNumber") {
      const index = sorted.indexOf(ambassador);
      const serialNumber = (page - 1) * rowsPerPage + index + 1;
      return <span className="text-sm">{serialNumber}</span>;
    }

    if (key === "ambassador") {
      return (
        <div className="flex items-center gap-3">
          <Avatar
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              ambassador.fullName
            )}&background=0ea5e9&color=fff`}
            alt={ambassador.fullName}
            size="sm"
          />
          <div>
            <p className="font-medium text-sm">{ambassador.fullName}</p>
            <p className="text-xs text-gray-500">{ambassador.emailAddress}</p>
          </div>
        </div>
      );
    }

    if (key === "contact") {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3 h-3 text-gray-400" />
            <span>{ambassador.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3 h-3 text-gray-400" />
            <span className="truncate max-w-32">{ambassador.emailAddress}</span>
          </div>
        </div>
      );
    }

    if (key === "leads") {
      return (
        <span className="text-sm">{ambassador.PaydayLead?.length || 0}</span>
      );
    }

    if (key === "createdAt") {
      return (
        <span className="text-sm">
          {new Date(ambassador.createdAt).toLocaleDateString()}
        </span>
      );
    }

    if (key === "actions") {
      return (
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="default"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Ambassador actions">
            <DropdownItem
              key="view"
              startContent={<Eye className="w-4 h-4" />}
              as={Link}
              href={`/access/${role}/creditflex/ambassadors/${ambassador.id}`}
            >
              View Details
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Trash2 className="w-4 h-4" />}
              onPress={() => {
                setSelectedAmbassador(ambassador);
                onDeleteOpen();
              }}
            >
              Delete Ambassador
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      );
    }

    return (
      <div className="text-small">{(ambassador as any)[key] || "N/A"}</div>
    );
  };

  // Column definitions
  const columns: ColumnDef[] = [
    { name: "Ambassador", uid: "ambassador", sortable: true },
    { name: "Contact", uid: "contact" },
    { name: "Institution", uid: "institution", sortable: true },
    { name: "IPPIS Number", uid: "ippisNumber", sortable: true },
    { name: "Leads", uid: "leads", sortable: true },
    { name: "Created", uid: "createdAt", sortable: true },
    { name: "Actions", uid: "actions" },
  ];

  return (
    <div className="p-6">
      <GenericTable<Ambassador>
        columns={columns}
        data={sorted}
        allCount={filtered.length}
        exportData={filtered}
        isLoading={isLoading}
        filterValue={filterValue}
        onFilterChange={(v) => {
          setFilterValue(v);
          setPage(1);
        }}
        statusOptions={[]}
        statusFilter={new Set()}
        onStatusChange={() => {}}
        statusColorMap={{}}
        showStatus={false}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        page={page}
        pages={pages}
        onPageChange={setPage}
        exportFn={exportFn}
        renderCell={renderCell}
        hasNoRecords={!isLoading && !error && filtered.length === 0}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Delete Ambassador</h3>
          </ModalHeader>
          <ModalBody>
            {selectedAmbassador && (
              <div className="space-y-4">
                <p>Are you sure you want to delete this ambassador?</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{selectedAmbassador.fullName}</p>
                  <p className="text-sm text-gray-500">
                    {selectedAmbassador.emailAddress}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedAmbassador.phoneNumber}
                  </p>
                </div>
                <p className="text-sm text-red-600">
                  This action cannot be undone.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={onDeleteClose}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteAmbassador}
              isLoading={isDeleting}
            >
              Delete Ambassador
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AmbassadorsView;
