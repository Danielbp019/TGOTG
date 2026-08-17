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
import { loginSchema, type LoginValues } from '@/lib/validations/auth'

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
  const router = useRouter()
  const [form, setForm] = React.useState<LoginValues>(initialLogin)
  const [errors, setErrors] = React.useState<LoginErrors>({})
  const [formError, setFormError] = React.useState<string | undefined>()
  const [submitting, setSubmitting] = React.useState(false)

  function handleField(field: keyof LoginValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormError(undefined)
  }

  function handleSubmit(event: React.FormEvent) {
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
    if (form.email === 'error@tgotg.com') {
      setFormError('Correo o contraseña incorrectos')
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
