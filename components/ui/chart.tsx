"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const Tooltip = <TValue extends RechartsPrimitive.Value, TName extends RechartsPrimitive.Name>({
  cursor,
  children,
  className,
  ...props
}: React.PropsWithChildren<RechartsPrimitive.TooltipProps<TValue, TName>> & {
  cursor?: boolean
}) => {
  const { active, payload, wrapperStyle } = props
  if (active && payload && payload.length) {
    return (
      <div
        className={cn(
          "relative z-50 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
          className,
        )}
        style={wrapperStyle}
      >
        {cursor && (
          <div
            className={cn(
              "absolute inset-y-0 left-0 w-px bg-muted",
              "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=horizontal]:inset-x-0 data-[orientation=horizontal]:top-0",
            )}
          />
        )}
        {children}
      </div>
    )
  }

  return null
}

const ChartTooltip = ({
  className,
  content,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  content?: React.ComponentProps<typeof ChartTooltipContent>
}) => {
  return (
    <RechartsPrimitive.Tooltip
      hideLabel
      cursor={{ stroke: "hsl(var(--chart-1))", strokeWidth: 1 }}
      content={<ChartTooltipContent {...content} />}
      className={className}
      {...props}
    />
  )
}
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    nameKey?: string
    valueKey?: string
  }
>(({ className, hideLabel = false, hideIndicator = false, nameKey, valueKey, children, ...props }, ref) => {
  const { active, payload } = RechartsPrimitive.useTooltip<RechartsPrimitive.Value, RechartsPrimitive.Name>()

  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0]?.payload
  const _nameKey = nameKey || payload[0]?.name
  const _valueKey = valueKey || payload[0]?.value

  return (
    <div
      ref={ref}
      className={cn("rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md", className)}
      {...props}
    >
      {!hideLabel && data?.[_nameKey as string] && <p className="font-medium">{data[_nameKey as string]}</p>}
      <div className="grid gap-1.5 pt-2">
        {payload.map((item, i) => {
          if (item.dataKey === "id") return null
          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {!hideIndicator && (
                  <span
                    className="size-3 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )}
                <span className="text-muted-foreground">{item.name || item.dataKey}</span>
              </div>
              <span className="font-medium text-foreground">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    config: Record<string, { label?: string; color?: string }>
    children: React.ReactNode
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId}`

  return (
    <div ref={ref} className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)} {...props}>
      <div
        data-chart={chartId}
        className="flex h-full w-full flex-col [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-dot[stroke='#8884d8']]:fill-primary [&_.recharts-line]:stroke-primary [&_.recharts-tooltip-cursor]:fill-accent [&_.recharts-xaxis-tick_line]:stroke-border [&_.recharts-yaxis-tick_line]:stroke-border"
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              id: chartId,
              config,
            } as React.PropsWithChildren<any>)
          }
          return child
        })}
      </div>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

export { ChartTooltip, ChartTooltipContent, ChartContainer }
