import { RepositoriesListContainer } from '@components/repositories-list-container.component'
import Link from 'next/link'
import { type JSX, Suspense } from 'react'

export default function HomePage(): JSX.Element {
  return (
    <div className='mx-auto flex min-h-screen w-full flex-col'>
      <header className='mx-auto flex w-full max-w-7xl flex-row items-center justify-between px-6 py-4'>
        <h1 className='text-accent hover:text-primary text-2xl font-bold transition-colors duration-300'>
          <Link href='/'>GitHub Repositories</Link>
        </h1>
      </header>
      <div className='bg-accent h-[1px] w-full' />
      <main className='mx-auto flex w-full max-w-7xl flex-col items-start gap-2 px-6 py-4'>
        <h2 className='text-foreground text-2xl font-bold'>Procure por repositórios</h2>
        <p className='text-muted-foreground mb-4 text-sm'>Encontre repositórios no GitHub de forma rápida e fácil.</p>
        <Suspense
          fallback={
            <div className='flex w-full items-center justify-center'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
            </div>
          }
        >
          <RepositoriesListContainer />
        </Suspense>
      </main>
    </div>
  )
}
