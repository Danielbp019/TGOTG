'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/auth/auth-provider'
import { ApiError, updateAccountProfile } from '@/lib/api'
import {
  accountProfileSchema,
  type AccountProfileValues,
} from '@/lib/validations/account'

interface ProfileTabProps {
  initialProfile: AccountProfileValues
  onReset?: () => number
}

export function ProfileTab({ initialProfile, onReset }: ProfileTabProps) {
  const { updateUser } = useAuth()
  const [formError, setFormError] = React.useState<string | undefined>()
  const [saved, setSaved] = React.useState(false)

  const form = useForm<AccountProfileValues>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: initialProfile,
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form

  const versionRef = React.useRef(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!onReset) return
    const v = onReset()
    if (v !== versionRef.current) {
      versionRef.current = v
      reset(initialProfile)
      setFormError(undefined)
      setSaved(false)
    }
  })

  async function onSubmit(data: AccountProfileValues) {
    setFormError(undefined)
    setSaved(false)
    try {
      const { user: updated } = await updateAccountProfile({
        nick: data.nick,
        current_password: data.currentPassword || undefined,
        password: data.password || undefined,
        password_confirmation: data.confirmPassword || undefined,
      })
      updateUser(updated)
      setSaved(true)
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        if (error.errors.nick?.[0]) {
          setError('nick', { message: error.errors.nick[0] })
        }
        if (error.errors.current_password?.[0]) {
          setError('currentPassword', { message: error.errors.current_password[0] })
        }
        if (error.errors.password?.[0]) {
          setError('password', { message: error.errors.password[0] })
        }
        const confirmError =
          error.errors.confirmPassword?.[0] ??
          error.errors.password_confirmation?.[0]
        if (confirmError) {
          setError('confirmPassword', { message: confirmError })
        }
      } else {
        setFormError(
          error instanceof ApiError
            ? error.message
            : 'No se pudo conectar con el servidor.'
        )
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="account-email">Correo electrónico</Label>
        <Input
          id="account-email"
          type="email"
          value={initialProfile.email}
          disabled
        />
        <p
          id="account-email-note"
          className="text-muted-foreground text-xs"
        >
          El correo no se puede modificar.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="account-nick">Nick</Label>
        <Input
          id="account-nick"
          type="text"
          {...register('nick')}
          aria-invalid={Boolean(errors.nick)}
          aria-describedby={
            errors.nick ? 'account-nick-error' : undefined
          }
        />
        {errors.nick && (
          <p
            id="account-nick-error"
            className="text-destructive text-xs"
          >
            {errors.nick.message}
          </p>
        )}
      </div>

      <Separator />

      <div className="grid gap-2">
        <Label htmlFor="account-current-password">
          Contraseña actual
        </Label>
        <Input
          id="account-current-password"
          type="password"
          autoComplete="current-password"
          {...register('currentPassword')}
          aria-invalid={Boolean(errors.currentPassword)}
          aria-describedby={
            errors.currentPassword
              ? 'account-current-password-error'
              : undefined
          }
          placeholder="Necesaria para cambiar la contraseña"
        />
        {errors.currentPassword && (
          <p
            id="account-current-password-error"
            className="text-destructive text-xs"
          >
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="account-password">Nueva contraseña</Label>
        <Input
          id="account-password"
          type="password"
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password
              ? 'account-password-error'
              : undefined
          }
          placeholder="Déjala en blanco para no cambiarla"
        />
        {errors.password && (
          <p
            id="account-password-error"
            className="text-destructive text-xs"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="account-confirm-password">
          Confirmar contraseña
        </Label>
        <Input
          id="account-confirm-password"
          type="password"
          {...register('confirmPassword')}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword
              ? 'account-confirm-password-error'
              : undefined
          }
        />
        {errors.confirmPassword && (
          <p
            id="account-confirm-password-error"
            className="text-destructive text-xs"
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {saved && (
        <p className="text-sm text-emerald-600">
          Cambios guardados correctamente.
        </p>
      )}

      {formError && (
        <p className="text-destructive text-sm">{formError}</p>
      )}

      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
