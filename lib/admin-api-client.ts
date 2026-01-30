/**
 * ADMIN API CLIENT
 * 
 * Helper functions for admin panel to write to database via API.
 * 
 * This replaces direct localStorage usage in AdminContext.
 * Admin edits should go through these API calls.
 */

/**
 * Update home page content
 */
export async function updateHomeContent(data: any): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/content/home', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Update about page content
 */
export async function updateAboutContent(data: any): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/content/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Update packages
 */
export async function updatePackages(data: any[]): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/content/packages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packages: data }),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Update travel tours content
 */
export async function updateTravelToursContent(data: any): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/content/travel-tours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Update service page
 */
export async function updateServicePage(
  serviceId: string,
  data: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/admin/content/service-pages/${serviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Update contact info
 */
export async function updateContactInfo(data: any): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/content/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Update footer info
 */
export async function updateFooterInfo(data: any): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/content/footer', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Upload image
 */
export async function uploadImage(
  file: File,
  folder?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    if (folder) formData.append('folder', folder)

    const response = await fetch('/api/admin/images/upload', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Delete image
 */
export async function deleteImage(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/admin/images/delete?url=${encodeURIComponent(url)}`, {
      method: 'DELETE',
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * NOTE: These functions should be called from AdminContext update methods.
 * 
 * Example in AdminContext:
 * 
 * const updateHomeHero = useCallback(async (updates: Partial<AdminContent['home']['hero']>) => {
 *   // Update local state immediately (optimistic update)
 *   const newContent = { ...content, home: { ...content.home, hero: { ...content.home.hero, ...updates } } }
 *   setContent(newContent)
 *   
 *   // Sync to database via API
 *   const result = await updateHomeContent({ hero: newContent.home.hero })
 *   if (!result.success) {
 *     // Revert on error
 *     setContent(content)
 *     alert('Failed to save: ' + result.error)
 *   }
 * }, [content])
 */
