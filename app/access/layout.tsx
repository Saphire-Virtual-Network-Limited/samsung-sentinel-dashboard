import { AccessLayoutView } from "@/view";
import { DebugProvider } from "@/lib/debugContext";
async function AccessLayout({ children }: { children: React.ReactNode }) {
	return (
		<DebugProvider>
			<AccessLayoutView>{children}</AccessLayoutView>
		</DebugProvider>
	);
}
export default AccessLayout;
