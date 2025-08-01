"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";
import { useMobiflexLeaderboard } from "@/hooks/mobiflex";
import { formatCurrency, formatNumber } from "@/lib/helper";

const MobiflexTopPerformers = () => {
  const { data, isLoading } = useMobiflexLeaderboard();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Top Performing Agents</h3>
        </CardHeader>
        <CardBody>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Get top 10 performers (those with commission > 0)
  const topPerformers =
    data?.leaderboard
      .filter((agent) => agent.totalCommission > 0)
      .slice(0, 10) || [];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Top Performing Agents</h3>
      </CardHeader>
      <CardBody>
        {topPerformers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No performance data available
          </div>
        ) : (
          <Table aria-label="Top performing agents">
            <TableHeader>
              <TableColumn>AGENT</TableColumn>
              <TableColumn>PARTNER</TableColumn>
              <TableColumn>COMMISSION</TableColumn>
              <TableColumn>LOANS</TableColumn>
              <TableColumn>AVG/LOAN</TableColumn>
            </TableHeader>
            <TableBody>
              {topPerformers.map((agent, index) => (
                <TableRow key={agent.mbeId}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {agent.firstName} {agent.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {agent.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        agent.partnerName !== "N/A" ? "success" : "default"
                      }
                    >
                      {agent.partnerName}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(agent.totalCommission)}
                    </span>
                  </TableCell>
                  <TableCell>{formatNumber(agent.loanCount)}</TableCell>
                  <TableCell>
                    {formatCurrency(agent.averageCommissionPerLoan)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};

export default MobiflexTopPerformers;
