'use client'

type PageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage(props: Readonly<PageProps>) {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <h1 className='text-2xl font-bold'>Something went wrong</h1>
      <p className='break-words rounded-md bg-zinc-100 p-4 dark:bg-zinc-800'>{props.error.message}</p>
    </div>
  )
}
