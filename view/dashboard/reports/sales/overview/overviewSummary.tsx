"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
import { DropOffsView, UniqueEngageView, XiaomiReport, GeneralEngageXiaomi, GeneralEngageSamsung, SamsungReport, OppoReport, GeneralEngageOppo } from "@/view/dashboard";


import React from "react";
const SummaryReportOverviewView = () => { 
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
					<GeneralEngageOppo />	
				</Tab>
				<Tab
					key="Unique Engagement"
					title="Unique Engagement"
					className="lg:p-4 text-base">
					<OppoReport />        
				</Tab>




			</Tabs>
		</div>
	);
};

export default SummaryReportOverviewView;
