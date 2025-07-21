"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { light: string; dark: string }
type ChartConfig = {
  [k: string]: {
    label?: string
    icon?: React.ComponentType
  } & ({ color?: string; theme?: never } | { theme?: Record<string, string>; color?: never })
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ config, className, children, ...props }, ref) => {
  const id = React.useId()
  if (!config) {
    return null
  }
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={ref}
        className={cn("flex h-[300px] w-full flex-col items-center justify-center overflow-hidden", className)}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      is
      nameKey?: string
      valueKey?: string
    }
>(
  (
    {
      className,
      viewBox,
      active,
      payload,
      label,
      nameKey,
      valueKey,
      hideLabel = false,
      hideIndicator = false,
      ...props
    },
    ref
  ) => {
    const { config } = useChart()

    if (!active || !payload?.length) {
      return null
    }

    const relevantPayload = payload.filter((item: any) => config[item.dataKey as keyof ChartConfig]?.label)

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[130px] items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        {!hideLabel && label ? (
          <div className="row-span-2 flex flex-col">
            \
