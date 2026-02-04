"use client"

import { UserAuthProvider } from "@/context/user-auth-context"

export function UserAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <UserAuthProvider>{children}</UserAuthProvider>
}
