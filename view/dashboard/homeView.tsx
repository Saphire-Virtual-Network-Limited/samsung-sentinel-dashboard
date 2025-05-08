"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn,} from "@/lib";
import { Button, card, Card, CardBody, CardHeader, Input } from "@heroui/react";
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib";

const HomeView = () => {
  const date = new Date();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const monthYear = `${month}, ${year}`;

  // Get first and last day of current month for default date range
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [filteredMetrics, setFilteredMetrics] = useState<any[]>([]);
  const [tempStartDate, setTempStartDate] = useState(firstDay);
  const [tempEndDate, setTempEndDate] = useState(lastDay);

  // Helper to format each metric card
  const formatMetric = (title: string, value: string | number, change: string, href: string, hasNaira: boolean = false) => {
    const numericChange = parseFloat(change);
    const isPositive = numericChange > 0;
    const trendIcon = isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />;
    const changeColor = isPositive ? "text-green-600" : "text-red-600";
    const changeBg = isPositive ? "bg-green-100" : "bg-red-100";

    return {
      title,
      value,
      change: `${change}%`,
      trendIcon,
      changeColor,
      changeBg,
      href,
      hasNaira
    };
  };

  // Build dynamic metrics from API response
  const metrics = [
    formatMetric("Total No. of Loans", "45,872", "101,152", "#"),
    formatMetric("Total Amount of Loans", "42,199,000", "101,152", "#", true),
    formatMetric("Total No. of Ongoing Loans", "125,450", "101,152", "#"),
    formatMetric("Total Amount of Ongoing Loans", "28,450,000", "101,152", "#", true),
  ];

  const handleApplyFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
  };

  useEffect(() => {
    if (startDate && endDate) {
      // Filter metrics based on date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Here you would typically make an API call with the date range
      // For now, we'll just simulate filtered data
      const filtered = metrics.map(metric => ({
        ...metric,
        value: metric.hasNaira 
          ? Math.floor(Math.random() * 50000000).toLocaleString()
          : Math.floor(Math.random() * 50000).toLocaleString(),
        change: (Math.random() * 100).toFixed(2)
      }));
      
      setFilteredMetrics(filtered);
    } else {
      setFilteredMetrics(metrics);
    }
  }, [startDate, endDate]);

  // Set initial metrics on component mount
  useEffect(() => {
    setFilteredMetrics(metrics);
  }, []);

  return (
    <>
      <div className="flex gap-2 items-center justify-end space-x-3 mb-4">
        <p className="text-sm text-default-400">From</p>
        <Input
          type="date"
          placeholder="Start Date"
          value={tempStartDate}
          onChange={(e) => setTempStartDate(e.target.value)}
          className="w-32"
        />
        <p className="text-sm text-default-400">To</p>
        <Input
          type="date"
          placeholder="End Date"
          value={tempEndDate}
          onChange={(e) => setTempEndDate(e.target.value)}
          className="w-32"
        />
        <Button
          variant="flat"
          className="bg-primary text-white"
          onClick={handleApplyFilter}
        >Apply</Button>
      </div>
      <div className="grid auto-rows-min gap-4 grid-cols-2 lg:grid-cols-4 py-4">
        {filteredMetrics.map((item, index) => (
          <Card
            key={index}
            as={Link}
            isPressable
            href={item.href}
            className="rounded-xl hover:shadow-md transition-all duration-300 p-4 cursor-pointer">
            <CardHeader className="flex items-start justify-between">
                <h1 className={cn("lg:text-lg text-sm text-gray-600", GeneralSans_Meduim.className)}>{item.title}</h1>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className={cn("lg:text-3xl text-xl font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                {item.hasNaira ? `₦${item.value}` : item.value}
              </p>
              <div className="grid lg:flex items-center gap-2 text-sm text-gray-500">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${item.changeBg} ${item.changeColor}`}>
                  {item.trendIcon}
                  {item.change.replace("+", "")}
                </span>
                <span className={cn("text-xs", GeneralSans_Meduim.className)}>from last month</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      
    </>
  );
};

export default HomeView;