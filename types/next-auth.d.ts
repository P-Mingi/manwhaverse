import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      locale: string
      avatar_url: string | null
      display_name: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    locale: string
    avatar_url: string | null
    display_name: string | null
  }
}
