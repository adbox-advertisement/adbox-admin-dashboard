import { useCmsText } from "./use-cms-content"
export function useWebsiteContact() {
  const content = useCmsText()
  const lines = content("site.contact.address", "No. 64A, Omensa Plaza\nOff Awoshie Pokuase Rd.").split("\n").filter(Boolean)
  const officeAddress = { lines, full: lines.join(", ") }
  const phone = content("site.contact.phone", "+233 (0) 30 123 4567")
  const email = content("site.contact.email", "info@richdadinvestments.com")
  return {
    officeAddress,
    officeMapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress.full)}`,
    phone,
    phoneUrl: `tel:${phone.replace(/\(0\)/g, "").replace(/[^+0-9]/g, "")}`,
    email,
    emailUrl: `mailto:${email.trim()}`,
  }
}
