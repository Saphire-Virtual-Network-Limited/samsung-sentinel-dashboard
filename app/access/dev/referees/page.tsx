"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
import { UnapprovedRefereesPage, ApprovedRefereesPage, RejectedRefereesPage } from "@/view/dashboard";


import React from "react";

const CustomersPage = () => {
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
					key="Unapproved"
					title="Unapproved"
					className="lg:p-4 text-base">
					<UnapprovedRefereesPage />	
				</Tab>
				<Tab
					key="Approved"
					title="Approved"
					className="lg:p-4 text-base">
					<ApprovedRefereesPage />
				</Tab>
				<Tab
					key="Rejected"
					title="Rejected"
					className="lg:p-4 text-base">
					<RejectedRefereesPage />
				</Tab>

			</Tabs>
		</div>
	);
};

export default CustomersPage;
