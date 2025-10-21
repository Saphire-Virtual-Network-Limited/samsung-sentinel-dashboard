import SingleProductView from "@/view/dashboard/samsung-sentinel/SingleProductView";
import { useParams } from "next/navigation";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params?.id as string;
  return <SingleProductView productId={productId} />;
}
