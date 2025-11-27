"use client"

import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import type React from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useState } from "react"
import { Trash2, Edit2, Plus } from "lucide-react"

interface AdminPackage {
  id: number
  name: string
  price: number
  duration: string
  category: string
}

export default function Admin() {
  useScrollToTop()
  const [packages, setPackages] = useState<AdminPackage[]>([
    { id: 1, name: "Dubai Experience", price: 899, duration: "6 Days", category: "travel" },
    { id: 2, name: "European Tour", price: 1299, duration: "7 Days", category: "travel" },
  ])
  const [formData, setFormData] = useState({ name: "", price: "", duration: "", category: "travel" })
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setPackages(
        packages.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: formData.name,
                price: Number(formData.price),
                duration: formData.duration,
                category: formData.category,
              }
            : p,
        ),
      )
      setEditingId(null)
    } else {
      setPackages([
        ...packages,
        {
          id: Math.max(...packages.map((p) => p.id), 0) + 1,
          name: formData.name,
          price: Number(formData.price),
          duration: formData.duration,
          category: formData.category,
        },
      ])
    }
    setFormData({ name: "", price: "", duration: "", category: "travel" })
  }

  const handleEdit = (pkg: AdminPackage) => {
    setFormData({ name: pkg.name, price: String(pkg.price), duration: pkg.duration, category: pkg.category })
    setEditingId(pkg.id)
  }

  const handleDelete = (id: number) => {
    setPackages(packages.filter((p) => p.id !== id))
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground mb-12">Manage packages and content</p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add/Edit Form */}
            <div className="lg:col-span-1 bg-white border border-border rounded-xl p-6 h-fit">
              <h3 className="text-xl font-bold mb-6 text-foreground">{editingId ? "Edit Package" : "Add Package"}</h3>
              <form onSubmit={handleAddPackage} className="space-y-4">
                <input
                  type="text"
                  placeholder="Package Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="travel">Travel</option>
                  <option value="study">Study</option>
                  <option value="work">Work</option>
                </select>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> {editingId ? "Update" : "Add"} Package
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      setFormData({ name: "", price: "", duration: "", category: "travel" })
                    }}
                    className="w-full px-4 py-2 bg-muted text-foreground rounded-lg font-semibold text-sm hover:bg-border transition"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            {/* Packages List */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-6 text-foreground">Packages</h3>
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white border border-border rounded-lg p-4 flex justify-between items-center hover:border-primary transition"
                  >
                    <div>
                      <h4 className="font-bold text-foreground">{pkg.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${pkg.price} • {pkg.duration} • {pkg.category}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="p-2 hover:bg-slate-50 rounded-lg transition text-primary"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
