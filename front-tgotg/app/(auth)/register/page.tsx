import Link from 'next/link'

import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="grid gap-4">
      <RegisterForm />
      <p className="text-muted-foreground text-center text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="text-foreground font-medium underline underline-offset-3"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
