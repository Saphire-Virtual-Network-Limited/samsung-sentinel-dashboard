"use client";

import React from 'react'
import {  DailyDashCardCollection, InceptionDashCardCollection  } from "@/components/reususables"
import CollectionAnalytcics from '@/components/dashboard/collectionAnalytcics'

const CollectionHomeView = () => {
  return (
    <div className='space-y-6'>
        <CollectionAnalytcics />
        <DailyDashCardCollection /> 
        <InceptionDashCardCollection />
    </div>
  )
}

export default CollectionHomeView