import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}
