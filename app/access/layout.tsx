import { AccessLayoutView } from "@/view";

async function AccessLayout({ children }: { children: React.ReactNode }) {
	return <AccessLayoutView>{children}</AccessLayoutView>;
}
export default AccessLayout;
