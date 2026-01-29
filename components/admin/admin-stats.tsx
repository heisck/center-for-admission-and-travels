'use client'

import { useAdmin } from '@/context/admin-context'
import { Package, Users, FileText, Globe } from 'lucide-react'

export function AdminStats() {
  const { content } = useAdmin()

  const stats = [
    {
      icon: Globe,
      label: 'Services',
      value: content.home.services.length,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Package,
      label: 'Packages',
      value: content.packages.length,
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Users,
      label: 'Team Members',
      value: content.about.team.length,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: FileText,
      label: 'Core Values',
      value: content.about.coreValues.length,
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div key={idx} className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition">
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
              <Icon size={24} />
            </div>
            <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        )
      })}
    </div>
  )
}
