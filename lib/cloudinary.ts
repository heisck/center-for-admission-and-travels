/**
 * CLOUDINARY UTILITY FUNCTIONS
 * 
 * Prepared for Cloudinary integration. Currently returns mock URLs.
 * 
 * TODO: When Cloudinary is integrated:
 * 1. Install: npm install cloudinary
 * 2. Set environment variables:
 *    - CLOUDINARY_CLOUD_NAME
 *    - CLOUDINARY_API_KEY
 *    - CLOUDINARY_API_SECRET
 * 3. Replace mock functions with real Cloudinary SDK calls
 */

/**
 * Upload image to Cloudinary
 * 
 * @param file - File object or base64 string
 * @param folder - Optional folder path in Cloudinary
 * @returns Cloudinary URL
 * 
 * TODO: Replace with real Cloudinary upload
 */
export async function uploadImage(
  file: File | string,
  folder?: string
): Promise<string> {
  // Mock: Return placeholder URL
  // TODO: Replace with actual Cloudinary upload
  
  if (typeof file === 'string') {
    // Base64 string
    // TODO: Convert base64 to buffer and upload to Cloudinary
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload/v${Date.now()}/placeholder.jpg`
  }

  // File object
  // TODO: Upload file to Cloudinary
  // Example:
  // const formData = new FormData()
  // formData.append('file', file)
  // formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET!)
  // 
  // const response = await fetch(
  //   `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
  //   { method: 'POST', body: formData }
  // )
  // const data = await response.json()
  // return data.secure_url

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload/v${Date.now()}/${file.name || 'image.jpg'}`
}

/**
 * Delete image from Cloudinary
 * 
 * @param publicId - Cloudinary public ID (extracted from URL)
 * @returns Success status
 * 
 * TODO: Replace with real Cloudinary delete
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  // Mock: Return success
  // TODO: Replace with actual Cloudinary delete
  
  // Example:
  // const cloudinary = require('cloudinary').v2
  // cloudinary.config({
  //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  //   api_key: process.env.CLOUDINARY_API_KEY,
  //   api_secret: process.env.CLOUDINARY_API_SECRET,
  // })
  // 
  // try {
  //   await cloudinary.uploader.destroy(publicId)
  //   return true
  // } catch (error) {
  //   console.error('Error deleting image:', error)
  //   return false
  // }

  console.log(`[MOCK] Would delete image: ${publicId}`)
  return true
}

/**
 * Replace image in Cloudinary
 * 
 * @param oldPublicId - Old image public ID
 * @param newFile - New file to upload
 * @param folder - Optional folder path
 * @returns New Cloudinary URL
 * 
 * TODO: Replace with real Cloudinary replace
 */
export async function replaceImage(
  oldPublicId: string,
  newFile: File | string,
  folder?: string
): Promise<string> {
  // Mock: Delete old and upload new
  // TODO: Replace with actual Cloudinary replace
  
  await deleteImage(oldPublicId)
  return await uploadImage(newFile, folder)
}

/**
 * Extract public ID from Cloudinary URL
 * 
 * @param url - Cloudinary URL
 * @returns Public ID or null
 */
export function extractPublicId(url: string): string | null {
  // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
  return match ? match[1] : null
}

/**
 * Generate optimized image URL with transformations
 * 
 * @param url - Cloudinary URL
 * @param width - Optional width
 * @param height - Optional height
 * @param quality - Optional quality (1-100)
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // Mock: Return original URL
  // TODO: Add Cloudinary transformations
  
  if (!url.includes('cloudinary.com')) {
    return url // Not a Cloudinary URL
  }

  // Example transformation:
  // const transformations = []
  // if (width) transformations.push(`w_${width}`)
  // if (height) transformations.push(`h_${height}`)
  // transformations.push(`q_${quality}`)
  // 
  // const publicId = extractPublicId(url)
  // return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformations.join(',')}/${publicId}`

  return url
}

/**
 * Upload multiple images
 * 
 * @param files - Array of files or base64 strings
 * @param folder - Optional folder path
 * @returns Array of Cloudinary URLs
 */
export async function uploadImages(
  files: (File | string)[],
  folder?: string
): Promise<string[]> {
  // TODO: Use Promise.all for parallel uploads
  const uploads = files.map((file) => uploadImage(file, folder))
  return Promise.all(uploads)
}

/**
 * Delete multiple images
 * 
 * @param publicIds - Array of public IDs
 * @returns Array of success statuses
 */
export async function deleteImages(publicIds: string[]): Promise<boolean[]> {
  const deletes = publicIds.map((id) => deleteImage(id))
  return Promise.all(deletes)
}

/**
 * Validate image file
 * 
 * @param file - File object
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPG, PNG, WebP, or GIF.',
    }
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit.`,
    }
  }

  return { valid: true }
}

/**
 * Convert base64 to File object
 * 
 * @param base64 - Base64 string
 * @param filename - Optional filename
 * @returns File object
 */
export function base64ToFile(base64: string, filename: string = 'image.jpg'): File {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

/**
 * NOTE: All functions above are prepared for Cloudinary integration.
 * 
 * To integrate:
 * 1. Install: npm install cloudinary
 * 2. Set environment variables in .env.local:
 *    CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 *    CLOUDINARY_UPLOAD_PRESET=your_upload_preset (optional)
 * 3. Uncomment and implement the TODO sections above
 * 4. Test with real Cloudinary account
 */
