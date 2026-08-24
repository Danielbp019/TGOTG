import { cn } from '@/lib/utils'

interface BrandMarkProps {
  className?: string
  letterClassName?: string
}

export function BrandMark({ className, letterClassName }: BrandMarkProps) {
  return (
    <span
      className={cn(
        'bg-ink relative flex shrink-0 items-center justify-center rounded-full',
        className ?? 'size-9'
      )}
    >
      <span
        aria-hidden="true"
        className="border-gold-bright absolute inset-[3px] rounded-full border"
      />
      <span
        className={cn(
          'font-deco text-gold-bright -translate-y-px leading-none',
          letterClassName ?? 'text-sm'
        )}
      >
        T
      </span>
    </span>
  )
}
