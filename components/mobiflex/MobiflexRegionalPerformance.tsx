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
} from "@heroui/react";
import { useMobiflexRegionStats } from "@/hooks/mobiflex";
import { formatCurrency, formatNumber } from "@/lib/helper";

const MobiflexRegionalPerformance = () => {
  const { data, isLoading } = useMobiflexRegionStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Regional Performance</h3>
        </CardHeader>
        <CardBody>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  const regions = data?.regionStats || [];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Regional Performance</h3>
      </CardHeader>
      <CardBody>
        {regions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No regional data available
          </div>
        ) : (
          <Table aria-label="Regional performance">
            <TableHeader>
              <TableColumn>STATE</TableColumn>
              <TableColumn>AGENTS</TableColumn>
              <TableColumn>TOTAL COMMISSION</TableColumn>
              <TableColumn>AGENT COMMISSION</TableColumn>
              <TableColumn>COMMISSIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {regions.map((region, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <span className="font-medium">
                      {region.state === "Unknown"
                        ? "Not Specified"
                        : region.state}
                    </span>
                  </TableCell>
                  <TableCell>{formatNumber(region.agentCount)}</TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(region.totalCommission)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(region.totalAgentCommission)}
                  </TableCell>
                  <TableCell>{formatNumber(region.commissionCount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};

export default MobiflexRegionalPerformance;
