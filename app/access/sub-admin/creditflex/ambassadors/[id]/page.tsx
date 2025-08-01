import { AmbassadorDetailView } from "@/view/creditflex/ambassador";

interface AmbassadorDetailPageProps {
  params: {
    id: string;
  };
}

export default function SubAdminAmbassadorDetailPage({
  params,
}: AmbassadorDetailPageProps) {
  return <AmbassadorDetailView ambassadorId={params.id} />;
}
