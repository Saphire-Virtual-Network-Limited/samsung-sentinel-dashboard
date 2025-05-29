"use client";

import React from "react";
import SingleRefereeView from "@/view/dashboard/verify-Referee/singleRefView";

export default function RefereePage({ params }: { params: { status: string; id: string } }) {
  return <SingleRefereeView status={params.status} id={params.id} />;
} 