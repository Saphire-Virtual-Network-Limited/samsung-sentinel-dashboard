"use client";
import React from "react";
import { SingleRefereeView } from "@/view/dashboard";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SingleRefereePage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const role = "admin"; // Hardcoded for this route

  return (
    <SingleRefereeView 
      status="approved-referees" 
      id={resolvedParams.id} 
      role={role}
    />
  );
} 