"use client";
import React, { use } from "react";
import SingleRefereeView from "@/view/dashboard/verify-Referee/singleRefView";

export default function RejectedRefereePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  return <SingleRefereeView id={params.id} />;
}