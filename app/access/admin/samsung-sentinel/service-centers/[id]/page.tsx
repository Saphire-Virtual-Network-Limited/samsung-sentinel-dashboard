import SingleServiceCenterView from "@/view/dashboard/samsung-sentinel/SingleServiceCenterView";

export default function ServiceCenterDetailsPage({
	params,
}: {
	params: { id: string };
}) {
	return <SingleServiceCenterView serviceCenterId={params.id} />;
}
