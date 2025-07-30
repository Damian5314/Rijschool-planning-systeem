import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlanningLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Filters skeleton */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planning grid skeleton */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header skeleton */}
                <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
                  <Skeleton className="h-12 bg-gray-50" />
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 bg-gray-50" />
                  ))}
                </div>

                {/* Time slots skeleton */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-8 gap-px bg-gray-200">
                    <Skeleton className="h-16 bg-white" />
                    {Array.from({ length: 7 }).map((_, j) => (
                      <div key={j} className="bg-white p-2 min-h-16">
                        {Math.random() > 0.7 && (
                          <Skeleton className="h-12 w-full rounded" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}