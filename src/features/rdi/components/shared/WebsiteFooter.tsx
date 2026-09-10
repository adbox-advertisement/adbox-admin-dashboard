import { useWebsiteContact } from "../../cms/use-website-contact"
import { useCmsText } from "../../cms/use-cms-content"
import { Mail, MapPin, Phone } from "lucide-react"

import { WebsiteLink } from "./WebsiteLink"
import { SocialIcon } from "./SocialIcon"
export function WebsiteFooter() {
  const content = useCmsText()
  const { officeAddress, officeMapUrl, phone, phoneUrl, email, emailUrl } = useWebsiteContact()
  return (<footer className="bg-[#0F172A] px-4 py-12 text-white @min-[640px]/rdi:py-16">
    <div className="rdi-container mx-auto">
      <div className="mb-12 grid grid-cols-1 gap-10 @min-[640px]/rdi:grid-cols-2 @min-[1024px]/rdi:grid-cols-4">
        <div>
          <WebsiteLink href={"/"} aria-label="RichDad Investments home" className="mb-5 flex items-center gap-3">
            <img src={content("site.brand.logo", "/rdi-assets/logo.png")} alt={content("site.brand.name", "RichDad Investments")} loading="lazy" className="size-12 rounded-lg object-cover" />
            <span className="rdi-heading text-xl font-bold">

              {content("site.brand.name", "RDI")}</span>
          </WebsiteLink>
          <p className="max-w-xs leading-relaxed text-slate-400">

            {content("site.brand.description", "Building spaces, shaping stories, and powering progress through three specialized divisions.")}</p>
          <div className="mt-6 flex gap-3">
            {(["Facebook", "Instagram", "LinkedIn"] as const).map(label => <span key={label} role="img" aria-label={label} className="flex size-10 items-center justify-center rounded-full bg-white/5 text-slate-400">
              <SocialIcon name={label} />
            </span>)}
          </div>
        </div>
        {[{ title: content("site.footer.6", "Our Divisions"), links: [["Construction", "/construction"], ["Media Production", "/media"], ["Solar Technology", "/solar"]] }, { title: content("site.footer.7", "Company"), links: [["Home", "/"], ["About Us", "/about"], ["Contact", "/contact"]] }].map(column => <div key={column.title}>
          <h2 className="mb-5 rdi-heading text-lg font-semibold">
            {column.title}
          </h2>
          <ul className="space-y-3">
            {column.links.map(([label, href]) => <li key={label}>
              <WebsiteLink href={href} className="text-slate-400 transition-colors hover:text-white">
                {label}
              </WebsiteLink>
            </li>)}
          </ul>
        </div>)}
        <div>
          <h2 className="mb-5 rdi-heading text-lg font-semibold">

            {content("site.footer.8", "Contact")}</h2>
          <ul className="space-y-4 text-slate-400">
            <li>
              <WebsiteLink href={officeMapUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-white">
                <MapPin className="mt-1 size-5 shrink-0 text-amber-400" />
                <span>
                  {officeAddress.lines.map(line => <span key={line} className="block">
                    {line}
                  </span>)}
                </span>
              </WebsiteLink>
            </li>
            <li>
              <WebsiteLink href={phoneUrl} className="flex items-start gap-3 hover:text-white">
                <Phone className="mt-1 size-5 shrink-0 text-purple-400" />

                {phone}</WebsiteLink>
            </li>
            <li>
              <WebsiteLink href={emailUrl} className="flex items-start gap-3 hover:text-white">
                <Mail className="mt-1 size-5 shrink-0 text-emerald-400" />
                <span className="break-all">

                  {email}</span>
              </WebsiteLink>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-slate-700 pt-8 text-sm text-slate-400">

        {content("site.footer.13", "© 2026 RichDad Investments. All rights reserved.")}</p>
    </div>
  </footer>)
}
