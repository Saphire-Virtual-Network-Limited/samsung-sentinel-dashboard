"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, {
  ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { getAllAgentRecord, capitalize, calculateAge } from "@/lib";
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
import { AgentsData, AgentRecord } from "./types";
import { statusOptions, columns, statusColorMap } from "./constants";

export default function SalesUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  // Get the role from the URL path (e.g., /access/dev/staff/agents -> dev)
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
  const MOBIFLEX_APP_KEY = process.env.NEXT_PUBLIC_MOBIFLEX_APP_KEY;
  // Fetch data based on date filter
  const { data: raw = [], isLoading } = useSWR(
    startDate && endDate
      ? ["sales-agent-records", startDate, endDate]
      : "sales-agent-records",
    () =>
      getAllAgentRecord(startDate, endDate, {
        appKey: MOBIFLEX_APP_KEY,
      })
        .then((r) => {
          if (!r.data?.data || r.data?.data?.length === 0) {
            setHasNoRecords(true);
            return [];
          }
          setHasNoRecords(false);
          return r?.data?.data;
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

  console.log(raw);

  // FIX: Remove the extra .data access since raw is already the data array
  const salesStaff = useMemo(() => {
    if (!Array.isArray(raw)) return [];
    return raw.map((r: AgentRecord) => ({
      ...r,
      fullName: `${capitalize(r.firstname)} ${capitalize(r.lastname)}`,
      age: calculateAge(r.dob),
      state: r?.MbeKyc?.state || "N/A",
      city: r?.MbeKyc?.city || "N/A",
      bvnPhoneNumber: r.bvnPhoneNumber,
      title: r?.title || "N/A",
      mainPhoneNumber: r.phone,
    }));
  }, [raw]);

  const filtered = useMemo(() => {
    // Add safety check
    if (!salesStaff || !Array.isArray(salesStaff)) {
      return [];
    }

    let list = [...salesStaff];
    if (filterValue) {
      const f = filterValue.toLowerCase();
      list = list.filter(
        (c: AgentRecord) =>
          c.firstname.toLowerCase().includes(f) ||
          c.lastname.toLowerCase().includes(f) ||
          c.email.toLowerCase().includes(f) ||
          c.bvnPhoneNumber?.toLowerCase().includes(f) ||
          c.phone?.toLowerCase().includes(f) ||
          c.title?.toLowerCase().includes(f) ||
          c.mbeId.toLowerCase().includes(f) ||
          (c.bvn && c.bvn.toString().toLowerCase().includes(f)) ||
          String(c?.customersCount)?.toLowerCase().includes(f) ||
          //     c.LoanRecord?.[0]?.storeId?.toLowerCase().includes(f) ||
          c.MbeAccountDetails?.accountNumber?.toLowerCase().includes(f)
      );
    }
    if (statusFilter.size > 0) {
      list = list.filter((c) => statusFilter.has(c.accountStatus || ""));
    }
    return list;
  }, [salesStaff, filterValue, statusFilter]);

  const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const sorted = React.useMemo(() => {
    return [...paged].sort((a, b) => {
      const aVal = a[sortDescriptor.column as keyof AgentRecord];
      const bVal = b[sortDescriptor.column as keyof AgentRecord];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paged, sortDescriptor]);

  // Export all filtered
  const exportFn = async (data: AgentRecord[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Customers");
    ws.columns = columns
      .filter((c) => c.uid !== "actions")
      .map((c) => ({ header: c.name, key: c.uid, width: 20 }));
    data.forEach((r) =>
      ws.addRow({ ...r, status: capitalize(r.accountStatus || "") })
    );
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), "Customer_Records.xlsx");
  };

  // Render each cell, including actions dropdown:
  const renderCell = (row: AgentRecord, key: string) => {
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
                  router.push(`/access/${role}/staff/agents/${row.mbeId}`)
                }
              >
                View
              </DropdownItem>
            </DropdownMenu>
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
    if (key === "fullName") {
      return (
        <div
          className="capitalize cursor-pointer"
          onClick={() =>
            router.push(`/access/${role}/staff/agents/${row.mbeId}`)
          }
        >
          {(row as any)[key]}
        </div>
      );
    }
    return (
      <div
        className="text-small cursor-pointer"
        onClick={() => router.push(`/access/${role}/staff/agents/${row.mbeId}`)}
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
        <GenericTable<AgentRecord>
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
