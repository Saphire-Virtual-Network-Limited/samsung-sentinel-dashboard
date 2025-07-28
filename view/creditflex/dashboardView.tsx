"use client";

import React, { Suspense, useState, useEffect } from "react";
import { StatCard } from "@/components/atoms/StatCard";
import { useAdminDashboardStatistics } from "@/hooks/useAdminDashboardStats";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import CreditflexAllLoansView from "@/view/creditflex/allLoansView";
import {
  BarChart3,
  Users,
  CreditCard,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Percent,
} from "lucide-react";

// Loading and Error Components
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
    ))}
  </div>
);

const StatsError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="h-24 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center"
      >
        <button
          onClick={onRetry}
          className="text-red-600 text-sm hover:text-red-800"
        >
          Failed to load - Retry
        </button>
      </div>
    ))}
  </div>
);

// Utility Functions
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: string | number): string => {
  if (typeof value === "string") return value;
  return value?.toLocaleString("en-US") || "0";
};

const NewSalesHomeView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    filterBy: "",
    limit: rowsPerPage,
    offset: 0,
  });

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    mutate: refetch,
  } = useAdminDashboardStatistics();

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      limit: rowsPerPage,
      offset: (currentPage - 1) * rowsPerPage,
    }));
  }, [currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (statsLoading) return <StatsSkeleton />;
  if (statsError) return <StatsError onRetry={refetch} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total No. of Marketers"
          value={formatNumber(stats.totalTelemarketers)}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Total Loans Disbursed"
          value={formatNumber(stats.totalLoansDisbursed)}
          icon={<CreditCard className="w-5 h-5" />}
        />
        <StatCard
          title="Active Loans"
          value={formatNumber(stats.activeLoans)}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Total Loans Repaid"
          value={formatNumber(stats.totalLoansRepaid)}
          icon={<PiggyBank className="w-5 h-5" />}
        />
        <StatCard
          title="Loan Amount Repaid"
          value={formatCurrency(stats.totalLoanAmountRepaid)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          title="Active Loan Applications"
          value={formatNumber(stats.activeLoanApplications)}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          title="Disbursed Amount"
          value={formatCurrency(stats.totalDisbursedAmount)}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(stats.totalOutstandingBalance)}
          icon={<TrendingDown className="w-5 h-5" />}
        />
        <StatCard
          title="Repayment Rate"
          value={stats.repaymentRate}
          icon={<Percent className="w-5 h-5" />}
        />
        <StatCard
          title="Average Loan Amount"
          value={formatCurrency(stats.averageLoanAmount)}
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <StatCard
          title="Conversion Rate"
          value={stats.conversionRate}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          title="Total Users Onboarded"
          value={formatNumber(stats.totalUsersOnboarded)}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Loan Requests Section */}
      <CreditflexAllLoansView />
    </div>
  );
};

export default NewSalesHomeView;
