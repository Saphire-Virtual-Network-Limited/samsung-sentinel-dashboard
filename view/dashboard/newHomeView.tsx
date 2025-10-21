"use client";

import React from "react";
import {
	DashCard,
	DailyDashCard,
	InceptionDashCard,
	DeviceDashAnalytic,
	ScreenReport,
} from "@/components/reususables";
import { getSelectedProduct } from "@/utils";
import MobiflexHomeView from "./MobiflexHomeView";
import NewSalesHomeView from "../creditflex/dashboardView";
import CommunicationLockReport from "@/components/reususables/custom-ui/CommunicationLockReport";
import CollectionAnalytcics from "@/components/dashboard/collectionAnalytcics";
const NewHomeView = () => {
	const { label: selectedProduct } = getSelectedProduct();

	if (selectedProduct == "CreditFlex") {
		return <NewSalesHomeView />;
	}

	return (
		<div className="space-y-6">
			<DailyDashCard />
			<CommunicationLockReport />
			<InceptionDashCard />
			<DeviceDashAnalytic />
			<ScreenReport />
			{selectedProduct == "Mobiflex" && <MobiflexHomeView />}
		</div>
	);
};

export default NewHomeView;
