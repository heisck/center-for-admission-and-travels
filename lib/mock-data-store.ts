/**
 * MOCK DATA LAYER
 * 
 * This is a temporary in-memory data store that mimics database behavior.
 * It will be replaced with Prisma client calls when database is connected.
 * 
 * Features:
 * - CRUD operations for all entities
 * - Undo/redo support (stores last 5 versions)
 * - Matches Prisma schema structure exactly
 */

import type { AdminContent } from '@/context/admin-context'

// ============================================================================
// TYPE DEFINITIONS (matching Prisma schema)
// ============================================================================

export type PackageCategory = 'travel' | 'study' | 'work'
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled'

export interface ContentVersion {
  id: string
  entityType: string
  entityId: string
  content: any
  version: number
  createdAt: Date
  createdBy?: string
}

// ============================================================================
// MOCK DATA STORE
// ============================================================================

class MockDataStore {
  private versions: Map<string, ContentVersion[]> = new Map()
  private maxVersions = 5

  // Home Page
  private homePage: any = null
  private homeHeroImages: any[] = []
  private homeStats: any[] = []
  private homeServices: any[] = []

  // About Page
  private aboutPage: any = null
  private aboutMission: any = null
  private aboutVision: any = null
  private aboutCoreValues: any[] = []
  private aboutFounder: any = null
  private aboutTeamMembers: any[] = []

  // Packages
  private packages: any[] = []

  // Travel Tours
  private travelToursPage: any = null
  private travelToursFeatured: any[] = []

  // Service Pages
  private servicePages: any[] = []

  // Contact & Footer
  private contactInfo: any = null
  private footerInfo: any = null

  // Auth (mock)
  private adminUsers: any[] = [
    {
      id: '1',
      username: 'admin',
      password: 'password123', // Will be hashed in production
      email: 'admin@example.com',
    },
  ]

  // ============================================================================
  // VERSION MANAGEMENT
  // ============================================================================

  private saveVersion(entityType: string, entityId: string, content: any): void {
    const key = `${entityType}:${entityId}`
    const versions = this.versions.get(key) || []
    
    const newVersion: ContentVersion = {
      id: `v_${Date.now()}`,
      entityType,
      entityId,
      content: JSON.parse(JSON.stringify(content)), // Deep clone
      version: versions.length + 1,
      createdAt: new Date(),
    }

    versions.push(newVersion)
    
    // Keep only last maxVersions
    if (versions.length > this.maxVersions) {
      versions.shift()
    }

    this.versions.set(key, versions)
  }

  getVersions(entityType: string, entityId: string): ContentVersion[] {
    const key = `${entityType}:${entityId}`
    return this.versions.get(key) || []
  }

  restoreVersion(entityType: string, entityId: string, version: number): any | null {
    const versions = this.getVersions(entityType, entityId)
    const versionToRestore = versions.find((v) => v.version === version)
    return versionToRestore ? versionToRestore.content : null
  }

  // ============================================================================
  // HOME PAGE
  // ============================================================================

  getHomePage(): any {
    return this.homePage
  }

  updateHomePage(data: any): any {
    if (!this.homePage) {
      this.homePage = { id: 'home', ...data, createdAt: new Date(), updatedAt: new Date() }
    } else {
      this.homePage = { ...this.homePage, ...data, updatedAt: new Date() }
    }
    this.saveVersion('home', 'home', this.homePage)
    return this.homePage
  }

  getHomeHeroImages(): any[] {
    return this.homeHeroImages.sort((a, b) => a.order - b.order)
  }

  updateHomeHeroImages(images: any[]): void {
    this.homeHeroImages = images
    this.saveVersion('home', 'heroImages', images)
  }

  getHomeStats(): any[] {
    return this.homeStats.sort((a, b) => a.order - b.order)
  }

  updateHomeStats(stats: any[]): void {
    this.homeStats = stats
    this.saveVersion('home', 'stats', stats)
  }

  getHomeServices(): any[] {
    return this.homeServices.sort((a, b) => a.order - b.order)
  }

  updateHomeServices(services: any[]): void {
    this.homeServices = services
    this.saveVersion('home', 'services', services)
  }

  // ============================================================================
  // ABOUT PAGE
  // ============================================================================

  getAboutPage(): any {
    return this.aboutPage
  }

  updateAboutPage(data: any): any {
    if (!this.aboutPage) {
      this.aboutPage = { id: 'about', ...data, createdAt: new Date(), updatedAt: new Date() }
    } else {
      this.aboutPage = { ...this.aboutPage, ...data, updatedAt: new Date() }
    }
    this.saveVersion('about', 'about', this.aboutPage)
    return this.aboutPage
  }

  // Mission
  getAboutMission(): any {
    return this.aboutMission
  }

  updateAboutMission(data: any): void {
    this.aboutMission = { ...this.aboutMission, ...data, updatedAt: new Date() }
    this.saveVersion('about', 'mission', this.aboutMission)
  }

  // Vision
  getAboutVision(): any {
    return this.aboutVision
  }

  updateAboutVision(data: any): void {
    this.aboutVision = { ...this.aboutVision, ...data, updatedAt: new Date() }
    this.saveVersion('about', 'vision', this.aboutVision)
  }

  // Core Values
  getAboutCoreValues(): any[] {
    return this.aboutCoreValues.sort((a, b) => a.order - b.order)
  }

  updateAboutCoreValues(values: any[]): void {
    this.aboutCoreValues = values
    this.saveVersion('about', 'coreValues', values)
  }

  // Founder
  getAboutFounder(): any {
    return this.aboutFounder
  }

  updateAboutFounder(data: any): void {
    this.aboutFounder = { ...this.aboutFounder, ...data, updatedAt: new Date() }
    this.saveVersion('about', 'founder', this.aboutFounder)
  }

  // Team
  getAboutTeamMembers(): any[] {
    return this.aboutTeamMembers.sort((a, b) => a.order - b.order)
  }

  updateAboutTeamMembers(members: any[]): void {
    this.aboutTeamMembers = members
    this.saveVersion('about', 'team', members)
  }

  // ============================================================================
  // PACKAGES
  // ============================================================================

  getPackages(): any[] {
    return this.packages.sort((a, b) => a.order - b.order)
  }

  getPackage(id: string): any | null {
    return this.packages.find((p) => p.id === id) || null
  }

  createPackage(data: any): any {
    const pkg = {
      id: `pkg_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.packages.push(pkg)
    this.saveVersion('package', pkg.id, pkg)
    return pkg
  }

  updatePackage(id: string, data: any): any {
    const index = this.packages.findIndex((p) => p.id === id)
    if (index === -1) return null

    this.packages[index] = { ...this.packages[index], ...data, updatedAt: new Date() }
    this.saveVersion('package', id, this.packages[index])
    return this.packages[index]
  }

  deletePackage(id: string): boolean {
    const index = this.packages.findIndex((p) => p.id === id)
    if (index === -1) return false

    this.packages.splice(index, 1)
    return true
  }

  // ============================================================================
  // TRAVEL TOURS
  // ============================================================================

  getTravelToursPage(): any {
    return this.travelToursPage
  }

  updateTravelToursPage(data: any): any {
    if (!this.travelToursPage) {
      this.travelToursPage = { id: 'travel-tours', ...data, createdAt: new Date(), updatedAt: new Date() }
    } else {
      this.travelToursPage = { ...this.travelToursPage, ...data, updatedAt: new Date() }
    }
    this.saveVersion('travelTours', 'travel-tours', this.travelToursPage)
    return this.travelToursPage
  }

  getTravelToursFeatured(): any[] {
    return this.travelToursFeatured.sort((a, b) => a.order - b.order)
  }

  updateTravelToursFeatured(featured: any[]): void {
    this.travelToursFeatured = featured
    this.saveVersion('travelTours', 'featured', featured)
  }

  // ============================================================================
  // SERVICE PAGES
  // ============================================================================

  getServicePages(): any[] {
    return this.servicePages
  }

  getServicePage(serviceId: string): any | null {
    return this.servicePages.find((s) => s.serviceId === serviceId) || null
  }

  updateServicePage(serviceId: string, data: any): any {
    let service = this.servicePages.find((s) => s.serviceId === serviceId)
    
    if (!service) {
      service = {
        id: `svc_${Date.now()}`,
        serviceId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.servicePages.push(service)
    } else {
      const index = this.servicePages.indexOf(service)
      this.servicePages[index] = { ...service, ...data, updatedAt: new Date() }
      service = this.servicePages[index]
    }

    this.saveVersion('servicePage', serviceId, service)
    return service
  }

  // ============================================================================
  // CONTACT & FOOTER
  // ============================================================================

  getContactInfo(): any {
    return this.contactInfo
  }

  updateContactInfo(data: any): any {
    if (!this.contactInfo) {
      this.contactInfo = { id: 'contact', ...data, createdAt: new Date(), updatedAt: new Date() }
    } else {
      this.contactInfo = { ...this.contactInfo, ...data, updatedAt: new Date() }
    }
    this.saveVersion('contact', 'contact', this.contactInfo)
    return this.contactInfo
  }

  getFooterInfo(): any {
    return this.footerInfo
  }

  updateFooterInfo(data: any): any {
    if (!this.footerInfo) {
      this.footerInfo = { id: 'footer', ...data, createdAt: new Date(), updatedAt: new Date() }
    } else {
      this.footerInfo = { ...this.footerInfo, ...data, updatedAt: new Date() }
    }
    this.saveVersion('footer', 'footer', this.footerInfo)
    return this.footerInfo
  }

  // ============================================================================
  // AUTHENTICATION (Mock)
  // ============================================================================

  findAdminUser(username: string): any | null {
    return this.adminUsers.find((u) => u.username === username) || null
  }

  verifyPassword(user: any, password: string): boolean {
    // Mock: In production, use bcrypt to compare hashed passwords
    return user.password === password
  }

  // ============================================================================
  // EXPORT/IMPORT (for migration)
  // ============================================================================

  exportAll(): any {
    return {
      homePage: this.homePage,
      homeHeroImages: this.homeHeroImages,
      homeStats: this.homeStats,
      homeServices: this.homeServices,
      aboutPage: this.aboutPage,
      aboutMission: this.aboutMission,
      aboutVision: this.aboutVision,
      aboutCoreValues: this.aboutCoreValues,
      aboutFounder: this.aboutFounder,
      aboutTeamMembers: this.aboutTeamMembers,
      packages: this.packages,
      travelToursPage: this.travelToursPage,
      travelToursFeatured: this.travelToursFeatured,
      servicePages: this.servicePages,
      contactInfo: this.contactInfo,
      footerInfo: this.footerInfo,
    }
  }

  importAll(data: any): void {
    // Import all data (for migration from localStorage)
    if (data.homePage) this.homePage = data.homePage
    if (data.homeHeroImages) this.homeHeroImages = data.homeHeroImages
    if (data.homeStats) this.homeStats = data.homeStats
    if (data.homeServices) this.homeServices = data.homeServices
    if (data.aboutPage) this.aboutPage = data.aboutPage
    if (data.aboutMission) this.aboutMission = data.aboutMission
    if (data.aboutVision) this.aboutVision = data.aboutVision
    if (data.aboutCoreValues) this.aboutCoreValues = data.aboutCoreValues
    if (data.aboutFounder) this.aboutFounder = data.aboutFounder
    if (data.aboutTeamMembers) this.aboutTeamMembers = data.aboutTeamMembers
    if (data.packages) this.packages = data.packages
    if (data.travelToursPage) this.travelToursPage = data.travelToursPage
    if (data.travelToursFeatured) this.travelToursFeatured = data.travelToursFeatured
    if (data.servicePages) this.servicePages = data.servicePages
    if (data.contactInfo) this.contactInfo = data.contactInfo
    if (data.footerInfo) this.footerInfo = data.footerInfo
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const mockDataStore = new MockDataStore()

/**
 * NOTE: This mock store is in-memory and will reset on server restart.
 * 
 * When connecting to real database:
 * 1. Replace all mockDataStore calls with Prisma client calls
 * 2. Use Prisma transactions for atomic operations
 * 3. Implement proper error handling
 * 4. Add database connection pooling
 * 5. Use Prisma's built-in versioning or implement ContentVersion table
 */
