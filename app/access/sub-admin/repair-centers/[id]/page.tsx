import React from "react";
import { SubAdminRepairCenterDetailView } from "@/view/admin";

interface PageProps {
	params: Promise<{ id: string }>;
}

const Page = ({ params }: PageProps) => {
	const { id } = React.use(params);
	return <SubAdminRepairCenterDetailView repairCenterId={id} />;
};

export default Page;
