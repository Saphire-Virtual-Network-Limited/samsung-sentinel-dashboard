import { AmbassadorDetailView } from "@/view/creditflex/ambassador";

interface AmbassadorDetailPageProps {
  params: {
    id: string;
  };
}

export default function AdminAmbassadorDetailPage({
  params,
}: AmbassadorDetailPageProps) {
  return <AmbassadorDetailView ambassadorId={params.id} />;
}
