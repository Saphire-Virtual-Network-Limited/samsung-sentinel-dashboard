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
import { useMobiflexPartnerStats } from "@/hooks/mobiflex";
import { formatCurrency, formatNumber } from "@/lib/helper";

const MobiflexPartnerPerformance = () => {
  const { data, isLoading } = useMobiflexPartnerStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Partner Performance</h3>
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

  const partners = data?.partnerStats || [];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Partner Performance</h3>
      </CardHeader>
      <CardBody>
        {partners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No partner data available
          </div>
        ) : (
          <Table aria-label="Partner performance">
            <TableHeader>
              <TableColumn>PARTNER</TableColumn>
              <TableColumn>AGENTS</TableColumn>
              <TableColumn>TOTAL COMMISSION</TableColumn>
              <TableColumn>PARTNER COMMISSION</TableColumn>
              <TableColumn>COMMISSIONS</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.partnerId}>
                  <TableCell>
                    <span className="font-medium">{partner.partnerName}</span>
                  </TableCell>
                  <TableCell>{formatNumber(partner.agentCount)}</TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(partner.totalCommission)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(partner.totalPartnerCommission)}
                  </TableCell>
                  <TableCell>{formatNumber(partner.commissionCount)}</TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        partner.totalCommission > 0 ? "success" : "warning"
                      }
                    >
                      {partner.totalCommission > 0 ? "Active" : "Inactive"}
                    </Chip>
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

export default MobiflexPartnerPerformance;
