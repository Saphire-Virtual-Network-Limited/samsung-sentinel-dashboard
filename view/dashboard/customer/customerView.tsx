"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, {
  ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { getAllCustomerRecord, capitalize, calculateAge } from "@/lib";
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
  ChipProps,
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { CustomerRecord } from "./types";
import { statusOptions, columns, statusColorMap } from "./constants";

export default function CustomerPage() {
  const router = useRouter();
  const pathname = usePathname();
  // Get the role from the URL path (e.g., /access/dev/customers -> dev)
  const role = pathname.split("/")[2];
  // --- date filter state ---
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [hasNoRecords, setHasNoRecords] = useState(false);

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
      getAllCustomerRecord(startDate, endDate)
        .then((r) => {
          if (!r.data || r.data.length === 0) {
            setHasNoRecords(true);
            return [];
          }
          setHasNoRecords(false);
          return r.data;
        })
        .catch((error) => {
          console.error("Error fetching customer records:", error);
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
        fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,

        age: calculateAge(r.dob),
        state: r.CustomerKYC?.[0]?.state || "N/A",
        city: r.CustomerKYC?.[0]?.town || "N/A",
        bvnPhoneNumber: r.bvnPhoneNumber,
        loanAmount: r.LoanRecord?.[0]?.loanAmount
          ? `₦${r.LoanRecord[0].loanAmount.toLocaleString()}`
          : "N/A",
        region: r.CustomerKYC?.[0]?.localGovernment || "N/A",
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
              >
                View
              </DropdownItem>
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
        />
      )}
    </>
  );
}
