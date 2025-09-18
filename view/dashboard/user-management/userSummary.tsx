"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";


import React from "react";
import UsersView from "./usersView";
import ClusterSupView from "./clusterSupView";
import StateManagerView from "./stateManagerView";
import StateSupervisorView from "./stateSupervisorView";

const UserSummaryView = () => {
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
					key="All Users"
					title="All Users"
					className="lg:p-4 text-base">
					<UsersView />	
				</Tab>
				
                    <Tab
                        key="Cluster Supervisors"
                        title="Cluster Supervisors"
                        className="lg:p-4 text-base">
                        <ClusterSupView />
                    </Tab>
					<Tab
						key="State Managers"
						title="State Managers"
						className="lg:p-4 text-base">
						<StateManagerView />
					</Tab>
					<Tab
						key="State Supervisors"
						title="State Supervisors"
						className="lg:p-4 text-base">
						<StateSupervisorView />
					</Tab>
			</Tabs>
		</div>
	);
};

export default UserSummaryView;
