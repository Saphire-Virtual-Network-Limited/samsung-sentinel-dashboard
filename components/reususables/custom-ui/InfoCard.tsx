"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  headerContent?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  className = "",
  icon,
  collapsible = false,
  defaultExpanded = true,
  headerContent,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!collapsible) {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
      >
        <div className="p-4 border-b border-default-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <h3 className="text-lg font-semibold text-default-900">
                {title}
              </h3>
            </div>
            {headerContent}
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
    >
      <div
        className="p-4 border-b border-default-200 cursor-pointer hover:bg-default-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-lg font-semibold text-default-900">{title}</h3>
          </div>
          <div className="flex items-center gap-3">
            {headerContent}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-default-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-default-500" />
            )}
          </div>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? "max-h-none opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default InfoCard;
