import React from "react";
import { Card, CardBody } from "@heroui/react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  className,
}) => {
  return (
    <Card className={cn("h-24", className)}>
      <CardBody className="flex flex-row items-center justify-between p-4">
        <div className="flex flex-col justify-center">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardBody>
    </Card>
  );
};
