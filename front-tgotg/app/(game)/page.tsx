import { ResourcesSummary } from '@/components/dashboard/resources-summary'
import { CitiesSummary } from '@/components/dashboard/cities-summary'
import { ActivityFeed } from '@/components/dashboard/activity-feed'

export default function SummaryPage() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <h2 className="font-heading text-center text-2xl font-bold">
        Acontecimientos del mundo
      </h2>

      <ResourcesSummary />
      <CitiesSummary />
      <ActivityFeed />
    </div>
  )
}
