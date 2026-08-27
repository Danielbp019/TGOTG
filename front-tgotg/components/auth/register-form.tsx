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
import { registerSchema, type RegisterValues } from '@/lib/validations/auth'
import { useAuth } from '@/components/auth/auth-provider'
import { HelpCircle } from 'lucide-react'

export function RegisterForm() {
  const { register: registerUser } = useAuth()
  const [formError, setFormError] = React.useState<string | undefined>()

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nick: '',
      email: '',
      password: '',
      confirmPassword: '',
      remember: false,
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form

  const rememberValue = watch('remember')

  async function onSubmit(data: RegisterValues) {
    setFormError(undefined)
    try {
      await registerUser({
        nick: data.nick,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
        remember: data.remember,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422) {
          if (error.errors.nick?.[0]) {
            form.setError('nick', { message: error.errors.nick[0] })
          }
          if (error.errors.email?.[0]) {
            form.setError('email', { message: error.errors.email[0] })
          }
          if (error.errors.password?.[0]) {
            form.setError('password', { message: error.errors.password[0] })
          }
          const confirmError =
            error.errors.confirmPassword?.[0] ??
            error.errors.password_confirmation?.[0]
          if (confirmError) {
            form.setError('confirmPassword', { message: confirmError })
          }
          setFormError(error.message)
        } else {
          setFormError(error.message)
        }
      } else {
        setFormError('No se pudo conectar con el servidor.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <div>
        <h2 className="font-heading text-xl font-bold">
          Funda tu civilización
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Elige un nombre digno de ser recordado por los otros dioses.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-nick">Nombre de dios</Label>
        <Input
          id="register-nick"
          type="text"
          autoComplete="nickname"
          placeholder="Tu nombre en el reino"
          {...register('nick')}
          aria-invalid={Boolean(errors.nick)}
          aria-describedby={errors.nick ? 'register-nick-error' : undefined}
        />
        {errors.nick && (
          <p id="register-nick-error" className="text-destructive text-xs">
            {errors.nick.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-email">Correo electrónico</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="dios@reino.com"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
        />
        {errors.email && (
          <p id="register-email-error" className="text-destructive text-xs">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-password">Contraseña</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? 'register-password-error' : undefined
          }
        />
        {errors.password && (
          <p id="register-password-error" className="text-destructive text-xs">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-confirm-password">Confirmar contraseña</Label>
        <Input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register('confirmPassword')}
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
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="register-remember"
          checked={rememberValue ?? false}
          onCheckedChange={(checked) => setValue('remember', checked === true)}
        />
        <Label htmlFor="register-remember" className="text-sm font-normal">
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
        {isSubmitting ? 'Fundando…' : 'Fundar civilización'}
      </Button>
    </form>
  )
}
