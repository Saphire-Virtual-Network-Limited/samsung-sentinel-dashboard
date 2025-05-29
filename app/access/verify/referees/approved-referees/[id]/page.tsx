"use client";

import React from "react";
import SingleRefereeView from "@/view/dashboard/verify-Referee/singleRefView";

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ApprovedRefereePage({ params }: PageProps) {
  return <SingleRefereeView id={params.id} />;
}