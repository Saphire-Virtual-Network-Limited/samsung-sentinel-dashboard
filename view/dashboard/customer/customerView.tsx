"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, {
  ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import {
  getAllCustomerBasicRecord,
  capitalize,
  calculateAge,
  deleteCustomer,
  showToast,
  useAuth,
} from "@/lib";
import { hasPermission } from "@/lib/permissions";
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
  Input
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { CustomerRecord } from "./types";
import { statusOptions, columns, statusColorMap } from "./constants";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

export default function CustomerPage() {
  const router = useRouter();
  const pathname = usePathname();
  // Get the role from the URL path (e.g., /access/dev/customers -> dev)
  const role = pathname.split("/")[2];

  const { userResponse } = useAuth();
  const userEmail = userResponse?.data?.email || "";

  // --- date filter state ---
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [hasNoRecords, setHasNoRecords] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerRecord | null>(null);
  const {
    isOpen: isReasonModal,
    onOpen: onReasonModal,
    onClose: onReasonModalClose,
  } = useDisclosure();

  const [reason, setReason] = useState("");

  // --- table state ---
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "fullName",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // --- handle date filter ---
  const handleDateFilter = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Fetch data based on date filter
  const { data: raw = [], isLoading } = useSWR(
    startDate && endDate
      ? ["customer-records", startDate, endDate]
      : "customer-records",
    () =>
      getAllCustomerBasicRecord(startDate, endDate)
        .then((r) => {
          if (!r.data || r.data.length === 0) {
            setHasNoRecords(true);
            return [];
          }
          setHasNoRecords(false);
          return r.data;
        })
        .catch((error: any) => {
          console.error("Error fetching customer records:", error);
          showToast({ type: "error", message: error.message, duration: 8000 });
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

  // console.log(raw);

  const customers = useMemo(
    () =>
      raw.map((r: CustomerRecord) => ({
        ...r,
        customerId: r.customerId,
        fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
        age: calculateAge(r.dob),
        bvnPhoneNumber: r.bvnPhoneNumber,

        createdAt: new Date(r.createdAt).toLocaleDateString('en-GB'),
        channel: r.channel,


      })),
    [raw]
  );

  const filtered = useMemo(() => {
    let list = [...customers];
    if (filterValue) {
      const f = filterValue.toLowerCase();
      list = list.filter(
        (c) =>
          c.firstName.toLowerCase().includes(f) ||
          c.lastName.toLowerCase().includes(f) ||
          c.email.toLowerCase().includes(f) ||
          c.bvnPhoneNumber?.toLowerCase().includes(f) ||
          c.mainPhoneNumber?.toLowerCase().includes(f) ||
          c.regBy?.mbe_old_id?.toLowerCase().includes(f) ||
          c.customerId.toLowerCase().includes(f) ||
          (c.bvn && c.bvn.toString().toLowerCase().includes(f)) ||
          c.LoanRecord?.[0]?.loanRecordId?.toLowerCase().includes(f) ||
          c.LoanRecord?.[0]?.storeId?.toLowerCase().includes(f) ||
          c.CustomerAccountDetails?.[0]?.accountNumber
            ?.toLowerCase()
            .includes(f)
      );
    }
    if (statusFilter.size > 0) {
      list = list.filter((c) => statusFilter.has(c.status || ""));
    }
    return list;
  }, [customers, filterValue, statusFilter]);

  const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const sorted = React.useMemo(() => {
    return [...paged].sort((a, b) => {
      const aVal = a[sortDescriptor.column as keyof CustomerRecord];
      const bVal = b[sortDescriptor.column as keyof CustomerRecord];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paged, sortDescriptor]);

  // Export all filtered
  const exportFn = async (data: CustomerRecord[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Customers");
    ws.columns = columns
      .filter((c) => c.uid !== "actions")
      .map((c) => ({ header: c.name, key: c.uid, width: 20 }));
    data.forEach((r) =>
      ws.addRow({ ...r, status: capitalize(r.status || "") })
    );
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), "Customer_Records.xlsx");
  };

  const handleCancelBill = async (customerId: string) => {
      if (!reason) {
        showToast({
          type: "error",
          message: "Please enter a reason for cancellation",
          duration: 3000,
        });
        return;
      }
        try {
      setIsButtonLoading(true);
      const response = await deleteCustomer(customerId, reason);
      showToast({
        type: "success",
        message: "Bill cancelled successfully",
        duration: 3000,
      });
      onReasonModalClose();
      setReason("");
      setSelectedCustomer(null);
    } catch (error: any) {
      console.error("Error cancelling bill:", error);
      showToast({ type: "error", message: error.message, duration: 8000 });
    } finally {
      setIsButtonLoading(false);
    }
  };

  // Render each cell, including actions dropdown:
  const renderCell = (row: CustomerRecord, key: string) => {
    if (key === "actions") {
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
                onPress={() =>
                  router.push(`/access/${role}/customers/${row.customerId}`)
                }
                className="cursor-pointer"
              >
                View
              </DropdownItem>
              <DropdownItem
                key="viewInNewTab"
                onPress={() =>
                  window.open(
                    `/access/${role}/customers/${row.customerId}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                View in new tab
              </DropdownItem>
              {hasPermission(role, "canDeleteCustomers", userEmail) ? (
                <DropdownItem
                  key="cancelBill"
                  onPress={() => {
                    onReasonModal();
                    setSelectedCustomer(row);
                  }}
                >
                  Cancel Bill
                </DropdownItem>
              ) : null}
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    }
    if (key === "status") {
      return (
        <Chip
          className="capitalize"
          color={statusColorMap[row.status || ""]}
          size="sm"
          variant="flat"
        >
          {capitalize(row.status || "")}
        </Chip>
      );
    }
    if (key === "fullName") {
      return (
        <div
          className="capitalize cursor-pointer"
          onClick={() =>
            router.push(`/access/${role}/customers/${row.customerId}`)
          }
        >
          {(row as any)[key]}
        </div>
      );
    }
    return (
      <div
        className="text-small cursor-pointer"
        onClick={() =>
          router.push(`/access/${role}/customers/${row.customerId}`)
        }
      >
        {(row as any)[key]}
      </div>
    );
  };

  return (
    <>
      <div className="mb-4 flex justify-center md:justify-end"></div>

      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={10} />
      ) : (
        <GenericTable<CustomerRecord>
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
          statusOptions={statusOptions}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusColorMap={statusColorMap}
          showStatus={false}
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
          defaultDateRange={{ days: 30 }}
        />
      )}

      {/* Cancel Bill Modal */}
      <Modal isOpen={isReasonModal} onClose={onReasonModalClose} size="lg">
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Cancel Customer Bill</ModalHeader>
              <ModalBody>
                <p className="text-md text-default-500 mb-4">
                  Please provide a reason for cancelling this customer&apos;s bill. This action cannot be undone.
                </p>
                <Input
                  label="Reason"
                  placeholder="Enter reason for cancellation"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />

                {selectedCustomer && (
                  <div className="mt-4">
                    <p className="font-medium">
                      Customer Name: {selectedCustomer.firstName}{" "}
                      {selectedCustomer.lastName}
                    </p>
                    <p className="font-medium">BVN: {selectedCustomer.bvn}</p>
                    <p className="font-medium">
                      Customer ID: {selectedCustomer.customerId}
                    </p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="flex gap-2">
                <Button
                  color="success"
                  variant="solid"
                  onPress={() => {
                    if (selectedCustomer) {
                      handleCancelBill(selectedCustomer.customerId);
                    }
                  }}
                  isLoading={isButtonLoading}
                >
                  Submit
                </Button>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onReasonModalClose();
                    setSelectedCustomer(null);
                    setReason("");
                  }}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
