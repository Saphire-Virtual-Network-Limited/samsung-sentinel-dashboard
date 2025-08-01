"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  MoreVertical,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2,
  Download,
  Target,
  Percent,
  UserPlus,
} from "lucide-react";
import { StatCard } from "@/components/atoms/StatCard";
import {
  useAmbassadorLeads,
  useUnassignedLeads,
} from "@/hooks/useAmbassadorLeads";
import { Lead } from "@/lib/api";
import InfoCard from "../../../components/reususables/custom-ui/InfoCard";
import GenericTable, {
  ColumnDef,
} from "../../../components/reususables/custom-ui/tableUi";
import * as ExcelJS from "exceljs";
import { cn } from "@/lib/utils";
import { GeneralSans_Meduim } from "@/lib";

interface LeadStats {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  lostLeads: number;
}

// Loading and Error Components
const StatsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);

const StatsError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-24 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center"
        >
          <button
            onClick={onRetry}
            className="text-red-600 text-sm hover:text-red-800"
          >
            Failed to load - Retry
          </button>
        </div>
      ))}
    </div>
  </div>
);

// Utility Functions
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: string | number): string => {
  if (typeof value === "string") return value;
  return value?.toLocaleString("en-US") || "0";
};

// Statistics Cards Component
const StatsCards: React.FC<{ stats: LeadStats; isUnassigned?: boolean }> = ({
  stats,
  isUnassigned = false,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
    <StatCard
      title="Total Leads"
      value={formatNumber(stats.totalLeads)}
      icon={<Users className="w-5 h-5" />}
    />
    <StatCard
      title="New Leads"
      value={formatNumber(stats.newLeads)}
      icon={<UserPlus className="w-5 h-5" />}
    />
    <StatCard
      title="Contacted Leads"
      value={formatNumber(stats.contactedLeads)}
      icon={<Phone className="w-5 h-5" />}
    />
    <StatCard
      title="Qualified Leads"
      value={formatNumber(stats.qualifiedLeads)}
      icon={<Target className="w-5 h-5" />}
    />
    {!isUnassigned && (
      <>
        <StatCard
          title="Converted Leads"
          value={formatNumber(stats.convertedLeads)}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={<Percent className="w-5 h-5" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          title="Lost Leads"
          value={formatNumber(stats.lostLeads)}
          icon={<Trash2 className="w-5 h-5" />}
        />
      </>
    )}
    {isUnassigned && (
      <StatCard
        title="Lost Leads"
        value={formatNumber(stats.lostLeads)}
        icon={<Trash2 className="w-5 h-5" />}
      />
    )}
  </div>
);

// Leads Table Component
const LeadsTable: React.FC<{
  leads: Lead[];
  stats: LeadStats;
  isUnassigned?: boolean;
}> = ({ leads, stats, isUnassigned = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: "ascending" | "descending";
  }>({ column: "createdAt", direction: "descending" });

  // Get unique values for filters
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(leads.map((lead) => lead.status))];
    return statuses.filter(Boolean);
  }, [leads]);

  // Filter and search leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phoneNumber?.includes(searchTerm) ||
        lead.ippisNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.state?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads];
    if (sortDescriptor.column) {
      sorted.sort((a, b) => {
        let aValue: any = a[sortDescriptor.column as keyof Lead] || "";
        let bValue: any = b[sortDescriptor.column as keyof Lead] || "";

        // Handle date fields
        if (sortDescriptor.column === "createdAt") {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        } else if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue)
          return sortDescriptor.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortDescriptor.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredLeads, sortDescriptor]);

  // Pagination
  const rowsPerPage = 10;
  const pages = Math.ceil(sortedLeads.length / rowsPerPage);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedLeads.slice(start, end);
  }, [sortedLeads, currentPage]);

  // Excel export function
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leads Data");

    // Define columns
    worksheet.columns = [
      { header: "Lead Name", key: "leadName", width: 20 },
      { header: "Phone Number", key: "phoneNumber", width: 15 },
      { header: "IPPIS Number", key: "ippisNumber", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "State", key: "state", width: 15 },
      { header: "Grade Level", key: "gradeLevel", width: 12 },
      { header: "Created Date", key: "createdAt", width: 15 },
      { header: "Bank Name", key: "salaryBankName", width: 20 },
      { header: "Account Number", key: "salaryAccountNumber", width: 18 },
    ];

    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
    });

    // Add data rows
    sortedLeads.forEach((lead) => {
      worksheet.addRow({
        leadName: lead.leadName,
        phoneNumber: lead.phoneNumber,
        ippisNumber: lead.ippisNumber,
        status: lead.status,
        state: lead.state,
        gradeLevel: lead.gradeLevel,
        createdAt: new Date(lead.createdAt).toLocaleDateString(),
        salaryBankName: lead.salaryBankName,
        salaryAccountNumber: lead.salaryAccountNumber,
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${isUnassigned ? "unassigned-" : ""}leads-data-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "primary";
      case "contacted":
        return "warning";
      case "qualified":
        return "secondary";
      case "converted":
        return "success";
      case "disbursed":
        return "success";
      case "lost":
        return "danger";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  // Table columns configuration
  const columns: ColumnDef[] = [
    {
      name: "Lead Info",
      uid: "leadInfo",
      sortable: true,
    },
    {
      name: "Phone",
      uid: "phoneNumber",
      sortable: true,
    },
    {
      name: "IPPIS Number",
      uid: "ippisNumber",
      sortable: true,
    },
    {
      name: "Status",
      uid: "status",
      sortable: true,
    },
    {
      name: "State",
      uid: "state",
      sortable: true,
    },
    {
      name: "Grade Level",
      uid: "gradeLevel",
      sortable: true,
    },
    {
      name: "Created",
      uid: "createdAt",
      sortable: true,
    },
    {
      name: "Actions",
      uid: "actions",
    },
  ];

  // Render cell function
  const renderCell = (lead: Lead, key: string) => {
    switch (key) {
      case "leadInfo":
        return (
          <div className="flex items-center gap-3">
            <Avatar name={lead.leadName} size="sm" className="flex-shrink-0" />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-900">
                {lead.leadName}
              </p>
              <p className="text-xs text-gray-500">{lead.salaryBankName}</p>
            </div>
          </div>
        );
      case "phoneNumber":
        return (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{lead.phoneNumber}</span>
          </div>
        );
      case "ippisNumber":
        return <span className="text-sm font-mono">{lead.ippisNumber}</span>;
      case "status":
        return (
          <Chip
            className="capitalize"
            color={getStatusColor(lead.status) as any}
            size="sm"
            variant="flat"
          >
            {lead.status}
          </Chip>
        );
      case "state":
        return <span className="text-sm">{lead.state}</span>;
      case "gradeLevel":
        return <span className="text-sm">{lead.gradeLevel}</span>;
      case "createdAt":
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {new Date(lead.createdAt).toLocaleDateString()}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="view">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownItem>
                <DropdownItem key="edit">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return <span>-</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <StatsCards stats={stats} isUnassigned={isUnassigned} />

      {/* Leads Table */}
      <InfoCard
        title={isUnassigned ? "Unassigned Leads" : "All Leads"}
        icon={<Users className="h-5 w-5" />}
        headerContent={
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              size="sm"
              startContent={<Download className="h-4 w-4" />}
              onClick={exportToExcel}
            >
              Export Excel
            </Button>
          </div>
        }
      >
        <GenericTable<Lead>
          columns={columns}
          data={paginatedLeads}
          allCount={sortedLeads.length}
          exportData={sortedLeads}
          isLoading={false}
          filterValue={searchTerm}
          onFilterChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          statusOptions={uniqueStatuses.map((status) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            uid: status,
          }))}
          statusFilter={new Set(statusFilter === "all" ? [] : [statusFilter])}
          onStatusChange={(keys) => {
            const selectedStatus = Array.from(keys)[0] as string;
            setStatusFilter(selectedStatus || "all");
            setCurrentPage(1);
          }}
          statusColorMap={uniqueStatuses.reduce((acc, status) => {
            acc[status] = getStatusColor(status) as any;
            return acc;
          }, {} as Record<string, "primary" | "warning" | "secondary" | "success" | "danger" | "default">)}
          showStatus={true}
          sortDescriptor={sortDescriptor}
          onSortChange={(sd) => {
            setSortDescriptor(sd as any);
          }}
          page={currentPage}
          pages={pages}
          onPageChange={setCurrentPage}
          exportFn={exportToExcel}
          renderCell={renderCell}
          hasNoRecords={sortedLeads.length === 0}
        />
      </InfoCard>
    </div>
  );
};

// All Leads Component
const AllLeadsView: React.FC = () => {
  const { data: leads, isLoading, error, mutate } = useAmbassadorLeads();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(
      (lead) => lead.status === "converted" || lead.status === "disbursed"
    ).length;
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const newLeads = leads.filter((lead) => lead.status === "new").length;
    const contactedLeads = leads.filter(
      (lead) => lead.status === "contacted"
    ).length;
    const qualifiedLeads = leads.filter(
      (lead) => lead.status === "qualified"
    ).length;
    const lostLeads = leads.filter(
      (lead) => lead.status === "lost" || lead.status === "rejected"
    ).length;

    return {
      totalLeads,
      convertedLeads,
      conversionRate,
      totalRevenue: 0, // This would need to be calculated based on loan amounts
      newLeads,
      contactedLeads,
      qualifiedLeads,
      lostLeads,
    };
  }, [leads]);

  if (isLoading) return <StatsSkeleton />;
  if (error) return <StatsError onRetry={mutate} />;

  return <LeadsTable leads={leads} stats={stats} />;
};

// Unassigned Leads Component
const UnassignedLeadsView: React.FC = () => {
  const { data: leads, isLoading, error, mutate } = useUnassignedLeads();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const newLeads = leads.filter((lead) => lead.status === "new").length;
    const contactedLeads = leads.filter(
      (lead) => lead.status === "contacted"
    ).length;
    const qualifiedLeads = leads.filter(
      (lead) => lead.status === "qualified"
    ).length;
    const lostLeads = leads.filter(
      (lead) => lead.status === "lost" || lead.status === "rejected"
    ).length;

    return {
      totalLeads,
      convertedLeads: 0,
      conversionRate: 0,
      totalRevenue: 0,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      lostLeads,
    };
  }, [leads]);

  if (isLoading) return <StatsSkeleton />;
  if (error) return <StatsError onRetry={mutate} />;

  return <LeadsTable leads={leads} stats={stats} isUnassigned={true} />;
};

// Main Leads View Component
const LeadsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex w-full flex-col">
        <Tabs
          aria-label="Leads Options"
          size="lg"
          radius="lg"
          color="primary"
          className={cn("pb-5", GeneralSans_Meduim.className)}
          classNames={{
            tab: "lg:p-4 text-sm lg:text-base",
          }}
        >
          <Tab key="all-leads" title="All Leads" className="lg:p-4 text-base">
            <AllLeadsView />
          </Tab>
          <Tab
            key="unassigned-leads"
            title="Unassigned Leads"
            className="lg:p-4 text-base"
          >
            <UnassignedLeadsView />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default LeadsView;
