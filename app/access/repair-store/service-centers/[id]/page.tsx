import React from "react";
import { RepairStoreSingleServiceCenterView } from "@/view/repair-store";

interface PageProps {
	params: Promise<{ id: string }>;
}

const Page = ({ params }: PageProps) => {
	const { id } = React.use(params);
	return <RepairStoreSingleServiceCenterView centerId={id} />;
};

export default Page;
