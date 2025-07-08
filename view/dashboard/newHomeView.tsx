"use client";

import React from 'react'
import { DashCard, DailyDashCard, InceptionDashCard, DeviceDashAnalytic, ScreenReport  } from "@/components/reususables"

const NewHomeView = () => {
  return (
    <div className='space-y-6'>
        <DailyDashCard /> 
        <InceptionDashCard />
        <DeviceDashAnalytic />
        <ScreenReport />
    </div>
  )
}

export default NewHomeView