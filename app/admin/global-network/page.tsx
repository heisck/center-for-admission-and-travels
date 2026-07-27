'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { BlogImageUpload } from '@/components/admin/blog-image-upload'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import {
  CURRENCY_META,
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  formatMoney,
  normalizeCurrency,
  type SupportedCurrency,
} from '@/lib/currency'

type ServicePlan = {
  id?: string
  name: string
  description: string
  duration: string
  price: number
  currency: SupportedCurrency
  published: boolean
}

type ProfessionalService = {
  id: string
  slug: string
  name: string
  summary: string
  descriptionHtml: string
  imageUrl: string
  published: boolean
  plans: ServicePlan[]
}

type ServiceDraft = Omit<ProfessionalService, 'id'>

const EMPTY_PLAN: ServicePlan = {
  name: 'Normal',
  description: '',
  duration: '',
  price: 0,
  currency: DEFAULT_CURRENCY,
  published: true,
}

function createEmptyDraft(): ServiceDraft {
  return {
    slug: '',
    name: '',
    summary: '',
    descriptionHtml: '',
    imageUrl: '',
    published: true,
    plans: [{ ...EMPTY_PLAN }],
  }
}

function normalizeService(service: ProfessionalService): ProfessionalService {
  return {
    ...service,
    plans: (service.plans || []).map((plan) => ({
      ...plan,
      price: Number(plan.price) || 0,
      currency: normalizeCurrency(plan.currency),
      published: plan.published !== false,
    })),
  }
}

export default function AdminProfessionalServicesPage() {
  const [services, setServices] = useState<ProfessionalService[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ServiceDraft>(createEmptyDraft)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [listOpen, setListOpen] = useState(true)

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedId) || null,
    [selectedId, services]
  )

  const loadServices = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/services', { credentials: 'include' })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to load services')
      }

      const nextServices = (result.data || []).map(normalizeService)
      setServices(nextServices)
      setSelectedId((currentId) => {
        if (currentId && nextServices.some((service: ProfessionalService) => service.id === currentId)) {
          return currentId
        }
        return nextServices[0]?.id || null
      })
      if (nextServices.length === 0) {
        setDraft(createEmptyDraft())
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadServices()
  }, [loadServices])

  useEffect(() => {
    if (!selectedService) return
    setDraft({
      slug: selectedService.slug,
      name: selectedService.name,
      summary: selectedService.summary,
      descriptionHtml: selectedService.descriptionHtml,
      imageUrl: selectedService.imageUrl,
      published: selectedService.published,
      plans:
        selectedService.plans.length > 0
          ? selectedService.plans.map((plan) => ({ ...plan }))
          : [{ ...EMPTY_PLAN }],
    })
  }, [selectedService])

  const beginNewService = () => {
    setSelectedId(null)
    setDraft(createEmptyDraft())
    setListOpen(false)
  }

  const selectService = (service: ProfessionalService) => {
    setSelectedId(service.id)
    setListOpen(false)
  }

  const updatePlan = (index: number, updates: Partial<ServicePlan>) => {
    setDraft((current) => ({
      ...current,
      plans: current.plans.map((plan, planIndex) =>
        planIndex === index ? { ...plan, ...updates } : plan
      ),
    }))
  }

  const addPlan = () => {
    setDraft((current) => ({
      ...current,
      plans: [
        ...current.plans,
        {
          ...EMPTY_PLAN,
          name: current.plans.length === 1 ? 'Express' : `Plan ${current.plans.length + 1}`,
        },
      ],
    }))
  }

  const removePlan = (index: number) => {
    setDraft((current) => ({
      ...current,
      plans: current.plans.filter((_, planIndex) => planIndex !== index),
    }))
  }

  const validateDraft = () => {
    if (!draft.name.trim()) return 'Service name is required.'
    if (!draft.summary.trim()) return 'Add a short service summary.'
    if (draft.published && !draft.imageUrl.trim()) return 'Published services need an image.'

    const validPlans = draft.plans.filter(
      (plan) => plan.name.trim() && Number.isFinite(Number(plan.price)) && Number(plan.price) > 0
    )
    if (draft.published && validPlans.length === 0) {
      return 'Published services need at least one plan with a valid price.'
    }
    if (draft.plans.some((plan) => plan.name.trim() && Number(plan.price) <= 0)) {
      return 'Every named plan must have a price greater than zero.'
    }
    return null
  }

  const saveService = async () => {
    const validationError = validateDraft()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setSaving(true)
    try {
      const response = await fetch(
        selectedId ? `/api/admin/services/${selectedId}` : '/api/admin/services',
        {
          method: selectedId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...draft,
            plans: draft.plans.map((plan) => ({
              ...plan,
              price: Number(plan.price),
              currency: normalizeCurrency(plan.currency),
            })),
          }),
        }
      )
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save service')
      }

      const saved = normalizeService(result.data)
      setServices((current) => {
        const exists = current.some((service) => service.id === saved.id)
        return exists
          ? current.map((service) => (service.id === saved.id ? saved : service))
          : [...current, saved]
      })
      setSelectedId(saved.id)
      toast.success(selectedId ? 'Service updated' : 'Service created')
      window.dispatchEvent(new CustomEvent('content-updated'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  const deleteService = async () => {
    if (!selectedId || !selectedService) return
    if (!window.confirm(`Delete "${selectedService.name}" and all of its plans?`)) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/services/${selectedId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete service')
      }

      const remaining = services.filter((service) => service.id !== selectedId)
      setServices(remaining)
      setSelectedId(remaining[0]?.id || null)
      if (remaining.length === 0) setDraft(createEmptyDraft())
      toast.success('Service deleted')
      window.dispatchEvent(new CustomEvent('content-updated'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete service')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
              Professional services
            </p>
            <h1 className="mt-1 text-3xl font-bold text-foreground">Service Catalog</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Create document, registration, certificate, and processing services. Each service can
              have separate Normal, Express, or custom plans.
            </p>
          </div>
          <button
            type="button"
            onClick={beginNewService}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="h-fit overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setListOpen((open) => !open)}
              className="flex w-full items-center justify-between border-b border-border px-5 py-4 text-left font-semibold lg:cursor-default"
            >
              Services ({services.length})
              {listOpen ? (
                <ChevronUp className="h-4 w-4 lg:hidden" />
              ) : (
                <ChevronDown className="h-4 w-4 lg:hidden" />
              )}
            </button>

            <div className={`${listOpen ? 'block' : 'hidden'} lg:block`}>
              {loading ? (
                <div className="flex items-center gap-2 px-5 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading services…
                </div>
              ) : services.length === 0 ? (
                <p className="px-5 py-8 text-sm text-muted-foreground">
                  No services yet. Add the first one.
                </p>
              ) : (
                <div className="max-h-[34rem] overflow-y-auto p-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => selectService(service)}
                      className={`mb-1 w-full rounded-xl px-3 py-3 text-left transition ${
                        selectedId === service.id
                          ? 'bg-orange-50 text-orange-900 ring-1 ring-orange-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="block truncate text-sm font-semibold">{service.name}</span>
                      <span className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          {service.plans.length} plan{service.plans.length === 1 ? '' : 's'}
                        </span>
                        <span className={service.published ? 'text-green-700' : 'text-slate-500'}>
                          {service.published ? 'Published' : 'Draft'}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <section className="min-w-0 space-y-6">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedId ? 'Edit Service' : 'Create Service'}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The slug is generated automatically unless you provide one.
                  </p>
                </div>
                <label className="inline-flex items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={draft.published}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, published: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                  Visible on public page
                </label>
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-sm font-semibold text-foreground">Service name</span>
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Passport application assistance"
                      className="w-full rounded-xl border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-sm font-semibold text-foreground">URL slug (optional)</span>
                    <input
                      value={draft.slug}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, slug: event.target.value }))
                      }
                      placeholder="passport-application"
                      className="w-full rounded-xl border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-foreground">Short summary</span>
                  <textarea
                    value={draft.summary}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, summary: event.target.value }))
                    }
                    rows={3}
                    maxLength={600}
                    placeholder="A concise explanation shown on the service card."
                    className="w-full resize-y rounded-xl border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Service image</p>
                  <BlogImageUpload
                    value={draft.imageUrl}
                    onChange={(imageUrl) => setDraft((current) => ({ ...current, imageUrl }))}
                    folder="professional-services"
                    alt={draft.name || 'Professional service'}
                  />
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Full service details</p>
                    <p className="text-xs text-muted-foreground">
                      Formatting is saved as real rich text and appears the same on the public page.
                    </p>
                  </div>
                  <RichTextEditor
                    value={draft.descriptionHtml}
                    onChange={(descriptionHtml) =>
                      setDraft((current) => ({ ...current, descriptionHtml }))
                    }
                    placeholder="Explain the process, documents required, and what the customer receives…"
                    ariaLabel="Professional service details"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <CircleDollarSign className="h-5 w-5 text-orange-600" />
                    Plans and Pricing
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add as many service levels as needed, such as Normal and Express.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPlan}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-800 transition hover:bg-orange-100"
                >
                  <Plus className="h-4 w-4" />
                  Add Plan
                </button>
              </div>

              <div className="space-y-4">
                {draft.plans.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No plans added. Published services need at least one paid plan.
                  </div>
                ) : (
                  draft.plans.map((plan, index) => (
                    <div key={plan.id || `plan-${index}`} className="rounded-2xl border border-border p-4 sm:p-5">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="font-bold text-foreground">Plan {index + 1}</p>
                        <div className="flex items-center gap-4">
                          <label className="inline-flex items-center gap-2 text-xs font-semibold">
                            <input
                              type="checkbox"
                              checked={plan.published}
                              onChange={(event) =>
                                updatePlan(index, { published: event.target.checked })
                              }
                            />
                            Active
                          </label>
                          <button
                            type="button"
                            onClick={() => removePlan(index)}
                            aria-label={`Remove plan ${index + 1}`}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1.5">
                          <span className="text-xs font-semibold text-muted-foreground">Plan name</span>
                          <input
                            value={plan.name}
                            onChange={(event) => updatePlan(index, { name: event.target.value })}
                            placeholder="Normal or Express"
                            className="w-full rounded-xl border border-border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Turnaround time
                          </span>
                          <input
                            value={plan.duration}
                            onChange={(event) => updatePlan(index, { duration: event.target.value })}
                            placeholder="10–15 working days"
                            className="w-full rounded-xl border border-border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </label>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_11rem]">
                        <label className="space-y-1.5">
                          <span className="text-xs font-semibold text-muted-foreground">Price</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={plan.price}
                            onChange={(event) =>
                              updatePlan(index, { price: Number(event.target.value) || 0 })
                            }
                            className="w-full rounded-xl border border-border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-xs font-semibold text-muted-foreground">Currency</span>
                          <select
                            value={plan.currency}
                            onChange={(event) =>
                              updatePlan(index, { currency: normalizeCurrency(event.target.value) })
                            }
                            className="w-full rounded-xl border border-border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            {SUPPORTED_CURRENCIES.map((currency) => (
                              <option key={currency} value={currency}>
                                {CURRENCY_META[currency].label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label className="mt-4 block space-y-1.5">
                        <span className="text-xs font-semibold text-muted-foreground">
                          What this plan includes
                        </span>
                        <textarea
                          value={plan.description}
                          onChange={(event) =>
                            updatePlan(index, { description: event.target.value })
                          }
                          rows={2}
                          maxLength={500}
                          placeholder="Priority processing, document review, submission support…"
                          className="w-full resize-y rounded-xl border border-border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </label>

                      {plan.price > 0 ? (
                        <p className="mt-3 text-sm font-semibold text-orange-700">
                          Customer price: {formatMoney(plan.price, plan.currency)}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="sticky bottom-4 z-20 flex flex-col-reverse gap-3 rounded-2xl border border-border bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div>
                {selectedId ? (
                  <button
                    type="button"
                    onClick={deleteService}
                    disabled={deleting || saving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 sm:w-auto"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete Service
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={saveService}
                disabled={saving || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:opacity-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {selectedId ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
