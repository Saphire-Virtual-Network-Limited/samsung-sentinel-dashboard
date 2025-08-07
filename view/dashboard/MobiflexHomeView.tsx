"use client";

import React from "react";
import {
  MobiflexDailyDashCard,
  MobiflexInceptionDashCard,
  MobiflexLeaderboardAnalytic,
  MobiflexPartnerPerformance,
} from "@/components/mobiflex";

const MobiflexHomeView = () => {
  return (
    <div className="space-y-6">
      <MobiflexDailyDashCard />
      <MobiflexInceptionDashCard />
      <MobiflexLeaderboardAnalytic />
      <MobiflexPartnerPerformance />
    </div>
  );
};

export default MobiflexHomeView;
