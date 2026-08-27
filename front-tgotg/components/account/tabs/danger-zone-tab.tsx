'use client'

import * as React from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth/auth-provider'
import { ApiError, deleteAccount } from '@/lib/api'
import {
  createDeleteAccountSchema,
  type DeleteAccountValues,
} from '@/lib/validations/account'
import { getFieldError } from '@/lib/validations/utils'

type DeleteErrors = Partial<Record<keyof DeleteAccountValues, string>> & {
  form?: string
}

interface DangerZoneTabProps {
  onReset?: () => number
}

export function DangerZoneTab({ onReset }: DangerZoneTabProps) {
  const { user, logout } = useAuth()
  const [confirmNick, setConfirmNick] = React.useState('')
  const [deletePassword, setDeletePassword] = React.useState('')
  const [deleteErrors, setDeleteErrors] = React.useState<DeleteErrors>({})
  const [deleting, setDeleting] = React.useState(false)

  const versionRef = React.useRef(0)
  React.useEffect(() => {
    if (!onReset) return
    const v = onReset()
    if (v !== versionRef.current) {
      versionRef.current = v
      setConfirmNick('')
      setDeletePassword('')
      setDeleteErrors({})
      setDeleting(false)
    }
  })

  async function handleDelete() {
    const result = createDeleteAccountSchema(user?.nick ?? '').safeParse({
      confirmNick,
      password: deletePassword,
    })
    if (!result.success) {
      setDeleteErrors({
        confirmNick: getFieldError(result.error, 'confirmNick'),
        password: getFieldError(result.error, 'password'),
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
  )
}
