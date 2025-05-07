import type { Metadata, Viewport } from "next";
import { MaxWidthWrapper, cn, ThemeProvider, InternetStatus, GeneralSans_Meduim, AuthProvider } from "@/lib";
import { Toaster } from "sonner";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

const appName = "Sapphire Credit | Dashboard";
const appColor = "#0F52BA";
export const metadata: Metadata = {
	title: `${appName} | Dashboard`,
	description: "",
};
export const viewport: Viewport = {
	themeColor: appColor,
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning>
			<body className={cn("m-auto min-h-screen bg-background bg-center bg-no-repeat scroll-smooth antialiased", GeneralSans_Meduim.className)}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange>
					<NextTopLoader
						color="#0F52BA"
						showSpinner={true}
						easing="ease"
					/>
					<AuthProvider>
						<MaxWidthWrapper>{children}</MaxWidthWrapper>

						<Toaster
							position="top-right"
							expand={false}
						/>
						<InternetStatus />
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
