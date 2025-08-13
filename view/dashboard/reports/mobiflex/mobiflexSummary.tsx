"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
import MobiflexAgentsReportView from "./agentsReport";
import MobiflexCommissionReportView from "./commissionReport";
import MobiflexPartnersReportView from "./partnersReport";
import React from "react";

const MobiflexReportsView = () => {
	return (
		<div className="flex w-full flex-col">
			<Tabs
				aria-label="Mobiflex Reports"
				size="lg"
				radius="lg"
				color="primary"
				className={cn("pb-5", GeneralSans_Meduim.className)}
				classNames={{
					tab: "lg:p-4 text-sm lg:text-base",
				}}
			>
				<Tab
					key="agents"
					title="Agent Performance"
					className="lg:p-4 text-base"
				>
					<MobiflexAgentsReportView />
				</Tab>

				<Tab
					key="commission"
					title="Commission Analysis"
					className="lg:p-4 text-base"
				>
					<MobiflexCommissionReportView />
				</Tab>

				<Tab
					key="partners"
					title="Partner Performance"
					className="lg:p-4 text-base"
				>
					<MobiflexPartnersReportView />
				</Tab>
			</Tabs>
		</div>
	);
};

MobiflexReportsView.subtitle = (
	<div className="mb-6">
		<h1
			className={cn(
				"text-2xl font-bold text-gray-900 mb-2",
				GeneralSans_Meduim.className
			)}
		>
			Mobiflex Reports
		</h1>
		<p className="text-gray-600">
			Comprehensive reports for Mobiflex performance, agents, and commissions
		</p>
	</div>
);

export default MobiflexReportsView;
