'use client'

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  const signOut = async () => {
    await nextAuthSignOut({ redirectTo: '/' })
  }

  return {
    user: session?.user ?? null,
    loading: status === 'loading',
    signOut,
  }
}
