import ViewRepairClaimView from "@/view/samsung-partners/ViewRepairClaimView";

interface ViewRepairClaimPageProps {
	params: {
		id: string;
	};
}

const ViewRepairClaimPage = ({ params }: ViewRepairClaimPageProps) => {
	return <ViewRepairClaimView claimId={params.id} />;
};

export default ViewRepairClaimPage;
