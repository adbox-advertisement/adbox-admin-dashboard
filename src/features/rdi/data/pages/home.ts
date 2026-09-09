import type { RdiPageContent } from "../../types"

export const homePage: RdiPageContent = {
  "id": "home",
  "name": "Home page",
  "navigationLabel": "Home",
  "slug": "/",
  "status": "Published",
  "blocks": [
    {
      "id": "home-hero",
      "type": "hero",
      "name": "Hero banner",
      "visible": true,
      "eyebrow": "Three Divisions. One Vision. Endless Possibilities.",
      "title": "Welcome to RichDad Investments",
      "description": "Choose your path to discover how we can transform your project"
    },
    {
      "id": "home-divisions",
      "type": "cards",
      "name": "Business divisions",
      "visible": true,
      "eyebrow": "",
      "title": "Business divisions",
      "description": "Choose the division that best fits your project.",
      "items": [
        {
          "id": "home-construction",
          "title": "Construction",
          "description": "Building tomorrow's infrastructure today. Civil works, buildings and water systems, supported by the right equipment and engineering expertise.",
          "features": [
            "Civil Engineering & Building Construction",
            "Pipe Laying & Water Systems",
            "HDPE Pipe Fittings",
            "Butt-Fusion Machine Sales & Rentals"
          ],
          "buttonLabel": "Explore Construction",
          "buttonHref": "/construction",
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/construction/residential-buildings.jpg",
            "alt": "Residential building works from the RichDad Investments construction portfolio"
          }
        },
        {
          "id": "home-media",
          "title": "Media",
          "description": "Crafting compelling stories through digital innovation. From concept to creation, we bring your brand's vision to life.",
          "features": [
            "Video Production & Photography",
            "Digital Marketing Solutions",
            "Brand Development",
            "Content Strategy"
          ],
          "buttonLabel": "Explore Media",
          "buttonHref": "/media",
          "media": {
            "type": "image",
            "url": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
            "alt": "Media Production"
          }
        },
        {
          "id": "home-solar",
          "title": "Solar Technology",
          "description": "In partnership with ALLOLLA General Power, we connect homes and businesses with solar panels, inverters and intelligent energy storage.",
          "features": [
            "Solar Panel Installation",
            "ALLOLLA Inverters & Battery Storage",
            "Commercial Energy Storage",
            "Maintenance & Performance Monitoring"
          ],
          "buttonLabel": "Explore Solar Technology",
          "buttonHref": "/solar",
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/solar/allolla/product-family.jpg",
            "alt": "ALLOLLA solar panels, inverters and energy storage systems"
          }
        }
      ]
    },
    {
      "id": "home-cta",
      "type": "cta",
      "name": "Guidance call to action",
      "visible": true,
      "eyebrow": "",
      "title": "Not sure which division you need?",
      "description": "",
      "buttonLabel": "Contact Us for Guidance",
      "buttonHref": "/contact"
    }
  ]
}
