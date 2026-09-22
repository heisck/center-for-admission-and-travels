'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Undo2,
  Redo2,
  Save,
  Eye,
  Pencil,
  RotateCw,
  ExternalLink,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Home,
  Info,
  Package,
  GraduationCap,
  Briefcase,
  Compass,
  Globe,
  Shield,
  BookOpen,
  Mail,
  Send,
  Phone,
  CreditCard,
  ImageIcon,
  SlidersHorizontal,
  User,
  Loader2,
  Check,
} from 'lucide-react'

import { useAdmin } from '@/context/admin-context'
import { useAdminWorkspace } from '@/context/admin-workspace-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  exact?: boolean
  badgeKey?: 'messages' | 'payments'
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Website Pages',
    items: [
      { href: '/admin', label: 'Home', icon: Home, exact: true, description: 'Hero, services & featured' },
      { href: '/admin/about', label: 'About Us', icon: Info, description: 'Mission, vision, team & founder' },
      { href: '/admin/packages', label: 'Packages', icon: Package, description: 'Travel, study & work packages' },
      { href: '/admin/study-abroad', label: 'Study Abroad', icon: GraduationCap, description: 'Programs, requirements & visas' },
      { href: '/admin/work-abroad', label: 'Work Abroad', icon: Briefcase, description: 'Global jobs & work permits' },
      { href: '/admin/travel-tours', label: 'Travel & Tours', icon: Compass, description: 'Destinations & itineraries' },
      { href: '/admin/global-network', label: 'Services', icon: Globe, description: 'Immigration & travel docs' },
      { href: '/admin/legal', label: 'Legal Pages', icon: Shield, description: 'Terms, privacy & refunds' },
    ],
  },
  {
    title: 'Communications',
    items: [
      { href: '/admin/blog', label: 'Blog & News', icon: BookOpen, description: 'Articles, updates & insights' },
      { href: '/admin/contact-messages', label: 'Messages', icon: Mail, badgeKey: 'messages', description: 'Customer inquiries & forms' },
      { href: '/admin/newsletter', label: 'Newsletter', icon: Send, description: 'Subscribers & campaigns' },
      { href: '/admin/contact', label: 'Contact & Links', icon: Phone, description: 'Office info & social channels' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/admin/payments', label: 'Payments', icon: CreditCard, badgeKey: 'payments', description: 'Transactions & orders' },
      { href: '/admin/media', label: 'Media Library', icon: ImageIcon, description: 'Images & asset cleanup' },
      { href: '/admin/payment-settings', label: 'Payment Gateways', icon: SlidersHorizontal, description: 'Paystack, PayPal & bank' },
      { href: '/admin/profile', label: 'Admin Profile', icon: User, description: 'Account credentials & auth' },
    ],
  },
]

export function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { undo, redo, canUndo, canRedo, saveAll, isSaving } = useAdmin()
  const { mode, setMode, refreshPreview, publicPath, isEditablePage } = useAdminWorkspace()

  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [badges, setBadges] = useState<{
    unreadMessages: number
    unviewedPayments: number
    pendingPayments: number
  }>({
    unreadMessages: 0,
    unviewedPayments: 0,
    pendingPayments: 0,
  })

  // Online / Offline monitor
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  // Badges notification polling
  const fetchBadges = () => {
    fetch('/api/admin/notifications', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setBadges({
            unreadMessages: data.data.unreadMessages ?? 0,
            unviewedPayments: data.data.unviewedPayments ?? 0,
            pendingPayments: data.data.pendingPayments ?? 0,
          })
        }
      })
      .catch((err) => {
        console.error('[AdminHeader] Notifications fetch error:', err)
      })
  }

  useEffect(() => {
    fetchBadges()
  }, [pathname])

  useEffect(() => {
    const onUpdate = () => fetchBadges()
    window.addEventListener('admin-notifications-update', onUpdate)
    return () => window.removeEventListener('admin-notifications-update', onUpdate)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsNavOpen(false)
  }, [pathname])

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsNavOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  // Active navigation item detection
  const activeItem = useMemo(() => {
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')) {
          return item
        }
      }
    }
    return null
  }, [pathname])

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // Ignore network errors on logout redirect
    } finally {
      setIsLoggingOut(false)
      router.push('/admin-login')
      router.refresh()
    }
  }

  const handleRefreshClick = () => {
    setIsRefreshing(true)
    refreshPreview()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const getBadgeCount = (badgeKey?: 'messages' | 'payments') => {
    if (badgeKey === 'messages') return badges.unreadMessages
    if (badgeKey === 'payments') return badges.unviewedPayments + badges.pendingPayments
    return 0
  }

  const ActiveIcon = activeItem?.icon || Home

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-16 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6 gap-2">
        {/* LEFT: Branding + Navigation Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/admin" className="flex items-center gap-2 shrink-0 group" title="Admin Home">
            <Image
              src="/images/ca-20logo.png"
              alt="Center for Admission and Travels"
              width={34}
              height={34}
              className="h-8 w-auto object-contain transition group-hover:opacity-90"
              priority
            />
            <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-slate-900">
              <span>Admin Panel</span>
              <span
                className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}
                title={isOnline ? 'Online' : 'Offline'}
              />
            </div>
          </Link>

          {/* Navigation Dropdown Popover */}
          <Popover open={isNavOpen} onOpenChange={setIsNavOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-800 transition"
                aria-label="Select section or page"
              >
                <ActiveIcon className="h-4 w-4 text-orange-600 shrink-0" />
                <span className="font-semibold max-w-[110px] sm:max-w-[160px] truncate">
                  {activeItem ? activeItem.label : 'Menu'}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isNavOpen ? 'rotate-180' : ''}`} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={8}
              className="w-[94vw] sm:w-[620px] lg:w-[740px] max-h-[82vh] overflow-y-auto p-4 bg-white rounded-xl shadow-xl border border-slate-200 z-[90]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isCurrent = item.exact
                          ? pathname === item.href
                          : pathname === item.href || pathname.startsWith(item.href + '/')
                        const count = getBadgeCount(item.badgeKey)
                        const ItemIcon = item.icon

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsNavOpen(false)}
                            className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs transition ${
                              isCurrent
                                ? 'bg-orange-50/80 text-orange-600 font-semibold border border-orange-200/60'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                            }`}
                          >
                            <ItemIcon
                              className={`h-4 w-4 mt-0.5 shrink-0 ${
                                isCurrent ? 'text-orange-600' : 'text-slate-400'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate">{item.label}</span>
                                {count > 0 && (
                                  <span className="min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full">
                                    {count > 99 ? '99+' : count}
                                  </span>
                                )}
                                {isCurrent && <Check className="h-3 w-3 text-orange-600 shrink-0" />}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {isOnline ? 'All systems operational' : 'Offline mode'}
                </span>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Public Website
                </a>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* CENTER: Workspace Controls (Live page / Edit content / Refresh / Open page) */}
        <div className="hidden md:flex items-center justify-center gap-1.5 sm:gap-2">
          {isEditablePage && publicPath ? (
            <>
              {/* Segmented Mode Toggle */}
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 sm:p-1">
                <button
                  type="button"
                  onClick={() => setMode('preview')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition ${
                    mode === 'preview'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Live page</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition ${
                    mode === 'edit'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Edit content</span>
                </button>
              </div>

              {/* Refresh preview */}
              <button
                type="button"
                onClick={handleRefreshClick}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                title="Refresh preview"
              >
                <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-orange-600' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>

              {/* Open page in new tab */}
              <a
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                title="Open page in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Open page</span>
              </a>
            </>
          ) : (
            <div className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {activeItem?.label || 'Management Console'}
            </div>
          )}
        </div>

        {/* RIGHT: Edit Actions, Badges & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Undo / Redo controls */}
          <div className="hidden lg:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 hover:bg-slate-200 rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 mx-0.5" />
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 hover:bg-slate-200 rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={saveAll}
            disabled={isSaving}
            className="hidden md:inline-flex px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            title="Save all changes to database"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Quick Notifications: Messages & Payments */}
          <Link
            href="/admin/contact-messages"
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition hidden md:inline-flex"
            title="Contact Messages"
          >
            <Mail className="h-4 w-4" />
            {badges.unreadMessages > 0 && (
              <span className="absolute 0.5 top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full">
                {badges.unreadMessages > 99 ? '99+' : badges.unreadMessages}
              </span>
            )}
          </Link>

          <Link
            href="/admin/payments"
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition hidden md:inline-flex"
            title="Payments"
          >
            <CreditCard className="h-4 w-4" />
            {badges.unviewedPayments + badges.pendingPayments > 0 && (
              <span className="absolute 0.5 top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full">
                {badges.unviewedPayments + badges.pendingPayments > 99
                  ? '99+'
                  : badges.unviewedPayments + badges.pendingPayments}
              </span>
            )}
          </Link>

          {/* User Account / Profile Dropdown */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    A
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-xl rounded-xl p-1 z-50">
                <DropdownMenuLabel className="font-normal px-2.5 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-slate-900">Administrator</p>
                    <div className="flex items-center gap-1.5 pt-0.5 text-xs text-muted-foreground">
                      <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span>{isOnline ? 'Online' : 'Offline mode'}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex items-center gap-2 cursor-pointer px-2.5 py-2 text-xs font-medium text-slate-700">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Admin Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/media" className="flex items-center gap-2 cursor-pointer px-2.5 py-2 text-xs font-medium text-slate-700">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                    <span>Media Library</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/payment-settings" className="flex items-center gap-2 cursor-pointer px-2.5 py-2 text-xs font-medium text-slate-700">
                    <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                    <span>Payment Gateways</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 cursor-pointer px-2.5 py-2 text-xs font-medium text-slate-700"
                  >
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                    <span>View Public Website</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  variant="destructive"
                  className="cursor-pointer px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </header>

    {/* MOBILE OVERLAY DRAWER */}
    {isMobileMenuOpen && (
      <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-white overflow-y-auto border-b border-slate-200 p-4 pb-24 space-y-4 shadow-2xl animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Mobile Action Controls: Save & Undo/Redo */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                saveAll()
                setIsMobileMenuOpen(false)
              }}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-white rounded-xl font-semibold shadow-xs hover:bg-primary/90 transition disabled:opacity-50 text-sm"
              title="Save all changes"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="p-2 hover:bg-slate-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <div className="w-px h-4 bg-slate-300 mx-0.5" />
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="p-2 hover:bg-slate-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Access: Messages & Payments */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/admin/contact-messages"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-600" />
                <span>Messages</span>
              </div>
              {badges.unreadMessages > 0 && (
                <span className="min-w-[18px] h-4 px-1.5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {badges.unreadMessages > 99 ? '99+' : badges.unreadMessages}
                </span>
              )}
            </Link>
            <Link
              href="/admin/payments"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-600" />
                <span>Payments</span>
              </div>
              {badges.unviewedPayments + badges.pendingPayments > 0 && (
                <span className="min-w-[18px] h-4 px-1.5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {badges.unviewedPayments + badges.pendingPayments > 99
                    ? '99+'
                    : badges.unviewedPayments + badges.pendingPayments}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile workspace toggle if editable */}
          {isEditablePage && publicPath && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workspace View</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('preview')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
                    mode === 'preview' ? 'bg-primary text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  <Eye className="h-4 w-4" /> Live page
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('edit')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
                    mode === 'edit' ? 'bg-primary text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  <Pencil className="h-4 w-4" /> Edit content
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleRefreshClick()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Refresh preview
                </button>
                <a
                  href={publicPath}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open page
                </a>
              </div>
            </div>
          )}

          {/* Categorized links in mobile */}
          <div className="space-y-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
                  {section.title}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {section.items.map((item) => {
                    const isCurrent = item.exact
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(item.href + '/')
                    const count = getBadgeCount(item.badgeKey)
                    const ItemIcon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                          isCurrent
                            ? 'bg-orange-50 text-orange-600 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ItemIcon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {count > 0 && (
                          <span className="min-w-[18px] h-4 px-1.5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2">
            <Link
              href="/admin/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>Admin Profile</span>
            </Link>
            <Link
              href="/admin/media"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ImageIcon className="h-4 w-4 text-slate-400" />
              <span>Media Library</span>
            </Link>
            <Link
              href="/admin/payment-settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <span>Payment Gateways</span>
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4" />
              View Public Website
            </a>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-center gap-2 w-full py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminHeader
