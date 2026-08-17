import { cn } from "@/lib/utils"

interface LevelBarProps {
  level: number
  max: number
  className?: string
}

export function LevelBar({ level, max, className }: LevelBarProps) {
  return (
    <div
      role="img"
      aria-label={`Nivel ${level} de ${max}`}
      className={cn("flex w-full gap-1", className)}
    >
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            index < level ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  )
}