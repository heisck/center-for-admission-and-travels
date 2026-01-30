'use client'

import Link from 'next/link'
import { Home, Users, MapPin, BookOpen, Settings, Mail, ArrowRight } from 'lucide-react'

const PAGES = [
  {
    name: 'Home Page',
    description: 'Edit hero section, services, and call-to-action',
    icon: Home,
    href: '/admin/home',
    color: 'from-orange-500 to-orange-600',
  },
  {
    name: 'About Page',
    description: 'Manage company info, team, mission, and values',
    icon: Users,
    href: '/admin/about',
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Travel Tours',
    description: 'Edit travel packages and featured destinations',
    icon: MapPin,
    href: '/admin/travel-tours',
    color: 'from-green-500 to-green-600',
  },
  {
    name: 'Packages',
    description: 'Manage study, work, and travel packages',
    icon: BookOpen,
    href: '/admin/packages',
    color: 'from-purple-500 to-purple-600',
  },
  {
    name: 'Services',
    description: 'Edit service descriptions and details',
    icon: Settings,
    href: '/admin/services',
    color: 'from-red-500 to-red-600',
  },
  {
    name: 'Contact & Footer',
    description: 'Manage contact info, address, and social media links',
    icon: Mail,
    href: '/admin/contact',
    color: 'from-pink-500 to-rose-600',
  },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Admin Panel</h1>
          <p className="text-muted-foreground">
            Select a page below to start editing your website content
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {PAGES.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-primary"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${page.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="text-white" size={24} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2">{page.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{page.description}</p>

                {/* Arrow */}
                <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Edit
                  <ArrowRight size={16} className="ml-2" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Pages</p>
            <p className="text-3xl font-bold text-foreground">{PAGES.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-muted-foreground text-sm mb-2">Last Updated</p>
            <p className="text-3xl font-bold text-foreground">Just now</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-muted-foreground text-sm mb-2">Status</p>
            <p className="text-3xl font-bold text-green-600">Active</p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
          <h3 className="text-lg font-bold text-foreground mb-3">Quick Guide</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-foreground">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                1
              </span>
              <p>Click on any page card above to start editing</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                2
              </span>
              <p>Click on text to edit it inline - changes save automatically</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                3
              </span>
              <p>Use Undo/Redo buttons in the toolbar to revert changes</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                4
              </span>
              <p>Click Reset to revert all changes to defaults</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
