"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Button, Chip, Snippet } from "@heroui/react";
import { ArrowLeft, ChevronDown, ChevronUp, Store, MapPin, Clock, CreditCard, Smartphone, User, Calendar, Activity, FileText, Eye, History } from "lucide-react";
import {
  getStoreRecordById,
  AuditApprovalforStoreDetails,
  showToast,
  useAuth,
} from "@/lib";

// Store Record Type
type StoreRecord = {
  store: {
    storeId: string;
    storeName: string;
    storeOldId: number;
    status: string;
    isArchived: boolean;
    city: string;
    state: string;
    region: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    storeEmail: string;
    phoneNumber: string;
    address: string;
    partner: string;
    storeOpen: string;
    storeClose: string;
    longitude: number;
    latitude: number;
    clusterId: number;
    storeErpId: string | null;
    channel: string | null;
    createdAt: string;
    updatedAt: string;
  };
  auditLogs: Array<{
    user: {
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      createdAt: string;
      updatedAt: string;
    };
    action: string;
    previousData: {
      city: string;
      state: string;
      region: string;
      status: string;
      address: string;
      channel: string | null;
      partner: string;
      storeId: string;
      bankCode: string;
      bankName: string;
      latitude: number;
      clusterId: number;
      createdAt: string;
      longitude: number;
      storeName: string;
      storeOpen: string;
      updatedAt: string;
      isArchived: boolean;
      storeClose: string;
      storeEmail: string;
      storeErpId: string | null;
      storeOldId: number;
      accountName: string;
      phoneNumber: string;
      accountNumber: string;
    };
    newData: {
      city: string;
      state: string;
      region: string;
      status: string;
      address: string;
      channel: string | null;
      partner: string;
      storeId: string;
      bankCode: string;
      bankName: string;
      latitude: number;
      clusterId: number;
      createdAt: string;
      longitude: number;
      storeName: string;
      storeOpen: string;
      updatedAt: string;
      isArchived: boolean;
      storeClose: string;
      storeEmail: string;
      storeErpId: string | null;
      storeOldId: number;
      accountName: string;
      phoneNumber: string;
      accountNumber: string;
    };
    changes: {
      city: string;
      state: string;
      region: string;
      address: string;
      partner: string;
      storeId: string;
      bankCode: string;
      bankName: string;
      latitude: number;
      clusterId: number;
      longitude: number;
      storeName: string;
      storeOpen: string;
      storeClose: string;
      storeEmail: string;
      accountName: string;
      phoneNumber: string;
      accountNumber: string;
    };
    createdAt: string;
  }>;
};

// Utility Components
const InfoCard = ({
  title,
  children,
  className = "",
  icon,
  collapsible = false,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!collapsible) {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}
      >
        <div className="p-4 border-b border-default-200 bg-gradient-to-r from-default-50 to-default-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-default-900">{title}</h3>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    );
  }
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}
    >
      <div
        className="p-4 border-b border-default-200 bg-gradient-to-r from-default-50 to-default-100 cursor-pointer hover:bg-default-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-default-900">{title}</h3>
          </div>
          <Button
            variant="light"
            size="sm"
            isIconOnly
            className="text-default-500 hover:bg-white/50"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? "max-h-none opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const InfoField = ({
  label,
  value,
  endComponent,
  copyable = false,
}: {
  label: string;
  value?: string | null;
  endComponent?: React.ReactNode;
  copyable?: boolean;
}) => (
  <div className="bg-gradient-to-r from-default-50 to-default-100 rounded-lg p-4 border border-default-200 hover:shadow-sm transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-medium text-default-600">{label}</div>
      {endComponent}
    </div>
    <div className="font-semibold text-default-900 flex items-center gap-2">
      <span className="bg-white px-3 py-2 rounded-lg border border-default-200 flex-1">
        {value || "N/A"}
      </span>
      {copyable && value && (
        <Snippet
          codeString={value}
          className="p-0"
          size="sm"
          hideSymbol
          hideCopyButton={false}
        />
      )}
    </div>
  </div>
);

const EmptyState = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <div className="text-center py-8">
    <div className="flex justify-center mb-4">
      <div className="p-3 bg-default-100 rounded-full">{icon}</div>
    </div>
    <h3 className="text-lg font-semibold text-default-900 mb-2">{title}</h3>
    <p className="text-default-500 text-sm">{description}</p>
  </div>
);

export default function SingleStoreView() {
  const router = useRouter();
  const pathname = usePathname();
  // Get the role from the URL path (e.g., /access/finance/stores -> finance)
  const role = pathname.split("/")[2];

  const { userResponse } = useAuth();
  const userEmail = userResponse?.data?.email || "";


  const params = useParams();

  const [store, setStore] = useState<StoreRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const fetchStore = async () => {
      if (!params.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getStoreRecordById(params.id as string);
        
        if (response && response.data) {
          setStore(response.data);
        } else {
          showToast({
            type: "error",
            message: "Store not found",
            duration: 5000,
          });
        }
      } catch (error: any) {
        console.error("Error fetching store:", error);
        showToast({
          type: "error",
          message: error.message || "Failed to fetch store data",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [params.id]);

  console.log(store);

  const handleApproveStore = async () => {
    try {
      setIsLoading(true);
       await AuditApprovalforStoreDetails(store?.store.storeId || "", "APPROVED");
      showToast({
        type: "success",
        message: "Store approved successfully",
        duration: 5000,
      });
      router.push(`/access/${role}/stores`);
    } catch (error: any) {
        console.error("Error approving store:", error);
      showToast({
        type: "error",
        message: error.message || "Failed to approve store",
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-default-900 mb-2">
            Store Not Found
          </h2>
          <p className="text-default-500 mb-4">
            The requested store information could not be found.
          </p>
          <Button
            variant="flat"
            color="primary"
            startContent={<ArrowLeft />}
            onPress={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-50">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-default-200">
        <div className="py-8 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-default-900 mb-1">
                    {store.store.storeName}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-default-600">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      ID: {store.store.storeId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created: {store.store.createdAt ? new Date(store.store.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Chip
                  color={store.store.status === "ACTIVE" ? "success" : "warning"}
                  variant="flat"
                  className="font-medium"
                  startContent={<Activity className="w-3 h-3" />}
                >
                  {store.store.status || "INACTIVE"}
                </Chip>
                {store.store.isArchived && (
                  <Chip
                    color="danger"
                    variant="flat"
                    size="sm"
                    className="font-medium"
                    startContent={<Eye className="w-3 h-3" />}
                  >
                    Archived
                  </Chip>
                )}
              </div>
              <Button
                color="primary"
                variant="solid"
                size="sm"
                startContent={<Store className="w-4 h-4" />}
                onPress={handleApproveStore}
                isLoading={isLoading}
              >
                Approve Store
              </Button>
            </div>
          </div>
        </div>
      </div>

            <div className="px-6 py-8">
        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-default-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-default-500">Store Status</p>
                <p className="text-lg font-semibold text-default-900">{store.store.status}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-default-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-default-500">Location</p>
                <p className="text-lg font-semibold text-default-900">{store.store.city}, {store.store.state}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-default-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-default-500">Operating Hours</p>
                <p className="text-lg font-semibold text-default-900">
                  {store.store.storeOpen && store.store.storeClose ? `${store.store.storeOpen} - ${store.store.storeClose}` : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-default-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <History className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-default-500">Audit Logs</p>
                <p className="text-lg font-semibold text-default-900">{store.auditLogs?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     {/* Left Column - Store Information */}
            <div className="lg:col-span-1 space-y-8">
                           {/* Basic Store Information */}
              <InfoCard
                title="Store Information"
                icon={<Store className="w-5 h-5 text-default-600" />}
                collapsible={true}
                defaultExpanded={false}
              >
               <div className="p-4">
                 <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                   <InfoField
                     label="Store ID"
                     value={store.store.storeId}
                     copyable
                   />
                   <InfoField
                     label="Store Name"
                     value={store.store.storeName}
                   />
                   <InfoField label="Store Email" value={store.store.storeEmail} />
                   <InfoField label="Phone Number" value={store.store.phoneNumber} />
                   <InfoField label="Partner" value={store.store.partner} />
                   <InfoField label="Status" value={store.store.status} />
                   <InfoField label="Created At" value={store.store.createdAt ? new Date(store.store.createdAt).toLocaleString() : "N/A"} />
                   <InfoField label="Updated At" value={store.store.updatedAt ? new Date(store.store.updatedAt).toLocaleString() : "N/A"} />
                 </div>
               </div>
             </InfoCard>

             

                           {/* Operating Hours */}
              <InfoCard
                title="Operating Hours"
                icon={<Clock className="w-5 h-5 text-default-600" />}
                collapsible={true}
                defaultExpanded={false}
              >
               <div className="p-4">
                 <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                   <InfoField label="Store Open" value={store.store.storeOpen} />
                   <InfoField label="Store Close" value={store.store.storeClose} />
                   <InfoField 
                     label="Operating Hours" 
                     value={store.store.storeOpen && store.store.storeClose ? `${store.store.storeOpen} - ${store.store.storeClose}` : "N/A"} 
                   />
                 </div>
               </div>
             </InfoCard>
           </div>

           {/* Right Column - Store Details */}
           <div className="lg:col-span-2 space-y-8">
                           {/* Location Information */}
                           <InfoCard
                title="Location Information"
                icon={<MapPin className="w-5 h-5 text-default-600" />}
                collapsible={true}
                defaultExpanded={false}
              >
               <div className="p-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <InfoField label="Address" value={store.store.address} />
                   <InfoField label="City" value={store.store.city} />
                   <InfoField label="State" value={store.store.state} />
                   <InfoField label="Region" value={store.store.region} />
                   <InfoField label="Longitude" value={store.store.longitude?.toString()} />
                   <InfoField label="Latitude" value={store.store.latitude?.toString()} />
                   <InfoField label="Cluster ID" value={store.store.clusterId?.toString()} />
                 </div>
               </div>
             </InfoCard>

                           {/* Banking Information */}
              <InfoCard
                title="Banking Information"
                icon={<CreditCard className="w-5 h-5 text-default-600" />}
                collapsible={true}
                defaultExpanded={false}
              >
               <div className="p-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <InfoField label="Bank Name" value={store.store.bankName} />
                   <InfoField label="Bank Code" value={store.store.bankCode} />
                   <InfoField label="Account Number" value={store.store.accountNumber} copyable />
                   <InfoField label="Account Name" value={store.store.accountName} />
                 </div>
               </div>
             </InfoCard>

             {/* Enhanced Audit History */}
             <InfoCard
               title="Audit History"
               icon={<History className="w-5 h-5 text-default-600" />}
               collapsible={true}
               defaultExpanded={false}
             >
               <div className="p-6">
                 {store.auditLogs && store.auditLogs.length > 0 ? (
                   <div className="space-y-6">
                     {/* Summary Stats */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                       <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                         <div className="flex items-center gap-2 mb-2">
                           <Activity className="w-4 h-4 text-blue-600" />
                           <span className="text-sm font-medium text-blue-700">Total Actions</span>
                         </div>
                         <div className="text-2xl font-bold text-blue-900">{store.auditLogs.length}</div>
                       </div>
                       <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                         <div className="flex items-center gap-2 mb-2">
                           <User className="w-4 h-4 text-green-600" />
                           <span className="text-sm font-medium text-green-700">Unique Users</span>
                         </div>
                         <div className="text-2xl font-bold text-green-900">
                           {new Set(store.auditLogs.map(log => log.user.userId)).size}
                         </div>
                       </div>
                       <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                         <div className="flex items-center gap-2 mb-2">
                           <Calendar className="w-4 h-4 text-purple-600" />
                           <span className="text-sm font-medium text-purple-700">Last Updated</span>
                         </div>
                         <div className="text-sm font-bold text-purple-900">
                           {store.auditLogs[0] ? new Date(store.auditLogs[0].createdAt).toLocaleDateString() : "N/A"}
                         </div>
                       </div>
                     </div>

                                           {/* Audit Logs */}
                      <div className="space-y-4">
                        {store.auditLogs.map((log, index) => (
                         <div key={index} className="bg-white rounded-xl border border-default-200 shadow-sm hover:shadow-md transition-shadow">
                           {/* Enhanced Header */}
                           <div className="p-4 border-b border-default-100 bg-gradient-to-r from-default-50 to-default-100 rounded-t-xl">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                 <div className="relative">
                                   <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                                     <span className="text-sm font-bold text-primary-700">
                                       {log.user.firstName.charAt(0)}{log.user.lastName.charAt(0)}
                                     </span>
                                   </div>
                                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white flex items-center justify-center">
                                     <div className="w-2 h-2 bg-white rounded-full"></div>
                                   </div>
                                 </div>
                                 <div>
                                   <div className="flex items-center gap-2 mb-1">
                                     <span className="text-sm font-semibold text-default-900">
                                       {log.user.firstName} {log.user.lastName}
                                     </span>
                                     <Chip size="sm" variant="flat" color="primary" className="font-medium">
                                       {log.user.role}
                                     </Chip>
                                   </div>
                                   <div className="flex items-center gap-3 text-xs text-default-500">
                                     <span className="flex items-center gap-1">
                                       <User className="w-3 h-3" />
                                       {log.user.email}
                                     </span>
                                     <span className="flex items-center gap-1">
                                       <Calendar className="w-3 h-3" />
                                       {new Date(log.createdAt).toLocaleDateString()}
                                     </span>
                                     <span className="flex items-center gap-1">
                                       <Clock className="w-3 h-3" />
                                       {new Date(log.createdAt).toLocaleTimeString()}
                                     </span>
                                   </div>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <div className="text-xs text-default-400 mb-1">Action</div>
                                 <Chip 
                                   size="sm" 
                                   variant="flat" 
                                   color="secondary"
                                   className="font-medium"
                                 >
                                   {log.action}
                                 </Chip>
                               </div>
                             </div>
                           </div>

                                                       {/* Essential Audit Information */}
                            <div className="p-4">
                              {/* User Information */}
                              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-semibold text-blue-700">Updated By</span>
                                </div>
                                <div className="text-sm text-blue-800">
                                  <strong>Name:</strong> {log.user.firstName} {log.user.lastName}
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                  <strong>Role:</strong> {log.user.role} • <strong>Date:</strong> {new Date(log.createdAt).toLocaleString()}
                                </div>
                              </div>

                              {/* Key Store Information Changes */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Store Name */}
                                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Store className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-green-700">Store Name</span>
                                  </div>
                                  <div className="text-sm">
                                    <div className="text-green-800">
                                      <strong>Previous:</strong> {log.previousData?.storeName || "N/A"}
                                    </div>
                                    <div className="text-green-900 font-semibold">
                                      <strong>New:</strong> {log.newData?.storeName || "N/A"}
                                    </div>
                                  </div>
                                </div>

                                {/* Account Name */}
                                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-semibold text-purple-700">Account Name</span>
                                  </div>
                                  <div className="text-sm">
                                    <div className="text-purple-800">
                                      <strong>Previous:</strong> {log.previousData?.accountName || "N/A"}
                                    </div>
                                    <div className="text-purple-900 font-semibold">
                                      <strong>New:</strong> {log.newData?.accountName || "N/A"}
                                    </div>
                                  </div>
                                </div>

                                {/* Bank Name */}
                                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm font-semibold text-orange-700">Bank Name</span>
                                  </div>
                                  <div className="text-sm">
                                    <div className="text-orange-800">
                                      <strong>Previous:</strong> {log.previousData?.bankName || "N/A"}
                                    </div>
                                    <div className="text-orange-900 font-semibold">
                                      <strong>New:</strong> {log.newData?.bankName || "N/A"}
                                    </div>
                                  </div>
                                </div>

                                {/* Bank Code */}
                                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-indigo-700">Bank Code</span>
                                  </div>
                                  <div className="text-sm">
                                    <div className="text-indigo-800">
                                      <strong>Previous:</strong> {log.previousData?.bankCode || "N/A"}
                                    </div>
                                    <div className="text-indigo-900 font-semibold">
                                      <strong>New:</strong> {log.newData?.bankCode || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                         </div>
                       ))}
                     </div>
                     
                     {/* All audit logs are now displayed */}
                   </div>
                 ) : (
                   <div className="text-center py-12">
                     <div className="flex justify-center mb-6">
                       <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center">
                         <History className="w-8 h-8 text-default-400" />
                       </div>
                     </div>
                     <h3 className="text-lg font-semibold text-default-900 mb-2">No Audit History</h3>
                     <p className="text-default-500 text-sm max-w-md mx-auto">
                       No audit logs found for this store. Changes will appear here once modifications are made to the store information.
                     </p>
                   </div>
                 )}
               </div>
             </InfoCard>
           </div>
        </div>
      </div>


    </div>
  );
}
