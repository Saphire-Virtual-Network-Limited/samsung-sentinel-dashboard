import React from "react";
import SingleRefereeView from "@/view/dashboard/verify-Referee/singleRefView";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ApprovedRefereePage({ params }: PageProps) {
  const resolvedParams = await params;
  return <SingleRefereeView id={resolvedParams.id} />;
}
