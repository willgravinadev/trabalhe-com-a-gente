'use client'

import { Pagination } from '@components/pagination.component'
import { RepositoryCard } from '@components/repository-card.component'
import { type GitHubRepositoriesPagination, type GithubRepository } from '@http/github-repositories/search-github-repositories'

export function RepositoriesList(
  props: Readonly<{
    repositories: GithubRepository[]
    pagination: GitHubRepositoriesPagination
    isLoading: boolean
    error: Error | null
    query: string
    onPageChange: (page: number) => void
  }>
) {
  if (!props.query.trim()) {
    return (
      <div className='text-muted-foreground flex w-full justify-center py-12'>
        <p>Digite uma consulta para pesquisar repositórios</p>
      </div>
    )
  }

  if (props.isLoading) {
    return (
      <div className='flex w-full flex-col gap-4'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className='bg-muted animate-pulse rounded-lg p-6'>
            <div className='bg-muted-foreground/20 mb-2 h-6 w-3/4 rounded'></div>
            <div className='bg-muted-foreground/20 mb-4 h-4 w-full rounded'></div>
            <div className='flex space-x-4'>
              <div className='bg-muted-foreground/20 h-4 w-16 rounded'></div>
              <div className='bg-muted-foreground/20 h-4 w-16 rounded'></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (props.error) {
    return (
      <div className='text-destructive flex w-full flex-col items-center justify-center py-12'>
        <div className='text-center' role='alert' aria-live='polite'>
          <p className='mb-2 text-lg font-semibold'>Erro ao carregar repositórios</p>
          <p className='text-sm'>{props.error.message}</p>
        </div>
      </div>
    )
  }

  if (props.repositories.length === 0) {
    return (
      <div className='text-muted-foreground flex w-full justify-center py-12'>
        <div className='text-center'>
          <p className='mb-2 text-lg font-semibold'>Nenhum repositório encontrado</p>
          <p className='text-sm'>Tente ajustar sua consulta de pesquisa</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {props.repositories.map((repository) => (
          <RepositoryCard key={repository.externalID} repository={repository} />
        ))}
      </div>

      <Pagination pagination={props.pagination} onPageChange={props.onPageChange} isLoading={props.isLoading} query={props.query} />
    </div>
  )
}
