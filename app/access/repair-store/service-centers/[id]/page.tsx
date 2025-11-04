import React from "react";
import { RepairStoreSingleServiceCenterView } from "@/view/repair-store";

interface PageProps {
	params: { id: string };
}

const page = ({ params }: PageProps) => {
	return <RepairStoreSingleServiceCenterView centerId={params.id} />;
};

export default page;
