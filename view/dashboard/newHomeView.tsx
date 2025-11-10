"use client";

import {
	DailyDashCard,
	DeviceDashAnalytic,
	InceptionDashCard,
	ScreenReport,
} from "@/components/reususables";
const NewHomeView = () => {
	return (
		<div className="space-y-6">
			<DailyDashCard />
			<InceptionDashCard />
			<DeviceDashAnalytic />
			<ScreenReport />
		</div>
	);
};

export default NewHomeView;
