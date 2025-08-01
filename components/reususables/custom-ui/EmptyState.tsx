"use client";

import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = "",
}) => (
  <div className={`text-center py-8 ${className}`}>
    <div className="flex justify-center mb-4">
      <div className="p-3 bg-default-100 rounded-full">{icon}</div>
    </div>
    <h3 className="text-lg font-semibold text-default-900 mb-2">{title}</h3>
    <p className="text-default-500 text-sm mb-4">{description}</p>
    {action && <div className="flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
