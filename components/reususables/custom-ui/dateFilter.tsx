"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@heroui/react";
import { SelectField } from "../form";

interface DateFilterProps {
  onFilterChange: (startDate: string, endDate: string) => Promise<void>;
  initialStartDate?: string;
  initialEndDate?: string;
  className?: string;
  isLoading?: boolean;
}

const DateFilter: React.FC<DateFilterProps> = ({
  onFilterChange,
  initialStartDate,
  initialEndDate,
  className,
  isLoading = false
}) => {
  // Get date range options
  const getDateRanges = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Start of current month
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Last 7 days
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    
    // Last 30 days
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);
    
    // Last 90 days
    const last90Days = new Date(now);
    last90Days.setDate(now.getDate() - 90);

    return {
      today,
      firstDayOfMonth: firstDayOfMonth.toISOString().split('T')[0],
      last7Days: last7Days.toISOString().split('T')[0],
      last30Days: last30Days.toISOString().split('T')[0],
      last90Days: last90Days.toISOString().split('T')[0]
    };
  };

  const dateRanges = getDateRanges();
  const [startDate, setStartDate] = useState(initialStartDate || dateRanges.firstDayOfMonth);
  const [endDate, setEndDate] = useState(initialEndDate || dateRanges.today);
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedRange, setSelectedRange] = useState('month');

  useEffect(() => {
    // Apply this month's date range by default and submit to endpoint
    handleQuickSelect(selectedRange);
    // Remove the immediate API call on mount to prevent undefined values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialStartDate) setStartDate(initialStartDate);
    if (initialEndDate) setEndDate(initialEndDate);
  }, [initialStartDate, initialEndDate]);

  const handleApply = async () => {
    if (!isValidDateRange()) return;
    
    try {
      setIsFiltering(true);
      await onFilterChange(startDate, endDate);
    } catch (error) {
      console.error("Error applying date filter:", error);
    } finally {
      setIsFiltering(false);
    }
  };

  const isValidDateRange = () => {
    if (!startDate || !endDate) return false;
    return new Date(startDate) <= new Date(endDate);
  };

  const handleQuickSelect = async (range: string) => {
    setSelectedRange(range);
    let newStartDate = startDate;
    let newEndDate = endDate;

    switch(range) {
      case '7days':
        newStartDate = dateRanges.last7Days;
        newEndDate = dateRanges.today;
        break;
      case '30days':
        newStartDate = dateRanges.last30Days;
        newEndDate = dateRanges.today;
        break;
      case '90days':
        newStartDate = dateRanges.last90Days;
        newEndDate = dateRanges.today;
        break;
      case 'month':
        newStartDate = dateRanges.firstDayOfMonth;
        newEndDate = dateRanges.today;
        break;
      default:
        return;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);

    try {
      setIsFiltering(true);
      await onFilterChange(newStartDate, newEndDate);
    } catch (error) {
      console.error("Error applying quick select filter:", error);
    } finally {
      setIsFiltering(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-4 ">
        <SelectField
          htmlFor="date-range"
          id="date-range"
          placeholder="Date Range"
          onChange={(value) => handleQuickSelect(value as string)}
          defaultSelectedKeys={['month']}
          options={[
            { value: '7days', label: 'Last 7 Days' },
            { value: '30days', label: 'Last 30 Days' },
            { value: '90days', label: 'Last 90 Days' },
            { value: 'month', label: 'This Month' }
          ]}
          size="lg"
        />

        <div className="flex gap-2 items-center space-x-3">
          <p className="text-sm text-default-400">From</p>
          <Input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setSelectedRange('custom');
            }}
            className="w-full"
            max={endDate || undefined}
          />
          <p className="text-sm text-default-400">To</p>
          <Input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setSelectedRange('custom');
            }}
            className="w-full"
            min={startDate || undefined}
          />

          <Button
            variant="flat"
            className="bg-primary text-white"
            onPress={handleApply}
            disabled={!isValidDateRange() || isLoading || isFiltering}
          >
            {isFiltering || isLoading ? "Loading..." : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateFilter;
