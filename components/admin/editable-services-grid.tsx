'use client'

import Link from 'next/link'
import { Globe, Briefcase, Plane, GraduationCap, Plus, Trash2 } from 'lucide-react'
import { useAdmin } from '@/context/admin-context'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
} from '@/components/admin/editable-content'

const iconMap: Record<string, any> = {
  GraduationCap,
  Briefcase,
  Plane,
  Globe,
}

const ROUTE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '/study-abroad', label: 'Study Abroad' },
  { value: '/work-abroad', label: 'Work Abroad' },
  { value: '/travel-tours', label: 'Travel & Tours' },
  { value: '/global-network', label: 'Professional Services' },
]

const ROUTE_TO_ADMIN: Record<string, string> = {
  '/study-abroad': '/admin/study-abroad',
  '/work-abroad': '/admin/work-abroad',
  '/travel-tours': '/admin/travel-tours',
  '/global-network': '/admin/global-network',
}

// Legacy title map only when route is unset
const titleToAdminRoute: Record<string, string> = {
  'Study Abroad': '/admin/study-abroad',
  'Work Abroad': '/admin/work-abroad',
  'Travel & Tours': '/admin/travel-tours',
  'Travel Tours': '/admin/travel-tours',
  'Global Network': '/admin/global-network',
  'Professional Services': '/admin/global-network',
  'Travel Documentation Services': '/admin/global-network',
}

function getAdminRouteForService(service: {
  id: string
  title: string
  route?: string | null
}): string {
  if (service.route && ROUTE_TO_ADMIN[service.route]) {
    return ROUTE_TO_ADMIN[service.route]
  }
  const normalizedTitle = service.title?.trim() || ''
  const route = titleToAdminRoute[normalizedTitle]
  if (route) return route
  const slug = normalizedTitle.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')
  if (['study-abroad', 'work-abroad', 'travel-tours', 'global-network'].includes(slug)) {
    return `/admin/${slug}`
  }
  return '/admin/services'
}

function defaultRouteForIndex(index: number): string {
  return ROUTE_OPTIONS[index]?.value || ROUTE_OPTIONS[0].value
}

export function EditableServicesGrid() {
  const { content, updateServices } = useAdmin()
  const { services } = content.home

  const handleServiceUpdate = (idx: number, field: string, value: string) => {
    const newServices = [...services]
    newServices[idx] = { ...newServices[idx], [field]: value }
    updateServices(newServices)
  }

  const handleAddService = () => {
    const index = services.length
    const newService = {
      id: `new-${Date.now()}`,
      icon: 'Globe',
      title: 'New Service',
      description: 'Service description',
      // Always pin a public route so renaming title later never 404s
      route: defaultRouteForIndex(index),
    }
    updateServices([...services, newService])
  }

  const handleDeleteService = (idx: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      updateServices(services.filter((_, i) => i !== idx))
    }
  }

  return (
    <section id="services" className="py-12 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Our </span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive solutions for your international journey
          </p>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            Edit titles and descriptions freely. Public URLs stay stable via the
            &quot;Links to&quot; route — not the title text.
          </p>
          <button
            onClick={handleAddService}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add Service
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, idx) => {
            const Icon = iconMap[service.icon] || Globe
            const linkedRoute = service.route || defaultRouteForIndex(idx)
            return (
              <div
                key={service.id}
                className="group p-8 rounded-2xl border border-border hover:border-primary bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-red-500 transition">
                    <Icon className="w-7 h-7 text-primary group-hover:text-white transition" />
                  </div>
                  <button
                    onClick={() => handleDeleteService(idx)}
                    className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 opacity-0 group-hover:opacity-100"
                    title="Delete service"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <EditableTextWrapper
                  value={service.title}
                  onChange={(value) => handleServiceUpdate(idx, 'title', value)}
                  variant="heading"
                  className="text-2xl font-bold mb-3 text-foreground"
                />
                <EditableTextareaWrapper
                  value={service.description}
                  onChange={(value) => handleServiceUpdate(idx, 'description', value)}
                  rows={3}
                  className="text-muted-foreground leading-relaxed mb-4"
                />
                <div className="flex flex-col gap-1 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <label className="text-muted-foreground font-medium shrink-0">
                      Links to:
                    </label>
                    <select
                      value={linkedRoute}
                      onChange={(e) => handleServiceUpdate(idx, 'route', e.target.value)}
                      className="px-2 py-1 border border-border rounded bg-white text-foreground font-mono min-w-0 flex-1"
                    >
                      {ROUTE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.value} ({opt.label})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-muted-foreground">
                    Changing the title above does not change this URL.
                  </p>
                </div>
                <Link
                  href={getAdminRouteForService({ ...service, route: linkedRoute })}
                  className="inline-block text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform"
                >
                  Click to know more →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
