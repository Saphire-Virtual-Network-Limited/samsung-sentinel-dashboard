"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
	import { DownPaymentView, LoanRepaymentView, AllTransactionView } from "@/view/dashboard";


import React from "react";

const RepaymentSummariesView = () => {
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
					key="Loan Repayment"
					title="Loan Repayment"
					className="lg:p-4 text-base">
					<LoanRepaymentView />
				</Tab>
				<Tab
					key="Down Payment"
					title="Down Payment"
					className="lg:p-4 text-base">
					<DownPaymentView />	
				</Tab>
				<Tab
					key="All Transaction"
					title="All Transaction"
					className="lg:p-4 text-base">
					<AllTransactionView />	
				</Tab>
				
			</Tabs>
		</div>
	);
};

export default RepaymentSummariesView;
