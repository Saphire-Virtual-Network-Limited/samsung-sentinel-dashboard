"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisclosure,
} from "@heroui/react";
import {
  EllipsisVertical,
  MoreHorizontal,
  Eye,
  Link,
  ExternalLink,
} from "lucide-react";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { LoanDetailsModal } from "@/components/modals/LoanDetailsModal";
import { useAdminAllLoans } from "@/hooks/creditflex/useAdminAllLoans";
import { capitalize, showToast, getColor } from "@/lib";
import {
  triggerCDFAdminDisbursement,
  getCDFLoanById,
  triggerCDFAdminBulkDisbursement,
} from "@/lib/api";
import {
  CreditflexLoan,
  CreditflexLoanFilters,
  searchFilterOptions,
} from "./allLoans/types";
import { columns, statusOptions, statusColorMap } from "./allLoans/constants";

// Status color mapping for Excel export
const STATUS_COLOR_MAP: Record<string, string> = {
  success: "FF28A745",
  warning: "FFFFC107",
  primary: "FF0D6EFD",
  danger: "FFDC3545",
  default: "FFE0E0E0",
};

const CreditflexAllLoansView = () => {
  const router = useRouter();
  const pathname = usePathname();

  const role = pathname.split("/")[2];

  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [hasNoRecords, setHasNoRecords] = useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "dateOfApplication",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedLoanIds, setSelectedLoanIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedLoan, setSelectedLoan] = useState<CreditflexLoan | null>(null);

  const [isBulkDisbursing, setIsBulkDisbursing] = useState(false);

  // Modal states
  const {
    isOpen: isLoanModalOpen,
    onOpen: openLoanModal,
    onClose: closeLoanModal,
  } = useDisclosure();

  // Get status from URL parameter if present (client-side only)
  const [urlStatus, setUrlStatus] = useState<string | null>(null);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getCustomerName = (loan: any) =>
    loan.employeeName ||
    loan.debtor ||
    loan.customerName ||
    (loan.wacsCustomer
      ? `${loan.wacsCustomer.firstName || ""} ${
          loan.wacsCustomer.middleName || ""
        } ${loan.wacsCustomer.surname || ""}`.trim()
      : "N/A");

  const getTelesalesAgent = (loan: any) =>
    loan.wacsCustomer?.teleMarketer
      ? `${loan.wacsCustomer.teleMarketer.firstname || ""} ${
          loan.wacsCustomer.teleMarketer.lastname || ""
        }`.trim()
      : "Unassigned";

  const filters: CreditflexLoanFilters = useMemo(
    () => ({
      // API status filtering disabled - using local filtering instead
      // status: statusFilter.size > 0 ? Array.from(statusFilter)[0] : "all",
      status: "all",
      startDate,
      endDate,
      page,
      limit: rowsPerPage,
      // API search disabled - using local filtering instead
      // ...(filterValue &&
      //   filterBy === "telesales-agent" && { telemarketerName: filterValue }),
      // ...(filterValue && filterBy === "ippis" && { ippisNumber: filterValue }),
      // ...(filterValue &&
      //   filterBy === "loan-product" && { loanProductId: filterValue }),
      // ...(filterValue && !filterBy && { customerName: filterValue }),
    }),
    [startDate, endDate, page] //statusFilter
  );

  const { data: response, error, isLoading } = useAdminAllLoans(filters);

  const loansData = useMemo(() => {
    if (!response?.data) {
      setHasNoRecords(!isLoading && !error);
      return [];
    }

    setHasNoRecords(false);

    // Debug: Log first loan to understand the data structure
    if (response.data.length > 0) {
      console.log("Sample loan data structure:", response.data[0]);
    }

    return response.data.map((loan: any) => ({
      ...loan,
      customerName: getCustomerName(loan),
      customerIppis:
        loan.customerIppis ||
        loan.ippisNumber ||
        loan.wacsCustomer?.ippisNumber ||
        "N/A",
      amountRequested:
        loan.amountRequested || loan.loanAmount || loan.principalAmount || 0,
      disbursedAmount: loan.disbursedAmount || 0,
      amountPaidSoFar: loan.amountPaidSoFar || 0,
      balance: loan.balance || 0,
      loanTenure: loan.loanTenure || loan.tenure || 0,
      rawDate: loan.rawDate || loan.createdAt || loan.dateOfApplication,
      dateOfApplication:
        loan.rawDate || loan.createdAt || loan.dateOfApplication,
      telesalesAgent: getTelesalesAgent(loan),
      loanProduct: loan.loanProduct || loan.loanProductName || "N/A",
      Invoice: loan.Invoice,
      principalAmount:
        loan.principalAmount || loan.amountRequested || loan.loanAmount || 0,
      totalAmount:
        loan.totalAmount ||
        loan.amountWithInterest ||
        (loan.principalAmount || loan.amountRequested || 0) * 1.1 ||
        0,
    }));
  }, [response, isLoading, error]);

  // Handle URL parameters for status and loan ID
  useEffect(() => {
    // Only run on client side to avoid SSR issues
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const statusParam = searchParams.get("status");
      const loanIdParam = searchParams.get("loanId");

      if (statusParam) {
        setUrlStatus(statusParam.toLowerCase());
        // Also set the status filter to match the URL
        setStatusFilter(new Set([statusParam.toLowerCase()]));
      }

      // Handle loan ID parameter for opening loan modal
      if (loanIdParam && loansData.length > 0) {
        const loan = loansData.find(
          (loan: CreditflexLoan) =>
            loan.loanId === loanIdParam || loan.id === loanIdParam
        );
        if (loan) {
          setSelectedLoan(loan);
          openLoanModal();

          // Clean URL without causing page reload
          const newUrl =
            window.location.pathname +
            (statusParam ? `?status=${statusParam}` : "");
          window.history.replaceState({}, "", newUrl);
        }
      }
    }
  }, [loansData, openLoanModal]);

  const handleDateFilter = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setPage(1);
  };

  // Handle viewing loan details
  const handleViewLoan = (loan: CreditflexLoan) => {
    setSelectedLoan(loan);
    openLoanModal();
  };

  // Handle copy shareable link
  const handleCopyLoanLink = (loan: CreditflexLoan) => {
    const currentUrl = window.location.origin + window.location.pathname;
    const shareableLink = `${currentUrl}?loanId=${loan.loanId || loan.id}`;

    navigator.clipboard.writeText(shareableLink);
    showToast({
      message: "Shareable link copied to clipboard!",
      type: "success",
    });
  };

  const filtered = useMemo(() => {
    if (!Array.isArray(loansData)) return [];

    let list = [...loansData];

    // Local status filtering
    if (statusFilter.size > 0) {
      const selectedStatuses = Array.from(statusFilter).map((s) =>
        s.toLowerCase()
      );
      list = list.filter((loan: CreditflexLoan) =>
        selectedStatuses.includes(loan.status?.toLowerCase() || "")
      );
    }

    // Local text filtering - similar to customer view approach
    if (filterValue) {
      const searchValue = filterValue.toLowerCase();

      if (filterBy) {
        // Filter by specific field
        list = list.filter((loan: CreditflexLoan) => {
          switch (filterBy) {
            case "customer-name":
              return loan.customerName?.toLowerCase().includes(searchValue);
            case "telesales-agent":
              return loan.telesalesAgent?.toLowerCase().includes(searchValue);
            case "ippis":
              return loan.customerIppis?.toLowerCase().includes(searchValue);
            case "loan-product":
              return loan.loanProduct?.toLowerCase().includes(searchValue);
            case "date-of-application":
              return new Date(loan.dateOfApplication)
                .toLocaleDateString()
                .toLowerCase()
                .includes(searchValue);
            case "tenure":
              return loan.tenure?.toString().includes(searchValue);
            default:
              return true;
          }
        });
      } else {
        // Default search across multiple fields (like customer view)
        list = list.filter(
          (loan: CreditflexLoan) =>
            loan.customerName?.toLowerCase().includes(searchValue) ||
            loan.loanId?.toLowerCase().includes(searchValue) ||
            loan.telesalesAgent?.toLowerCase().includes(searchValue) ||
            loan.customerIppis?.toLowerCase().includes(searchValue) ||
            loan.loanProduct?.toLowerCase().includes(searchValue) ||
            loan.status?.toLowerCase().includes(searchValue) ||
            loan.amountRequested?.toString().includes(searchValue) ||
            loan.principalAmount?.toString().includes(searchValue)
        );
      }
    }

    return list;
  }, [loansData, filterValue, filterBy, statusFilter]); //added statusFilter

  const pages =
    Math.ceil((response?.pagination?.total || filtered.length) / rowsPerPage) ||
    1;

  const paged = useMemo(() => {
    if (response?.pagination) {
      return filtered;
    }

    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, response?.pagination]);

  const sorted = useMemo(() => {
    return [...paged].sort((a, b) => {
      const aVal = a[sortDescriptor.column as keyof CreditflexLoan];
      const bVal = b[sortDescriptor.column as keyof CreditflexLoan];

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

  const disbursableLoans = useMemo(() => {
    const disbursable = filtered.filter((loan) => {
      return loan.Invoice && !loan.Invoice.isPaid;
    });
    return disbursable;
  }, [filtered]);

  const disbursableLoanIds = useMemo(() => {
    const ids = new Set(disbursableLoans.map((loan) => loan.loanId || loan.id));
    return ids;
  }, [disbursableLoans]);

  const allDisbursableSelected = useMemo(() => {
    if (disbursableLoanIds.size === 0) return false;
    if (!(selectedLoanIds instanceof Set)) return false;
    return Array.from(disbursableLoanIds).every((id) =>
      selectedLoanIds.has(id)
    );
  }, [disbursableLoanIds, selectedLoanIds]);

  const someSelected = useMemo(() => {
    if (!(selectedLoanIds instanceof Set)) return false;
    return Array.from(disbursableLoanIds).some((id) => selectedLoanIds.has(id));
  }, [disbursableLoanIds, selectedLoanIds]);

  const selectedDisbursableCount = useMemo(() => {
    if (!(selectedLoanIds instanceof Set)) return 0;
    return Array.from(selectedLoanIds).filter((id) =>
      disbursableLoanIds.has(id)
    ).length;
  }, [selectedLoanIds, disbursableLoanIds]);

  useEffect(() => {
    if (selectedLoanIds.size > 0) {
      const validSelection = new Set(
        Array.from(selectedLoanIds).filter((id) => disbursableLoanIds.has(id))
      );
      if (validSelection.size !== selectedLoanIds.size) {
        setSelectedLoanIds(validSelection);
      }
    }
  }, [disbursableLoanIds, selectedLoanIds]);

  const handleBulkDisburse = async () => {
    if (!(selectedLoanIds instanceof Set)) {
      showToast({
        message: "Invalid selection state",
        type: "error",
      });
      return;
    }

    const selectedDisbursableLoans = disbursableLoans.filter((loan) =>
      selectedLoanIds.has(loan.loanId || loan.id)
    );

    if (selectedDisbursableLoans.length === 0) {
      showToast({
        message: "No valid loans selected for disbursement",
        type: "warning",
      });
      return;
    }

    try {
      const disbursementData = selectedDisbursableLoans.map((loan) => ({
        loanId: loan.loanId,
        invoiceReference: loan.Invoice?.reference,
      }));
      setIsBulkDisbursing(true);

      const response = await triggerCDFAdminBulkDisbursement(disbursementData);

      showToast({
        message: `Bulk disbursement completed. ${response.data.successful} successful, ${response.data.failed} failed.`,
        type: response.data.failed > 0 ? "warning" : "success",
      });

      setSelectedLoanIds(new Set());
    } catch (err: any) {
      console.error("Bulk disbursement failed:", err);
      showToast({
        message: `Bulk disbursement failed: ${
          err.message || "Please try again"
        }`,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsBulkDisbursing(false);
    }
  };

  const handleDisburse = async (loan: CreditflexLoan) => {
    if (!loan?.Invoice?.isPaid) {
      try {
        await triggerCDFAdminDisbursement(
          String(loan?.loanId),
          String(loan?.Invoice?.reference)
        );
        showToast({ message: "Disbursement triggered", type: "success" });
        try {
          await getCDFLoanById(String(loan?.loanId));
        } catch (error: any) {
          console.error("Error fetching loan by ID:", error);
          showToast({
            message: `Failed to sync updated loan data: ${error.message}`,
            type: "warning",
            duration: 5000,
          });
        }
      } catch (err: any) {
        console.error("Disbursement failed:", err);
        showToast({
          message: `Disbursement failed for ${loan?.loanId}: ${
            err.message || "Please try again"
          }`,
          type: "warning",
          duration: 5000,
        });
      }
    }
  };
  const exportFn = async (data: CreditflexLoan[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("All Loans");

    ws.columns = [
      { header: "S/N", key: "serialNumber", width: 8 },
      { header: "Telesales Agents", key: "telesalesAgent", width: 20 },
      { header: "Customer FullName", key: "customerName", width: 25 },
      { header: "IPPIS", key: "customerIppis", width: 15 },
      { header: "Loan ID", key: "loanId", width: 20 },
      { header: "Loan Product", key: "loanProduct", width: 20 },
      { header: "Principal Amount", key: "principalAmount", width: 15 },
      { header: "Total Amount", key: "totalAmount", width: 15 },
      { header: "Loan Amount Requested", key: "amountRequested", width: 15 },
      { header: "Loan Amount Disbursed", key: "disbursedAmount", width: 15 },
      { header: "Loan Amount Paid So Far", key: "amountPaidSoFar", width: 15 },
      { header: "Balance", key: "balance", width: 15 },
      { header: "Tenure", key: "loanTenure", width: 12 },
      { header: "Date of Application", key: "rawDate", width: 18 },
      { header: "Status", key: "status", width: 15 },
    ];

    data.forEach((loan, index) => {
      const row = ws.addRow({
        serialNumber: index + 1,
        telesalesAgent: loan.telesalesAgent,
        customerName: loan.customerName,
        customerIppis: loan.customerIppis || "N/A",
        loanId: loan.loanId,
        loanProduct: loan.loanProduct,
        principalAmount: loan.principalAmount || 0,
        totalAmount: loan.totalAmount || 0,
        amountRequested: loan.amountRequested || 0,
        disbursedAmount: loan.disbursedAmount || 0,
        amountPaidSoFar: loan.amountPaidSoFar || 0,
        balance: loan.balance || 0,
        loanTenure: `${loan.loanTenure} months`,
        rawDate: formatDate(loan.rawDate),
        status: loan.status,
      });

      const colorKey = getColor(loan.status);
      const fillColor =
        STATUS_COLOR_MAP[colorKey] || STATUS_COLOR_MAP["default"];
      const statusCell = row.getCell("status");

      if (process.env.EXCEL_STATUS_COLOR === "true") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
        statusCell.font = { color: { argb: "FFFFFFFF" } };
      }
    });

    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6E6E6" },
    };

    [
      "principalAmount",
      "totalAmount",
      "amountRequested",
      "disbursedAmount",
      "amountPaidSoFar",
      "balance",
    ].forEach((col) => (ws.getColumn(col).numFmt = "#,##0"));

    const buf = await wb.xlsx.writeBuffer();
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const fileName = `Creditflex_All_Loans_${formattedDate.replace(
      / /g,
      "_"
    )}_${formattedTime.replace(/:/g, "-")}.xlsx`;
    saveAs(new Blob([buf]), fileName);
  };

  const renderCell = (loan: CreditflexLoan, key: string) => {
    if (key === "serialNumber") {
      const index = sorted.indexOf(loan);
      const serialNumber = (page - 1) * rowsPerPage + index + 1;
      return <span className="text-sm">{serialNumber}</span>;
    }

    if (key === "actions") {
      return (
        <Dropdown>
          <DropdownTrigger>
            <Button variant="light" isIconOnly size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem
              key="view"
              color="primary"
              startContent={<Eye className="w-4 h-4" />}
              onPress={() => handleViewLoan(loan)}
            >
              View Details
            </DropdownItem>
            <DropdownItem
              key="copy-link"
              color="default"
              startContent={<Link className="w-4 h-4" />}
              onPress={() => handleCopyLoanLink(loan)}
            >
              Copy Shareable Link
            </DropdownItem>

            <DropdownItem
              key="disburse"
              color="success"
              className={`${
                loan.Invoice?.isPaid
                  ? "cursor-not-allowed bg-green-400 text-white"
                  : ""
              }`}
              onPress={() => {
                handleDisburse(loan);
              }}
              isDisabled={loan.Invoice?.isPaid}
            >
              Disburse{loan.Invoice?.isPaid ? "d" : ""}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      );
    }

    if (key === "status") {
      return (
        <Chip
          className="capitalize"
          color={statusColorMap[loan.status || ""]}
          size="sm"
          variant="flat"
        >
          {capitalize(loan.status || "")}
        </Chip>
      );
    }

    if (key === "customerName") {
      return (
        <div
          className="capitalize cursor-pointer font-medium text-blue-600 hover:text-blue-800"
          onClick={() => handleViewLoan(loan)}
        >
          {loan.customerName}
        </div>
      );
    }

    if (
      key === "principalAmount" ||
      key === "totalAmount" ||
      key === "amountRequested" ||
      key === "disbursedAmount" ||
      key === "amountPaidSoFar" ||
      key === "balance"
    ) {
      const amount = loan[key as keyof CreditflexLoan] as number;
      return (
        <span className="font-medium">₦{amount?.toLocaleString() || 0}</span>
      );
    }

    if (key === "customerIppis") {
      return <span className="text-sm">{loan.customerIppis || "N/A"}</span>;
    }

    if (key === "dateOfApplication" || key === "rawDate") {
      return formatDate(loan.rawDate || loan.dateOfApplication);
    }

    if (key === "tenure" || key === "loanTenure") {
      const tenure = loan.loanTenure || loan.tenure;
      return `${tenure} months`;
    }

    return <div className="text-small">{(loan as any)[key] || "N/A"}</div>;
  };

  const handleSelectionChange = (keys: any) => {
    if (keys === "all") {
      // If all disbursable loans are already selected, deselect all
      if (allDisbursableSelected) {
        setSelectedLoanIds(new Set());
      } else {
        // Select all disbursable loans only
        setSelectedLoanIds(new Set(Array.from(disbursableLoanIds)));
      }
    } else if (keys instanceof Set) {
      // Filter to only allow selection of disbursable loans
      const validSelection = new Set(
        Array.from(keys).filter((id) => disbursableLoanIds.has(id))
      );
      setSelectedLoanIds(validSelection);
    } else {
      // Fallback for other cases (like empty selection)
      setSelectedLoanIds(new Set());
    }
  };

  return (
    <div className="p-6">
      {/* Bulk Actions Bar */}
      {selectedDisbursableCount > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onPress={handleBulkDisburse}
              isDisabled={selectedDisbursableCount === 0}
              className="min-w-fit"
              isLoading={isBulkDisbursing}
            >
              Disburse Selected ({selectedDisbursableCount})
            </Button>
            <Button
              color="default"
              variant="bordered"
              size="sm"
              onPress={() => setSelectedLoanIds(new Set())}
              isDisabled={selectedLoanIds.size === 0}
              className="min-w-fit"
            >
              Clear Selection
            </Button>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="text-sm text-blue-700 self-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {selectedDisbursableCount} selected for disbursement
              </span>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={10} />
      ) : (
        <GenericTable<CreditflexLoan>
          columns={columns}
          data={sorted}
          allCount={response?.pagination?.total || filtered.length}
          exportData={filtered}
          isLoading={isLoading}
          filterValue={filterValue}
          onFilterChange={(v) => {
            setFilterValue(v);
            setPage(1);
          }}
          statusOptions={statusOptions}
          statusFilter={statusFilter}
          onStatusChange={(status) => {
            setStatusFilter(status);
            setPage(1);
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
          selectionMode="multiple"
          selectedKeys={
            selectedLoanIds.size === disbursableLoanIds.size &&
            disbursableLoanIds.size > 0
              ? disbursableLoanIds
              : selectedLoanIds
          }
          onSelectionChange={handleSelectionChange}
          disabledKeys={
            new Set(
              sorted
                .filter(
                  (loan) => !disbursableLoanIds.has(loan.loanId || loan.id)
                )
                .map((loan) => loan.loanId || loan.id)
            )
          }
        />
      )}

      {/* Loan Details Modal */}
      <LoanDetailsModal
        isOpen={isLoanModalOpen}
        onClose={closeLoanModal}
        loan={selectedLoan}
      />
    </div>
  );
};

export default CreditflexAllLoansView;
