import { SentinelSingleCustomerPage } from '@/view'
import React from 'react'


const SingleCustomerPage = ({ params }: any) => {
  return (<SentinelSingleCustomerPage sentinelCustomerId={params.id} />


  )
}

export default SingleCustomerPage