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
  Switch,
  Select,
  SelectItem,
} from "@heroui/react";
import { EllipsisVertical, Plus } from "lucide-react";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { useLoanProducts } from "@/hooks/creditflex/useLoanProducts";
import { LoanProductTypeModal } from "@/components/modals/LoanProductTypeModal";
import { CreateLoanProductDetailModal } from "@/components/modals/CreateLoanProductDetailModal";
import { capitalize, showToast } from "@/lib";
import { getColor } from "@/lib/utils";
import { updateCDFLoanProduct, deleteCDFLoanProduct } from "@/lib/api";
import { LoanProduct, searchFilterOptions } from "./types";
import { columns, statusOptions, statusColorMap } from "./constants";

// Status color mapping for Excel export
const STATUS_COLOR_MAP: Record<string, string> = {
  success: "FF28A745",
  warning: "FFFFC107",
  primary: "FF0D6EFD",
  danger: "FFDC3545",
  default: "FFE0E0E0",
};

const CreditflexLoanProductsView = () => {
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
    column: "title",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedProductType, setSelectedProductType] = useState("");

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

  // Modal states
  const {
    isOpen: isTypeModalOpen,
    onOpen: openTypeModal,
    onClose: closeTypeModal,
  } = useDisclosure();

  const {
    isOpen: isDetailModalOpen,
    onOpen: openDetailModal,
    onClose: closeDetailModal,
  } = useDisclosure();

  // Fetch loan products data
  const { data: response, error, isLoading, mutate } = useLoanProducts();

  const loanProductsData = useMemo(() => {
    return response?.data?.loans || response?.data || [];
  }, [response]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter and search logic (memoized to prevent unnecessary recalculations)
  const filtered = useMemo(() => {
    let list = [...loanProductsData];

    // Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      list = list.filter((product: LoanProduct) => {
        if (!product.createdAt) return true;
        const productDate = new Date(product.createdAt);
        return productDate >= start && productDate <= end;
      });
    }

    // Status filter
    if (statusFilter.size > 0 && !statusFilter.has("all")) {
      list = list.filter((product: LoanProduct) =>
        statusFilter.has(product.status?.toLowerCase() || "")
      );
    }

    // Search filter (only apply if debounced value exists)
    if (debouncedFilterValue.trim()) {
      const searchValue = debouncedFilterValue.toLowerCase();

      if (filterBy && filterBy !== "all") {
        // Filter by specific field
        list = list.filter((product: LoanProduct) => {
          switch (filterBy) {
            case "title":
              return product.title?.toLowerCase().includes(searchValue);
            case "product-type":
              return product.loanProductType
                ?.toLowerCase()
                .includes(searchValue);
            case "interest-rate":
              return product.interestRate?.toString().includes(searchValue);
            case "amount-range":
              return (
                product.amountFrom?.toString().includes(searchValue) ||
                product.amountTo?.toString().includes(searchValue)
              );
            case "moratorium":
              return product.moratoriumPeriod?.toString().includes(searchValue);
            default:
              return true;
          }
        });
      } else {
        // Default search across multiple fields
        list = list.filter(
          (product: LoanProduct) =>
            product.title?.toLowerCase().includes(searchValue) ||
            product.loanProductType?.toLowerCase().includes(searchValue) ||
            product.status?.toLowerCase().includes(searchValue) ||
            product.interestRate?.toString().includes(searchValue) ||
            product.amountFrom?.toString().includes(searchValue) ||
            product.amountTo?.toString().includes(searchValue)
        );
      }
    }

    return list;
  }, [
    loanProductsData,
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
      const aVal = a[sortDescriptor.column as keyof LoanProduct];
      const bVal = b[sortDescriptor.column as keyof LoanProduct];

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

  // Handle product type selection
  const handleProductTypeSelection = (type: string) => {
    setSelectedProductType(type);
    closeTypeModal();
    openDetailModal();
  };

  // Handle product creation success
  const handleProductCreated = () => {
    mutate(); // Refresh the data
    showToast({
      message: "Loan product created successfully!",
      type: "success",
    });
  };

  // Handle status toggle
  const handleStatusToggle = useCallback(
    async (productId: string, currentStatus: string) => {
      try {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        await updateCDFLoanProduct(productId, { status: newStatus });

        showToast({
          message: `Product ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully!`,
          type: "success",
        });

        mutate(); // Refresh the data
      } catch (error: any) {
        console.error("Error updating product status:", error);
        showToast({
          message: error?.message || "Failed to update product status",
          type: "error",
        });
      }
    },
    [mutate]
  );

  // Handle product deletion
  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      try {
        await deleteCDFLoanProduct(productId);

        showToast({
          message: "Product deleted successfully!",
          type: "success",
        });

        mutate(); // Refresh the data
      } catch (error: any) {
        console.error("Error deleting product:", error);
        showToast({
          message: error?.message || "Failed to delete product",
          type: "error",
        });
      }
    },
    [mutate]
  );

  // Excel export function
  const exportFn = useCallback(async (data: LoanProduct[]) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Loan Products");

      // Define columns
      worksheet.columns = [
        { header: "Product Name", key: "title", width: 20 },
        { header: "Product Type", key: "loanProductType", width: 25 },
        { header: "Min Amount", key: "amountFrom", width: 15 },
        { header: "Max Amount", key: "amountTo", width: 15 },
        { header: "Interest Rate (%)", key: "interestRate", width: 15 },
        { header: "Moratorium (months)", key: "moratoriumPeriod", width: 18 },
        { header: "Tenure (months)", key: "loanTenure", width: 15 },
        { header: "Status", key: "status", width: 12 },
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
      data.forEach((product) => {
        const row = worksheet.addRow({
          title: product.title,
          loanProductType: product.loanProductType,
          amountFrom: product.amountFrom,
          amountTo: product.amountTo,
          interestRate: product.interestRate,
          moratoriumPeriod: product.moratoriumPeriod,
          loanTenure: product.loanTenure,
          status: capitalize(product.status),
          createdAt: product.createdAt ? formatDate(product.createdAt) : "",
        });

        // Color code status
        const statusColor =
          STATUS_COLOR_MAP[getColor(product.status)] ||
          STATUS_COLOR_MAP.default;
        const statusCell = row.getCell("status");
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
      saveAs(blob, `loan-products-${timestamp}.xlsx`);

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
    (product: LoanProduct, columnKey: string) => {
      if (columnKey === "serialNumber") {
        const index = sorted.indexOf(product);
        const serialNumber = (page - 1) * rowsPerPage + index + 1;
        return <span className="text-sm">{serialNumber}</span>;
      }

      switch (columnKey) {
        case "title":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{product.title}</p>
              {product.description && (
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  {product.description}
                </p>
              )}
            </div>
          );

        case "loanProductType":
          return (
            <span className="text-sm capitalize">
              {product.loanProductType?.replace("-", " ") || "N/A"}
            </span>
          );

        case "amountFrom":
          return (
            <span className="text-sm font-medium">
              {formatCurrency(product.amountFrom)}
            </span>
          );

        case "amountTo":
          return (
            <span className="text-sm font-medium">
              {formatCurrency(product.amountTo)}
            </span>
          );

        case "interestRate":
          return <span className="text-sm">{product.interestRate}%</span>;

        case "moratoriumPeriod":
          return <span className="text-sm">{product.moratoriumPeriod}</span>;

        case "loanTenure":
          return <span className="text-sm">{product.loanTenure || "N/A"}</span>;

        case "status":
          return (
            <Chip
              className="capitalize"
              color={getColor(product.status)}
              size="sm"
              variant="flat"
            >
              {product.status}
            </Chip>
          );

        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Switch
                size="sm"
                color="primary"
                isSelected={product.status === "active"}
                onChange={() => handleStatusToggle(product.id, product.status)}
              />
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <EllipsisVertical className="text-default-300" size={16} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="edit"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      showToast({
                        message: "Edit functionality coming soon!",
                        type: "info",
                      });
                    }}
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this product?")
                      ) {
                        handleDeleteProduct(product.id);
                      }
                    }}
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return (
            <span className="text-sm">
              {String(product[columnKey as keyof LoanProduct] || "")}
            </span>
          );
      }
    },
    [handleStatusToggle, handleDeleteProduct, sorted, page]
  );

  // Set no records state
  React.useEffect(() => {
    setHasNoRecords(!isLoading && filtered.length === 0);
  }, [isLoading, filtered.length]);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">Failed to load loan products</p>
          <Button color="primary" onPress={() => mutate()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className=" space-y-6">
      {/* Table */}
      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={10} />
      ) : (
        <GenericTable<LoanProduct>
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
          createButton={{
            text: "Create Loan Product",
            onClick: openTypeModal,
          }}
        />
      )}

      {/* Modals */}
      <LoanProductTypeModal
        isOpen={isTypeModalOpen}
        onClose={closeTypeModal}
        onContinue={handleProductTypeSelection}
      />

      <CreateLoanProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        onSuccess={handleProductCreated}
        selectedType={selectedProductType}
      />
    </div>
  );
};

export default CreditflexLoanProductsView;
