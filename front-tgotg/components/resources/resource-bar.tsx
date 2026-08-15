import { resources, resourceAmounts, resourcePerHour } from "@/data/resources"

export function ResourceBar() {
  return (
    <ul className="flex flex-col gap-1">
      {Object.values(resources).map((resource) => (
        <li
          key={resource.key}
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm"
        >
          <span className="flex items-center gap-3 text-muted-foreground">
            <resource.icon className="size-4 shrink-0" />
            <span>{resource.label}</span>
          </span>
          <span className="flex items-baseline gap-2">
            <span className="font-medium tabular-nums">
              {resourceAmounts[resource.key].toLocaleString("es-ES")}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              +{resourcePerHour[resource.key]}/h
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
