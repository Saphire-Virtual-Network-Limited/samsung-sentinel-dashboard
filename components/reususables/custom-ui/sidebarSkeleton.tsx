"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
	return (
		<div className="w-full h-full bg-black flex flex-col">
			{/* Header Skeleton */}
			<div className="bg-black border-b border-gray-800 p-4">
				<div className="flex items-center gap-3">
					<Skeleton className="w-12 h-12 rounded-lg bg-gray-700" />
					<div className="flex flex-col gap-2 flex-1">
						<Skeleton className="h-4 w-32 bg-gray-700" />
						<Skeleton className="h-3 w-24 bg-gray-700" />
					</div>
				</div>
			</div>

			{/* Content Skeleton */}
			<div className="flex-1 p-4 space-y-4">
				{/* Menu Items */}
				{Array.from({ length: 6 }).map((_, index) => (
					<div key={index} className="space-y-2">
						<div className="flex items-center gap-3">
							<Skeleton className="w-5 h-5 bg-gray-700" />
							<Skeleton className="h-4 flex-1 bg-gray-700" />
						</div>
						{/* Submenu items for some menu items */}
						{index % 2 === 0 && (
							<div className="ml-8 space-y-2">
								{Array.from({ length: 2 }).map((_, subIndex) => (
									<Skeleton key={subIndex} className="h-3 w-20 bg-gray-700" />
								))}
							</div>
						)}
					</div>
				))}
			</div>

			{/* Footer Skeleton */}
			<div className="border-t border-gray-800 p-4 space-y-3">
				<div className="flex items-center gap-3">
					<Skeleton className="w-4 h-4 bg-gray-700" />
					<Skeleton className="h-4 w-16 bg-gray-700" />
				</div>
				<div className="flex items-center gap-3">
					<Skeleton className="w-4 h-4 bg-gray-700" />
					<Skeleton className="h-4 w-16 bg-gray-700" />
				</div>
			</div>
		</div>
	);
}
