import type { RdiPageContent } from "../../types"

export const solarPage: RdiPageContent = {
  "id": "solar",
  "name": "Solar Technology page",
  "navigationLabel": "Solar Technology",
  "slug": "/solar",
  "status": "Published",
  "blocks": [
    {
      "id": "solar-hero",
      "type": "hero",
      "name": "Solar hero",
      "visible": true,
      "eyebrow": "RDI × ALLOLLA · Solar partnership",
      "title": "Smarter solar power for a brighter future",
      "description": "RichDad Investments, in partnership with ALLOLLA General Power, brings together local project support and solar technology to help power your home, business and everything ahead.",
      "buttonLabel": "Request a Solar Consultation",
      "buttonHref": "mailto:solar@richdadinvestments.com?subject=RDI%20and%20ALLOLLA%20solar%20consultation",
      "secondaryButtonLabel": "Explore Solutions",
      "secondaryButtonHref": "#solar-services",
      "media": {
        "type": "image",
        "url": "https://www.richdadinvestments.org/solar/allolla/product-family.jpg",
        "alt": "ALLOLLA solar panels, inverters, home batteries and commercial energy storage systems"
      }
    },
    {
      "id": "solar-benefits",
      "type": "cards",
      "name": "Solar benefits",
      "visible": true,
      "eyebrow": "A partnership built around your energy needs",
      "title": "Local guidance.\nConnected energy solutions.",
      "description": "RDI is your local point of contact for planning and delivering your solar project. ALLOLLA General Power brings the technology range, from photovoltaic modules and inverters to intelligent battery storage.\n\nTogether, we help you explore a system that fits your property, power needs and plans for growth.",
      "items": [
        {
          "id": "solar-independence",
          "title": "Energy independence",
          "description": "Generate power at your property and reduce reliance on the grid."
        },
        {
          "id": "solar-cleaner",
          "title": "Cleaner operations",
          "description": "Use renewable energy to reduce the environmental impact of daily power needs."
        },
        {
          "id": "solar-reliable",
          "title": "Built for reliability",
          "description": "Thoughtful design, quality installation, and support protect long-term performance."
        }
      ],
      "buttonLabel": "Meet ALLOLLA General Power",
      "buttonHref": "https://www.allolla.com"
    },
    {
      "id": "solar-solutions",
      "type": "cards",
      "name": "ALLOLLA product catalogue",
      "visible": true,
      "eyebrow": "The ALLOLLA range",
      "title": "Power for your home. Capacity for your business.",
      "description": "Explore solar generation, inverters and energy storage through our partnership with ALLOLLA General Power.",
      "items": [
        {
          "id": "solar-module",
          "category": "generation",
          "title": "Solar Photovoltaic Modules",
          "eyebrow": "AL560–580M10NHB-144",
          "description": "N-type monocrystalline modules with a half-cell design, designed to generate power for residential and commercial solar systems.",
          "features": [
            "Rated power at STC — 560–580 W",
            "Module efficiency — Up to 22.5%"
          ],
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/solar/allolla/solar-panel.jpg",
            "alt": "ALLOLLA photovoltaic module with an aluminium frame and dark solar cells"
          },
          "buttonLabel": "Enquire About This System",
          "buttonHref": "mailto:solar@richdadinvestments.com?subject=ALLOLLA%20Solar%20Photovoltaic%20Modules%20%E2%80%94%20AL560%E2%80%93580M10NHB-144"
        },
        {
          "id": "inverter",
          "category": "generation",
          "title": "Solar Inverters",
          "eyebrow": "AL-IV-104 / 106 / 1012",
          "description": "Connect solar generation, battery storage and grid supply, with an LCD display and Wi-Fi communication for system monitoring.",
          "features": [
            "Rated output options — 4 / 6 / 12 kW",
            "Protection rating — IP54"
          ],
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/solar/allolla/inverter.jpg",
            "alt": "ALLOLLA wall-mounted solar inverter with a circular digital display"
          },
          "buttonLabel": "Enquire About This System",
          "buttonHref": "mailto:solar@richdadinvestments.com?subject=ALLOLLA%20Solar%20Inverters%20%E2%80%94%20AL-IV-104%20%2F%20106%20%2F%201012"
        },
        {
          "id": "all-in-one",
          "category": "generation",
          "title": "All-in-One Energy System",
          "eyebrow": "AL-Ai-03",
          "description": "An integrated power and storage unit with a lithium iron phosphate battery, intelligent battery management and an LCD touch screen.",
          "features": [
            "Rated output — 5 kW",
            "Battery energy — 15 kWh"
          ],
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/solar/allolla/all-in-one.jpg",
            "alt": "ALLOLLA all-in-one energy system with an integrated battery and inverter"
          },
          "buttonLabel": "Enquire About This System",
          "buttonHref": "mailto:solar@richdadinvestments.com?subject=ALLOLLA%20All-in-One%20Energy%20System%20%E2%80%94%20AL-Ai-03"
        },
        {
          "id": "geco-compact",
          "category": "home",
          "title": "GECO Compact Battery",
          "eyebrow": "AL-BP-24100G",
          "description": "Compact LiFePO4 storage with an integrated battery management system and an LCD display for everyday household energy needs.",
          "features": [
            "Rated energy — 2.56 kWh",
            "Rated voltage — 25.6 V"
          ],
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/solar/allolla/geco-compact-battery.jpg",
            "alt": "Compact ALLOLLA GECO battery with a front LCD display"
          },
          "buttonLabel": "Enquire About This System",
          "buttonHref": "mailto:solar@richdadinvestments.com?subject=ALLOLLA%20GECO%20Compact%20Battery%20%E2%80%94%20AL-BP-24100G"
        },
        {
          "id": "infi",
          "category": "home",
          "title": "INFI Modular Battery",
          "eyebrow": "AL-BP-48100S",
          "description": "Modular LiFePO4 storage with CAN or RS485 communication. The brochure lists scalable energy capacity up to 30.72 kWh.",
          "features": [
            "Module energy — 5.12 kWh",
            "Rated voltage — 51.2 V"
          ],
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/solar/allolla/infi-battery.jpg",
            "alt": "ALLOLLA INFI rack battery with front power connections and controls"
          },
          "buttonLabel": "Enquire About This System",
          "buttonHref": "mailto:solar@richdadinvestments.com?subject=ALLOLLA%20INFI%20Modular%20Battery%20%E2%80%94%20AL-BP-48100S"
        },
        {
          "id": "geco-15",
          "category": "home",
          "title": "GECO High-Capacity Battery",
          "eyebrow": "AL-BP-48300W",
          "description": "A larger LiFePO4 battery with an LCD touch screen and intelligent battery management, with scalable energy capacity listed up to 120 kWh.",
          "features": [
            "Rated energy — 15 kWh",
            "Rated voltage — 51.2 V"
          ],
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/solar/allolla/geco-15kwh-battery.jpg",
            "alt": "ALLOLLA GECO high-capacity battery on castors with a touch-screen display"
          },
          "buttonLabel": "Enquire About This System",
          "buttonHref": "mailto:solar@richdadinvestments.com?subject=ALLOLLA%20GECO%20High-Capacity%20Battery%20%E2%80%94%20AL-BP-48300W"
        },
        {
          "id": "air-cooled",
          "category": "business",
          "title": "Air-Cooled Energy Storage",
          "eyebrow": "AL-AC-215KWh",
          "description": "A pre-assembled energy storage cabinet with air cooling, modular expansion, battery monitoring and fault recording.",
          "features": [
            "Storage series — 215 kWh",
            "Cabinet protection — IP55"
          ],
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/solar/allolla/air-cooled-storage.jpg",
            "alt": "ALLOLLA air-cooled commercial energy storage cabinet"
          },
          "buttonLabel": "Enquire About This System",
          "buttonHref": "mailto:solar@richdadinvestments.com?subject=ALLOLLA%20Air-Cooled%20Energy%20Storage%20%E2%80%94%20AL-AC-215KWh"
        },
        {
          "id": "liquid-cooled",
          "category": "business",
          "title": "Liquid-Cooled Energy Storage",
          "eyebrow": "AL-LC-215KWh",
          "description": "Integrated LiFePO4 storage with liquid cooling, battery performance monitoring and modular expansion for commercial applications.",
          "features": [
            "Battery capacity — 215 kWh",
            "Power options — 100 / 200 kW"
          ],
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/solar/allolla/liquid-cooled-storage.jpg",
            "alt": "ALLOLLA commercial energy storage cabinet with liquid cooling"
          },
          "buttonLabel": "Enquire About This System",
          "buttonHref": "mailto:solar@richdadinvestments.com?subject=ALLOLLA%20Liquid-Cooled%20Energy%20Storage%20%E2%80%94%20AL-LC-215KWh"
        },
        {
          "id": "container",
          "category": "business",
          "title": "Container Energy Storage",
          "eyebrow": "Commercial & industrial ESS",
          "description": "Large-scale energy storage for peak-demand management, transformer capacity support and emergency backup for critical equipment.",
          "features": [
            "Catalogue series — 1,000–2,400 kWh",
            "Battery chemistry — LFP"
          ],
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/solar/allolla/container-storage.jpg",
            "alt": "ALLOLLA containerised battery energy storage system"
          },
          "buttonLabel": "Enquire About This System",
          "buttonHref": "mailto:solar@richdadinvestments.com?subject=ALLOLLA%20Container%20Energy%20Storage%20%E2%80%94%20Commercial%20%26%20industrial%20ESS"
        }
      ]
    },
    {
      "id": "solar-ecosystem",
      "type": "split",
      "name": "Connected energy system",
      "visible": true,
      "eyebrow": "One connected energy system",
      "title": "Generate. Store. Stay in control.",
      "description": "ALLOLLA connects solar panels, inverters, battery storage and grid supply, with cloud, app and PC monitoring to help you understand your energy system.",
      "media": {
        "type": "image",
        "url": "https://www.richdadinvestments.org/solar/allolla/energy-solutions.jpg",
        "alt": "ALLOLLA system diagram showing solar panels connected to an inverter, batteries, the grid and household loads, with cloud monitoring on an app or PC"
      },
      "items": [
        {
          "id": "generate",
          "title": "Use solar energy",
          "description": "Photovoltaic modules feed the inverter to support your property's energy needs."
        },
        {
          "id": "store",
          "title": "Store energy for later",
          "description": "Battery storage adds flexibility and supports backup power in a suitably designed system."
        },
        {
          "id": "monitor",
          "title": "Monitor performance",
          "description": "Connected monitoring brings operating information to your app or computer."
        }
      ]
    },
    {
      "id": "solar-process",
      "type": "cards",
      "name": "Solar process",
      "visible": true,
      "eyebrow": "Our process",
      "title": "A clear path from energy need to working system",
      "description": "Practical renewable energy, professionally delivered.",
      "items": [
        {
          "id": "solar-process-1",
          "eyebrow": "01",
          "title": "Consultation",
          "description": "We learn about your energy needs, property, and priorities."
        },
        {
          "id": "solar-process-2",
          "eyebrow": "02",
          "title": "Site & System Design",
          "description": "Our team assesses the site and develops a tailored solar solution."
        },
        {
          "id": "solar-process-3",
          "eyebrow": "03",
          "title": "Professional Installation",
          "description": "The system is installed carefully, tested, and prepared for handover."
        },
        {
          "id": "solar-process-4",
          "eyebrow": "04",
          "title": "Monitoring & Support",
          "description": "We help you understand performance and keep the system operating well."
        }
      ]
    },
    {
      "id": "solar-cta",
      "type": "cta",
      "name": "Solar call to action",
      "visible": true,
      "eyebrow": "",
      "title": "Ready to put the sun to work?",
      "description": "Tell us about your property and energy needs. Our RDI solar team will help you explore the ALLOLLA range and plan your next step.",
      "buttonLabel": "Start Your Solar Project",
      "buttonHref": "mailto:solar@richdadinvestments.com?subject=RDI%20and%20ALLOLLA%20solar%20consultation",
      "secondaryButtonLabel": "+233 (0) 26 267 7977",
      "secondaryButtonHref": "tel:+233262677977"
    }
  ]
}
