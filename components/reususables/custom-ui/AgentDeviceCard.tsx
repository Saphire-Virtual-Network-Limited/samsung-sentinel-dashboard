"use client";

import React, { useState } from "react";
import { Button, Chip, Snippet } from "@heroui/react";

interface DeviceItem {
  id: string;
  itemCode: string;
  itemName: string;
  availableQty: number;
  serialNumbers: string[];
  createdAt: string;
  updatedAt: string;
  mbeId: string;
  expiryDate?: string;
}

interface AgentDeviceCardProps {
  device: DeviceItem;
  className?: string;
}

const AgentDeviceCard: React.FC<AgentDeviceCardProps> = ({
  device,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isExpiringSoon =
    device.expiryDate &&
    new Date(device.expiryDate) <=
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const isExpired =
    device.expiryDate && new Date(device.expiryDate) < new Date();

  return (
    <div
      className={`bg-default-50 rounded-lg p-3 border border-default-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-default-900 text-sm truncate">
            {device.itemName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-default-500">
            <span>#{device.itemCode}</span>
            <span>•</span>
            <span>
              {device.availableQty} unit{device.availableQty !== 1 ? "s" : ""}
            </span>
            {device.expiryDate && (
              <>
                <span>•</span>
                <span
                  className={
                    isExpired
                      ? "text-danger"
                      : isExpiringSoon
                      ? "text-warning"
                      : "text-success"
                  }
                >
                  {isExpired
                    ? "Expired"
                    : isExpiringSoon
                    ? "Due Soon"
                    : "Active"}
                </span>
              </>
            )}
          </div>
        </div>
        <Button
          variant="light"
          size="md"
          isIconOnly
          className="text-default-400 hover:text-default-600 w-fit"
          onPress={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <span>Hide</span> : <span>View More</span>}
        </Button>
      </div>
      <div className="space-y-1">
        <div className="text-xs text-default-500">Serial Numbers:</div>
        {isExpanded ? (
          <div className="space-y-1">
            {device.serialNumbers.map((serial, index) => (
              <div
                key={serial}
                className="flex items-center justify-between bg-white rounded px-2 py-1 text-xs"
              >
                <span className="text-default-600">#{index + 1}</span>
                <Snippet
                  codeString={serial}
                  size="sm"
                  className="text-xs"
                  hideSymbol
                >
                  {serial}
                </Snippet>
              </div>
            ))}
          </div>
        ) : (
          <div className="hidden">
            {device.serialNumbers.slice(0, 3).map((serial) => (
              <Snippet
                key={serial}
                codeString={serial}
                size="sm"
                className="text-xs"
                hideSymbol
              >
                {serial.length > 8 ? `${serial.slice(0, 8)}...` : serial}
              </Snippet>
            ))}
            {device.serialNumbers.length > 3 && (
              <Chip size="sm" variant="flat" className="text-xs">
                +{device.serialNumbers.length - 3} more
              </Chip>
            )}
          </div>
        )}
      </div>
      {(isExpanded || device.expiryDate) && (
        <div className="flex items-center justify-between text-xs text-default-500 mt-2 pt-2 border-t border-default-200">
          <span>
            Assigned: {new Date(device.createdAt).toLocaleDateString()}
          </span>
          {device.expiryDate && (
            <span
              className={
                isExpired
                  ? "text-danger"
                  : isExpiringSoon
                  ? "text-warning"
                  : "text-success"
              }
            >
              Return by: {new Date(device.expiryDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentDeviceCard;
export type { DeviceItem };
