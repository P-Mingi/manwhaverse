import { auth } from '@/auth'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export default auth((req) => {
  // The `authorized` callback in auth.ts handles route protection
  // Here we combine Auth.js session validation with next-intl locale routing
  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
