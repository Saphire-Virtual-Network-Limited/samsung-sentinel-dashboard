"use client";

import React, { useState } from "react";
import { Card, CardBody, Tabs, Tab } from "@heroui/react";
import { DollarSign, CreditCard } from "lucide-react";
import {
	UnpaidProcessedClaimsView,
	PaidProcessedClaimsView,
} from "@/view/samsung-partners";

export default function SamsungSentinelCompletedRepairsView() {
	const [activeTab, setActiveTab] = useState("unpaid");

	return (
		<div className="space-y-6">
			{/* Tabs Container */}
			<Card>
				<CardBody className="p-0">
					<Tabs
						selectedKey={activeTab}
						onSelectionChange={(key) => setActiveTab(key as string)}
						variant="underlined"
						classNames={{
							tabList:
								"gap-6 w-full relative rounded-none p-6 border-b border-divider",
							cursor: "w-full bg-primary",
							tab: "max-w-fit px-0 h-12",
							tabContent: "group-data-[selected=true]:text-primary",
						}}
					>
						<Tab
							key="unpaid"
							title={
								<div className="flex items-center space-x-2">
									<DollarSign className="w-4 h-4" />
									<span>Unpaid</span>
								</div>
							}
						>
							<div className="p-6">
								<UnpaidProcessedClaimsView />
							</div>
						</Tab>

						<Tab
							key="paid"
							title={
								<div className="flex items-center space-x-2">
									<CreditCard className="w-4 h-4" />
									<span>Paid</span>
								</div>
							}
						>
							<div className="p-6">
								<PaidProcessedClaimsView />
							</div>
						</Tab>
					</Tabs>
				</CardBody>
			</Card>
		</div>
	);
}
