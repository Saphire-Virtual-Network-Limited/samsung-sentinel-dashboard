"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
import { DropOffsView, SamsungReport, UniqueEngageView, XiaomiReport, OppoReport } from "@/view/dashboard";


import React from "react";
import MbeReport from "./sales/mbe/mbe";

const SummaryReportView = () => {
	return (
		<div className="flex w-full flex-col">
			<Tabs
				aria-label="Options"
				size="lg"
				radius="lg"
				color="primary"
				className={cn("pb-5", GeneralSans_Meduim.className)}
				classNames={{
					tab: "lg:p-4 text-sm lg:text-base",
				}}>
				<Tab
					key="General Engagement"
					title="General Engagement"
					className="lg:p-4 text-base">
					<DropOffsView />	
				</Tab>
				<Tab
					key="Unique Engagement"
					title="Unique Engagement"
					className="lg:p-4 text-base">
					<UniqueEngageView />        
				</Tab>
				
				
				

			</Tabs>
		</div>
	);
};

export default SummaryReportView;
