"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, {
  ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { getMBEwithCustomer, capitalize, calculateAge } from "@/lib";
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
import { MBERecord } from "./types";
import { statusOptions, columns, statusColorMap } from "./constants";

export default function MBEPage() {
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
  const { data: raw, isLoading } = useSWR(
    startDate && endDate
      ? ["mbe-records", startDate, endDate]
      : "mbe-records",
    () =>
      getMBEwithCustomer()
        .then((r) => {
          console.log("API response:", r);
          // Handle different response structures
          let data;
          if (r.data) {
            data = r.data;
          } else if (Array.isArray(r)) {
            data = r;
          } else if (r.records) {
            data = r.records;
          } else {
            data = r;
          }
          
          if (!data || data.length === 0) {
            setHasNoRecords(true);
            return [];
          }
          setHasNoRecords(false);
          return data;
        })
        .catch((error) => {
          console.error("Error fetching mbe records:", error);
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

  // Ensure raw is always an array - handle different response structures
  const safeRaw = raw && Array.isArray(raw.data) ? raw.data : 
                  raw && Array.isArray(raw) ? raw : 
                  raw?.records ? raw.records : 
                  [];

  const mbeRecords = useMemo(
    () =>
      safeRaw.map((r: MBERecord) => {
        const customerCount = Array.isArray(r.Customers) ? r.Customers.length : 0;
        return {
          ...r,
          fullName: `${capitalize(r.firstname || "")} ${capitalize(r.lastname || "")}`,
          phone: r.phone || "N/A",
          state: r.state || "N/A",
          customers: customerCount, // Count all customers with safety check
          region: r.stores?.[0]?.storeId || "N/A",
          channel: r.title || "N/A",
          mbeId: r.mbeId || "N/A",
          mbe_old_id: r.mbe_old_id || "N/A",
        };
      }),
    [safeRaw]
  );

  // Create filtered version of original data for export
  const filteredOriginal = useMemo(() => {
    let list = [...safeRaw];
    if (filterValue) {
      const f = filterValue.toLowerCase();
      list = list.filter(
        (c) =>
          `${capitalize(c.firstname)} ${capitalize(c.lastname)}`.toLowerCase().includes(f) ||
          (c.phone || "").toLowerCase().includes(f) ||
          (c.title || "").toLowerCase().includes(f) ||
          (c.state || "").toLowerCase().includes(f) ||
          (c.stores?.[0]?.storeId || "").toLowerCase().includes(f) ||
          (c.mbeId || "").toLowerCase().includes(f) ||
          (c.mbe_old_id || "").toLowerCase().includes(f)
      );
    }
    if (statusFilter.size > 0) {
      list = list.filter((c) => statusFilter.has(c.accountStatus || ""));
    }
    return list;
  }, [safeRaw, filterValue, statusFilter]);

  const filtered = useMemo(() => {
    let list = [...mbeRecords];
    if (filterValue) {
      const f = filterValue.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(f) ||
          c.phone.toLowerCase().includes(f) ||
          c.channel.toLowerCase().includes(f) ||
          c.state.toLowerCase().includes(f) ||
          c.region.toLowerCase().includes(f) ||
          c.mbeId.toLowerCase().includes(f) ||
          c.mbe_old_id.toLowerCase().includes(f)
      );
    }
    if (statusFilter.size > 0) {
      list = list.filter((c) => statusFilter.has(c.accountStatus || ""));
    }
    return list;
  }, [mbeRecords, filterValue, statusFilter]);

  const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
    const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const sorted = React.useMemo(() => {
    return [...paged].sort((a, b) => {
      const aVal = a[sortDescriptor.column as keyof MBERecord];
      const bVal = b[sortDescriptor.column as keyof MBERecord];
      const cmp = aVal && bVal ? aVal < bVal ? -1 : aVal > bVal ? 1 : 0 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paged, sortDescriptor]);
  
  // Export all filtered
  const exportFn = async (data: any[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("MBE Records");
    ws.columns = columns
      .filter((c) => c.uid !== "actions")
      .map((c) => ({ header: c.name, key: c.uid, width: 20 }));
    
    // Process the data for export
    const exportData = data.map((r) => ({
      fullName: `${capitalize(r.firstname)} ${capitalize(r.lastname)}`,
      phone: r.phone || "N/A",
      channel: r.title || "N/A",
      state: r.state || "N/A",
      region: r.stores?.[0]?.storeId || "N/A",
      customers: Array.isArray(r.Customers) ? r.Customers.length : 0,
      status: capitalize(r.accountStatus || ""),
    }));
    
    exportData.forEach((r) => ws.addRow(r));
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), "MBE_Records.xlsx");
  };

  // Render each cell, including actions dropdown:
  const renderCell = (row: MBERecord, key: string) => {
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
                  router.push(`/access/${role}/staff/mbe/${row.mbeId}`)
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
          color={statusColorMap[row.accountStatus || ""]}
          size="sm"
          variant="flat"
        >
          {capitalize(row.accountStatus || "")}
        </Chip>
      );
    }
    if (key === "fullName") {
      return (
        <div
          className="capitalize cursor-pointer"
          onClick={() =>
            router.push(`/access/${role}/staff/mbe/${row.mbeId}`) 
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
          router.push(`/access/${role}/staff/mbe/${row.mbeId}`)
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
        <GenericTable<MBERecord>
          columns={columns}
          data={sorted as unknown as MBERecord[]}       
          allCount={filtered.length}
          exportData={filteredOriginal as unknown as MBERecord[]}
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
