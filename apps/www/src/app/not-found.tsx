'use client'

import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: '404'
}

export default function NotFoundPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <div className='mb-40 mt-52 flex flex-col items-center justify-center gap-12'>
        <h1 className='text-center text-6xl font-bold'>Not Found</h1>
      </div>
    </div>
  )
}
