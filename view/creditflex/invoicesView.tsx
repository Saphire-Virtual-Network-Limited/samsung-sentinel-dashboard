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
  Select,
  SelectItem,
} from "@heroui/react";
import { MoreVertical, Download, Eye, FileText, Copy } from "lucide-react";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { useInvoices } from "@/hooks/creditflex/useInvoices";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import { capitalize, showToast } from "@/lib";
import { getColor } from "@/lib/utils";
import { Invoice, searchFilterOptions } from "./invoices/types";
import { columns, statusOptions, statusColorMap } from "./invoices/constants";

// Status color mapping for Excel export
const STATUS_COLOR_MAP: Record<string, string> = {
  success: "FF28A745",
  warning: "FFFFC107",
  primary: "FF0D6EFD",
  danger: "FFDC3545",
  default: "FFE0E0E0",
};

const CreditflexInvoicesView = () => {
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
    column: "customerName",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Modal states
  const {
    isOpen: isInvoiceModalOpen,
    onOpen: openInvoiceModal,
    onClose: closeInvoiceModal,
  } = useDisclosure();

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

  // Fetch invoices data
  const { data: response, error, isLoading, mutate } = useInvoices();

  const invoicesData = useMemo(() => {
    const rawData = response?.data?.invoices || response?.data || [];
    return Array.isArray(rawData) ? rawData : [];
  }, [response]);
  // Handle URL invoice reference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const invoiceRef = urlParams.get("invoiceRef");

      if (invoiceRef && invoicesData.length > 0) {
        const invoice = invoicesData.find(
          (inv) => inv.reference === invoiceRef || inv.id === invoiceRef
        );

        if (invoice) {
          setSelectedInvoice(invoice);
          openInvoiceModal();
          // Clean URL without causing page reload
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        }
      }
    }
  }, [invoicesData, openInvoiceModal]);
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

  const getCustomerName = (invoice: Invoice) => {
    return (
      invoice.wacsCustomer?.fullName ||
      invoice.wacsCustomerLoan?.wacsCustomer?.fullName ||
      invoice.wacsCustomerLoan?.debtor ||
      invoice.wacsCustomerLoan?.employeeName ||
      invoice.employeeName ||
      invoice.debtor ||
      invoice.customerName ||
      invoice.accountName ||
      `${invoice.wacsCustomer?.firstName || ""} ${
        invoice.wacsCustomer?.middleName || ""
      } ${invoice.wacsCustomer?.surname || ""}`.trim() ||
      `${invoice.wacsCustomerLoan?.wacsCustomer?.firstName || ""} ${
        invoice.wacsCustomerLoan?.wacsCustomer?.middleName || ""
      } ${invoice.wacsCustomerLoan?.wacsCustomer?.surname || ""}`.trim() ||
      "N/A"
    );
  };

  // Filter and search logic (memoized to prevent unnecessary recalculations)
  const filtered = useMemo(() => {
    let list = [...invoicesData];

    // Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      list = list.filter((invoice: Invoice) => {
        if (!invoice.createdAt) return true;
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= start && invoiceDate <= end;
      });
    }

    // Status filter
    if (statusFilter.size > 0 && !statusFilter.has("all")) {
      list = list.filter((invoice: Invoice) => {
        const statusValue = invoice.isPaid ? "paid" : "pending";
        return statusFilter.has(statusValue);
      });
    }

    // Search filter (only apply if debounced value exists)
    if (debouncedFilterValue.trim()) {
      const searchValue = debouncedFilterValue.toLowerCase();

      if (filterBy && filterBy !== "all") {
        // Filter by specific field
        list = list.filter((invoice: Invoice) => {
          switch (filterBy) {
            case "customer-name":
              return getCustomerName(invoice)
                .toLowerCase()
                .includes(searchValue);
            case "telesales-agent":
              return (
                invoice.telesalesAgent?.toLowerCase().includes(searchValue) ||
                invoice.telesalesAgentName
                  ?.toLowerCase()
                  .includes(searchValue) ||
                invoice.wacsCustomerLoan?.wacsCustomer?.fullName
                  ?.toLowerCase()
                  .includes(searchValue)
              );
            case "loan-id":
              return (
                invoice.loanId
                  ?.toString()
                  .toLowerCase()
                  .includes(searchValue) ||
                invoice.wacsCustomerLoan?.loanId
                  ?.toLowerCase()
                  .includes(searchValue)
              );
            case "bank-name":
              return (
                invoice.bankName?.toLowerCase().includes(searchValue) ||
                invoice.wacsCustomerLoan?.wacsCustomer?.bankName
                  ?.toLowerCase()
                  .includes(searchValue)
              );
            case "account-number":
              return (
                invoice.accountNumber?.toLowerCase().includes(searchValue) ||
                invoice.wacsCustomerLoan?.wacsCustomer?.accountNumber
                  ?.toLowerCase()
                  .includes(searchValue)
              );
            case "amount":
              return (
                invoice.amountRequested?.toString().includes(searchValue) ||
                invoice.primaryAmount?.toString().includes(searchValue) ||
                invoice.amount?.toString().includes(searchValue) ||
                invoice.wacsCustomerLoan?.amountRequested
                  ?.toString()
                  .includes(searchValue)
              );
            default:
              return true;
          }
        });
      } else {
        // Default search across multiple fields
        list = list.filter(
          (invoice: Invoice) =>
            getCustomerName(invoice).toLowerCase().includes(searchValue) ||
            invoice.loanId?.toString().toLowerCase().includes(searchValue) ||
            invoice.wacsCustomerLoan?.loanId
              ?.toLowerCase()
              .includes(searchValue) ||
            invoice.telesalesAgent?.toLowerCase().includes(searchValue) ||
            invoice.telesalesAgentName?.toLowerCase().includes(searchValue) ||
            invoice.bankName?.toLowerCase().includes(searchValue) ||
            invoice.wacsCustomerLoan?.wacsCustomer?.bankName
              ?.toLowerCase()
              .includes(searchValue) ||
            invoice.accountNumber?.toLowerCase().includes(searchValue) ||
            invoice.wacsCustomerLoan?.wacsCustomer?.accountNumber
              ?.toLowerCase()
              .includes(searchValue) ||
            invoice.reference?.toLowerCase().includes(searchValue) ||
            (invoice.isPaid ? "paid" : "pending").includes(searchValue) ||
            invoice.amountRequested?.toString().includes(searchValue) ||
            invoice.primaryAmount?.toString().includes(searchValue) ||
            invoice.amount?.toString().includes(searchValue) ||
            invoice.wacsCustomerLoan?.amountRequested
              ?.toString()
              .includes(searchValue)
        );
      }
    }

    return list;
  }, [
    invoicesData,
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
      let aVal: any;
      let bVal: any;

      // Handle special cases for nested properties
      if (sortDescriptor.column === "customerName") {
        aVal = getCustomerName(a);
        bVal = getCustomerName(b);
      } else if (sortDescriptor.column === "telesalesAgent") {
        aVal = a.telesalesAgent || a.telesalesAgentName || "";
        bVal = b.telesalesAgent || b.telesalesAgentName || "";
      } else {
        aVal = a[sortDescriptor.column as keyof Invoice];
        bVal = b[sortDescriptor.column as keyof Invoice];
      }

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

  // Handle invoice view
  const handleViewInvoice = useCallback(
    (invoice: Invoice) => {
      setSelectedInvoice(invoice);
      openInvoiceModal();
    },
    [openInvoiceModal]
  );

  // Handle download invoice
  const handleDownloadInvoice = useCallback((invoice: Invoice) => {
    // TODO: Implement download functionality
    showToast({
      message: "Download functionality coming soon!",
      type: "info",
    });
  }, []);

  // Handle copy reference
  const handleCopyReference = useCallback((invoice: Invoice) => {
    if (invoice.reference) {
      navigator.clipboard.writeText(invoice.reference);
      showToast({
        message: "Reference copied to clipboard!",
        type: "success",
      });
    }
  }, []);

  // Handle copy shareable link
  const handleCopyLink = useCallback((invoice: Invoice) => {
    const currentUrl = window.location.origin + window.location.pathname;
    const shareableLink = `${currentUrl}?invoiceRef=${
      invoice.reference || invoice.id
    }`;

    navigator.clipboard.writeText(shareableLink);
    showToast({
      message: "Shareable link copied to clipboard!",
      type: "success",
    });
  }, []);

  // Excel export function
  const exportFn = useCallback(async (data: Invoice[]) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Invoices");

      // Define columns
      worksheet.columns = [
        { header: "Loan ID", key: "loanId", width: 15 },
        { header: "Customer Name", key: "customerName", width: 25 },
        { header: "Telesales Agent", key: "telesalesAgent", width: 20 },
        { header: "Primary Amount", key: "primaryAmount", width: 15 },
        { header: "Amount Requested", key: "amountRequested", width: 15 },
        { header: "Bank Name", key: "bankName", width: 20 },
        { header: "Account Number", key: "accountNumber", width: 15 },
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
      data.forEach((invoice) => {
        const row = worksheet.addRow({
          loanId: invoice.loanId,
          customerName: getCustomerName(invoice),
          telesalesAgent: invoice.telesalesAgent || invoice.telesalesAgentName,
          primaryAmount: invoice.primaryAmount,
          amountRequested: invoice.amountRequested,
          bankName: invoice.bankName,
          accountNumber: invoice.accountNumber,
          status: capitalize(invoice.status),
          createdAt: invoice.createdAt ? formatDate(invoice.createdAt) : "",
        });

        // Color code status
        const statusColor =
          STATUS_COLOR_MAP[getColor(invoice.status)] ||
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
      saveAs(blob, `invoices-${timestamp}.xlsx`);

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
    (invoice: Invoice, columnKey: string) => {
      if (columnKey === "serialNumber") {
        const index = sorted.indexOf(invoice);
        const serialNumber = (page - 1) * rowsPerPage + index + 1;
        return <span className="text-sm">{serialNumber}</span>;
      }

      switch (columnKey) {
        case "telesalesAgent":
          return (
            <span className="text-sm">
              {invoice.telesalesAgent || invoice.telesalesAgentName || "N/A"}
            </span>
          );

        case "customerName":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">
                {getCustomerName(invoice)}
              </p>
            </div>
          );

        case "loanId":
          return <span className="text-sm">{invoice.loanId || "N/A"}</span>;

        case "primaryAmount":
          return (
            <span className="text-sm font-medium">
              {formatCurrency(
                invoice.primaryAmount ||
                  invoice.amountRequested ||
                  invoice.amount ||
                  0
              )}
            </span>
          );

        case "amountRequested":
          return (
            <span className="text-sm font-medium">
              {formatCurrency(
                invoice.amountRequested ||
                  invoice.amount ||
                  invoice.primaryAmount ||
                  0
              )}
            </span>
          );

        case "bankName":
          return <span className="text-sm">{invoice.bankName || "N/A"}</span>;

        case "accountNumber":
          return (
            <span className="text-sm">{invoice.accountNumber || "N/A"}</span>
          );

        case "status":
          const statusText = invoice.isPaid ? "Paid" : "Pending";
          const statusColor = invoice.isPaid ? "success" : "warning";

          return (
            <Chip
              className="capitalize"
              color={statusColor}
              size="sm"
              variant="flat"
            >
              {statusText}
            </Chip>
          );

        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <MoreVertical className="w-4 h-4 text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Invoice actions">
                  <DropdownItem
                    key="view"
                    startContent={<Eye className="w-4 h-4" />}
                    onPress={() => handleViewInvoice(invoice)}
                  >
                    View Details
                  </DropdownItem>
                  <DropdownItem
                    key="download"
                    startContent={<Download className="w-4 h-4" />}
                    onPress={() => handleDownloadInvoice(invoice)}
                  >
                    Download Invoice
                  </DropdownItem>
                  <DropdownItem
                    key="copy-reference"
                    startContent={<FileText className="w-4 h-4" />}
                    onPress={() => handleCopyReference(invoice)}
                  >
                    Copy Reference
                  </DropdownItem>
                  <DropdownItem
                    key="copy-link"
                    startContent={<Copy className="w-4 h-4" />}
                    onPress={() => handleCopyLink(invoice)}
                  >
                    Copy Shareable Link
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return (
            <span className="text-sm">
              {String(invoice[columnKey as keyof Invoice] || "")}
            </span>
          );
      }
    },
    [
      sorted,
      page,
      handleViewInvoice,
      handleDownloadInvoice,
      handleCopyReference,
      handleCopyLink,
    ]
  );

  // Set no records state
  React.useEffect(() => {
    setHasNoRecords(!isLoading && filtered.length === 0);
  }, [isLoading, filtered.length]);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">Failed to load invoices</p>
          <Button color="primary" onPress={() => mutate()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Invoices
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {invoicesData.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Paid
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {invoicesData.filter((inv) => inv.isPaid === true).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pending
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {invoicesData.filter((inv) => inv.isPaid === false).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Recent
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {
              invoicesData.filter((inv) => {
                if (!inv.createdAt) return false;
                const invoiceDate = new Date(inv.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return invoiceDate >= weekAgo;
              }).length
            }
          </p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={10} />
      ) : (
        <GenericTable<Invoice>
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
        />
      )}

      {/* Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={closeInvoiceModal}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default CreditflexInvoicesView;
