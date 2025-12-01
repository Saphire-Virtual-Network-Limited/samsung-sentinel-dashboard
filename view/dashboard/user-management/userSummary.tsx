"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";

import React from "react";
import UsersView from "./usersView";

const UserSummaryView = () => {
	return (
		<div className="flex w-full flex-col">
			<UsersView />
		</div>
	);
};

export default UserSummaryView;
