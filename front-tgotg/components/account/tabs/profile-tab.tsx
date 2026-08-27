'use client'

import * as React from 'react'

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
import { getFieldError } from '@/lib/validations/utils'

type ProfileErrors = Partial<Record<keyof AccountProfileValues, string>>

interface ProfileTabProps {
  initialProfile: AccountProfileValues
  onReset?: () => number
}

export function ProfileTab({ initialProfile, onReset }: ProfileTabProps) {
  const { updateUser } = useAuth()
  const [profile, setProfile] =
    React.useState<AccountProfileValues>(initialProfile)
  const [profileErrors, setProfileErrors] = React.useState<ProfileErrors>({})
  const [formError, setFormError] = React.useState<string | undefined>()
  const [saved, setSaved] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const versionRef = React.useRef(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!onReset) return
    const v = onReset()
    if (v !== versionRef.current) {
      versionRef.current = v
      setProfile(initialProfile)
      setProfileErrors({})
      setFormError(undefined)
      setSaved(false)
      setSaving(false)
    }
  })

  function handleField(field: keyof AccountProfileValues, value: string) {
    setProfile((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'password' && value === '') {
        next.confirmPassword = ''
      }
      return next
    })
    setSaved(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = accountProfileSchema.safeParse(profile)
    if (!result.success) {
      setProfileErrors({
        email: getFieldError(result.error, 'email'),
        nick: getFieldError(result.error, 'nick'),
        currentPassword: getFieldError(result.error, 'currentPassword'),
        password: getFieldError(result.error, 'password'),
        confirmPassword: getFieldError(result.error, 'confirmPassword'),
      })
      setSaved(false)
      return
    }
    setProfileErrors({})
    setFormError(undefined)
    setSaved(false)
    setSaving(true)
    try {
      const { user: updated } = await updateAccountProfile({
        nick: profile.nick,
        current_password: profile.currentPassword || undefined,
        password: profile.password || undefined,
        password_confirmation: profile.confirmPassword || undefined,
      })
      updateUser(updated)
      setSaved(true)
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setProfileErrors({
          nick: error.errors.nick?.[0],
          currentPassword: error.errors.current_password?.[0],
          password: error.errors.password?.[0],
          confirmPassword:
            error.errors.confirmPassword?.[0] ??
            error.errors.password_confirmation?.[0],
        })
      } else {
        setFormError(
          error instanceof ApiError
            ? error.message
            : 'No se pudo conectar con el servidor.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="account-email">Correo electrónico</Label>
        <Input
          id="account-email"
          type="email"
          value={profile.email}
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
          value={profile.nick}
          onChange={(event) => handleField('nick', event.target.value)}
          aria-invalid={Boolean(profileErrors.nick)}
          aria-describedby={
            profileErrors.nick ? 'account-nick-error' : undefined
          }
        />
        {profileErrors.nick && (
          <p
            id="account-nick-error"
            className="text-destructive text-xs"
          >
            {profileErrors.nick}
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
          value={profile.currentPassword}
          onChange={(event) =>
            handleField('currentPassword', event.target.value)
          }
          aria-invalid={Boolean(profileErrors.currentPassword)}
          aria-describedby={
            profileErrors.currentPassword
              ? 'account-current-password-error'
              : undefined
          }
          placeholder="Necesaria para cambiar la contraseña"
        />
        {profileErrors.currentPassword && (
          <p
            id="account-current-password-error"
            className="text-destructive text-xs"
          >
            {profileErrors.currentPassword}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="account-password">Nueva contraseña</Label>
        <Input
          id="account-password"
          type="password"
          value={profile.password}
          onChange={(event) => handleField('password', event.target.value)}
          aria-invalid={Boolean(profileErrors.password)}
          aria-describedby={
            profileErrors.password
              ? 'account-password-error'
              : undefined
          }
          placeholder="Déjala en blanco para no cambiarla"
        />
        {profileErrors.password && (
          <p
            id="account-password-error"
            className="text-destructive text-xs"
          >
            {profileErrors.password}
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
          value={profile.confirmPassword}
          onChange={(event) =>
            handleField('confirmPassword', event.target.value)
          }
          aria-invalid={Boolean(profileErrors.confirmPassword)}
          aria-describedby={
            profileErrors.confirmPassword
              ? 'account-confirm-password-error'
              : undefined
          }
        />
        {profileErrors.confirmPassword && (
          <p
            id="account-confirm-password-error"
            className="text-destructive text-xs"
          >
            {profileErrors.confirmPassword}
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
        disabled={saving}
      >
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
