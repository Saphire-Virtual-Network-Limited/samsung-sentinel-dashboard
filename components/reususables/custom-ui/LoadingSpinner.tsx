"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "border-primary",
  fullScreen = true,
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 ${color} ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
