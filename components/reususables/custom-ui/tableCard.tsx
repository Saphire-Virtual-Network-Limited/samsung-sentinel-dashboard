"use client";

import React, { SVGProps, useCallback, useEffect, useMemo, useState } from "react";
import { EllipsisVertical, SearchIcon, ChevronDownIcon } from "lucide-react";
import { showToast } from "@/lib";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, Pagination, ChipProps, SortDescriptor, Skeleton, ModalFooter, ModalBody, ModalHeader, ModalContent, Modal, useDisclosure, User, DropdownSection, Card, CardBody, CardHeader, cn, Link } from "@heroui/react";
import { z } from "zod";
import useSWR, { mutate } from "swr";
import { DateFilter, SelectField } from "..";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

interface Column {
  name: string;
  uid: string;
  sortable?: boolean;
}

interface TableCardProps {
  columns: Column[];
  data: any[];
  onView?: string;
  onExport?: string;
  onEdit?: string;
  onDelete?: string;
  onCreate?: string;
  searchPlaceholder?: string;
  showDateFilter?: boolean;
  showExport?: boolean;
  renderCell: (item: any, columnKey: React.Key) => React.ReactNode;
  isLoading?: boolean;
  fetchUrl?: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toISOString().replace("T", " ").slice(0, 19);
};

export default function TableCard({
  columns,
  data: initialData,
  onView,
  onExport,
  onEdit,
  onDelete,
  onCreate,
  searchPlaceholder = "Search...",
  showDateFilter = false,
  showExport = false,
  renderCell,
  isLoading: initialLoading = false,
  fetchUrl
}: TableCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: columns[0].uid,
    direction: "ascending",
  });

  const { data, error, isLoading } = useSWR(fetchUrl, async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  });

  const tableData = data || initialData;
  const loading = isLoading || initialLoading;

  const handleView = useCallback((item: any) => {
    setSelectedItem(item);
    onOpen();
    if (onView && typeof window !== 'undefined') {
      const event = new CustomEvent(onView, { detail: item });
      window.dispatchEvent(event);
    }
  }, [onView, onOpen]);

  const handleCreate = useCallback(() => {
    if (onCreate && typeof window !== 'undefined') {
      const event = new CustomEvent(onCreate);
      window.dispatchEvent(event);
    }
  }, [onCreate]);

  const handleEdit = useCallback((item: any) => {
    if (onEdit && typeof window !== 'undefined') {
      const event = new CustomEvent(onEdit, { detail: item });
      window.dispatchEvent(event);
    }
  }, [onEdit]);

  const handleDelete = useCallback((item: any) => {
    if (onDelete && typeof window !== 'undefined') {
      const event = new CustomEvent(onDelete, { detail: item });
      window.dispatchEvent(event);
    }
  }, [onDelete]);

  const handleExport = useCallback(() => {
    if (onExport && typeof window !== 'undefined') {
      const event = new CustomEvent(onExport);
      window.dispatchEvent(event);
    }
  }, [onExport]);

  const handleDateFilter = useCallback(async (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setPage(1);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setRowsPerPage(10);
        setPage(1);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const hasSearchFilter = Boolean(filterValue);
  const hasDateFilter = Boolean(startDate && endDate);

  const filteredItems = React.useMemo(() => {
    let filtered = [...tableData];

    if (hasSearchFilter) {
      filtered = filtered.filter((item) => 
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

    if (hasDateFilter) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      });
    }

    return filtered;
  }, [tableData, hasSearchFilter, hasDateFilter, filterValue, startDate, endDate]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof typeof a];
      const second = b[sortDescriptor.column as keyof typeof b];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const onClear = () => {
    setFilterValue("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const topContent = (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 flex-wrap items-end">
        <Input
          isClearable
          className="w-[60%] sm:max-w-[44%]"
          placeholder={searchPlaceholder}
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={onClear}
          onValueChange={(val) => {
            setFilterValue(val);
            setPage(1);
          }}
        />

        <div className="flex gap-3 flex-wrap">
          {showDateFilter && (
            <DateFilter
              className="w-full sm:max-w-[44%]"
              onFilterChange={handleDateFilter}
              initialStartDate={startDate}
              initialEndDate={endDate}
              isLoading={loading}
            />
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          {showExport && (
            <Button
              size="md"
              className="bg-red-500 text-white"
              onPress={handleExport}>
              Export
            </Button>
          )}

          {onCreate && (
            <Button
              size="md"
              className="bg-primary text-white"
              onPress={handleCreate}>
              Create New
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <span className="text-default-400 text-small">Total {tableData.length} items</span>
      </div>
    </div>
  );

  const bottomContent = (
    <div className="py-2 px-2 flex justify-between items-center">
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={pages}
        onChange={setPage}
      />
    </div>
  );

  const skeletonRows = Array.from({ length: rowsPerPage }, (_, i) => (
    <TableRow key={`skeleton-${i}`}>
      {columns.map((col) => (
        <TableCell key={col.uid}>
          <Skeleton className="h-4 w-full rounded" />
        </TableCell>
      ))}
    </TableRow>
  ));

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Data table"
        bottomContent={!loading && bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[550px]",
          tr: "cursor-pointer",
        }}
        selectedKeys={selectedKeys}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={(keys) => setSelectedKeys(new Set(keys as unknown as string[]))}
        onSortChange={setSortDescriptor}
        selectionMode="single">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent="No data found"
          items={loading ? [] : sortedItems}>
          {loading ? skeletonRows : (item) => (
            <TableRow key={item.id || item._id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">User Details</ModalHeader>
              <ModalBody>
                {selectedItem && (
                  <div className="space-y-4">
                    {Object.entries(selectedItem).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                {onEdit && (
                  <Button color="primary" variant="light" onPress={() => handleEdit(selectedItem)}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button color="danger" variant="light" onPress={() => handleDelete(selectedItem)}>
                    Delete
                  </Button>
                )}
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}