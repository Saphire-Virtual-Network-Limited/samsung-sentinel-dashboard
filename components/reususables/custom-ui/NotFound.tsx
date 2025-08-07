"use client";

import React from "react";
import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";

interface NotFoundProps {
  title?: string;
  description?: string;
  onGoBack: () => void;
  buttonText?: string;
  fullScreen?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  title = "Not Found",
  description = "The requested information could not be found.",
  onGoBack,
  buttonText = "Go Back",
  fullScreen = true,
  icon,
  className = "",
}) => {
  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-12";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        {icon && <div className="flex justify-center mb-4">{icon}</div>}
        <h2 className="text-2xl font-semibold text-default-900 mb-2">
          {title}
        </h2>
        <p className="text-default-500 mb-4">{description}</p>
        <Button
          variant="flat"
          color="primary"
          startContent={<ArrowLeft />}
          onPress={onGoBack}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
