import { SentinelSingleCustomerPage } from "@/view"

export default async function SingleCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <SentinelSingleCustomerPage sentinelCustomerId={id} />
}
