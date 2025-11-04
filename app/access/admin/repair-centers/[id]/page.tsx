import React from "react";
import { AdminRepairCenterDetailView } from "@/view/admin";

interface PageProps {
	params: { id: string };
}

const page = ({ params }: PageProps) => {
	return <AdminRepairCenterDetailView repairCenterId={params.id} />;
};

export default page;
