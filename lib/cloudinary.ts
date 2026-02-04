/**
 * CLOUDINARY UTILITY FUNCTIONS
 * 
 * Real Cloudinary integration using the SDK
 */

import { v2 as cloudinary } from 'cloudinary'

// Validate Cloudinary configuration
function validateCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || cloudName === 'your_cloud_name') {
    console.warn('⚠️ CLOUDINARY_CLOUD_NAME is not set or is using default value')
  }
  if (!apiKey) {
    console.warn('⚠️ CLOUDINARY_API_KEY is not set')
  }
  if (!apiSecret) {
    console.warn('⚠️ CLOUDINARY_API_SECRET is not set')
  }

  return {
    cloudName: cloudName || 'your_cloud_name',
    apiKey: apiKey || '',
    apiSecret: apiSecret || '',
    isValid: !!(cloudName && cloudName !== 'your_cloud_name' && apiKey && apiSecret),
  }
}

const config = validateCloudinaryConfig()

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.apiKey,
  api_secret: config.apiSecret,
  secure: true,
})

// Export validation function
export function isCloudinaryConfigured(): boolean {
  return config.isValid
}

/**
 * Upload image to Cloudinary
 * 
 * @param file - File object or base64 string
 * @param folder - Optional folder path in Cloudinary
 * @returns Cloudinary URL
 */
export async function uploadImage(
  file: File | string,
  folder?: string
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'
    )
  }

  try {
    const uploadOptions: {
      folder?: string
      resource_type: 'image'
      use_filename?: boolean
      unique_filename?: boolean
      overwrite?: boolean
    } = {
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    }

    if (folder) {
      uploadOptions.folder = folder
    } else {
      uploadOptions.folder = 'center-for-admission-and-travels'
    }

    let result

    if (typeof file === 'string') {
      // Base64 string or data URI
      if (file.startsWith('data:')) {
        result = await cloudinary.uploader.upload(file, uploadOptions)
      } else {
        // Assume it's base64 without data URI prefix
        const dataUri = `data:image/jpeg;base64,${file}`
        result = await cloudinary.uploader.upload(dataUri, uploadOptions)
      }
    } else {
      // File object - convert to base64 data URI
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`
      result = await cloudinary.uploader.upload(dataUri, uploadOptions)
    }

    return result.secure_url
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Delete image from Cloudinary
 * 
 * @param publicId - Cloudinary public ID (extracted from URL)
 * @returns Success status
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary is not configured. Skipping deletion.')
    return false
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    })
    return result.result === 'ok'
  } catch (error: any) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

/**
 * Replace image in Cloudinary
 * 
 * @param oldPublicId - Old image public ID
 * @param newFile - New file to upload
 * @param folder - Optional folder path
 * @returns New Cloudinary URL
 */
export async function replaceImage(
  oldPublicId: string,
  newFile: File | string,
  folder?: string
): Promise<string> {
  // Delete old image
  await deleteImage(oldPublicId)
  // Upload new image
  return await uploadImage(newFile, folder)
}

/**
 * Extract public ID from Cloudinary URL
 * 
 * @param url - Cloudinary URL
 * @returns Public ID or null
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) {
    return null
  }

  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
    // Handle URLs with or without transformations
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
    // Example: https://res.cloudinary.com/demo/image/upload/w_500,h_500/folder/image.jpg
    // Example: https://res.cloudinary.com/demo/image/upload/folder/image.jpg
    
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    
    // Find the index of 'upload' in the path
    const uploadIndex = pathParts.indexOf('upload')
    if (uploadIndex === -1) {
      return null
    }
    
    // Everything after 'upload' is the path (may include version and transformations)
    // Extract the public_id part (everything after upload, excluding version if present)
    const afterUpload = pathParts.slice(uploadIndex + 1)
    
    // Remove version if present (v1234567890)
    if (afterUpload.length > 0 && afterUpload[0].startsWith('v') && /^v\d+$/.test(afterUpload[0])) {
      afterUpload.shift()
    }
    
    // Join remaining parts to get public_id
    const publicId = afterUpload.join('/')
    
    // Remove file extension if present
    return publicId.replace(/\.[^.]+$/, '')
  } catch (error) {
    console.error('Error extracting public ID:', error)
    // Fallback to regex
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
    return match ? match[1] : null
  }
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
  if (!url.includes('cloudinary.com')) {
    return url // Not a Cloudinary URL
  }

  const publicId = extractPublicId(url)
  if (!publicId) {
    return url
  }

  const transformations: string[] = []
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  transformations.push(`q_${quality}`)

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name'
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(',')}/${publicId}`
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
