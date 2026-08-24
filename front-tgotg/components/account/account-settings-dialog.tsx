'use client'

import * as React from 'react'
import { AlertTriangle, Clock, Trash2, User } from 'lucide-react'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/auth/auth-provider'
import { ApiError, deleteAccount, updateAccountProfile } from '@/lib/api'
import { getSavedTimeFormat, saveTimeFormat } from '@/lib/settings'
import { cn } from '@/lib/utils'
import {
  accountProfileSchema,
  createDeleteAccountSchema,
  type AccountProfileValues,
  type DeleteAccountValues,
} from '@/lib/validations/account'

interface AccountSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ProfileErrors = Partial<Record<keyof AccountProfileValues, string>>
type DeleteErrors = Partial<Record<keyof DeleteAccountValues, string>> & {
  form?: string
}

function getFieldError(
  error: z.ZodError<AccountProfileValues>,
  field: keyof AccountProfileValues
) {
  return error.issues.find((issue) => issue.path.join('.') === field)?.message
}

function getDeleteFieldError(
  error: z.ZodError<DeleteAccountValues>,
  field: keyof DeleteAccountValues
) {
  return error.issues.find((issue) => issue.path.join('.') === field)?.message
}

export function AccountSettingsDialog({
  open,
  onOpenChange,
}: AccountSettingsDialogProps) {
  const { user, updateUser, logout } = useAuth()

  const initialProfile: AccountProfileValues = {
    email: user?.email ?? '',
    nick: user?.nick ?? '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  }

  const [profile, setProfile] =
    React.useState<AccountProfileValues>(initialProfile)
  const [profileErrors, setProfileErrors] = React.useState<ProfileErrors>({})
  const [formError, setFormError] = React.useState<string | undefined>()
  const [saved, setSaved] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [confirmNick, setConfirmNick] = React.useState('')
  const [deletePassword, setDeletePassword] = React.useState('')
  const [deleteErrors, setDeleteErrors] = React.useState<DeleteErrors>({})
  const [deleting, setDeleting] = React.useState(false)
  const [timeFormat, setTimeFormat] = React.useState<'24h' | '12h'>('24h')

  function resetForm() {
    setProfile(initialProfile)
    setProfileErrors({})
    setFormError(undefined)
    setSaved(false)
    setSaving(false)
    setConfirmNick('')
    setDeletePassword('')
    setDeleteErrors({})
    setDeleting(false)
    setTimeFormat(getSavedTimeFormat())
  }

  function handleOpenChange(next: boolean) {
    resetForm()
    onOpenChange(next)
  }

  const [prevOpen, setPrevOpen] = React.useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      resetForm()
    }
  }

  function handleProfileField(
    field: keyof AccountProfileValues,
    value: string
  ) {
    setProfile((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'password' && value === '') {
        next.confirmPassword = ''
      }
      return next
    })
    setSaved(false)
  }

  async function handleProfileSubmit(event: React.FormEvent) {
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

  async function handleDelete() {
    const result = createDeleteAccountSchema(user?.nick ?? '').safeParse({
      confirmNick,
      password: deletePassword,
    })
    if (!result.success) {
      setDeleteErrors({
        confirmNick: getDeleteFieldError(result.error, 'confirmNick'),
        password: getDeleteFieldError(result.error, 'password'),
      })
      return
    }
    setDeleteErrors({})
    setDeleting(true)
    try {
      await deleteAccount({
        confirm_nick: confirmNick,
        password: deletePassword,
      })
      setDeleting(false)
      await logout()
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setDeleteErrors({
          confirmNick: error.errors.confirm_nick?.[0],
          password: error.errors.password?.[0],
          form: error.message,
        })
      } else {
        setDeleteErrors({
          form:
            error instanceof ApiError
              ? error.message
              : 'No se pudo conectar con el servidor.',
        })
      }
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustes de cuenta</DialogTitle>
          <DialogDescription>
            Gestiona los datos de tu cuenta y su seguridad.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-auto overflow-hidden">
          <div className="grid gap-4 pr-3">
            <Tabs defaultValue="datos">
              <TabsList className="w-full">
                <TabsTrigger value="datos">
                  <User />
                  Datos de usuario
                </TabsTrigger>
                <TabsTrigger value="preferencias">
                  <Clock />
                  Preferencias
                </TabsTrigger>
                <TabsTrigger value="peligro">
                  <AlertTriangle />
                  Zona de peligro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="datos">
                <form
                  onSubmit={handleProfileSubmit}
                  className="grid gap-4"
                  noValidate
                >
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
                      onChange={(event) =>
                        handleProfileField('nick', event.target.value)
                      }
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
                        handleProfileField(
                          'currentPassword',
                          event.target.value
                        )
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
                      onChange={(event) =>
                        handleProfileField('password', event.target.value)
                      }
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
                        handleProfileField(
                          'confirmPassword',
                          event.target.value
                        )
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
              </TabsContent>

              <TabsContent value="preferencias">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="account-time-format">Formato de hora</Label>
                    <p className="text-muted-foreground text-xs">
                      Cómo se muestra la hora del servidor en la interfaz.
                    </p>
                    <div
                      id="account-time-format"
                      className="grid grid-cols-2 gap-2"
                    >
                      {(
                        [
                          { id: '24h', label: '24 horas' },
                          { id: '12h', label: '12 horas' },
                        ] as const
                      ).map((option) => {
                        const selected = option.id === timeFormat
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setTimeFormat(option.id)
                              saveTimeFormat(option.id)
                            }}
                            aria-pressed={selected}
                            className={cn(
                              'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                              selected
                                ? 'border-primary bg-primary/5 ring-primary ring-2'
                                : 'border-border hover:bg-muted'
                            )}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="peligro">
                <div className="border-destructive/40 bg-destructive/5 rounded-xl border p-4">
                  <h3 className="text-destructive flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="size-4" />
                    Borrar cuenta
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Esta acción es permanente y no se puede deshacer. Se
                    perderán todos tus progresos, recursos y datos.
                  </p>
                  <div className="mt-3 grid gap-2">
                    <Label htmlFor="account-confirm-nick">
                      Escribe tu nick para confirmar
                    </Label>
                    <Input
                      id="account-confirm-nick"
                      type="text"
                      value={confirmNick}
                      onChange={(event) => {
                        setConfirmNick(event.target.value)
                        setDeleteErrors((prev) => ({
                          ...prev,
                          confirmNick: undefined,
                          form: undefined,
                        }))
                      }}
                      aria-invalid={Boolean(deleteErrors.confirmNick)}
                      aria-describedby={
                        deleteErrors.confirmNick
                          ? 'account-confirm-nick-error'
                          : undefined
                      }
                    />
                    {deleteErrors.confirmNick && (
                      <p
                        id="account-confirm-nick-error"
                        className="text-destructive text-xs"
                      >
                        {deleteErrors.confirmNick}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2">
                    <Label htmlFor="account-delete-password">Contraseña</Label>
                    <Input
                      id="account-delete-password"
                      type="password"
                      autoComplete="current-password"
                      value={deletePassword}
                      onChange={(event) => {
                        setDeletePassword(event.target.value)
                        setDeleteErrors((prev) => ({
                          ...prev,
                          password: undefined,
                          form: undefined,
                        }))
                      }}
                      aria-invalid={Boolean(deleteErrors.password)}
                      aria-describedby={
                        deleteErrors.password
                          ? 'account-delete-password-error'
                          : undefined
                      }
                    />
                    {deleteErrors.password && (
                      <p
                        id="account-delete-password-error"
                        className="text-destructive text-xs"
                      >
                        {deleteErrors.password}
                      </p>
                    )}
                  </div>
                  {deleteErrors.form && (
                    <p className="text-destructive mt-2 text-sm">
                      {deleteErrors.form}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="mt-3 w-full sm:w-auto"
                  >
                    <Trash2 />
                    {deleting ? 'Borrando…' : 'Borrar cuenta'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
