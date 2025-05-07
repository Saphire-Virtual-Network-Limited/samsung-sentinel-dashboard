import React from "react";

const SidebarSkeletonLoader = () => {
	return (
		<div className="space-y-4">
			{Array.from({ length: 6 }).map((_, i) => (
				<div
					key={i}
					className="h-4 w-40 bg-gray-800 rounded animate-pulse"
				/>
			))}
		</div>
	);
};

export default SidebarSkeletonLoader;
