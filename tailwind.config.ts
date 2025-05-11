import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
import tailwindcssAnimate from "tailwindcss-animate";
export default {
	darkMode: ["class"],
	content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./view/**/*.{ts,tsx}", "./json/**/*.{ts,tsx}", "./utils/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: "1.3rem",
				sm: "1.3rem",
				md: "1.3rem",
				lg: "2rem",
				xl: "2.5rem",
			},
		},
		extend: {
			screens: {
				xs: {
					max: "380px",
				},
				sm: "600px",
			},
			animation: {
				"blur-in": "blur-in 1.3s ease-out",
				marquee: "marquee var(--duration) infinite linear",
				"marquee-vertical": "marquee-vertical var(--duration) linear infinite",
			},
			keyframes: {
				"blur-in": {
					"0%": {
						filter: "blur(10px)",
					},
					"100%": {
						filter: "blur(0px)",
					},
				},
				marquee: {
					from: {
						transform: "translateX(0)",
					},
					to: {
						transform: "translateX(calc(-100% - var(--gap)))",
					},
				},
				"marquee-vertical": {
					from: {
						transform: "translateY(0)",
					},
					to: {
						transform: "translateY(calc(-100% - var(--gap)))",
					},
				},
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [tailwindcssAnimate, heroui()],
} satisfies Config;
