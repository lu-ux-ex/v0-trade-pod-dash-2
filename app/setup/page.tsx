import { Suspense } from "react"
import SetupContent from "./setup-content"

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <div className="animate-pulse">Loading...</div>
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  )
}
