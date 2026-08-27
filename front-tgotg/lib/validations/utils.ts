import type { z } from 'zod'

export function getFieldError<T extends Record<string, unknown>>(
  error: z.ZodError<T>,
  field: keyof T & string
): string | undefined {
  return error.issues.find((issue) => issue.path.join('.') === field)?.message
}
