import ChromeCachePrimer from "@/components/chrome-cache-primer"
import FooterContentView, { EMPTY_CONTACT, EMPTY_FOOTER } from "@/components/footer-content"
import { getSiteChromeContent, type ContactContent, type FooterContent } from "@/lib/public-content"

interface FooterServerProps {
  contact?: ContactContent
  footer?: FooterContent
}

export default async function FooterServer({ contact, footer }: FooterServerProps) {
  if (contact && footer) {
    return (
      <>
        <ChromeCachePrimer contact={contact} footer={footer} />
        <FooterContentView contact={contact} footer={footer} />
      </>
    )
  }

  const chrome = await getSiteChromeContent()
  const resolvedContact = contact ?? chrome.contact ?? EMPTY_CONTACT
  const resolvedFooter = footer ?? chrome.footer ?? EMPTY_FOOTER

  return (
    <>
      <ChromeCachePrimer contact={resolvedContact} footer={resolvedFooter} />
      <FooterContentView contact={resolvedContact} footer={resolvedFooter} />
    </>
  )
}
