'use client'

import { useAdmin } from '@/context/admin-context'
import { EditableImage } from '@/components/admin/editable-image'
import {
  EditableTextWrapper,
  EditableTextareaWrapper,
  EditableListWrapper,
} from '@/components/admin/editable-content'
import Footer from '@/components/footer'

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

      <main className="min-h-screen bg-background overflow-x-hidden">
        {/* Hero - mirrors main About hero layout */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
                <EditableImage
                  src={about.heroImage}
                  alt="About hero"
                  onChange={(value) => updateAbout({ heroImage: value })}
                  fill
                  className="rounded-2xl"
                  objectFit="cover"
                  objectPosition="top"
                />
              </div>

              {/* Content */}
              <div className="order-1 md:order-2 space-y-4">
                <EditableTextWrapper
                  value={about.heroTitle}
                  onChange={(value) => updateAbout({ heroTitle: value })}
                  variant="title"
                  className="text-5xl md:text-6xl"
                />
                <EditableTextareaWrapper
                  value={about.heroSubtitle}
                  onChange={(value) => updateAbout({ heroSubtitle: value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision - mirrors main layout with editable text */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
                <EditableTextareaWrapper
                  value={about.mission.description}
                  onChange={(value) =>
                    updateAbout({ mission: { ...about.mission, description: value } })
                  }
                  rows={5}
                />
                <div className="mt-6 space-y-3">
                  <EditableListWrapper
                    items={about.mission.points}
                    onChange={handleMissionPointsUpdate}
                    label="Mission Points"
                    placeholder="Add mission point"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6 text-primary">Our Vision</h2>
                <EditableTextareaWrapper
                  value={about.vision.description}
                  onChange={(value) =>
                    updateAbout({ vision: { ...about.vision, description: value } })
                  }
                  rows={5}
                />
                <div className="mt-6 space-y-3">
                  <EditableListWrapper
                    items={about.vision.points}
                    onChange={handleVisionPointsUpdate}
                    label="Vision Points"
                    placeholder="Add vision point"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values - grid like main About page */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Core Values
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {about.coreValues.map((value, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition space-y-3"
                >
                  <EditableTextWrapper
                    value={value.title}
                    onChange={(val) => handleCoreValuesUpdate(idx, 'title', val)}
                    variant="heading"
                    className="text-primary"
                  />
                  <EditableTextareaWrapper
                    value={value.description}
                    onChange={(val) => handleCoreValuesUpdate(idx, 'description', val)}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder Section - mirrors main About founder section */}
        <section className="py-24 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative h-96 md:h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl opacity-20 blur-3xl"></div>
                <div className="relative bg-white rounded-3xl p-3 shadow-2xl overflow-hidden">
                  <div className="relative h-96 rounded-2xl">
                    <EditableImage
                      src={about.founder.image}
                      alt={about.founder.name}
                      onChange={(value) => updateAbout({ founder: { ...about.founder, image: value } })}
                      fill
                      className="rounded-2xl"
                      objectFit="cover"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-8">
                <div>
                  <EditableTextWrapper
                    value={about.founder.title}
                    onChange={(value) => updateAbout({ founder: { ...about.founder, title: value } })}
                    variant="title"
                    className="text-4xl md:text-5xl mb-4"
                  />
                  <EditableTextareaWrapper
                    value={about.founder.description}
                    onChange={(value) => updateAbout({ founder: { ...about.founder, description: value } })}
                    rows={6}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <strong>Vision:</strong>{' '}
                      <EditableTextWrapper
                        value={about.founder.vision}
                        onChange={(value) => updateAbout({ founder: { ...about.founder, vision: value } })}
                        variant="body"
                        className="inline"
                      />
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <strong>Mission:</strong>{' '}
                      <EditableTextWrapper
                        value={about.founder.mission}
                        onChange={(value) => updateAbout({ founder: { ...about.founder, mission: value } })}
                        variant="body"
                        className="inline"
                      />
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <strong>Values:</strong>{' '}
                      <EditableTextWrapper
                        value={about.founder.values}
                        onChange={(value) => updateAbout({ founder: { ...about.founder, values: value } })}
                        variant="body"
                        className="inline"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team section - mirrors main team grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Meet Our Team
              </span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Dedicated professionals committed to your success
            </p>

            <div className="grid md:grid-cols-4 gap-8">
              {about.team.map((member, idx) => (
                <div key={idx} className="group">
                  <div className="relative h-64 mb-4 rounded-xl overflow-hidden shadow-lg">
                    <EditableImage
                      src={member.image}
                      alt={member.name}
                      onChange={(value) => handleTeamUpdate(idx, 'image', value)}
                      fill
                      className="rounded-xl"
                      objectFit="cover"
                      objectPosition="top"
                    />
                  </div>
                  <EditableTextWrapper
                    value={member.name}
                    onChange={(val) => handleTeamUpdate(idx, 'name', val)}
                    variant="heading"
                    className="text-foreground"
                  />
                  <EditableTextareaWrapper
                    value={member.role}
                    onChange={(val) => handleTeamUpdate(idx, 'role', val)}
                    rows={2}
                  />
                  <div className="mt-3">
                    <EditableTextareaWrapper
                      value={member.description}
                      onChange={(val) => handleTeamUpdate(idx, 'description', val)}
                      rows={4}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
