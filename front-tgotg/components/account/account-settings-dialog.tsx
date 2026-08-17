'use client'

import * as React from 'react'
import { AlertTriangle, Trash2, User } from 'lucide-react'
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
import { currentUser } from '@/data/user'
import {
  accountProfileSchema,
  deleteAccountSchema,
  type AccountProfileValues,
} from '@/lib/validations/account'

interface AccountSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ProfileErrors = Partial<Record<keyof AccountProfileValues, string>>

const initialProfile: AccountProfileValues = {
  email: currentUser.email,
  nick: currentUser.name,
  password: '',
  confirmPassword: '',
}

function getFieldError(
  error: z.ZodError<AccountProfileValues>,
  field: keyof AccountProfileValues
) {
  return error.issues.find((issue) => issue.path.join('.') === field)?.message
}

export function AccountSettingsDialog({
  open,
  onOpenChange,
}: AccountSettingsDialogProps) {
  const [profile, setProfile] =
    React.useState<AccountProfileValues>(initialProfile)
  const [profileErrors, setProfileErrors] = React.useState<ProfileErrors>({})
  const [saved, setSaved] = React.useState(false)
  const [confirmNick, setConfirmNick] = React.useState('')
  const [deleteError, setDeleteError] = React.useState<string | undefined>()

  function resetForm() {
    setProfile(initialProfile)
    setProfileErrors({})
    setSaved(false)
    setConfirmNick('')
    setDeleteError(undefined)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetForm()
    }
    onOpenChange(next)
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

  function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = accountProfileSchema.safeParse(profile)
    if (!result.success) {
      setProfileErrors({
        email: getFieldError(result.error, 'email'),
        nick: getFieldError(result.error, 'nick'),
        password: getFieldError(result.error, 'password'),
        confirmPassword: getFieldError(result.error, 'confirmPassword'),
      })
      setSaved(false)
      return
    }
    setProfileErrors({})
    setSaved(true)
  }

  function handleDelete() {
    const result = deleteAccountSchema.safeParse({ confirmNick })
    if (!result.success) {
      setDeleteError(result.error.issues[0]?.message)
      return
    }
    setDeleteError(undefined)
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

                  <Button type="submit" className="w-full sm:w-auto">
                    Guardar cambios
                  </Button>
                </form>
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
                        setDeleteError(undefined)
                      }}
                      aria-invalid={Boolean(deleteError)}
                      aria-describedby={
                        deleteError ? 'account-confirm-nick-error' : undefined
                      }
                    />
                    {deleteError && (
                      <p
                        id="account-confirm-nick-error"
                        className="text-destructive text-xs"
                      >
                        {deleteError}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    className="mt-3 w-full sm:w-auto"
                  >
                    <Trash2 />
                    Borrar cuenta
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
