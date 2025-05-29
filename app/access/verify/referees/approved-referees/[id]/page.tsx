"use client";

import React from "react";
import SingleRefereeView from "@/view/dashboard/verify-Referee/singleRefView";

export default function ApprovedRefereePage({ params }: { params: { id: string } }) {
  return <SingleRefereeView id={params.id} />;
}