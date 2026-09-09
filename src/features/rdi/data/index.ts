import type { RdiSiteContent } from "../types"
import { initialSiteSettings } from "./site-settings"
import { homePage } from "./pages/home"
import { aboutPage } from "./pages/about"
import { constructionPage } from "./pages/construction"
import { mediaPage } from "./pages/media"
import { solarPage } from "./pages/solar"
import { contactPage } from "./pages/contact"

// Reviewed website content templates; the CMS API owns persisted site content.
export const initialRdiSiteContent: RdiSiteContent = {
  version: 5,
  settings: initialSiteSettings,
  pages: [homePage, aboutPage, constructionPage, mediaPage, solarPage, contactPage],
}
