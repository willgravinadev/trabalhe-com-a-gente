'use client'

import { cn } from '@github-search/utils'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { type ComponentProps } from 'react'

export function TooltipProvider({ delayDuration = 0, ...props }: Readonly<ComponentProps<typeof TooltipPrimitive.Provider>>) {
  // eslint-disable-next-line @eslint-react/no-context-provider -- fix later
  return <TooltipPrimitive.Provider data-slot='tooltip-provider' delayDuration={delayDuration} {...props} />
}

export function Tooltip({ ...props }: Readonly<ComponentProps<typeof TooltipPrimitive.Root>>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot='tooltip' {...props} />
    </TooltipProvider>
  )
}

export function TooltipTrigger({ ...props }: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />
}

export function TooltipContent({ className, sideOffset = 0, children, ...props }: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot='tooltip-content'
        sideOffset={sideOffset}
        className={cn(
          'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin) z-50 w-fit text-balance rounded-md px-3 py-1.5 text-xs',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className='bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]' />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}
