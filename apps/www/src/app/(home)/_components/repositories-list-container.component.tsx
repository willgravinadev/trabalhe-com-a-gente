'use client'

import { Form, FormControl, FormField, FormItem, FormMessage } from '@components/shadcn-ui/form'
import { Input } from '@components/shadcn-ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/shadcn-ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryState } from 'nuqs'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { PiMagnifyingGlass } from 'react-icons/pi'
import { toast } from 'sonner'
import { z } from 'zod'

import { useSearchGithubRepositories } from '../../../http/github-repositories/search-github-repositories'

import { RepositoriesList } from './repositories-list.component'

const formSchema = z.object({
  query: z.string().min(1, {
    message: 'A consulta de pesquisa é obrigatória.'
  }),
  sortBy: z.string().optional(),
  repositoriesPerPage: z.number().optional()
})

export function RepositoriesListContainer() {
  const [query, setQuery] = useQueryState('query', { defaultValue: '' })
  const [selectedPage, setSelectedPage] = useQueryState('selected-page', { defaultValue: 1, parse: Number })
  const [repositoriesPerPage, setRepositoriesPerPage] = useQueryState('repositories-per-page', { defaultValue: 10, parse: Number })
  const [sortBy, setSortBy] = useQueryState('sort-by', { defaultValue: '' })

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const { isLoading, isFetching, data, error } = useSearchGithubRepositories({
    query,
    selectedPage,
    repositoriesPerPage: Number(repositoriesPerPage),
    sortBy
  })

  useEffect(() => {
    if (error) toast.error(error.message)
  }, [error])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: query,
      sortBy: sortBy,
      repositoriesPerPage: repositoriesPerPage
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setQuery(values.query)
    setSortBy(values.sortBy ?? '')
    setRepositoriesPerPage(values.repositoriesPerPage ?? 10)
    setSelectedPage(1)
  }

  const handleQueryChange = (value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setQuery(value)
      form.setValue('query', value)
      setSelectedPage(1)
    }, 750)
  }

  const handleSortByChange = (value: string) => {
    setSortBy(value)
    form.setValue('sortBy', value)
  }

  const handleRepositoriesPerPageChange = (value: number) => {
    setRepositoriesPerPage(value)
    form.setValue('repositoriesPerPage', value)
  }

  const handlePageChange = (page: number) => {
    setSelectedPage(page)
  }

  return (
    <div className='flex w-full flex-col gap-4'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-wrap justify-between gap-4 lg:flex-row lg:flex-nowrap'>
          <FormField
            control={form.control}
            name='query'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <div className='relative'>
                    <PiMagnifyingGlass className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                    <Input
                      placeholder='Pesquise por repositórios (ex: react, vue, typescript...)'
                      className='pl-10'
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e)
                        handleQueryChange(e.target.value)
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='repositoriesPerPage'
            render={({ field }) => (
              <FormItem className='min-w-48'>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleRepositoriesPerPageChange(Number(value))
                  }}
                  value={field.value?.toString() ?? '10'}
                >
                  <FormControl className='w-full'>
                    <SelectTrigger>
                      <SelectValue placeholder='Itens por página' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='25'>25</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                    <SelectItem value='100'>100</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sortBy'
            render={({ field }) => (
              <FormItem className='min-w-56'>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleSortByChange(value)
                  }}
                  value={field.value}
                >
                  <FormControl className='w-full'>
                    <SelectTrigger>
                      <SelectValue placeholder='Ordenar por' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='best_match'>Melhor correspondência</SelectItem>
                    <SelectItem value='most_stars'>Mais estrelas</SelectItem>
                    <SelectItem value='most_forks'>Mais forks</SelectItem>
                    <SelectItem value='recently_updated'>Atualizado recentemente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <RepositoriesList
        repositories={data?.repositories ?? []}
        pagination={
          data?.pagination ?? {
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
            itemsPerPage: repositoriesPerPage,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }
        isLoading={isLoading || isFetching}
        error={error}
        query={query}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
