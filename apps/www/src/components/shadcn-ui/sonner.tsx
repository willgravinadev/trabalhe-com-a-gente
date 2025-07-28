'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

type SonnerTheme = ToasterProps['theme']

const isValidSonnerTheme = (theme: string | undefined): theme is SonnerTheme => {
  return theme === 'light' || theme === 'dark' || theme === 'system'
}

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  const sonnerTheme: SonnerTheme = isValidSonnerTheme(theme) ? theme : 'system'
  return (
    <Sonner
      theme={sonnerTheme}
      className='toaster group'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)'
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
