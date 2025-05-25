"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
import { DefaultedView, AllDevices, EnrolledDeviceView, UnEnrolledDeviceView } from "@/view/dashboard";


import React from "react";

const DeviceSummaryView = () => {     
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
					key="All Devices"
					title="All Devices"
					className="lg:p-4 text-base">
					<AllDevices />	
				</Tab>
				<Tab
					key="Enrolled"
					title="Enrolled"
					className="lg:p-4 text-base">
					<EnrolledDeviceView />
				</Tab>
                    <Tab
                        key="UnEnrolled"
                        title="UnEnrolled"
                        className="lg:p-4 text-base">
                        <UnEnrolledDeviceView />
                    </Tab>

			</Tabs>
		</div>
	);
};

export default DeviceSummaryView;
