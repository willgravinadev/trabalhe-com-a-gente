import Link from 'next/link'
import { type JSX } from 'react'

import { RepositoriesListContainer } from './_components/repositories-list-container.component'

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
        <RepositoriesListContainer />
      </main>
    </div>
  )
}
