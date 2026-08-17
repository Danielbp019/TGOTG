'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerSchema, type RegisterValues } from '@/lib/validations/auth'

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>

const initialRegister: RegisterValues = {
  nick: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function getFieldError(
  error: z.ZodError<RegisterValues>,
  field: keyof RegisterValues
) {
  return error.issues.find((issue) => issue.path.join('.') === field)?.message
}

export function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = React.useState<RegisterValues>(initialRegister)
  const [errors, setErrors] = React.useState<RegisterErrors>({})
  const [formError, setFormError] = React.useState<string | undefined>()
  const [submitting, setSubmitting] = React.useState(false)

  function handleField(field: keyof RegisterValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormError(undefined)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = registerSchema.safeParse(form)
    if (!result.success) {
      setErrors({
        nick: getFieldError(result.error, 'nick'),
        email: getFieldError(result.error, 'email'),
        password: getFieldError(result.error, 'password'),
        confirmPassword: getFieldError(result.error, 'confirmPassword'),
      })
      return
    }
    setErrors({})
    if (form.nick.trim().toLowerCase() === 'dios supremo') {
      setFormError('Ya existe una civilización con ese nombre')
      return
    }
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      router.push('/')
    }, 800)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>
          Forja tu nombre y adéntrate en la gran guerra.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="register-nick">Nick</Label>
            <Input
              id="register-nick"
              type="text"
              autoComplete="nickname"
              value={form.nick}
              onChange={(event) => handleField('nick', event.target.value)}
              aria-invalid={Boolean(errors.nick)}
              aria-describedby={errors.nick ? 'register-nick-error' : undefined}
            />
            {errors.nick && (
              <p id="register-nick-error" className="text-destructive text-xs">
                {errors.nick}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-email">Correo electrónico</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => handleField('email', event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'register-email-error' : undefined
              }
            />
            {errors.email && (
              <p id="register-email-error" className="text-destructive text-xs">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-password">Contraseña</Label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => handleField('password', event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'register-password-error' : undefined
              }
            />
            {errors.password && (
              <p
                id="register-password-error"
                className="text-destructive text-xs"
              >
                {errors.password}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-confirm-password">
              Confirmar contraseña
            </Label>
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) =>
                handleField('confirmPassword', event.target.value)
              }
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? 'register-confirm-password-error'
                  : undefined
              }
            />
            {errors.confirmPassword && (
              <p
                id="register-confirm-password-error"
                className="text-destructive text-xs"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {formError && <p className="text-destructive text-sm">{formError}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
