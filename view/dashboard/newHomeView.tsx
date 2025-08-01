"use client";

import React from "react";
import {
  DashCard,
  DailyDashCard,
  InceptionDashCard,
  DeviceDashAnalytic,
  ScreenReport,
} from "@/components/reususables";
import { getSelectedProduct } from "@/utils";
import MobiflexHomeView from "./MobiflexHomeView";
const NewHomeView = () => {
  const { label: selectedProduct } = getSelectedProduct();
  if (selectedProduct == "Mobiflex") {
    return <MobiflexHomeView />;
  }
  return (
    <div className="space-y-6">
      <DailyDashCard />
      <InceptionDashCard />
      <DeviceDashAnalytic />
      <ScreenReport />
    </div>
  );
};

export default NewHomeView;
