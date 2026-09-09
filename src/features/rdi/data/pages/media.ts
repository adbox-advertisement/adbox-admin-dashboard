import type { RdiPageContent } from "../../types"

export const mediaPage: RdiPageContent = {
  "id": "media",
  "name": "Media page",
  "navigationLabel": "Media",
  "slug": "/media",
  "status": "Published",
  "blocks": [
    {
      "id": "media-hero",
      "type": "hero",
      "name": "Media hero",
      "visible": true,
      "eyebrow": "Award-Winning Media Production",
      "title": "Stories That Move People",
      "description": "We create stunning visual content that captivates audiences and drives results",
      "media": {
        "type": "image",
        "url": "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=1600",
        "alt": "Creative media production workspace"
      }
    },
    {
      "id": "media-stats",
      "type": "stats",
      "name": "Media numbers",
      "visible": true,
      "eyebrow": "",
      "title": "Media impact",
      "description": "",
      "items": [
        {
          "id": "media-awards",
          "title": "24+",
          "description": "Industry Awards"
        },
        {
          "id": "media-clients",
          "title": "150+",
          "description": "Happy Clients"
        },
        {
          "id": "media-projects",
          "title": "500+",
          "description": "Projects Delivered"
        },
        {
          "id": "media-views",
          "title": "50M+",
          "description": "Total Views"
        }
      ]
    },
    {
      "id": "media-work",
      "type": "cards",
      "name": "Featured work",
      "visible": true,
      "eyebrow": "",
      "title": "Featured Work",
      "description": "Explore our latest creative projects",
      "items": [
        {
          "id": "media-tech",
          "eyebrow": "4K Video · Motion Graphics",
          "title": "Tech Innovation Campaign",
          "description": "A cutting-edge commercial campaign that increased brand awareness by 200%",
          "features": [
            "TechCorp",
            "2024"
          ],
          "media": {
            "type": "image",
            "url": "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800",
            "alt": "Tech Innovation Campaign"
          },
          "category": "commercial"
        },
        {
          "id": "media-documentary",
          "eyebrow": "Documentary · Cinematography",
          "title": "Urban Stories Documentary",
          "description": "Award-winning documentary series exploring urban culture",
          "features": [
            "City Arts",
            "2024"
          ],
          "media": {
            "type": "image",
            "url": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
            "alt": "Urban Stories Documentary"
          },
          "category": "video"
        },
        {
          "id": "media-ecolife",
          "eyebrow": "Logo Design · Brand Strategy",
          "title": "EcoLife Brand Identity",
          "description": "Complete brand redesign for sustainable lifestyle company",
          "features": [
            "EcoLife",
            "2024"
          ],
          "media": {
            "type": "image",
            "url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
            "alt": "EcoLife Brand Identity"
          },
          "category": "branding"
        },
        {
          "id": "media-animation",
          "eyebrow": "3D Animation · VFX",
          "title": "Animated Product Launch",
          "description": "3D animation for innovative product reveal",
          "features": [
            "StartupX",
            "2024"
          ],
          "media": {
            "type": "image",
            "url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
            "alt": "Animated Product Launch"
          },
          "category": "animation"
        },
        {
          "id": "media-fashion",
          "eyebrow": "Event Coverage · Quick Cuts",
          "title": "Fashion Week Recap",
          "description": "High-energy recap of international fashion week",
          "features": [
            "StyleMag",
            "2024"
          ],
          "media": {
            "type": "image",
            "url": "https://images.unsplash.com/photo-1445510861639-5651173bc5d5?w=800",
            "alt": "Fashion Week Recap"
          },
          "category": "video"
        },
        {
          "id": "media-restaurant",
          "eyebrow": "Menu Design · Photography",
          "title": "Restaurant Rebranding",
          "description": "Full visual identity for upscale restaurant chain",
          "features": [
            "Savory Kitchen",
            "2024"
          ],
          "media": {
            "type": "image",
            "url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
            "alt": "Restaurant Rebranding"
          },
          "category": "branding"
        }
      ]
    },
    {
      "id": "media-cta",
      "type": "cta",
      "name": "Media call to action",
      "visible": true,
      "eyebrow": "",
      "title": "Let's Create Something Amazing",
      "description": "Ready to bring your vision to life? Get in touch with our creative team today.",
      "buttonLabel": "Get Started",
      "buttonHref": "/contact"
    }
  ]
}
