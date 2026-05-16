import ChromeCachePrimer from "@/components/chrome-cache-primer"
import FooterContentView, { EMPTY_CONTACT, EMPTY_FOOTER } from "@/components/footer-content"
import { getSiteChromeContent, type ContactContent, type FooterContent } from "@/lib/public-content"
import { getNavLinks } from "@/lib/nav-links"

const SERVICE_ROUTES = ["/study-abroad", "/work-abroad", "/travel-tours", "/global-network"]

async function getFooterServiceLinks() {
  const navLinks = await getNavLinks()
  return SERVICE_ROUTES.map((href) => {
    const match = navLinks.find((link) => link.href === href)
    return { href, label: match?.mobileLabel ?? match?.label ?? href }
  })
}

interface FooterServerProps {
  contact?: ContactContent
  footer?: FooterContent
}

export default async function FooterServer({ contact, footer }: FooterServerProps) {
  const serviceLinks = await getFooterServiceLinks()

  if (contact && footer) {
    return (
      <>
        <ChromeCachePrimer contact={contact} footer={footer} />
        <FooterContentView contact={contact} footer={footer} serviceLinks={serviceLinks} />
      </>
    )
  }

  const chrome = await getSiteChromeContent()
  const resolvedContact = contact ?? chrome.contact ?? EMPTY_CONTACT
  const resolvedFooter = footer ?? chrome.footer ?? EMPTY_FOOTER

  return (
    <>
      <ChromeCachePrimer contact={resolvedContact} footer={resolvedFooter} />
      <FooterContentView contact={resolvedContact} footer={resolvedFooter} serviceLinks={serviceLinks} />
    </>
  )
}
