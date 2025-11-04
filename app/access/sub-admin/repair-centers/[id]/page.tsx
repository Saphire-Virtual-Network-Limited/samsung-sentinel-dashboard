import React from "react";
import { SubAdminRepairCenterDetailView } from "@/view/admin";

interface PageProps {
	params: { id: string };
}

const page = ({ params }: PageProps) => {
	return <SubAdminRepairCenterDetailView repairCenterId={params.id} />;
};

export default page;
