"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, {
  type ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { getAllScanPartners, capitalize, calculateAge } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  type SortDescriptor,
  type ChipProps,
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import type { ScanPartnerRecord } from "./types";
import { statusOptions, columns, statusColorMap } from "./constants";

export default function ScanPartnerPage() {
  const router = useRouter();
  const pathname = usePathname();
  // Get the role from the URL path (e.g., /access/dev/staff/scan-partners -> dev)
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
      ? ["scan-partner-records", startDate, endDate]
      : "scan-partner-records",
    () =>
      getAllScanPartners(startDate, endDate)
        .then((r: any) => {
          if (!r.data || r.data?.length === 0) {
            setHasNoRecords(true);
            return [];
          }
          setHasNoRecords(false);
          return r?.data;
        })
        .catch((error: any) => {
          console.error("Error fetching scan partner records:", error);
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

  // Transform scan partner data
  const scanPartners = useMemo(() => {
    if (!Array.isArray(raw)) return [];

    return raw.map((r: ScanPartnerRecord) => ({
      ...r,
      fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
      age: r.dob ? calculateAge(r.dob) : "N/A",
      mbeCount: r.Mbe ? r.Mbe.length : 0,
    }));
  }, [raw]);

  const filtered = useMemo(() => {
    // Add safety check
    if (!scanPartners || !Array.isArray(scanPartners)) {
      return [];
    }

    let list = [...scanPartners];

    if (filterValue) {
      const f = filterValue.toLowerCase();
      list = list.filter(
        (c: ScanPartnerRecord & { fullName: string }) =>
          c.firstName.toLowerCase().includes(f) ||
          c.lastName.toLowerCase().includes(f) ||
          c.email.toLowerCase().includes(f) ||
          c.telephoneNumber?.toLowerCase().includes(f) ||
          c.userId.toLowerCase().includes(f) ||
          c.accountType?.toLowerCase().includes(f) ||
          c.fullName.toLowerCase().includes(f)
      );
    }

    if (statusFilter.size > 0) {
      list = list.filter((c) => statusFilter.has(c.accountStatus || ""));
    }

    return list;
  }, [scanPartners, filterValue, statusFilter]);

  const pages = Math.ceil(filtered.length / rowsPerPage) || 1;

  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const sorted = React.useMemo(() => {
    return [...paged].sort((a, b) => {
      const aVal = a[sortDescriptor.column as keyof ScanPartnerRecord];
      const bVal = b[sortDescriptor.column as keyof ScanPartnerRecord];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paged, sortDescriptor]);

  // Export all filtered
  const exportFn = async (data: ScanPartnerRecord[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Scan Partners");

    ws.columns = columns
      .filter((c) => c.uid !== "actions")
      .map((c) => ({ header: c.name, key: c.uid, width: 20 }));

    data.forEach((r) =>
      ws.addRow({
        ...r,
        accountStatus: capitalize(r.accountStatus || ""),
        isActive: r.isActive ? "Yes" : "No",
        createdAt: new Date(r.createdAt).toLocaleDateString(),
      })
    );

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), "Scan_Partner_Records.xlsx");
  };

  // Render each cell, including actions dropdown:
  const renderCell = (
    row: ScanPartnerRecord & { fullName: string },
    key: string
  ) => {
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
                  router.push(
                    `/access/${role}/staff/scan-partners/${row.userId}`
                  )
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

    if (key === "isActive") {
      return (
        <Chip
          className="capitalize"
          color={row.isActive ? "success" : "danger"}
          size="sm"
          variant="flat"
        >
          {row.isActive ? "Yes" : "No"}
        </Chip>
      );
    }

    if (key === "fullName") {
      return (
        <div
          className="capitalize cursor-pointer  hover:underline"
          onClick={() =>
            router.push(`/access/${role}/staff/scan-partners/${row.userId}`)
          }
        >
          {row.fullName}
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

    if (key === "userId") {
      return <div className="text-small font-mono">{row.userId}</div>;
    }

    if (key === "accountType") {
      return (
        <div className="text-small capitalize">
          {row.accountType?.toLowerCase() || "N/A"}
        </div>
      );
    }

    return (
      <div
        className="text-small cursor-pointer"
        onClick={() =>
          router.push(`/access/${role}/staff/scan-partners/${row.userId}`)
        }
      >
        {(row as any)[key] || "N/A"}
      </div>
    );
  };

  return (
    <>
      <div className="mb-4 flex justify-center md:justify-end"></div>
      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={10} />
      ) : (
        <GenericTable<ScanPartnerRecord & { fullName: string }>
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
        />
      )}
    </>
  );
}
