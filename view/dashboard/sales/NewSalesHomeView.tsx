"use client";

import React from "react";
import {
  DashCard,
  DailyDashCard,
  InceptionDashCard,
  DeviceDashAnalytic,
  ScreenReport,
} from "@/components/reususables";

const NewSalesHomeView = () => {
  return (
    <div className="space-y-6">
      <DailyDashCard />
      <InceptionDashCard />
      <DeviceDashAnalytic />
    </div>
  );
};

export default NewSalesHomeView;
