import SingleProductView from "@/view/dashboard/samsung-sentinel/SingleProductView";

export default function ProductDetailsPage({
	params,
}: {
	params: { id: string };
}) {
	return <SingleProductView productId={params.id} />;
}
