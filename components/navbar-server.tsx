import Navbar from "@/components/navbar"
import { getNavLinks } from "@/lib/nav-links"

export default async function NavbarServer() {
  const navLinks = await getNavLinks()
  return <Navbar navLinks={navLinks} />
}
