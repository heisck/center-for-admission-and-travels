'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { useIsMobile } from '@/components/ui/use-mobile'

interface AdminOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

/**
 * Adaptive overlay:
 * - Phone / Mobile: Drawer sliding up from bottom
 * - Desktop: Centered Dialog modal
 */
export function AdminOverlay({
  open,
  onOpenChange,
  title,
  description,
  children,
}: AdminOverlayProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="z-[80] max-h-[92vh] flex flex-col bg-background">
          <DrawerHeader className="text-left border-b border-border pb-3 px-5 shrink-0">
            <DrawerTitle className="text-lg font-bold text-foreground">{title}</DrawerTitle>
            {description && (
              <DrawerDescription className="text-xs text-muted-foreground">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[80] max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-3 border-b border-border shrink-0">
          <DialogTitle className="text-xl font-bold text-foreground">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
