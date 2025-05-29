"use client";
import { SingleRefereeView } from '@/view/dashboard'
import React from 'react'

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const SingleRefereePage = ({ params }: PageProps) => {
  const resolvedParams = React.use(params);
  const role = "verify"; // Hardcoded for this route

  return (
    <SingleRefereeView status="rejected-referees" id={resolvedParams.id} role={role} />
  )
}

export default SingleRefereePage