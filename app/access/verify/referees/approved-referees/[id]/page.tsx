"use client";

import React from "react";
import SingleRefereeView from "@/view/dashboard/verify-Referee/singleRefView";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ApprovedRefereePage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  return <SingleRefereeView id={resolvedParams.id} />;
}