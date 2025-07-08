"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
import { LoansView, EnrolledView, ApprovedView, DefaultedView, UtilizationView, DueLoansView } from "@/view/dashboard";


import React from "react";

const LoanSummaryView = () => {
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
					key="All Loans"
					title="All Loans"
					className="lg:p-4 text-base">
					<LoansView />	
				</Tab>
				<Tab
					key="Enrolled"
					title="Enrolled"
					className="lg:p-4 text-base">
					<EnrolledView />
				</Tab>
                    <Tab
                        key="Approved"
                        title="Approved"
                        className="lg:p-4 text-base">
                        <ApprovedView />
                    </Tab>
					<Tab
                        key="Due Loans"
                        title="Due Loans"
                        className="lg:p-4 text-base">
                        <DueLoansView />
                    </Tab>
                    <Tab
                        key="Defaulted"
                        title="Defaulted"
                        className="lg:p-4 text-base">
                        <DefaultedView />
                    </Tab>
					<Tab
						key="Utilization"
						title="Utilization"
						className="lg:p-4 text-base">
						<UtilizationView />
					</Tab>
			</Tabs>
		</div>
	);
};

export default LoanSummaryView;
