import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}
