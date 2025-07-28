'use client'

import { Button } from '@components/shadcn-ui/button'
import { cn } from '@github-search/utils'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface PaginationProps {
  pagination: {
    currentPage: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    totalItems: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  isLoading: boolean
  query: string
  className?: string
}

function generatePageNumbers(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages: Array<number | 'ellipsis'> = []
  pages.push(1)
  if (currentPage <= 4) {
    pages.push(2, 3, 4, 5)
    if (totalPages > 6) pages.push('ellipsis')
    pages.push(totalPages)
  } else if (currentPage >= totalPages - 3) {
    if (totalPages > 6) pages.push('ellipsis')
    pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
  } else {
    pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages)
  }
  return pages
}

export function Pagination({ pagination, onPageChange, isLoading, query, className }: Readonly<PaginationProps>) {
  const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1
  const endItem = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)
  if (pagination.totalPages <= 1) return null
  const pageNumbers = generatePageNumbers(pagination.currentPage, pagination.totalPages)
  return (
    <div className={`flex flex-col items-center gap-6 ${className ?? ''}`}>
      <div className='text-muted-foreground text-center text-sm'>
        Mostrando{' '}
        <span className='text-foreground font-medium'>
          {startItem.toLocaleString('pt-BR')} - {endItem.toLocaleString('pt-BR')}
        </span>
        {' de '}
        <span className='text-foreground font-medium'>{pagination.totalItems.toLocaleString('pt-BR')}</span>
        {' repositórios para '}
        <span className='text-foreground font-medium'>"{query}"</span>
      </div>

      <nav className='flex items-center justify-center' aria-label='Navegação de páginas'>
        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage || isLoading}
            className={cn(pagination.currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer', 'hover:text-foreground')}
            aria-label='Página anterior'
          >
            <ChevronLeftIcon className='h-4 w-4' />
            <span className='ml-1 hidden sm:inline'>Anterior</span>
          </Button>
          <div className='mx-2 hidden items-center gap-1 sm:flex'>
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === 'ellipsis') {
                return (
                  <span key={`ellipsis-${index}`} className='text-muted-foreground px-2' aria-hidden='true'>
                    …
                  </span>
                )
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.currentPage ? 'default' : 'outline'}
                  size='sm'
                  className='hover:text-foreground'
                  onClick={() => onPageChange(pageNum)}
                  disabled={isLoading}
                  aria-label={`Ir para página ${pageNum}`}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <div className='flex items-center px-3 py-1 text-sm sm:hidden'>
            <span className='text-foreground font-medium'>{pagination.currentPage}</span>
            <span className='text-muted-foreground mx-1'>/</span>
            <span className='text-muted-foreground'>{pagination.totalPages}</span>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage || isLoading}
            className={cn(pagination.currentPage === pagination.totalPages ? 'cursor-not-allowed' : 'cursor-pointer', 'hover:text-foreground')}
            aria-label='Próxima página'
          >
            <span className='mr-1 hidden sm:inline'>Próximo</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </nav>
      {isLoading && (
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
          <span>Carregando página...</span>
        </div>
      )}
    </div>
  )
}
