"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, SortDescriptor, ChipProps } from "@heroui/react";
import { EllipsisVertical, ChevronLeft, ChevronRight } from "lucide-react";

interface VirtualTableProps<T> {
  data: T[];
  columns: Array<{
    name: string;
    uid: string;
    sortable?: boolean;
  }>;
  renderCell: (row: T, key: string) => React.ReactNode;
  isLoading?: boolean;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
}

export function VirtualTable<T>({
  data,
  columns,
  renderCell,
  isLoading = false,
  page,
  pages,
  onPageChange,
  totalRecords,
  pageSize,
  onPageSizeChange,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [rowHeight] = useState(60);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const pageSizeOptions = [10, 25, 50, 100];

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  }, [page, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (page < pages) {
      onPageChange(page + 1);
    }
  }, [page, pages, onPageChange]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-t-lg mb-2"></div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 mb-1"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="bg-default-50 border-b border-default-200">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 font-medium text-small text-default-600">
          {columns.map((column) => (
            <div key={column.uid} className="col-span-1">
              {column.name}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Table Body */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto"
        style={{
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = data[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                className="absolute top-0 left-0 w-full"
                style={{
                  height: `${rowHeight}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-default-100 hover:bg-default-50 transition-colors">
                  {columns.map((column) => (
                    <div key={column.uid} className="col-span-1">
                      {renderCell(row, column.uid)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-default-50 border-t border-default-200">
        <div className="flex items-center gap-2">
          <span className="text-small text-default-600">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalRecords)} of {totalRecords} results
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className="text-small text-default-600">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="text-small border border-default-300 rounded px-2 py-1"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={handlePreviousPage}
              isDisabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-small text-default-600 px-2">
              Page {page} of {pages}
            </span>
            
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={handleNextPage}
              isDisabled={page >= pages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 