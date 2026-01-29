'use client'

import { useAdmin } from '@/context/admin-context'
import { AdminToolbar } from '@/components/admin/admin-toolbar'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
  EditableImageListWrapper,
  EditableListWrapper,
  EditableSection,
} from '@/components/admin/editable-content'

export default function AdminAboutPage() {
  const { content, updateAbout } = useAdmin()
  const { about } = content

  const handleTeamUpdate = (idx: number, field: string, value: string) => {
    const newTeam = [...about.team]
    newTeam[idx] = { ...newTeam[idx], [field]: value }
    updateAbout({ team: newTeam })
  }

  const handleCoreValuesUpdate = (idx: number, field: string, value: string) => {
    const newValues = [...about.coreValues]
    newValues[idx] = { ...newValues[idx], [field]: value }
    updateAbout({ coreValues: newValues })
  }

  const handleMissionPointsUpdate = (points: string[]) => {
    updateAbout({
      mission: { ...about.mission, points },
    })
  }

  const handleVisionPointsUpdate = (points: string[]) => {
    updateAbout({
      vision: { ...about.vision, points },
    })
  }

  return (
    <>
      <AdminToolbar />

      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">About Page Editor</h1>
            <p className="text-muted-foreground mt-2">
              Edit company information, mission, vision, values, and team members.
            </p>
          </div>

          {/* Hero Section */}
          <EditableSection title="Hero Section">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Hero Title
                </label>
                <EditableTextWrapper
                  value={about.heroTitle}
                  onChange={(value) => updateAbout({ heroTitle: value })}
                  variant="title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Hero Subtitle
                </label>
                <EditableTextareaWrapper
                  value={about.heroSubtitle}
                  onChange={(value) => updateAbout({ heroSubtitle: value })}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Hero Image URL
                </label>
                <input
                  type="text"
                  value={about.heroImage}
                  onChange={(e) => updateAbout({ heroImage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </EditableSection>

          {/* Mission Section */}
          <EditableSection title="Our Mission">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mission Title
                </label>
                <EditableTextWrapper
                  value={about.mission.title}
                  onChange={(value) =>
                    updateAbout({ mission: { ...about.mission, title: value } })
                  }
                  variant="heading"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mission Description
                </label>
                <EditableTextareaWrapper
                  value={about.mission.description}
                  onChange={(value) =>
                    updateAbout({ mission: { ...about.mission, description: value } })
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mission Points
                </label>
                <EditableListWrapper
                  items={about.mission.points}
                  onChange={handleMissionPointsUpdate}
                  label="Points"
                  placeholder="Enter a mission point"
                />
              </div>
            </div>
          </EditableSection>

          {/* Vision Section */}
          <EditableSection title="Our Vision">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Vision Title
                </label>
                <EditableTextWrapper
                  value={about.vision.title}
                  onChange={(value) =>
                    updateAbout({ vision: { ...about.vision, title: value } })
                  }
                  variant="heading"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Vision Description
                </label>
                <EditableTextareaWrapper
                  value={about.vision.description}
                  onChange={(value) =>
                    updateAbout({ vision: { ...about.vision, description: value } })
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Vision Points
                </label>
                <EditableListWrapper
                  items={about.vision.points}
                  onChange={handleVisionPointsUpdate}
                  label="Points"
                  placeholder="Enter a vision point"
                />
              </div>
            </div>
          </EditableSection>

          {/* Core Values */}
          <EditableSection title="Core Values">
            <div className="space-y-6">
              {about.coreValues.map((value, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-slate-100 rounded-lg border border-slate-300 space-y-4"
                >
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-300">
                    <h4 className="font-semibold text-foreground">Value {idx + 1}</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Title
                    </label>
                    <EditableTextWrapper
                      value={value.title}
                      onChange={(val) => handleCoreValuesUpdate(idx, 'title', val)}
                      variant="body"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Description
                    </label>
                    <EditableTextareaWrapper
                      value={value.description}
                      onChange={(val) => handleCoreValuesUpdate(idx, 'description', val)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </EditableSection>

          {/* Team Members */}
          <EditableSection title="Team Members">
            <div className="space-y-6">
              {about.team.map((member, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-slate-100 rounded-lg border border-slate-300 space-y-4"
                >
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-300">
                    <h4 className="font-semibold text-foreground">Team Member {idx + 1}</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Name
                    </label>
                    <EditableTextWrapper
                      value={member.name}
                      onChange={(val) => handleTeamUpdate(idx, 'name', val)}
                      variant="body"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Role
                    </label>
                    <EditableTextareaWrapper
                      value={member.role}
                      onChange={(val) => handleTeamUpdate(idx, 'role', val)}
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={member.image}
                      onChange={(e) => handleTeamUpdate(idx, 'image', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Description
                    </label>
                    <EditableTextareaWrapper
                      value={member.description}
                      onChange={(val) => handleTeamUpdate(idx, 'description', val)}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </EditableSection>

          {/* Help Note */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Editing Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Click on any text to edit it inline</li>
              <li>Team members and values can be edited in their respective sections</li>
              <li>Use Undo/Redo for quick corrections</li>
              <li>All changes are automatically tracked</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
