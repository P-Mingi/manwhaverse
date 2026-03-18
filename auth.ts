import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Discord from 'next-auth/providers/discord'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Discord,
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/en/sign-in',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true, locale: true, avatar_url: true, display_name: true, content_filter: true },
        })
        if (dbUser) {
          token.username = dbUser.username
          token.locale = dbUser.locale
          token.avatar_url = dbUser.avatar_url
          token.display_name = dbUser.display_name
          token.content_filter = dbUser.content_filter
        }
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.locale = token.locale as string
        session.user.avatar_url = token.avatar_url as string | null
        session.user.display_name = token.display_name as string | null
        session.user.content_filter = (token.content_filter as string) ?? 'SAFE'
      }
      return session
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      const protectedPatterns = [/^\/[a-z]{2}\/library/, /^\/[a-z]{2}\/settings/, /^\/[a-z]{2}\/profile$/]
      const isProtected = protectedPatterns.some((p) => p.test(pathname))

      if (isProtected && !isLoggedIn) {
        const locale = pathname.match(/^\/([a-z]{2})/)?.[1] ?? 'en'
        return Response.redirect(new URL(`/${locale}/sign-in`, nextUrl.origin))
      }

      return true
    },
  },

  events: {
    async createUser({ user }) {
      if (user.id && user.email) {
        const baseUsername = (user.email.split('@')[0] ?? 'user')
          .replace(/[^a-zA-Z0-9_]/g, '')
          .slice(0, 20)

        let username = baseUsername
        let attempt = 0
        while (true) {
          const existing = await prisma.user.findUnique({ where: { username } })
          if (!existing || existing.id === user.id) break
          attempt++
          username = `${baseUsername}${attempt}`
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            username,
            display_name: user.name ?? baseUsername,
            avatar_url: user.image,
            locale: 'en',
          },
        })
      }
    },
  },
})
