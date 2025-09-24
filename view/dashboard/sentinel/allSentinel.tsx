"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { capitalize, getAllCustomerRecord } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, SortDescriptor, ChipProps } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";


const columns: ColumnDef[] = [
  { name: "Store Name", uid: "storeName" },
  { name: "Customer Id", uid: "customerId", sortable: true },
  { name: "Loan ID", uid: "loanRecordId", sortable: true },
  { name: "Name", uid: "fullName", sortable: true },
  { name: "Phone Number", uid: "bvnPhoneNumber" },
  { name: "Device IMEI", uid: "deviceImei" },
  { name: "Sentinel Type", uid: "sentinelType" },
  { name: "Sentinel Price", uid: "sentinelPrice" },
  { name: "Region", uid: "region" },
  { name: "State", uid: "state" },
  { name: "Registration Date", uid: "registrationDate" },
  { name: "Actions", uid: "actions" },
];

// Define all columns for export
const exportColumns: ColumnDef[] = [
  { name: "Store Name", uid: "storeName" },
  { name: "Customer Id", uid: "customerId", sortable: true },
  { name: "Loan ID", uid: "loanRecordId", sortable: true },
  { name: "Name", uid: "fullName", sortable: true },
  { name: "Phone Number", uid: "bvnPhoneNumber" },
  { name: "Email", uid: "email" },
  { name: "contact Address", uid: "contactAddress" },
  { name: "Device Name", uid: "deviceName" },
  { name: "Device IMEI", uid: "deviceImei" },
  { name: "Sentinel Type", uid: "sentinelType" },
  { name: "Sentinel Price", uid: "sentinelPrice" },
  { name: "Payment Type", uid: "paymentType" },
  { name: "Cluster", uid: "cluster" },
  { name: "Cluster supervisor", uid: "clusterSupervisor" },
  { name: "Region", uid: "region" },
  { name: "State", uid: "state" },
  { name: "Partner", uid: "partner" },
  { name: "Sales Rep", uid: "salesRep" },
  { name: "Registration Date", uid: "registrationDate" },
  { name: "Activation Date", uid: "activationDate" },
  { name: "Expiration Date", uid: "expirationDate" },
];

const statusOptions = [
  { name: "Pending", uid: "pending" },
  { name: "Approved", uid: "approved" },
  { name: "Rejected", uid: "rejected" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

type CustomerRecord = {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  bvn: string;
  dob: string;
  dobMisMatch: boolean;
  createdAt: string;
  updatedAt: string;
  customerLoanDiskId: string;
  channel: string;
  bvnPhoneNumber: string;
  mainPhoneNumber: string;
  mbeId: string;
  monoCustomerConnectedCustomerId: string;
  fullName?: string;
  age?: number;
  status?: string;
  Wallet?: {
    wallet_id: string;
    accountNumber: string;
    bankName: string;
    dva_id: number;
    accountName: string;
    bankId: number;
    currency: string;
    cust_code: string;
    cust_id: number;
    userId: string;
    created_at: string;
    updated_at: string;
    customerId: string;
  };
  WalletBalance?: {
    balanceId: string;
    userId: string;
    balance: number;
    lastBalance: number;
    created_at: string;
    updated_at: string;
    customerId: string;
  };
  TransactionHistory?: Array<{
    transactionHistoryId: string;
    amount: number;
    paymentType: string;
    prevBalance: number;
    newBalance: number;
    paymentReference: string;
    extRef: string;
    currency: string;
    channel: string;
    charge: number;
    chargeNarration: string;
    senderBank: string;
    senderAccount: string;
    recieverBank: string;
    recieverAccount: string;
    paymentDescription: string;
    paid_at: string;
    createdAt: string;
    updatedAt: string;
    userid: string;
    customersCustomerId: string;
  }>;
  CustomerKYC?: Array<{
    kycId: string;
    customerId: string;
    phone2: string;
    phone3: string;
    houseNumber: string;
    streetAddress: string;
    nearestBusStop: string;
    localGovernment: string;
    state: string;
    town: string;
    occupation: string;
    businessName: string;
    applicantBusinessAddress: string;
    applicantAddress: string;
    source: string;
    createdAt: string;
    updatedAt: string;
    status2Comment: string | null;
    status3Comment: string | null;
    channel: string;
    phone2Status: string;
    phone3Status: string;
  }>;
  CustomerAccountDetails?: Array<{
    customerAccountDetailsId: string;
    customerId: string;
    accountNumber: string;
    bankCode: string;
    channel: string;
    createdAt: string;
    updatedAt: string;
    bankID: number;
    bankName: string;
  }>;
  CustomerMandate?: Array<{
    customerMandateId: string;
    customerId: string;
    mandateId: string;
    status: string;
    monoCustomerId: string;
    mandate_type: string;
    debit_type: string;
    ready_to_debit: boolean;
    approved: boolean;
    start_date: string;
    end_date: string;
    reference: string;
    channel: string;
    createdAt: string;
    updatedAt: string;
    message: string;
  }>;
  LoanRecord?: Array<{
    loanRecordId: string;
    customerId: string;
    loanDiskId: string;
    lastPoint: string;
    channel: string;
    loanStatus: string;
    createdAt: string;
    updatedAt: string;
    loanAmount: number;
    deviceId: string;
    downPayment: number;
    insurancePackage: string;
    insurancePrice: number;
    mbsEligibleAmount: number;
    payFrequency: string;
    storeId: string;
    devicePrice: number;
    deviceAmount: number;
    monthlyRepayment: number;
    duration: number;
    interestAmount: number;
    deviceName: string;
    LoanRecordCard: any[];
    store: {
      storeOldId: number;
      storeName: string;
      city: string;
      state: string;
      region: string | null;
      address: string;
      accountNumber: string;
      accountName: string;
      bankName: string;
      bankCode: string;
      phoneNumber: string;
      storeEmail: string;
      longitude: number;
      latitude: number;
      clusterId: number;
      partner: string;
      storeOpen: string;
      storeClose: string;
      createdAt: string;
      updatedAt: string;
      storeId: string;
    };
    device: {
      price: number;
      deviceModelNumber: string;
      SAP: number;
      SLD: number;
      createdAt: string;
      deviceManufacturer: string;
      deviceName: string;
      deviceRam: string | null;
      deviceScreen: string | null;
      deviceStorage: string | null;
      imageLink: string;
      newDeviceId: string;
      oldDeviceId: string;
      sentiprotect: number;
      updatedAt: string;
      deviceType: string;
      deviceCamera: any[];
      android_go: string;
    };
    StoresOnLoan: Array<{
      storeOnLoanId: string;
      storeId: string;
      loanRecordId: string;
      amount: number;
      status: string;
      createdAt: string;
      updatedAt: string;
      channel: string;
    }>;
    DeviceOnLoan: Array<{
      deviceOnLoanId: string;
      deviceId: string;
      loanRecordId: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      channel: string;
      imei: string | null;
      amount: number;
      devicePrice: number;
    }>;
  }>;
  regBy: {
    title: string;
    createdAt: string;
    mbeId: string;
    mbe_old_id: string;
    updatedAt: string;
    firstname: string;
    lastname: string;
    phone: string;
    state: string | null;
    username: string;
    accountStatus: string;
    assignedStoreBranch: string | null;
    bvn: string | null;
    bvnPhoneNumber: string | null;
    channel: string | null;
    dob: string | null;
    email: string | null;
    isActive: boolean;
    otp: string | null;
    otpExpiry: string | null;
    password: string | null;
    role: string;
    tokenVersion: number;
    stores: Array<{
      id: string;
      mbeOldId: string;
      storeOldId: number;
      mbeId: string | null;
      storeId: string | null;
      store: {
        storeOldId: number;
        storeName: string;
        city: string;
        state: string;
        region: string;
        address: string;
        accountNumber: string;
        accountName: string;
        bankName: string;
        bankCode: string;
        phoneNumber: string;
        storeEmail: string;
        longitude: number;
        latitude: number;
        clusterId: number;
        partner: string;
        storeOpen: string;
        storeClose: string;
        createdAt: string;
        updatedAt: string;
        storeId: string;
      };
    }>;
  };
  MonoCustomer?: {
    customerId: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    name: string;
    connectedCustomerId: string;
    monourl: string;
    tempAccountId: string | null;
    CustomerAccounts: any[];
  };
  CustomerDropOffLog?: Array<{
    dropOffLogId: string;
    screenTime: string;
    apiResponseTime: string;
    customerId: string;
    createdAt: string;
    updatedAt: string;
    channel: string;
    screenName: string;
  }>;
};

export default function AllSentinelPage() {
  const router = useRouter();
  const pathname = usePathname();
  // Get the role from the URL path (e.g., /access/dev/customers -> dev)
  const role = pathname.split('/')[2];
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
    startDate && endDate ? ["sentinel-data", startDate, endDate] : "sentinel-data",
    () => getAllCustomerRecord(startDate, endDate)
      .then((r) => {
        if (!r.data || r.data.length === 0) {
          setHasNoRecords(true);
          return [];
        }
        setHasNoRecords(false);
        return r.data;
      })
      .catch((error) => {
        console.error("Error fetching sentinel data:", error);
        setHasNoRecords(true);
        return [];
      }),
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
      refreshInterval: 60000,
      shouldRetryOnError: false,
      keepPreviousData: true,
      revalidateIfStale: true
    }
  );

  const customers = useMemo(
    () =>
      raw.map((r: CustomerRecord) => {
        return {
          ...r,
          storeName: r.LoanRecord?.[0]?.store?.storeName || 'N/A',
          fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
          contactAddress: r.CustomerKYC?.[0]?.applicantAddress || 'N/A',
          deviceName: r.LoanRecord?.[0]?.deviceName || 'N/A',
          deviceImei: r.LoanRecord?.[0]?.DeviceOnLoan?.[0]?.imei || 'N/A',
          devicePrice: r.LoanRecord?.[0]?.devicePrice ? `₦${r.LoanRecord[0].devicePrice.toLocaleString()}` : 'N/A',
          sentinelType: r.LoanRecord?.[0]?.insurancePackage || 'N/A',
          sentinelPrice: r.LoanRecord?.[0]?.insurancePrice ? `₦${r.LoanRecord[0].insurancePrice.toLocaleString()}` : 'N/A',
          paymentType: "Online",
          cluster: r.LoanRecord?.[0]?.store?.clusterId || 'N/A',
          // clusterSupervisor: r.LoanRecord?.[0]?.store?.clusterSupervisor || 'N/A',
          region: r.LoanRecord?.[0]?.store?.region || 'N/A',
          state: r.LoanRecord?.[0]?.store?.state || 'N/A',
          partner: r.LoanRecord?.[0]?.store?.partner || 'N/A',
          salesRep: r.regBy?.firstname + ' ' + r.regBy?.lastname || 'N/A',
          registrationDate: r.LoanRecord?.[0]?.createdAt ? new Date(r.LoanRecord[0].createdAt).toLocaleDateString('en-GB') : 'N/A',
          activationDate: r.LoanRecord?.[0]?.updatedAt ? new Date(r.LoanRecord[0].createdAt).toLocaleDateString('en-GB') : 'N/A',
          expirationDate: r.LoanRecord?.[0]?.createdAt ? new Date(new Date(r.LoanRecord[0].createdAt).setFullYear(new Date(r.LoanRecord[0].createdAt).getFullYear() + 1)).toLocaleDateString('en-GB') : 'N/A',
        };
      }),
    [raw]
  );

  const filtered = useMemo(() => {
    let list = [...customers];
    // Filter for approved loan status and specific insurance packages
    list = list.filter((c) =>
      c.LoanRecord?.[0]?.loanStatus === 'APPROVED' &&
      (c.LoanRecord[0]?.insurancePackage === 'SAP' || c.LoanRecord[0]?.insurancePackage === 'SLD')
    );

    if (filterValue) {
      const f = filterValue.toLowerCase();
      list = list.filter((c) =>
        c.fullName.toLowerCase().includes(f) ||
        c.email.toLowerCase().includes(f) ||
        c.bvnPhoneNumber?.toLowerCase().includes(f) ||
        c.customerId.toLowerCase().includes(f) ||
        (c.bvn && c.bvn.toString().toLowerCase().includes(f)) ||
        c.LoanRecord?.[0]?.storeId?.toLowerCase().includes(f) ||
        c.deviceImei?.toLowerCase().includes(f)
      );
    }
    if (statusFilter.size > 0) {
      list = list.filter((c) => statusFilter.has(c.status || ''));
    }
    return list;
  }, [customers, filterValue, statusFilter]);

  const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const sorted = React.useMemo(() => {
    return [...paged].sort((a, b) => {
      const aVal = a[sortDescriptor.column as keyof CustomerRecord];
      const bVal = b[sortDescriptor.column as keyof CustomerRecord];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paged, sortDescriptor]);

  // Export all filtered
  const exportFn = async (data: CustomerRecord[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Customers");
    ws.columns = exportColumns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
    data.forEach((r) => ws.addRow({ ...r, status: capitalize(r.status || '') }));
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), "Customer_Records.xlsx");
  };

  // Render each cell, including actions dropdown:
  const renderCell = (row: CustomerRecord, key: string) => {
    if (key === "actions") {
      return (
        <div className="flex justify-end">
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                size="sm"
                variant="light">
                <EllipsisVertical className="text-default-300" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="view"
                onPress={() => router.push(`/access/${role}/customers/${row.customerId}`)}>
                View
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    }
    if (key === "status") {
      return (
        <Chip
          className="capitalize"
          color={statusColorMap[row.status || '']}
          size="sm"
          variant="flat">
          {capitalize(row.status || '')}
        </Chip>
      );
    }
    if (key === "fullName") {
      return <div className="capitalize cursor-pointer" onClick={() => router.push(`/access/${role}/customers/${row.customerId}`)}>{(row as any)[key]}</div>;
    }
    return <div className="text-small cursor-pointer" onClick={() => router.push(`/access/${role}/customers/${row.customerId}`)}>{(row as any)[key]}</div>;
  };

  return (
    <>
      <div className="mb-4 flex justify-center md:justify-end">
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={10} />
      ) : (
        <GenericTable<CustomerRecord>
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
