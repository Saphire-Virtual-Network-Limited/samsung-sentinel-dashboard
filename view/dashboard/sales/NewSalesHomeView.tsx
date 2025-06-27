"use client";

import React from "react";
import {
  DashCard,
  DailyDashCard,
  InceptionDashCard,
  DeviceDashAnalytic,
  ScreenReport,
} from "@/components/reususables";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Shield,
  Zap,
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
} from "lucide-react";

// Font classes (adjust paths as needed)
const GeneralSans_Medium = { className: "font-medium" };
const GeneralSans_SemiBold = { className: "font-semibold" };

// Types
interface MetricConfig {
  label: string;
  key: string;
  isCurrency?: boolean;
}

interface ChannelData {
  [key: string]: string | number;
}

interface ChannelConfig {
  name: string;
  url: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  metrics: MetricConfig[];
}

type ChannelType = "Sentinel" | "Phoenix" | "Eagle" | any;

// Utility function to format numbers
const formatNumber = (value: string | number): string => {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat().format(value);
};

// Channel configuration
const channelConfig: Record<ChannelType, ChannelConfig> = {
  Sentinel: {
    name: "Sentinel",
    url: "/sentinel",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    icon: <Shield className="w-4 h-4 text-blue-600" />,
    metrics: [
      { label: "Total", key: "total" },
      { label: "Today", key: "today" },
      { label: "Monthly Target", key: "monthly_target" },
      { label: "Month to Date", key: "month_to_date" },
      { label: "Actual Performance", key: "actual_performance" },
    ],
  },
};

// Demo data for multiple channels
const channelsData: Record<ChannelType, ChannelData> = {
  Sentinel: {
    total: 52,
    today: "0",
    monthly_target: "25",
    month_to_date: 22,
    actual_performance: 0,
  },
};

// Function to render metric rows
const renderMetricRow = (
  label: string,
  value: string | number,
  isCurrency: boolean = false
): React.ReactNode => (
  <div
    key={label}
    className="flex flex-row items-center justify-between lg:flex-col lg:items-start xl:flex-col xl:items-start py-1 border-b border-gray-100 last:border-b-0"
  >
    <span
      className={cn(
        "text-xs text-gray-600 lg:mb-0.5 xl:mb-0.5",
        GeneralSans_Medium.className
      )}
    >
      {label}
    </span>
    <span
      className={cn(
        "text-xs font-semibold text-gray-900",
        GeneralSans_SemiBold.className
      )}
    >
      {isCurrency ? `₦${formatNumber(value)}` : formatNumber(value)}
    </span>
  </div>
);

// Function to render channel cards
const renderChannelCard = (
  channel: ChannelType,
  data: ChannelData
): React.ReactNode => {
  const config = channelConfig[channel];

  return (
    <Card
      key={channel}
      as={Link}
      isPressable
      href={config.url}
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] min-h-[200px]",
        config.borderColor,
        "hover:border-gray-300"
      )}
    >
      {/* Gradient header */}
      <div className={cn("bg-gradient-to-r p-3", config.color)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn("p-1.5 rounded-lg", config.bgColor)}>
              {config.icon}
            </div>
            <h2
              className={cn(
                "text-white font-semibold text-sm",
                GeneralSans_SemiBold.className
              )}
            >
              {config.name}
            </h2>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <CardBody className="p-4 space-y-3">
        {config.metrics.map((metric) =>
          renderMetricRow(metric.label, data[metric.key], metric.isCurrency)
        )}
      </CardBody>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </Card>
  );
};

const NewSalesHomeView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Object.entries(channelsData).map(([channel, data]) =>
          renderChannelCard(channel as ChannelType, data)
        )}
      </div>
      {/**    <InceptionDashCard />
      <DeviceDashAnalytic /> */}
    </div>
  );
};

export default NewSalesHomeView;
