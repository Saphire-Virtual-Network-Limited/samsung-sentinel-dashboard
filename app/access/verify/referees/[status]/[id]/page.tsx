"use client";

import React from "react";
import { SingleRefereeView } from "@/view/dashboard";

interface PageProps {
  params: Promise<{
    status: string;
    id: string;
  }>;
}

const SingleRefereePage = ({ params }: PageProps) => {
  const resolvedParams = React.use(params);
  const role = "verify"; // Hardcoded for this route

  return <SingleRefereeView status={resolvedParams.status} id={resolvedParams.id} role={role} />;
};

export default SingleRefereePage; 