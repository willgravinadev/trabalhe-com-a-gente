'use client'

import { Toaster } from '@components/shadcn-ui/sonner'
import { TooltipProvider } from '@components/shadcn-ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { isProduction } from '@utils/constants.util'
import { ThemeProvider } from 'next-themes'
import { type ReactNode, useState } from 'react'

export const Providers = (props: { children: ReactNode }) => {
  // eslint-disable-next-line @eslint-react/naming-convention/use-state -- must be used
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute='class' defaultTheme='dark' enableSystem enableColorScheme disableTransitionOnChange>
        <TooltipProvider>
          {props.children}
          <ReactQueryDevtools initialIsOpen={!isProduction} />
          <Toaster toastOptions={{ duration: 2500 }} richColors visibleToasts={5} expand />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
