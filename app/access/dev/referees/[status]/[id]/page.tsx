"use client";

import { SingleRefereeView } from '@/view/dashboard';
import React from 'react';

interface PageProps {
  params: Promise<{
    status: string;
    id: string;
  }>;
}

const SingleRefereePage = ({ params }: PageProps) => {
  const resolvedParams = React.use(params);
  return (
    <SingleRefereeView status={resolvedParams.status} id={resolvedParams.id} />
  );
};

export default SingleRefereePage; 