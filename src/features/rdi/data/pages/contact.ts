import type { RdiPageContent } from "../../types"

export const contactPage: RdiPageContent = {
  "id": "contact",
  "name": "Contact page",
  "navigationLabel": "Contact",
  "slug": "/contact",
  "status": "Published",
  "blocks": [
    {
      "id": "contact-hero",
      "type": "hero",
      "name": "Contact hero",
      "visible": true,
      "eyebrow": "Start a conversation",
      "title": "Let's build, create, and power what's next",
      "description": "Tell us whether you need construction, media, solar technology, or a connected solution. We'll help you find the right path."
    },
    {
      "id": "contact-form",
      "type": "cards",
      "name": "Project enquiry form",
      "visible": true,
      "eyebrow": "",
      "title": "Tell us about your project",
      "description": "Share a few details and select the division that best matches your needs.",
      "items": [
        {
          "id": "contact-first-name",
          "title": "First Name",
          "description": "Your first name"
        },
        {
          "id": "contact-last-name",
          "title": "Last Name",
          "description": "Your last name"
        },
        {
          "id": "contact-email-field",
          "title": "Email Address",
          "description": "your.email@example.com"
        },
        {
          "id": "contact-phone-field",
          "title": "Phone Number",
          "description": "(123) 456-7890"
        },
        {
          "id": "contact-service",
          "title": "Service Interested In",
          "description": "Select a service",
          "features": [
            "Construction Services",
            "Media Services",
            "Solar Technology Services",
            "Multi-Division Project",
            "Other"
          ]
        },
        {
          "id": "contact-message",
          "title": "Message",
          "description": "Tell us about your project"
        }
      ],
      "buttonLabel": "Send Message"
    },
    {
      "id": "contact-details",
      "type": "cards",
      "name": "Contact information",
      "visible": true,
      "eyebrow": "",
      "title": "Contact information",
      "description": "",
      "items": [
        {
          "id": "contact-visit",
          "eyebrow": "Visit us",
          "title": "No. 64A, Omensa Plaza",
          "description": "Off Awoshie Pokuase Rd."
        },
        {
          "id": "contact-call",
          "eyebrow": "Call us",
          "title": "+233 (0) 30 123 4567",
          "description": ""
        },
        {
          "id": "contact-email",
          "eyebrow": "Email us",
          "title": "info@richdadinvestments.com",
          "description": ""
        },
        {
          "id": "contact-hours",
          "eyebrow": "Office hours",
          "title": "Monday–Friday: 8:00–17:00",
          "description": ""
        }
      ]
    },
    {
      "id": "contact-solar-note",
      "type": "cta",
      "name": "Solar project note",
      "visible": true,
      "eyebrow": "",
      "title": "Planning a solar project?",
      "description": "Include your location, typical power needs, and property type in the message so our solar team can prepare for the first conversation."
    },
    {
      "id": "contact-teams",
      "type": "cards",
      "name": "Division contacts",
      "visible": true,
      "eyebrow": "",
      "title": "Speak with the right team",
      "description": "Each division has dedicated specialists ready to understand your project.",
      "items": [
        {
          "id": "contact-construction-team",
          "title": "Construction",
          "description": "Building, renovation, and project enquiries",
          "features": [
            "construction@richdadinvestments.com"
          ]
        },
        {
          "id": "contact-media-team",
          "title": "Media",
          "description": "Production, branding, and campaign enquiries",
          "features": [
            "media@richdadinvestments.com"
          ]
        },
        {
          "id": "contact-solar-team",
          "title": "Solar Technology",
          "description": "RDI × ALLOLLA solar systems, storage and support",
          "features": [
            "solar@richdadinvestments.com"
          ]
        }
      ]
    },
    {
      "id": "contact-faq",
      "type": "cards",
      "name": "Frequently asked questions",
      "visible": true,
      "eyebrow": "",
      "title": "Frequently asked questions",
      "description": "Helpful details before we begin.",
      "items": [
        {
          "id": "contact-faq-1",
          "title": "Which areas do you serve?",
          "description": "We are based in Accra and primarily serve the Greater Accra Region, with project availability across Ghana depending on scope and requirements."
        },
        {
          "id": "contact-faq-2",
          "title": "Do you offer an initial consultation?",
          "description": "Yes. We begin with a conversation about your goals, site or audience, timeline, and budget so we can recommend the most useful next step."
        },
        {
          "id": "contact-faq-3",
          "title": "Can more than one division work on my project?",
          "description": "Yes. Our construction, media, and solar teams can work independently or coordinate on one project—for example, building a property, installing its energy system, and producing launch content."
        },
        {
          "id": "contact-faq-4",
          "title": "What solar technology services do you provide?",
          "description": "In partnership with ALLOLLA General Power, our solar division supports photovoltaic modules, inverters, home batteries and commercial energy storage, alongside system planning, installation and support."
        }
      ]
    }
  ]
}
