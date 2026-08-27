'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useAuth } from '@/components/auth/auth-provider'
import { HelpCircle } from 'lucide-react'

export function LoginForm() {
  const { login } = useAuth()
  const [formError, setFormError] = React.useState<string | undefined>()
  const submittedRef = React.useRef(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form

  const rememberValue = watch('remember')

  async function onSubmit(data: LoginValues) {
    if (submittedRef.current) return
    submittedRef.current = true
    setFormError(undefined)
    try {
      await login(data.email, data.password, data.remember)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422) {
          if (error.errors.email?.[0]) {
            form.setError('email', { message: error.errors.email[0] })
          }
          if (error.errors.password?.[0]) {
            form.setError('password', { message: error.errors.password[0] })
          }
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
      submittedRef.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
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
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
        />
        {errors.email && (
          <p id="login-email-error" className="text-destructive text-xs">
            {errors.email.message}
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
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? 'login-password-error' : undefined
          }
        />
        {errors.password && (
          <p id="login-password-error" className="text-destructive text-xs">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="login-remember"
          checked={rememberValue ?? false}
          onCheckedChange={(checked) => setValue('remember', checked === true)}
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
        disabled={isSubmitting}
        className="bg-wine text-parchment hover:bg-wine/90 mt-1 h-11 w-full gap-2.5 rounded-md text-[0.92rem] font-bold tracking-wide"
      >
        <span
          aria-hidden="true"
          className="border-gold-bright size-4 shrink-0 rounded-full border-[1.5px]"
        />
        {isSubmitting ? 'Entrando…' : 'Entrar al reino'}
      </Button>
    </form>
  )
}
