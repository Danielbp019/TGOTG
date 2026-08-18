'use client'

import * as React from 'react'
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
import { ApiError } from '@/lib/api'
import { loginSchema, type LoginValues } from '@/lib/validations/auth'
import { useAuth } from '@/components/auth/auth-provider'

type LoginErrors = Partial<Record<keyof LoginValues, string>>

const initialLogin: LoginValues = {
  email: '',
  password: '',
}

function getFieldError(
  error: z.ZodError<LoginValues>,
  field: keyof LoginValues
) {
  return error.issues.find((issue) => issue.path.join('.') === field)?.message
}

export function LoginForm() {
  const { login } = useAuth()
  const [form, setForm] = React.useState<LoginValues>(initialLogin)
  const [errors, setErrors] = React.useState<LoginErrors>({})
  const [formError, setFormError] = React.useState<string | undefined>()
  const [submitting, setSubmitting] = React.useState(false)

  function handleField(field: keyof LoginValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormError(undefined)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = loginSchema.safeParse(form)
    if (!result.success) {
      setErrors({
        email: getFieldError(result.error, 'email'),
        password: getFieldError(result.error, 'password'),
      })
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await login(form.email, form.password)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422) {
          setErrors({
            email: error.errors.email?.[0],
            password: error.errors.password?.[0],
          })
          setFormError(error.message)
        } else if (error.status === 429) {
          setFormError('Demasiados intentos. Inténtalo de nuevo en un minuto.')
        } else {
          setFormError(error.message)
        }
      } else {
        setFormError('No se pudo conectar con el servidor.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>
          Accede para volver a guiar a tu civilización.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="login-email">Correo electrónico</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => handleField('email', event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
            />
            {errors.email && (
              <p id="login-email-error" className="text-destructive text-xs">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="login-password">Contraseña</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => handleField('password', event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
            />
            {errors.password && (
              <p
                id="login-password-error"
                className="text-destructive text-xs"
              >
                {errors.password}
              </p>
            )}
          </div>

          {formError && <p className="text-destructive text-sm">{formError}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar al mundo'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
