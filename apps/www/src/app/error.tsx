'use client'

import { Button } from '@components/shadcn-ui'

export default function ErrorPage(props: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <h1 className='text-2xl font-bold'>Algo deu errado</h1>
      <p className='break-words rounded-md bg-zinc-100 p-4 dark:bg-zinc-800'>{props.error.message}</p>
      <Button onClick={props.reset} className='rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'>
        Tentar novamente
      </Button>
    </div>
  )
}
