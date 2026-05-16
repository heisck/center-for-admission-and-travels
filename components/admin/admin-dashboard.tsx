'use client'

import { useState } from 'react'
import { Undo2, Redo2, Home, Info, Package, Settings, Eye, EyeOff, Plane, Save, CreditCard, ClipboardList } from 'lucide-react'
import { useAdmin } from '@/context/admin-context'
import AdminHomeEditor from './editors/admin-home-editor'
import AdminAboutEditor from './editors/admin-about-editor'
import AdminPackagesEditor from './editors/admin-packages-editor'
import AdminServicesEditor from './editors/admin-services-editor'
import AdminTravelToursEditor from './editors/admin-travel-tours-editor'
import AdminBookingsEditor from './editors/admin-bookings-editor'
import LivePreview from './live-preview'
import { AdminHelp } from './admin-help'
import { DataManager } from './data-manager'
import { AdminStats } from './admin-stats'
import { useRouter } from 'next/navigation'

type AdminPage = 'home' | 'about' | 'packages' | 'services' | 'travel-tours' | 'bookings' | 'payment-settings'

export default function AdminDashboard() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<AdminPage>('home')
  const [showPreview, setShowPreview] = useState(true)
  const { canUndo, canRedo, undo, redo, saveAll, isSaving } = useAdmin()

  const handleSave = async () => {
    await saveAll()
  }

  const tabs: { id: AdminPage; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'about', label: 'About', icon: <Info size={18} /> },
    { id: 'packages', label: 'Packages', icon: <Package size={18} /> },
    { id: 'travel-tours', label: 'Travel Tours', icon: <Plane size={18} /> },
    { id: 'services', label: 'Services', icon: <Settings size={18} /> },
    { id: 'bookings', label: 'Bookings', icon: <ClipboardList size={18} /> },
    { id: 'payment-settings', label: 'Payment', icon: <CreditCard size={18} /> },
  ]

  const handleTabClick = (tabId: AdminPage) => {
    if (tabId === 'payment-settings') {
      router.push('/admin/payment-settings')
    } else {
      setCurrentPage(tabId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Edit your website content in real-time</p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 rounded-lg border border-border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Undo"
              >
                <Undo2 size={18} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 rounded-lg border border-border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Redo"
              >
                <Redo2 size={18} />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 px-4 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save all changes to database"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <div className="w-px h-6 bg-border"></div>
              <DataManager />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border -mb-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-3 font-medium transition flex items-center gap-2 whitespace-nowrap border-b-2 -mb-4 pb-4 ${
                  currentPage === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${showPreview ? 'lg:grid lg:grid-cols-2 gap-8' : ''}`}>
        {/* Editor Section */}
        <div className={`${showPreview ? 'overflow-y-auto' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:max-w-2xl">
            {/* Stats Overview */}
            <AdminStats />

            {currentPage === 'home' && <AdminHomeEditor />}
            {currentPage === 'about' && <AdminAboutEditor />}
            {currentPage === 'packages' && <AdminPackagesEditor />}
            {currentPage === 'travel-tours' && <AdminTravelToursEditor />}
            {currentPage === 'services' && <AdminServicesEditor />}
            {currentPage === 'bookings' && <AdminBookingsEditor />}
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="hidden lg:block overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-8">
              <div className="sticky top-0 bg-gradient-to-br from-slate-50 to-slate-100 border border-border rounded-lg p-4 mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Live Preview</h3>
                <span className="text-xs text-muted-foreground">Updates in real-time</span>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                {currentPage === 'home' && <LivePreview />}
                {currentPage !== 'home' && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Preview available for Home page</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Preview Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="p-3 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition"
          title={showPreview ? 'Hide preview' : 'Show preview'}
        >
          {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Help Guide */}
      <AdminHelp />
    </div>
  )
}
