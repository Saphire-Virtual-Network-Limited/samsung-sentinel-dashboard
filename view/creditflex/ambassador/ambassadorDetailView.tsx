"use client";

import React, { useMemo, useState } from "react";
import {
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
  Select,
  SelectItem,
  Spinner,
  SortDescriptor,
  Divider,
} from "@heroui/react";
import {
  MoreVertical,
  Eye,
  UserCheck,
  Users,
  Phone,
  Mail,
  MapPin,
  Building,
  ArrowLeft,
  Target,
  TrendingUp,
  CreditCard,
  DollarSign,
} from "lucide-react";
import InfoCard from "../../../components/reususables/custom-ui/InfoCard";
import InfoField from "../../../components/reususables/custom-ui/InfoField";
import {
  ImagePreviewModal,
  StatusChip,
} from "../../../components/reususables/custom-ui";
import GenericTable, {
  ColumnDef,
} from "../../../components/reususables/custom-ui/tableUi";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  getAmbassadorById,
  getAmbassadorLeadsWithDetails,
  getCDFAllTeleMarketers,
  updateLeadStatus,
  assignTelemarketerToLead,
  Lead,
  Ambassador,
} from "../../../lib/api";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { showToast } from "../../../lib/showNotification";

interface AmbassadorDetailViewProps {
  ambassadorId: string;
}

const AmbassadorDetailView: React.FC<AmbassadorDetailViewProps> = ({
  ambassadorId,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTelemarketer, setSelectedTelemarketer] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  });
  const rowsPerPage = 10;

  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose,
  } = useDisclosure();
  const {
    isOpen: isTelemarketerOpen,
    onOpen: onTelemarketerOpen,
    onClose: onTelemarketerClose,
  } = useDisclosure();
  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
    onClose: onImageClose,
  } = useDisclosure();

  // Fetch ambassador data
  const {
    data: ambassadorData,
    error: ambassadorError,
    isLoading: ambassadorLoading,
  } = useSWR(
    ambassadorId ? `ambassador-${ambassadorId}` : null,
    async () => {
      if (!ambassadorId) return null;
      const response = await getAmbassadorById(ambassadorId);
      return response.data;
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  // Fetch ambassador leads
  const {
    data: leadsData,
    error: leadsError,
    isLoading: leadsLoading,
    mutate,
  } = useSWR(
    `ambassador-${ambassadorId}-leads`,
    async () => {
      const response = await getAmbassadorLeadsWithDetails();
      return (
        response.data?.filter(
          (lead: Lead) => lead.ambassadorId === ambassadorId
        ) || []
      );
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  );

  // Fetch telemarketers for assignment
  const { data: telemarketersData } = useSWR("telemarketers", async () => {
    const response = await getCDFAllTeleMarketers();
    return response.data || [];
  });

  const ambassador = useMemo(() => ambassadorData || null, [ambassadorData]);
  const leads = useMemo(() => leadsData || [], [leadsData]);
  const telemarketers = useMemo(
    () => telemarketersData || [],
    [telemarketersData]
  );

  // Calculate stats
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const initiated = leads.filter(
      (lead) => lead.status === "INITIATED"
    ).length;
    const converted = leads.filter(
      (lead) => lead.status === "CONVERTED"
    ).length;
    const disbursed = leads.filter(
      (lead) => lead.status === "DISBURSED"
    ).length;
    const rejected = leads.filter((lead) => lead.status === "REJECTED").length;

    const conversionRate =
      totalLeads > 0
        ? (((converted + disbursed) / totalLeads) * 100).toFixed(1)
        : "0";

    return {
      totalLeads,
      initiated,
      converted,
      disbursed,
      rejected,
      conversionRate,
    };
  }, [leads]);

  // Filter and paginate leads
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    if (searchTerm.trim()) {
      const searchValue = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.leadName.toLowerCase().includes(searchValue) ||
          lead.phoneNumber.includes(searchValue) ||
          lead.ippisNumber.toLowerCase().includes(searchValue)
      );
    }

    if (statusFilter.size > 0) {
      filtered = filtered.filter((lead) => statusFilter.has(lead.status));
    }

    return filtered;
  }, [leads, searchTerm, statusFilter]);

  const pages = Math.ceil(filteredLeads.length / rowsPerPage);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, currentPage]);

  const sortedLeads = useMemo(() => {
    return [...paginatedLeads].sort((a, b) => {
      const aVal = a[sortDescriptor.column as keyof Lead];
      const bVal = b[sortDescriptor.column as keyof Lead];

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
  }, [paginatedLeads, sortDescriptor]);

  // Export function
  const exportLeads = async (data: Lead[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Ambassador Leads");

    ws.columns = [
      { header: "S/N", key: "serialNumber", width: 8 },
      { header: "Lead Name", key: "leadName", width: 25 },
      { header: "Phone Number", key: "phoneNumber", width: 15 },
      { header: "IPPIS Number", key: "ippisNumber", width: 15 },
      { header: "State", key: "state", width: 15 },
      { header: "Bank Name", key: "salaryBankName", width: 20 },
      { header: "Account Number", key: "salaryAccountNumber", width: 18 },
      { header: "Status", key: "status", width: 12 },
      { header: "Created Date", key: "createdAt", width: 18 },
    ];

    data.forEach((lead, index) => {
      ws.addRow({
        serialNumber: index + 1,
        leadName: lead.leadName,
        phoneNumber: lead.phoneNumber,
        ippisNumber: lead.ippisNumber,
        state: lead.state,
        salaryBankName: lead.salaryBankName,
        salaryAccountNumber: lead.salaryAccountNumber,
        status: lead.status,
        createdAt: new Date(lead.createdAt).toLocaleDateString(),
      });
    });

    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6E6E6" },
    };

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
    const fileName = `Ambassador_Leads_${ambassador.fullName.replace(
      / /g,
      "_"
    )}_${formattedDate.replace(/ /g, "_")}_${formattedTime.replace(
      /:/g,
      "-"
    )}.xlsx`;
    saveAs(new Blob([buf]), fileName);
  };

  // Status options and colors
  const statusOptions = [
    { name: "Initiated", uid: "INITIATED" },
    { name: "Converted", uid: "CONVERTED" },
    { name: "Disbursed", uid: "DISBURSED" },
    { name: "Rejected", uid: "REJECTED" },
  ];

  const statusColorMap: Record<string, any> = {
    INITIATED: "warning",
    CONVERTED: "success",
    DISBURSED: "primary",
    REJECTED: "danger",
  };

  const getStatusColor = (status: string) => {
    return statusColorMap[status] || "default";
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedLead || !selectedStatus) return;

    setIsUpdating(true);
    try {
      await updateLeadStatus(ambassadorId, selectedLead.id, selectedStatus);
      showToast({
        type: "success",
        message: "Lead status updated successfully",
        duration: 3000,
      });
      mutate();
      onStatusClose();
    } catch (error: any) {
      showToast({
        type: "error",
        message:
          error?.response?.data?.message || "Failed to update lead status",
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle telemarketer assignment
  const handleTelemarketerAssignment = async () => {
    if (!selectedLead || !selectedTelemarketer) return;

    setIsUpdating(true);
    try {
      await assignTelemarketerToLead(
        ambassadorId,
        selectedLead.id,
        selectedTelemarketer
      );
      showToast({
        type: "success",
        message: "Telemarketer assigned successfully",
        duration: 3000,
      });
      mutate();
      onTelemarketerClose();
    } catch (error: any) {
      showToast({
        type: "error",
        message:
          error?.response?.data?.message || "Failed to assign telemarketer",
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Render table cells
  const renderCell = (lead: Lead, key: string) => {
    switch (key) {
      case "serialNumber":
        const index = sortedLeads.indexOf(lead);
        return (
          <span className="text-sm">
            {(currentPage - 1) * rowsPerPage + index + 1}
          </span>
        );

      case "lead":
        return (
          <div>
            <p className="font-medium text-sm">{lead.leadName}</p>
            <p className="text-xs text-gray-500">{lead.ippisNumber}</p>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3 h-3 text-gray-400" />
              <span>{lead.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span>{lead.state}</span>
            </div>
          </div>
        );

      case "banking":
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-3 h-3 text-gray-400" />
              <span className="truncate max-w-24">{lead.salaryBankName}</span>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              {lead.salaryAccountNumber}
            </p>
          </div>
        );

      case "telemarketer":
        if (lead.ambassador?.teleMarketer) {
          return (
            <div className="text-sm">
              <p className="font-medium">
                {lead.ambassador.teleMarketer.firstname}{" "}
                {lead.ambassador.teleMarketer.lastname}
              </p>
              <p className="text-gray-500 text-xs">
                {lead.ambassador.teleMarketer.email}
              </p>
            </div>
          );
        }
        return <span className="text-gray-400 text-sm">Unassigned</span>;

      case "status":
        return (
          <Chip
            className="capitalize"
            color={getStatusColor(lead.status)}
            size="sm"
            variant="flat"
          >
            {lead.status.toLowerCase()}
          </Chip>
        );

      case "createdAt":
        return (
          <span className="text-sm">
            {new Date(lead.createdAt).toLocaleDateString()}
          </span>
        );

      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Lead actions">
              <DropdownItem
                key="status"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => {
                  setSelectedLead(lead);
                  setSelectedStatus(lead.status);
                  onStatusOpen();
                }}
              >
                Update Status
              </DropdownItem>
              <DropdownItem
                key="assign"
                startContent={<UserCheck className="w-4 h-4" />}
                onPress={() => {
                  setSelectedLead(lead);
                  setSelectedTelemarketer(lead.teleMarketerId || "");
                  onTelemarketerOpen();
                }}
              >
                Assign Telemarketer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );

      default:
        return <span className="text-sm">{(lead as any)[key] || "N/A"}</span>;
    }
  };

  const columns: ColumnDef[] = [
    { name: "S/N", uid: "serialNumber" },
    { name: "Lead", uid: "lead", sortable: true },
    { name: "Contact", uid: "contact" },
    { name: "Banking", uid: "banking" },
    { name: "Telemarketer", uid: "telemarketer" },
    { name: "Status", uid: "status", sortable: true },
    { name: "Created", uid: "createdAt", sortable: true },
    { name: "Actions", uid: "actions" },
  ];

  if (ambassadorLoading || leadsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (ambassadorError || leadsError || !ambassador) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading ambassador details</p>
          <Button
            color="primary"
            onPress={() => router.back()}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-50">
      {/* Header */}
      <div className="bg-white border-b border-default-200">
        <div className="py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3">
                <Avatar
                  isBordered
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    ambassador.fullName
                  )}&background=0ea5e9&color=fff`}
                  alt={ambassador.fullName}
                  className="w-12 h-12 cursor-pointer border-2 border-default-200"
                  onClick={onImageOpen}
                  color="primary"
                />
                <ImagePreviewModal
                  isOpen={isImageOpen}
                  onClose={onImageClose}
                  imageUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    ambassador.fullName
                  )}&background=0ea5e9&color=fff`}
                  title={ambassador.fullName}
                  alt={`${ambassador.fullName} - Full preview`}
                />
                <div>
                  <h1 className="text-xl font-bold text-default-900">
                    {ambassador.fullName}
                  </h1>
                  <p className="text-sm text-default-500">
                    {ambassador.institution}
                  </p>
                </div>
              </div>
            </div>
            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="flat"
                color="primary"
                size="sm"
                startContent={<ArrowLeft className="w-4 h-4" />}
                onPress={() => router.back()}
              >
                Go Back
              </Button>
            </div>
            {/* Action Buttons - Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="flat"
                color="primary"
                size="sm"
                isIconOnly
                onPress={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Statistics Cards */}
      <div className="px-4 py-6 bg-default-50">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Leads</p>
                <p className="text-2xl font-bold text-default-900">
                  {stats.totalLeads}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Target className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-default-500">Initiated</p>
                <p className="text-2xl font-bold text-default-900">
                  {stats.initiated}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-default-500">Converted</p>
                <p className="text-2xl font-bold text-default-900">
                  {stats.converted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-default-500">Disbursed</p>
                <p className="text-2xl font-bold text-default-900">
                  {stats.disbursed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-danger-100 rounded-lg">
                <Users className="w-6 h-6 text-danger" />
              </div>
              <div>
                <p className="text-sm text-default-500">Rejected</p>
                <p className="text-2xl font-bold text-default-900">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-default-500">Conversion Rate</p>
                <p className="text-2xl font-bold text-default-900">
                  {stats.conversionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="space-y-6">
          {/* Ambassador Info Card */}
          <InfoCard
            title="Ambassador Information"
            icon={<UserCheck className="w-5 h-5 text-primary" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField
                label="Full Name"
                value={ambassador.fullName}
                copyable
              />
              <InfoField
                label="Phone Number"
                value={ambassador.phoneNumber}
                copyable
                endComponent={<Phone className="w-4 h-4 text-gray-400" />}
              />
              <InfoField
                label="Email Address"
                value={ambassador.emailAddress}
                copyable
                endComponent={<Mail className="w-4 h-4 text-gray-400" />}
              />
              <InfoField
                label="Institution"
                value={ambassador.institution}
                endComponent={<Building className="w-4 h-4 text-gray-400" />}
              />
              <InfoField
                label="IPPIS Number"
                value={ambassador.ippisNumber}
                copyable
              />
              <InfoField
                label="State"
                value={ambassador.state}
                endComponent={<MapPin className="w-4 h-4 text-gray-400" />}
              />
              <InfoField
                label="Bank Name"
                value={ambassador.salaryBankName}
                endComponent={<Building className="w-4 h-4 text-gray-400" />}
              />
              <InfoField
                label="Account Number"
                value={ambassador.salaryAccountNumber}
                copyable
              />
              <InfoField
                label="Member Since"
                value={new Date(ambassador.createdAt).toLocaleDateString()}
              />
            </div>

            {/* Telemarketer Section */}
            <div className="mt-6">
              <h4 className="text-md font-semibold text-default-900 mb-3">
                Assigned Telemarketer
              </h4>
              {ambassador.teleMarketer ? (
                <div className="bg-success-50 rounded-lg p-4 border border-success-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoField
                      label="Name"
                      value={`${ambassador.teleMarketer.firstname} ${ambassador.teleMarketer.lastname}`}
                      className="bg-white"
                    />
                    <InfoField
                      label="Email"
                      value={ambassador.teleMarketer.email}
                      copyable
                      className="bg-white"
                    />
                    <InfoField
                      label="Phone"
                      value={ambassador.teleMarketer.phoneNumber}
                      copyable
                      className="bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-warning-50 rounded-lg p-4 border border-warning-200">
                  <p className="text-warning-700 font-medium">
                    No telemarketer assigned
                  </p>
                  <p className="text-warning-600 text-sm">
                    This ambassador has not been assigned to a telemarketer yet.
                  </p>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Ambassador Leads */}
          <InfoCard
            title="Ambassador Leads"
            icon={<Users className="w-5 h-5 text-primary" />}
            headerContent={
              <div className="text-sm text-gray-500">
                {filteredLeads.length} of {leads.length} leads
              </div>
            }
          >
            <GenericTable<Lead>
              columns={columns}
              data={sortedLeads}
              allCount={filteredLeads.length}
              exportData={filteredLeads}
              isLoading={leadsLoading}
              filterValue={searchTerm}
              onFilterChange={(v) => {
                setSearchTerm(v);
                setCurrentPage(1);
              }}
              statusOptions={statusOptions}
              statusFilter={statusFilter}
              onStatusChange={(keys) => {
                setStatusFilter(new Set(keys));
                setCurrentPage(1);
              }}
              statusColorMap={statusColorMap}
              showStatus={true}
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
              page={currentPage}
              pages={pages}
              onPageChange={setCurrentPage}
              exportFn={exportLeads}
              renderCell={renderCell}
              hasNoRecords={
                !leadsLoading && !leadsError && filteredLeads.length === 0
              }
            />
          </InfoCard>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal isOpen={isStatusOpen} onClose={onStatusClose} size="md">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Update Lead Status</h3>
          </ModalHeader>
          <ModalBody>
            {selectedLead && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{selectedLead.leadName}</p>
                  <p className="text-sm text-gray-500">
                    {selectedLead.phoneNumber}
                  </p>
                </div>
                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={selectedStatus ? [selectedStatus] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSelectedStatus(selected);
                  }}
                >
                  {statusOptions.map((status) => (
                    <SelectItem key={status.uid} value={status.uid}>
                      {status.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={onStatusClose}
              isDisabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleStatusUpdate}
              isLoading={isUpdating}
              isDisabled={!selectedStatus}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Telemarketer Assignment Modal */}
      <Modal
        isOpen={isTelemarketerOpen}
        onClose={onTelemarketerClose}
        size="md"
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Assign Telemarketer</h3>
          </ModalHeader>
          <ModalBody>
            {selectedLead && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{selectedLead.leadName}</p>
                  <p className="text-sm text-gray-500">
                    {selectedLead.phoneNumber}
                  </p>
                </div>
                <Select
                  label="Telemarketer"
                  placeholder="Select telemarketer"
                  selectedKeys={
                    selectedTelemarketer ? [selectedTelemarketer] : []
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSelectedTelemarketer(selected);
                  }}
                >
                  {telemarketers.map((tm: any) => (
                    <SelectItem
                      key={tm.teleMarketerId}
                      value={tm.teleMarketerId}
                    >
                      {tm.firstname} {tm.lastname} - {tm.email}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={onTelemarketerClose}
              isDisabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleTelemarketerAssignment}
              isLoading={isUpdating}
              isDisabled={!selectedTelemarketer}
            >
              Assign Telemarketer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AmbassadorDetailView;
