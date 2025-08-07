"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Select,
  SelectItem,
} from "@heroui/react";
import { Calendar } from "lucide-react";
import { useMobiflexLeaderboard } from "@/hooks/mobiflex";
import { formatCurrency, formatNumber } from "@/lib/helper";

// Period options for the dashboard
const periodOptions = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const MobiflexQuickStats = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  const { data, isLoading } = useMobiflexLeaderboard(selectedPeriod);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Quick Stats</h3>
        </CardHeader>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const activeAgents =
    data?.leaderboard.filter((agent) => agent.totalCommission > 0).length || 0;
  const totalAgents = data?.totalAgents || 0;
  const activePercentage =
    totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 0;

  const topAgent = data?.summary.topAgent;
  const totalCommission = data?.summary.totalCommission || 0;
  const totalAgentCommission = data?.summary.totalAgentCommission || 0;
  const agentCommissionRate =
    totalCommission > 0 ? (totalAgentCommission / totalCommission) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold">Quick Stats</h3>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select
            placeholder="Period"
            value={selectedPeriod}
            onChange={(e) =>
              setSelectedPeriod(
                e.target.value as "daily" | "weekly" | "monthly" | "yearly"
              )
            }
            className="min-w-[120px]"
            size="sm"
          >
            {periodOptions.map((period) => (
              <SelectItem key={period.key} value={period.key}>
                {period.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Active Agents */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Active Agents</span>
            <span className="text-sm text-gray-600">
              {formatNumber(activeAgents)} / {formatNumber(totalAgents)}
            </span>
          </div>
          <Progress
            value={activePercentage}
            color="success"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            {activePercentage.toFixed(1)}% of agents have generated commission
          </p>
        </div>

        {/* Commission Split */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Agent Commission Rate</span>
            <span className="text-sm text-gray-600">
              {agentCommissionRate.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={agentCommissionRate}
            color="primary"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(totalAgentCommission)} of{" "}
            {formatCurrency(totalCommission)}
          </p>
        </div>

        {/* Top Performer */}
        {topAgent && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Top Performer</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-sm">
                {topAgent.firstName} {topAgent.lastName}
              </p>
              <p className="text-xs text-gray-600 mb-2">{topAgent.phone}</p>
              <div className="flex justify-between text-xs">
                <span>Commission:</span>
                <span className="font-medium">
                  {formatCurrency(topAgent.totalCommission)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Loans:</span>
                <span className="font-medium">
                  {formatNumber(topAgent.loanCount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default MobiflexQuickStats;
