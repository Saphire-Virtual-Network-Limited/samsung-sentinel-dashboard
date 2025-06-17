"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
import {  SentinelPage } from "@/view/dashboard";


import React from "react";

const SalesReportView = () => {
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
					key="Sentinel Sales"
					title="Sentinel Sales"
					className="lg:p-4 text-base">
					<SentinelPage />	
				</Tab>
				{/* <Tab
					key="Loan Sales"
					title="Loan Sales"
					className="lg:p-4 text-base">
					<LoanPage />        
				</Tab> */}
					
			</Tabs>
		</div>
	);
};

export default SalesReportView;
