import FooterContentView, { EMPTY_CONTACT, EMPTY_FOOTER } from "@/components/footer-content"
import { getSiteChromeContent, type ContactContent, type FooterContent } from "@/lib/public-content"

interface FooterServerProps {
  contact?: ContactContent
  footer?: FooterContent
}

export default async function FooterServer({ contact, footer }: FooterServerProps) {
  if (contact && footer) {
    return <FooterContentView contact={contact} footer={footer} />
  }

  const chrome = await getSiteChromeContent()

  return (
    <FooterContentView
      contact={contact ?? chrome.contact ?? EMPTY_CONTACT}
      footer={footer ?? chrome.footer ?? EMPTY_FOOTER}
    />
  )
}
