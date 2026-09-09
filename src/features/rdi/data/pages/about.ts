import type { RdiPageContent } from "../../types"

export const aboutPage: RdiPageContent = {
  "id": "about",
  "name": "About page",
  "navigationLabel": "About",
  "slug": "/about",
  "status": "Published",
  "blocks": [
    {
      "id": "about-hero",
      "type": "hero",
      "name": "About hero",
      "visible": true,
      "eyebrow": "About RichDad Investments",
      "title": "Three disciplines. One connected vision.",
      "description": "We build enduring spaces, create meaningful stories, and deliver cleaner energy systems that help people and businesses move forward."
    },
    {
      "id": "about-divisions",
      "type": "cards",
      "name": "Division overview",
      "visible": true,
      "eyebrow": "",
      "title": "Explore our divisions",
      "description": "Specialized teams, connected by one standard of thoughtful delivery.",
      "items": [
        {
          "id": "about-construction",
          "eyebrow": "Building the future, one project at a time",
          "title": "Construction Division",
          "description": "Our construction division brings together planning, craftsmanship, and project management to deliver commercial and residential spaces that perform beautifully.",
          "features": [
            "Commercial and residential construction",
            "Renovation and remodelling",
            "Design-build coordination",
            "Project management",
            "Our promise — From the first brief to final handover, we keep quality, safety, clear communication, and responsible delivery at the centre of the project."
          ],
          "buttonLabel": "Explore Construction",
          "buttonHref": "/construction"
        },
        {
          "id": "about-media",
          "title": "Media Division",
          "eyebrow": "Stories that captivate, connect, and convert",
          "description": "Our media division turns ideas into strong visual experiences through strategy, production, branding, and digital content designed around real audience needs.",
          "features": [
            "Video production and photography",
            "Brand strategy and identity",
            "Digital marketing content",
            "Animation and visual storytelling",
            "Our promise — We pair creative direction with disciplined production so every asset supports your message, reflects your identity, and helps move your business forward."
          ],
          "buttonLabel": "Explore Media",
          "buttonHref": "/media"
        },
        {
          "id": "about-solar",
          "title": "Solar Technology Division",
          "eyebrow": "In partnership with ALLOLLA General Power",
          "description": "Our solar technology division partners with ALLOLLA General Power to bring together photovoltaic modules, inverters, home batteries and commercial energy storage, supported by RDI’s local project team.",
          "features": [
            "ALLOLLA photovoltaic modules and inverters",
            "Home batteries and commercial energy storage",
            "Energy assessment and system design",
            "Monitoring, maintenance, and support",
            "Our promise — We assess how you use energy, recommend an appropriate system, install it professionally, and help you protect performance after handover."
          ],
          "buttonLabel": "Explore Solar Technology",
          "buttonHref": "/solar"
        }
      ]
    },
    {
      "id": "about-story",
      "type": "split",
      "name": "Our story",
      "visible": true,
      "eyebrow": "Our story",
      "title": "Expertise that grows with the needs of our clients",
      "description": "RichDad Investments began with a vision to combine physical construction expertise with the creative power of digital media. That connected approach gave clients fewer handoffs and a more consistent path from idea to delivery.\n\nAs reliable, sustainable power became increasingly important to the homes and businesses we serve, Solar Technology became our third specialized division. It extends the same practical mindset into energy assessment, solar installation, storage, monitoring, and support.\n\nToday, our teams can work independently or together—building a facility, communicating its story, and helping power its future.",
      "media": {
        "type": "image",
        "url": "https://www.richdadinvestments.org/36.jpg",
        "alt": "The RichDad Investments team collaborating"
      }
    },
    {
      "id": "about-values",
      "type": "cards",
      "name": "What sets us apart",
      "visible": true,
      "eyebrow": "",
      "title": "What sets us apart",
      "description": "Connected expertise creates more options and a clearer experience for every client.",
      "items": [
        {
          "id": "about-collaboration",
          "title": "Collaborative teams",
          "description": "Construction, media, and solar specialists can coordinate around one brief and one shared outcome."
        },
        {
          "id": "about-innovation",
          "title": "Practical innovation",
          "description": "We choose technology and creative approaches for their real-world value, not novelty alone."
        },
        {
          "id": "about-delivery",
          "title": "Purposeful delivery",
          "description": "Every solution is shaped around your goals, constraints, users, and long-term success."
        }
      ]
    },
    {
      "id": "about-cta",
      "type": "cta",
      "name": "About call to action",
      "visible": true,
      "eyebrow": "",
      "title": "Talk to Our Team",
      "description": "",
      "buttonLabel": "Talk to Our Team",
      "buttonHref": "/contact"
    }
  ]
}
