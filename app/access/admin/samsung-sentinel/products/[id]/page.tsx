import SingleProductView from "@/view/dashboard/samsung-sentinel/SingleProductView";

export default async function ProductDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <SingleProductView productId={id} />;
}
