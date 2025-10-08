import { SamsungSentinelUploadDetailsView } from "@/view/dashboard/samsung-sentinel";

interface Props {
	params: {
		id: string;
	};
}

export default function SamsungSentinelUploadDetailsPage({ params }: Props) {
	return <SamsungSentinelUploadDetailsView uploadId={params.id} />;
}
