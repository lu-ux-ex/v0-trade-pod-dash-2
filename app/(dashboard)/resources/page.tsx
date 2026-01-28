import { Suspense } from "react"
import ResourcesContent from "./resources-content"

export default function ResourcesPage() {
  return (
    <Suspense fallback={null}>
      <ResourcesContent />
    </Suspense>
  )
}
