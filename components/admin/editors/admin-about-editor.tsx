'use client'

import { useAdmin } from '@/context/admin-context'
import { ImageEditor } from '../image-editor'
import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'

export default function AdminAboutEditor() {
  const { content, updateAbout } = useAdmin()
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    role: '',
    image: '',
    description: '',
  })

  const about = content.about

  const handleAddTeamMember = () => {
    if (newTeam.name.trim()) {
      const member = {
        id: Date.now().toString(),
        ...newTeam,
      }
      updateAbout({
        team: [...about.team, member],
      })
      setNewTeam({ name: '', role: '', image: '', description: '' })
      setShowAddTeam(false)
    }
  }

  const handleDeleteTeamMember = (id: string) => {
    updateAbout({
      team: about.team.filter((m) => m.id !== id),
    })
  }

  const handleUpdateTeamMember = (id: string, field: string, value: string) => {
    const updated = about.team.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    )
    updateAbout({ team: updated })
  }

  const handleUpdateCoreValue = (id: string, field: string, value: string) => {
    const updated = about.coreValues.map((v) =>
      v.id === id ? { ...v, [field]: value } : v
    )
    updateAbout({ coreValues: updated })
  }

  const handleUpdateMission = (field: string, value: string | string[]) => {
    updateAbout({
      mission: { ...about.mission, [field]: value },
    })
  }

  const handleUpdateVision = (field: string, value: string | string[]) => {
    updateAbout({
      vision: { ...about.vision, [field]: value },
    })
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Hero Section</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
            <input
              type="text"
              value={about.heroTitle}
              onChange={(e) => updateAbout({ heroTitle: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Subtitle</label>
            <textarea
              value={about.heroSubtitle}
              onChange={(e) => updateAbout({ heroSubtitle: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Hero Image URL</label>
            <input
              type="text"
              value={about.heroImage}
              onChange={(e) => updateAbout({ heroImage: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="/images/..."
            />
          </div>

          <ImageEditor
            images={[about.heroImage]}
            onChange={(images) => updateAbout({ heroImage: images[0] || '' })}
            maxImages={1}
            label="Hero Section Image"
          />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Mission */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-8">
          <h3 className="text-2xl font-bold mb-6 text-foreground">Mission</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
              <input
                type="text"
                value={about.mission.title}
                onChange={(e) => handleUpdateMission('title', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <textarea
                value={about.mission.description}
                onChange={(e) => handleUpdateMission('description', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Points</label>
              <div className="space-y-2">
                {about.mission.points.map((point, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const newPoints = [...about.mission.points]
                      newPoints[idx] = e.target.value
                      handleUpdateMission('points', newPoints)
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-8">
          <h3 className="text-2xl font-bold mb-6 text-foreground">Vision</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
              <input
                type="text"
                value={about.vision.title}
                onChange={(e) => handleUpdateVision('title', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <textarea
                value={about.vision.description}
                onChange={(e) => handleUpdateVision('description', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Points</label>
              <div className="space-y-2">
                {about.vision.points.map((point, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const newPoints = [...about.vision.points]
                      newPoints[idx] = e.target.value
                      handleUpdateVision('points', newPoints)
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Core Values</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {about.coreValues.map((value) => (
            <div key={value.id} className="border border-border rounded-lg p-4">
              <input
                type="text"
                value={value.title}
                onChange={(e) => handleUpdateCoreValue(value.id, 'title', e.target.value)}
                className="w-full font-semibold px-2 py-1 border border-border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                value={value.description}
                onChange={(e) => handleUpdateCoreValue(value.id, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
          <button
            onClick={() => setShowAddTeam(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={16} /> Add Member
          </button>
        </div>

        <div className="space-y-4">
          {about.team.map((member) => (
            <div key={member.id} className="border border-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleUpdateTeamMember(member.id, 'name', e.target.value)}
                  className="text-lg font-semibold px-2 py-1 border border-border rounded flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => handleDeleteTeamMember(member.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 ml-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <input
                type="text"
                value={member.role}
                onChange={(e) => handleUpdateTeamMember(member.id, 'role', e.target.value)}
                placeholder="Role/Position"
                className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              <input
                type="text"
                value={member.image}
                onChange={(e) => handleUpdateTeamMember(member.id, 'image', e.target.value)}
                placeholder="Image URL"
                className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              <textarea
                value={member.description}
                onChange={(e) => handleUpdateTeamMember(member.id, 'description', e.target.value)}
                placeholder="Bio/Description"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
          ))}
        </div>

        {showAddTeam && (
          <div className="mt-4 border border-border rounded-lg p-4 bg-slate-50">
            <input
              type="text"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              placeholder="Team member name"
              className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={newTeam.role}
              onChange={(e) => setNewTeam({ ...newTeam, role: e.target.value })}
              placeholder="Role/Position"
              className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={newTeam.image}
              onChange={(e) => setNewTeam({ ...newTeam, image: e.target.value })}
              placeholder="Image URL"
              className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={newTeam.description}
              onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              placeholder="Bio/Description"
              className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddTeamMember}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                Add Member
              </button>
              <button
                onClick={() => setShowAddTeam(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-foreground rounded-lg font-medium hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
