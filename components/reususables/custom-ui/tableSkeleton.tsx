"use client"

import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows = 10 }) => {
  return (
    <Table
      aria-label="Loading table"
      classNames={{ wrapper: "max-h-[calc(100dvh_-_150px)]" }}
      radius="md"
      shadow="sm">
      <TableHeader>
        {Array.from({ length: columns }).map((_, index) => (
          <TableColumn key={`header-${index}`}>
            <div className="animate-pulse h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4" />
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={`row-${rowIndex}`}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                <div className="animate-pulse h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSkeleton;
