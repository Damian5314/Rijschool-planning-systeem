import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="relative mb-4">
        <Skeleton className="h-10 w-full md:w-1/3" />
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="[&_tr]:border-b">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                <Skeleton className="h-5 w-24" />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                <Skeleton className="h-5 w-24" />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                <Skeleton className="h-5 w-24" />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                <Skeleton className="h-5 w-24" />
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                <Skeleton className="h-5 w-24 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                  <Skeleton className="h-5 w-32" />
                </td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                  <Skeleton className="h-5 w-24" />
                </td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                  <Skeleton className="h-5 w-20" />
                </td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                  <Skeleton className="h-5 w-28" />
                </td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
