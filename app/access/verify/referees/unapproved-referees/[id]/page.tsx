"use client";
import React from "react";
import SingleRefereeView from "@/view/dashboard/verify-Referee/singleRefView";

export default function UnapprovedRefereePage({ params }: { params: { id: string } }) {
  return <SingleRefereeView id={params.id} />;
}