'use client'

import { useAdminWorkspace } from '@/context/admin-workspace-context'
import { type ReactNode } from 'react'

export function AdminPageWorkspace({ children }: { children: ReactNode }) {
  const { mode } = useAdminWorkspace()

  return (
    <div
      data-workspace-mode={mode}
      className={`min-h-[calc(100vh-4rem)] w-full ${
        mode === 'preview' ? 'admin-live-mode' : 'admin-edit-mode'
      }`}
    >
      {children}
    </div>
  )
}
