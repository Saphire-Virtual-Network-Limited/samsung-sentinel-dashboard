"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { StatCard } from "@/components/atoms/StatCard";
import {
  useMobiflexLeaderboard,
  useMobiflexRegionStats,
  useMobiflexPartnerStats,
} from "@/hooks/mobiflex";
import { formatCurrency, formatNumber } from "@/lib/helper";

const MobiflexDashboardOverview = () => {
  const { data: leaderboardData, isLoading: loadingLeaderboard } =
    useMobiflexLeaderboard();
  const { data: regionData, isLoading: loadingRegions } =
    useMobiflexRegionStats();
  const { data: partnerData, isLoading: loadingPartners } =
    useMobiflexPartnerStats();

  const isLoading = loadingLeaderboard || loadingRegions || loadingPartners;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, index) => (
            <StatCard
              key={index}
              title="Loading..."
              value="..."
              className="animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Agents"
          value={formatNumber(leaderboardData?.totalAgents || 0)}
        />

        <StatCard
          title="Total Commission"
          value={formatCurrency(leaderboardData?.summary.totalCommission || 0)}
        />

        <StatCard
          title="Agent Commission"
          value={formatCurrency(
            leaderboardData?.summary.totalAgentCommission || 0
          )}
        />

        <StatCard
          title="Total Loans"
          value={formatNumber(leaderboardData?.summary.totalLoans || 0)}
        />
      </div>

      {/* Regional & Partner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Active States"
          value={formatNumber(regionData?.summary.totalStates || 0)}
        />

        <StatCard
          title="Active Partners"
          value={formatNumber(partnerData?.summary.totalPartners || 0)}
        />
      </div>
    </div>
  );
};

export default MobiflexDashboardOverview;
