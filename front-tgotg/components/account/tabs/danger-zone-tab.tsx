'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

interface DangerZoneTabProps {
  onReset?: () => number
}

export function DangerZoneTab({ onReset }: DangerZoneTabProps) {
  const { user, logout } = useAuth()

  const deleteAccountSchema = createDeleteAccountSchema(user?.nick ?? '')

  const form = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirmNick: '', password: '' },
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form

  const versionRef = React.useRef(0)
  React.useEffect(() => {
    if (!onReset) return
    const v = onReset()
    if (v !== versionRef.current) {
      versionRef.current = v
      reset()
    }
  })

  async function onSubmit(data: DeleteAccountValues) {
    try {
      await deleteAccount({
        confirm_nick: data.confirmNick,
        password: data.password,
      })
      await logout()
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        if (error.errors.confirm_nick?.[0]) {
          setError('confirmNick', { message: error.errors.confirm_nick[0] })
        }
        if (error.errors.password?.[0]) {
          setError('password', { message: error.errors.password[0] })
        }
      } else {
        setError('root', {
          message:
            error instanceof ApiError
              ? error.message
              : 'No se pudo conectar con el servidor.',
        })
      }
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
      <form onSubmit={handleSubmit(onSubmit)} className="mt-3 grid gap-2">
        <div className="grid gap-2">
          <Label htmlFor="account-confirm-nick">
            Escribe tu nick para confirmar
          </Label>
          <Input
            id="account-confirm-nick"
            type="text"
            {...register('confirmNick')}
            aria-invalid={Boolean(errors.confirmNick)}
            aria-describedby={
              errors.confirmNick
                ? 'account-confirm-nick-error'
                : undefined
            }
          />
          {errors.confirmNick && (
            <p
              id="account-confirm-nick-error"
              className="text-destructive text-xs"
            >
              {errors.confirmNick.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="account-delete-password">Contraseña</Label>
          <Input
            id="account-delete-password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password
                ? 'account-delete-password-error'
                : undefined
            }
          />
          {errors.password && (
            <p
              id="account-delete-password-error"
              className="text-destructive text-xs"
            >
              {errors.password.message}
            </p>
          )}
        </div>
        {errors.root && (
          <p className="text-destructive text-sm">
            {errors.root.message}
          </p>
        )}
        <Button
          type="submit"
          variant="destructive"
          disabled={isSubmitting}
          className="mt-3 w-full sm:w-auto"
        >
          <Trash2 />
          {isSubmitting ? 'Borrando…' : 'Borrar cuenta'}
        </Button>
      </form>
    </div>
  )
}
