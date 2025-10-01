"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Tabs, Tab } from "@heroui/react";
import { StatCard } from "@/components/atoms/StatCard";
import SimpleTable from "@/components/reususables/custom-ui/SimpleTable";
import useSWR from "swr";

// Mock data fetcher
const fetcher = (url: string) => {
	return Promise.resolve({
		stats: {
			daily: {
				imeiUploaded: 1250,
				imeiVerified: 1100,
				claimsApproved: 45,
				claimsRejected: 12,
				commissionPaid: 450000,
				commissionPending: 120000,
			},
			weekly: {
				imeiUploaded: 8750,
				imeiVerified: 7700,
				claimsApproved: 315,
				claimsRejected: 84,
				commissionPaid: 3150000,
				commissionPending: 840000,
			},
			monthly: {
				imeiUploaded: 35000,
				imeiVerified: 30800,
				claimsApproved: 1260,
				claimsRejected: 336,
				commissionPaid: 12600000,
				commissionPending: 3360000,
			},
		},
		unverifiedImeis: [
			{
				id: "UI001",
				imei: "123456789012345",
				deviceType: "Samsung Galaxy A24",
				uploadDate: "2024-01-15",
				status: "pending_verification",
				uploadedBy: "Admin User",
			},
			{
				id: "UI002",
				imei: "987654321098765",
				deviceType: "Samsung Galaxy S22",
				uploadDate: "2024-01-14",
				status: "pending_verification",
				uploadedBy: "Sub Admin",
			},
		],
		recentUploads: [
			{
				id: "RU001",
				deviceType: "Samsung Galaxy A24",
				fileName: "samsung_a24_batch_1.csv",
				imeiCount: 1500,
				uploadDate: "2024-01-15",
				uploadedBy: "Admin User",
				status: "completed",
			},
			{
				id: "RU002",
				deviceType: "Samsung Galaxy S22",
				fileName: "samsung_s22_batch_2.csv",
				imeiCount: 2200,
				uploadDate: "2024-01-14",
				uploadedBy: "Sub Admin",
				status: "processing",
			},
		],
	});
};

const AdminSamsungPartnersView = () => {
	const [selectedTab, setSelectedTab] = useState("daily");
	const { data, error } = useSWR("/api/admin/samsung-partners/dashboard", fetcher);

	const stats = data?.stats || {};
	const currentStats: any = stats[selectedTab as keyof typeof stats] || {};

	const unverifiedColumns = [
		{
			key: "imei",
			label: "IMEI",
		},
		{
			key: "deviceType",
			label: "Device Type",
		},
		{
			key: "uploadDate",
			label: "Upload Date",
			render: (item: any) => new Date(item.uploadDate).toLocaleDateString(),
		},
		{
			key: "uploadedBy",
			label: "Uploaded By",
		},
		{
			key: "status",
			label: "Status",
			render: (item: any) => (
				<span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
					{item.status.replace('_', ' ').toUpperCase()}
				</span>
			),
		},
	];

	const uploadsColumns = [
		{
			key: "deviceType",
			label: "Device Type",
		},
		{
			key: "fileName",
			label: "File Name",
		},
		{
			key: "imeiCount",
			label: "IMEI Count",
			render: (item: any) => item.imeiCount.toLocaleString(),
		},
		{
			key: "uploadDate",
			label: "Upload Date",
			render: (item: any) => new Date(item.uploadDate).toLocaleDateString(),
		},
		{
			key: "uploadedBy",
			label: "Uploaded By",
		},
		{
			key: "status",
			label: "Status",
			render: (item: any) => {
				const statusColors = {
					completed: "bg-green-100 text-green-800",
					processing: "bg-blue-100 text-blue-800",
					failed: "bg-red-100 text-red-800",
				};
				return (
					<span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[item.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
						{item.status.toUpperCase()}
					</span>
				);
			},
		},
	];

	if (error) {
		return (
			<div className="p-6">
				<div className="text-center py-8">
					<p className="text-red-500">Failed to load dashboard data</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Samsung Partners Admin</h1>
					<p className="text-gray-600 mt-1">Manage Samsung warranty program and partner activities</p>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="space-y-4">
				<Tabs
					selectedKey={selectedTab}
					onSelectionChange={(key) => setSelectedTab(key as string)}
					className="w-full"
				>
					<Tab key="daily" title="Daily Stats">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
							<StatCard
								title="IMEI Uploaded"
								value={currentStats.imeiUploaded?.toLocaleString() || "0"}
								icon={<span>📤</span>}
							/>
							<StatCard
								title="IMEI Verified"
								value={currentStats.imeiVerified?.toLocaleString() || "0"}
								icon={<span>✅</span>}
							/>
							<StatCard
								title="Claims Approved"
								value={currentStats.claimsApproved?.toLocaleString() || "0"}
								icon={<span>✅</span>}
							/>
							<StatCard
								title="Claims Rejected"
								value={currentStats.claimsRejected?.toLocaleString() || "0"}
								icon={<span>❌</span>}
							/>
							<StatCard
								title="Commission Paid"
								value={`₦${currentStats.commissionPaid?.toLocaleString() || "0"}`}
								icon={<span>💰</span>}
							/>
							<StatCard
								title="Commission Pending"
								value={`₦${currentStats.commissionPending?.toLocaleString() || "0"}`}
								icon={<span>⏰</span>}
							/>
						</div>
					</Tab>
					<Tab key="weekly" title="Weekly Stats">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
							<StatCard
								title="IMEI Uploaded"
								value={currentStats.imeiUploaded?.toLocaleString() || "0"}
								icon={<span>📤</span>}
							/>
							<StatCard
								title="IMEI Verified"
								value={currentStats.imeiVerified?.toLocaleString() || "0"}
								icon={<span>✅</span>}
							/>
							<StatCard
								title="Claims Approved"
								value={currentStats.claimsApproved?.toLocaleString() || "0"}
								icon={<span>✅</span>}
							/>
							<StatCard
								title="Claims Rejected"
								value={currentStats.claimsRejected?.toLocaleString() || "0"}
								icon={<span>❌</span>}
							/>
							<StatCard
								title="Commission Paid"
								value={`₦${currentStats.commissionPaid?.toLocaleString() || "0"}`}
								icon={<span>💰</span>}
							/>
							<StatCard
								title="Commission Pending"
								value={`₦${currentStats.commissionPending?.toLocaleString() || "0"}`}
								icon={<span>⏰</span>}
							/>
						</div>
					</Tab>
					<Tab key="monthly" title="Monthly Stats">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
							<StatCard
								title="IMEI Uploaded"
								value={currentStats.imeiUploaded?.toLocaleString() || "0"}
								icon={<span>📤</span>}
							/>
							<StatCard
								title="IMEI Verified"
								value={currentStats.imeiVerified?.toLocaleString() || "0"}
								icon={<span>✅</span>}
							/>
							<StatCard
								title="Claims Approved"
								value={currentStats.claimsApproved?.toLocaleString() || "0"}
								icon={<span>✅</span>}
							/>
							<StatCard
								title="Claims Rejected"
								value={currentStats.claimsRejected?.toLocaleString() || "0"}
								icon={<span>❌</span>}
							/>
							<StatCard
								title="Commission Paid"
								value={`₦${currentStats.commissionPaid?.toLocaleString() || "0"}`}
								icon={<span>💰</span>}
							/>
							<StatCard
								title="Commission Pending"
								value={`₦${currentStats.commissionPending?.toLocaleString() || "0"}`}
								icon={<span>⏰</span>}
							/>
						</div>
					</Tab>
				</Tabs>
			</div>

			{/* Data Tables */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Unverified IMEI Numbers</h3>
					</CardHeader>
					<CardBody>
						<SimpleTable
							data={(data as any)?.unverifiedImeis || []}
							columns={unverifiedColumns}
							searchable
							searchPlaceholder="Search by IMEI, device type..."
							isLoading={!data && !error}
							emptyMessage="No unverified IMEIs found"
							selectable={false}
						/>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Recent Uploads</h3>
					</CardHeader>
					<CardBody>
						<SimpleTable
							data={(data as any)?.recentUploads || []}
							columns={uploadsColumns}
							searchable
							searchPlaceholder="Search by device type, file name..."
							isLoading={!data && !error}
							emptyMessage="No recent uploads found"
							selectable={false}
						/>
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default AdminSamsungPartnersView;