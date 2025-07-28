'use client'

import { RepositoriesList } from '@components/repositories-list.component'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@components/shadcn-ui/form'
import { Input } from '@components/shadcn-ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/shadcn-ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchGithubRepositories } from '@http/github-repositories/search-github-repositories'
import { useQueryState } from 'nuqs'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { PiMagnifyingGlass } from 'react-icons/pi'
import { toast } from 'sonner'
import { z } from 'zod'

const SORT_OPTIONS = ['best_match', 'most_stars', 'most_forks', 'recently_updated'] as const
const REPOSITORIES_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const

const formSchema = z.object({
  query: z.string().min(1, {
    message: 'A consulta de pesquisa é obrigatória.'
  }),
  sortBy: z.string().optional(),
  repositoriesPerPage: z
    .number()
    .int()
    .min(10)
    .max(100)
    .refine((value) => REPOSITORIES_PER_PAGE_OPTIONS.includes(value as (typeof REPOSITORIES_PER_PAGE_OPTIONS)[number]), {
      message: 'O número de repositórios por página deve ser 10, 25, 50 ou 100.'
    })
    .optional()
})

type FormSchema = z.infer<typeof formSchema>

type SortOption = (typeof SORT_OPTIONS)[number]

function RepositoriesListContainerComponent() {
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

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: query,
      sortBy: sortBy,
      repositoriesPerPage: repositoriesPerPage
    }
  })

  function onSubmit(values: FormSchema) {
    setQuery(values.query)
    setSortBy(values.sortBy ?? '')
    setRepositoriesPerPage(values.repositoriesPerPage ?? 10)
    setSelectedPage(1)
  }

  const handleQueryChange = useCallback(
    (value: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setQuery(value)
        form.setValue('query', value)
        setSelectedPage(1)
      }, 750)
    },
    [setQuery, form, setSelectedPage]
  )

  const handleSortByChange = useCallback(
    (value: string) => {
      if (value === '' || SORT_OPTIONS.includes(value as SortOption)) {
        setSortBy(value)
        form.setValue('sortBy', value)
      }
    },
    [setSortBy, form]
  )

  const handleRepositoriesPerPageChange = useCallback(
    (value: number) => {
      if (REPOSITORIES_PER_PAGE_OPTIONS.includes(value as (typeof REPOSITORIES_PER_PAGE_OPTIONS)[number])) {
        setRepositoriesPerPage(value)
        form.setValue('repositoriesPerPage', value)
      }
    },
    [setRepositoriesPerPage, form]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      setSelectedPage(page)
    },
    [setSelectedPage]
  )

  const memoizedPagination = useMemo(() => {
    return (
      data?.pagination ?? {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: repositoriesPerPage,
        hasNextPage: false,
        hasPreviousPage: false
      }
    )
  }, [data?.pagination, repositoriesPerPage])

  return (
    <div className='flex w-full flex-col gap-4' role='main' aria-label='Lista de repositórios do GitHub'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-wrap justify-between gap-4 lg:flex-row lg:flex-nowrap'
          role='search'
          aria-label='Formulário de pesquisa de repositórios'
        >
          <FormField
            control={form.control}
            name='query'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <div className='relative'>
                    <PiMagnifyingGlass className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' aria-hidden='true' />
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
                      aria-label='Campo de pesquisa de repositórios'
                      aria-describedby='search-description'
                      role='searchbox'
                      type='search'
                    />
                  </div>
                </FormControl>
                <FormMessage />
                <div id='search-description' className='sr-only'>
                  Digite palavras-chave para pesquisar repositórios no GitHub
                </div>
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
                    <SelectTrigger aria-label='Selecionar número de itens por página'>
                      <SelectValue placeholder='Itens por página' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent role='listbox' aria-label='Opções de itens por página'>
                    <SelectItem value='10' role='option'>
                      10
                    </SelectItem>
                    <SelectItem value='25' role='option'>
                      25
                    </SelectItem>
                    <SelectItem value='50' role='option'>
                      50
                    </SelectItem>
                    <SelectItem value='100' role='option'>
                      100
                    </SelectItem>
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
                    <SelectTrigger aria-label='Selecionar critério de ordenação'>
                      <SelectValue placeholder='Ordenar por' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent role='listbox' aria-label='Opções de ordenação'>
                    <SelectItem value='best_match' role='option'>
                      Melhor correspondência
                    </SelectItem>
                    <SelectItem value='most_stars' role='option'>
                      Mais estrelas
                    </SelectItem>
                    <SelectItem value='most_forks' role='option'>
                      Mais forks
                    </SelectItem>
                    <SelectItem value='recently_updated' role='option'>
                      Atualizado recentemente
                    </SelectItem>
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
        pagination={memoizedPagination}
        isLoading={isLoading || isFetching}
        error={error}
        query={query}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export const RepositoriesListContainer = memo(RepositoriesListContainerComponent)
