import React from "react";

const SkeletonLoader = () => {
	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<aside className="w-64 bg-black text-white flex flex-col justify-between p-4">
				<div className="space-y-6">
					<div className="h-10 w-32 bg-gray-700 rounded animate-pulse" /> {/* Logo */}
					<div className="space-y-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="h-4 w-40 bg-gray-800 rounded animate-pulse"
							/>
						))}
					</div>
				</div>
				<div className="space-y-4">
					<div className="h-4 w-32 bg-gray-700 rounded animate-pulse" /> {/* Settings */}
					<div className="h-4 w-24 bg-gray-700 rounded animate-pulse" /> {/* Logout */}
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-6 space-y-8">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div className="space-y-2">
						<div className="h-6 w-64 bg-gray-200 rounded animate-pulse" /> {/* Greeting */}
						<div className="h-4 w-80 bg-gray-100 rounded animate-pulse" /> {/* Subheading */}
					</div>
					<div className="flex items-center gap-4">
						<div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" /> {/* Bell icon */}
						<div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" /> {/* Profile icon */}
					</div>
				</div>

				{/* Dashboard Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[1, 2, 3].map((card) => (
						<div
							key={card}
							className="h-48 bg-gray-200 rounded-xl animate-pulse"
						/>
					))}
				</div>
			</main>
		</div>
	);
};

export default SkeletonLoader;
