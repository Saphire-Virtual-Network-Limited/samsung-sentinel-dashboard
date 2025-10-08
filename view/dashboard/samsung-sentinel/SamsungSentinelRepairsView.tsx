"use client";

import React, { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import {
	PendingRepairClaimsView,
	ApprovedRepairClaimsView,
	RejectedRepairClaimsView,
} from "@/view/samsung-partners";

export default function SamsungSentinelRepairsView() {
	const [activeTab, setActiveTab] = useState("pending");

	return (
		<div className="space-y-6">
			{/* Tabs Container */}
			<Tabs
				selectedKey={activeTab}
				onSelectionChange={(key) => setActiveTab(key as string)}
			>
				<Tab key="pending" title="Pending Repairs">
					<PendingRepairClaimsView />
				</Tab>
				<Tab key="approved" title="Approved Repairs">
					<ApprovedRepairClaimsView />
				</Tab>
				<Tab key="rejected" title="Rejected Repairs">
					<RejectedRepairClaimsView />
				</Tab>
			</Tabs>
		</div>
	);
}
