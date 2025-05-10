import React from "react";

const CardSkeleton = () => {
	return (
		<div className="animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-900 p-6 h-40 w-full shadow">
			<div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-1/2 mb-4"></div>
			<div className="h-6 bg-gray-300 dark:bg-neutral-700 rounded w-2/3 mb-2"></div>
			<div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-1/4"></div>
		</div>
	);
};

export default CardSkeleton;
