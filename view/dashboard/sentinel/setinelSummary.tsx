"use client";
import { Tabs, Tab, cn } from "@heroui/react";
import { GeneralSans_Meduim } from "@/lib";
import { AllSentinelPage, SentinelPage } from "@/view";

import React from "react";

const SentinelSummaryView = () => {
  return (
    <div className="flex w-full flex-col">
      <Tabs
        aria-label="Options"
        size="lg"
        radius="lg"
        color="primary"
        className={cn("pb-5", GeneralSans_Meduim.className)}
        classNames={{
          tab: "lg:p-4 text-sm lg:text-base",
        }}>
        <Tab
          key="All Sentinel"
          title="All Sentinel"
          className="lg:p-4 text-base">
          <AllSentinelPage />
        </Tab>
        <Tab
          key="Standalone Sentinel"
          title="Standalone Sentinel"
          className="lg:p-4 text-base">
          <SentinelPage />
        </Tab>
      </Tabs>
    </div>
  );
};

export default SentinelSummaryView;
