import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ROUTES = ['/login', '/register']
const PROTECTED_PREFIXES = ['/mensajes', '/configuracion']

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname)
}

function isProtected(pathname: string): boolean {
  if (pathname === '/') return true
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('tgotg_token')?.value

  const hasSession = Boolean(token)

  if (isAuthRoute(pathname) && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (isProtected(pathname) && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/register', '/mensajes/:path*', '/configuracion/:path*'],
}
