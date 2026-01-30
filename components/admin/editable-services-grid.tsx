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

export function EditableServicesGrid() {
  const { content, updateServices } = useAdmin()
  const { services } = content.home

  const handleServiceUpdate = (idx: number, field: string, value: string) => {
    const newServices = [...services]
    newServices[idx] = { ...newServices[idx], [field]: value }
    updateServices(newServices)
  }

  const handleAddService = () => {
    const newService = {
      id: Date.now().toString(),
      icon: 'Globe',
      title: 'New Service',
      description: 'Service description',
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
                <Link
                  href={`/admin/${service.id}`}
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

