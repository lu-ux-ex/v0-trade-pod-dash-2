import { Suspense } from "react"
import PerksContent from "./perks-content"

export default function PerksPage() {
  return (
    <Suspense fallback={<PerksLoading />}>
      <PerksContent />
    </Suspense>
  )
}

function PerksLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="h-10 bg-muted rounded-md flex-1 animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
