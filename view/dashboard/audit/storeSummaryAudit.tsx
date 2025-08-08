"use client";

import React from 'react'
import { Tabs, Tab, cn, Button } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
import { UnpaidStoresView, PaidStoresView, AllStoresPending, AllStoresSuspended } from "@/view";
import AllStoresView from '@/view/dashboard/finance/allStoresView';


const StoreSummaryAudit = () => {
  return (
	<>
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
					key="All Stores"
					title="All Stores"
					className="lg:p-4 text-base">
					<AllStoresView />
				</Tab>
				
				<Tab
					key="Paid Stores"
					title="Paid Stores"
					className="lg:p-4 text-base">
					<PaidStoresView />
				</Tab>
				
				<Tab
					key="Unpaid Stores"
					title="Unpaid Stores"
					className="lg:p-4 text-base">
					<UnpaidStoresView />
				</Tab>
				<Tab
					key="Pending Stores"
					title="Pending Stores"
					className="lg:p-4 text-base">
					<AllStoresPending />
				</Tab>
				<Tab
					key="Suspended Stores"
					title="Suspended Stores"
					className="lg:p-4 text-base">
					<AllStoresSuspended />
				</Tab>

			</Tabs>
		</div>
		
	</>
  )
}

export default StoreSummaryAudit;
