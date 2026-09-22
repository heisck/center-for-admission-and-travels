'use client'

export { AdminHeader as AdminNavbar } from './admin-header'
export default function AdminNavbarCompat() {
  const { AdminHeader } = require('./admin-header')
  return <AdminHeader />
}
