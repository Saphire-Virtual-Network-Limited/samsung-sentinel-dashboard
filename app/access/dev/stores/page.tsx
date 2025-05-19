"use client";

import React from 'react'
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
import { CustomerView, UnpaidStoresView, PaidStoresView } from "@/view";
import AllStoresView from '@/view/dashboard/finance/allStoresView';


const Page = () => {
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

			</Tabs>
		</div>
  )
}

export default Page;
