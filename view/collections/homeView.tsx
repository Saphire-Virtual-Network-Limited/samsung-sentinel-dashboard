"use client";

import React from 'react'
import {  DailyDashCardCollection, InceptionDashCardCollection  } from "@/components/reususables"

const CollectionHomeView = () => {
  return (
    <div className='space-y-6'>
        <DailyDashCardCollection /> 
        <InceptionDashCardCollection />
    </div>
  )
}

export default CollectionHomeView