"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<div
			onClick={toggleTheme}
			className="cursor-pointer p-2 rounded-md relative">
			<Sun className="h-auto w-5 absolute transition-all duration-700 ease-in-out dark:opacity-0 dark:scale-0 lg:w-5" />
			<Moon className="h-auto w-5 absolute transition-all duration-700 ease-in-out opacity-0 scale-0 dark:opacity-100 dark:scale-100 lg:w-5" />
			<span className="sr-only">Toggle theme</span>
		</div>
	);
}
