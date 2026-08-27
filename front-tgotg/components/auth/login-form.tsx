'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ApiError } from '@/lib/api'
import { loginSchema, type LoginValues } from '@/lib/validations/auth'
import { getFieldError } from '@/lib/validations/utils'
import { useAuth } from '@/components/auth/auth-provider'
import { HelpCircle } from 'lucide-react'

type LoginErrors = Partial<Record<keyof LoginValues, string>>

const initialLogin: LoginValues = {
  email: '',
  password: '',
  remember: false,
}

export function LoginForm() {
  const { login } = useAuth()
  const [form, setForm] = React.useState<LoginValues>(initialLogin)
  const [errors, setErrors] = React.useState<LoginErrors>({})
  const [formError, setFormError] = React.useState<string | undefined>()
  const [submitting, setSubmitting] = React.useState(false)

  function handleField(field: keyof LoginValues, value: string | boolean) {
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
      await login(form.email, form.password, form.remember)
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
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <div>
        <h2 className="font-heading text-xl font-bold">Vuelve a tu reino</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Tus ciudades han seguido creciendo mientras no estabas.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="login-email">Correo electrónico</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="dios@reino.com"
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
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => handleField('password', event.target.value)}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? 'login-password-error' : undefined
          }
        />
        {errors.password && (
          <p id="login-password-error" className="text-destructive text-xs">
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="login-remember"
          checked={form.remember ?? false}
          onCheckedChange={(checked) => handleField('remember', checked === true)}
        />
        <Label htmlFor="login-remember" className="text-sm font-normal">
          Recuérdame
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="text-muted-foreground size-4 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Mantener la sesión activa durante 30 días</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {formError && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="bg-wine text-parchment hover:bg-wine/90 mt-1 h-11 w-full gap-2.5 rounded-md text-[0.92rem] font-bold tracking-wide"
      >
        <span
          aria-hidden="true"
          className="border-gold-bright size-4 shrink-0 rounded-full border-[1.5px]"
        />
        {submitting ? 'Entrando…' : 'Entrar al reino'}
      </Button>
    </form>
  )
}
