import Link from 'next/link'

import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="grid gap-4">
      <LoginForm />
      <p className="text-muted-foreground text-center text-sm">
        ¿Aún no tienes cuenta?{' '}
        <Link
          href="/register"
          className="text-foreground font-medium underline underline-offset-3"
        >
          Regístrate
        </Link>
      </p>
    </div>
  )
}
