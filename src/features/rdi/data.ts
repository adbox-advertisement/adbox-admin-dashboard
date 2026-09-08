import type { RdiSiteContent } from "@/features/rdi/types"

// Reviewed against the live RDI website on 8 September 2026.
export const initialRdiSiteContent: RdiSiteContent = {
  "version": 5,
  "settings": {
    "siteName": "RichDad Investments",
    "footerDescription": "Building spaces, shaping stories, and powering progress through three specialized divisions.",
    "footerQuickLinksHeading": "Our Divisions",
    "footerQuickLinks": [
      "Construction",
      "Media Production",
      "Solar Technology"
    ],
    "footerServicesHeading": "Company",
    "footerServices": [
      "Home",
      "About Us",
      "Contact"
    ],
    "footerContactHeading": "Contact",
    "contactAddress": "No. 64A, Omensa Plaza\nOff Awoshie Pokuase Rd.",
    "contactPhone": "+233 (0) 30 123 4567",
    "contactEmail": "info@richdadinvestments.com",
    "legalLinks": [],
    "copyright": "© 2026 RichDad Investments. All rights reserved."
  },
  "pages": [
    {
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
    },
    {
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
    },
    {
      "id": "construction",
      "name": "Construction page",
      "navigationLabel": "Construction",
      "slug": "/construction",
      "status": "Published",
      "blocks": [
        {
          "id": "construction-hero",
          "type": "hero",
          "name": "Construction hero",
          "visible": true,
          "eyebrow": "",
          "title": "Engineering & Construction",
          "description": "Building excellence with precision, quality, and innovation. Civil works, buildings and water infrastructure, from your first drawing to the final handover.",
          "buttonLabel": "Explore Our Services",
          "buttonHref": "#services",
          "secondaryButtonLabel": "Equipment & Pipe Fittings",
          "secondaryButtonHref": "#supplies"
        },
        {
          "id": "construction-stats",
          "type": "stats",
          "name": "Construction capabilities",
          "visible": true,
          "eyebrow": "",
          "title": "Our construction capabilities",
          "description": "",
          "items": [
            {
              "id": "civil",
              "title": "Civil & Building",
              "description": "Engineering and construction"
            },
            {
              "id": "water",
              "title": "Water Systems",
              "description": "Pipelines, boreholes and storage"
            },
            {
              "id": "fittings",
              "title": "HDPE Fittings",
              "description": "DN 40–800 · PN 10–25"
            },
            {
              "id": "equipment",
              "title": "Sales & Rentals",
              "description": "Butt-fusion machines · DN 50–800"
            }
          ]
        },
        {
          "id": "construction-introduction",
          "type": "split",
          "name": "Engineering expertise",
          "visible": true,
          "eyebrow": "Engineering expertise. Personal commitment.",
          "title": "Your vision, brought to life.",
          "description": "Based in Accra, RichDad Investments brings multidisciplinary consulting and engineering experience to the planning, design, implementation, monitoring and evaluation of construction projects.\n\nWe work closely with you to turn your ideas into drawings and practical construction solutions. Clear communication throughout the project keeps you informed of progress, schedules and budgets.",
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/construction/residential-buildings.jpg",
            "alt": "Residential building works from the RichDad Investments construction portfolio"
          },
          "items": [
            {
              "id": "vision",
              "title": "Our vision",
              "description": "To become a regional market leader in civil engineering and building construction services."
            },
            {
              "id": "mission",
              "title": "Our mission",
              "description": "To deliver efficient, affordable, sustainable and cost-effective engineering with a high standard of quality."
            }
          ]
        },
        {
          "id": "construction-why",
          "type": "cards",
          "name": "Why choose us",
          "visible": true,
          "eyebrow": "",
          "title": "Why Choose Us",
          "description": "Professionalism, integrity and practical solutions are at the heart of how we work.",
          "items": [
            {
              "id": "construction-quality",
              "title": "Quality First",
              "description": "Professionalism and integrity, with lasting solutions that stand the test of time"
            },
            {
              "id": "construction-delivery",
              "title": "On-Time Delivery",
              "description": "Clear communication on progress, schedules and budgets throughout your project"
            },
            {
              "id": "construction-experts",
              "title": "Expert Team",
              "description": "Multidisciplinary engineering knowledge supported by practical technical expertise"
            },
            {
              "id": "construction-full-service",
              "title": "Full Service",
              "description": "Planning, design, implementation, monitoring and evaluation under one roof"
            }
          ]
        },
        {
          "id": "construction-services",
          "type": "cards",
          "name": "Construction services",
          "visible": true,
          "eyebrow": "",
          "title": "Our Services",
          "description": "Comprehensive construction solutions tailored to your needs",
          "items": [
            {
              "id": "construction-service-0",
              "title": "Power Substations & Transmission Lines",
              "description": "Civil works for power infrastructure, including earthworks, equipment foundations, oil pits, cable trenches, control buildings, drainage and access roads.",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/power-substation.jpg",
                "alt": "Cable trenches and electrical equipment at a power substation"
              },
              "buttonLabel": "Discuss Your Project",
              "buttonHref": "mailto:construction@richdadinvestments.com"
            },
            {
              "id": "construction-service-1",
              "title": "Civil Engineering & Roads",
              "description": "Steel structures, reinforced concrete and road construction in gravel, paving blocks, concrete and bitumen, together with the drainage that supports them.",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/road-construction.jpg",
                "alt": "Road crew laying and levelling a bitumen surface"
              },
              "buttonLabel": "Discuss Your Project",
              "buttonHref": "mailto:construction@richdadinvestments.com"
            },
            {
              "id": "construction-service-2",
              "title": "Building Construction",
              "description": "High-rise and low-rise residential, commercial and institutional buildings. We translate your vision into drawings and carry it through to construction.",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/building-construction.jpg",
                "alt": "Multi-storey building under construction with scaffolding"
              },
              "buttonLabel": "Discuss Your Project",
              "buttonHref": "mailto:construction@richdadinvestments.com"
            },
            {
              "id": "construction-service-3",
              "title": "Pipe Laying",
              "description": "Pipe laying for potable water and sewage networks, working with uPVC, HDPE, carbon steel and ductile iron pipes to suit each project's requirements.",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/pipe-laying.jpg",
                "alt": "Workers joining a pipeline in an excavated trench"
              },
              "buttonLabel": "Discuss Your Project",
              "buttonHref": "mailto:construction@richdadinvestments.com"
            },
            {
              "id": "construction-service-4",
              "title": "Water Systems",
              "description": "Community water systems, borehole drilling and mechanization, distribution lines, underground and overhead storage reservoirs, and pumping stations.",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/water-systems.jpg",
                "alt": "Installed water pipework and a pump control cabinet"
              },
              "buttonLabel": "Discuss Your Project",
              "buttonHref": "mailto:construction@richdadinvestments.com"
            },
            {
              "id": "construction-service-5",
              "title": "Plant & Equipment Resources",
              "description": "Plant resources for civil works, roads and earthworks, supported by workshop maintenance, qualified mechanics and field servicing to keep projects moving.",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/plant-resources.jpg",
                "alt": "Excavator carrying out earthworks on a construction site"
              },
              "buttonLabel": "Discuss Your Project",
              "buttonHref": "mailto:construction@richdadinvestments.com"
            }
          ]
        },
        {
          "id": "construction-supplies",
          "type": "cards",
          "name": "Equipment & pipe fittings",
          "visible": true,
          "eyebrow": "Supply, sales & rentals",
          "title": "The right connections. The right equipment.",
          "description": "HDPE pipe fittings and butt-fusion welding machines to support your next installation.",
          "items": [
            {
              "id": "hdpe",
              "title": "HDPE Pipe Fittings",
              "description": "We supply fittings for water supply, drainage, firefighting, urban construction and petroleum and chemical industry applications.",
              "features": [
                "Elbows",
                "Stub ends",
                "Backing rings",
                "Tees",
                "Reducers",
                "Gate valves",
                "Air valves",
                "Water meters",
                "Hydrants",
                "Bolts & nuts",
                "Flanges",
                "Couplings",
                "Flange adapters",
                "HDPE compression fittings"
              ],
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/hdpe-fittings.jpg",
                "alt": "HDPE fittings, blue valves, flanges and couplings from the supplied product range"
              },
              "buttonLabel": "Enquire About Fittings",
              "buttonHref": "mailto:construction@richdadinvestments.com?subject=HDPE%20fittings%20enquiry"
            },
            {
              "id": "fusion",
              "title": "Butt-Fusion Welding Machines",
              "description": "Equipment for your pipe joining work, available to purchase or rent. Speak with our team about the machine and size range your project requires.",
              "features": [
                "Machine sales",
                "Equipment rentals",
                "Technical guidance"
              ],
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/butt-fusion-on-site.jpg",
                "alt": "Butt-fusion welding machine clamped around an HDPE pipe on site"
              },
              "buttonLabel": "Enquire About Sales",
              "buttonHref": "mailto:construction@richdadinvestments.com?subject=Butt-fusion%20equipment%20enquiry"
            }
          ]
        },
        {
          "id": "construction-process",
          "type": "cards",
          "name": "Our process",
          "visible": true,
          "eyebrow": "",
          "title": "Our Process",
          "description": "A streamlined approach that ensures your project runs smoothly from start to finish",
          "items": [
            {
              "id": "construction-process-1",
              "eyebrow": "01",
              "title": "Initial Consultation",
              "description": "We meet with you to understand your vision, requirements, budget, and timeline. Our experts provide initial guidance and feasibility assessment."
            },
            {
              "id": "construction-process-2",
              "eyebrow": "02",
              "title": "Design & Planning",
              "description": "Our team creates detailed plans, blueprints, and schedules. We handle all permits and ensure compliance with regulations."
            },
            {
              "id": "construction-process-3",
              "eyebrow": "03",
              "title": "Construction Phase",
              "description": "Expert execution with regular progress updates. Quality control at every stage ensures the highest standards are maintained."
            },
            {
              "id": "construction-process-4",
              "eyebrow": "04",
              "title": "Final Delivery",
              "description": "Thorough inspection and walkthrough. We ensure complete satisfaction and provide warranty support for your peace of mind."
            }
          ]
        },
        {
          "id": "construction-project-gallery",
          "type": "cards",
          "name": "Recent projects",
          "visible": true,
          "eyebrow": "",
          "title": "Our Work in Pictures",
          "description": "A closer look at our building, civil engineering and water infrastructure works.",
          "items": [
            {
              "id": "construction-project-0",
              "title": "Pipeline Installation",
              "description": "Pipe laying & fusion welding",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/pipeline-team.jpg",
                "alt": "Construction team aligning a large HDPE pipeline with a fusion machine"
              }
            },
            {
              "id": "construction-project-1",
              "title": "Concrete Structures",
              "description": "Civil & structural engineering",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/concrete-structure.jpg",
                "alt": "Reinforced concrete building frame and formwork on site"
              }
            },
            {
              "id": "construction-project-2",
              "title": "Residential Buildings",
              "description": "Building construction",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/residential-buildings.jpg",
                "alt": "Multi-storey residential buildings at different stages of construction"
              }
            },
            {
              "id": "construction-project-3",
              "title": "Steel Roof Structures",
              "description": "Structural works",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/steel-roof-structure.jpg",
                "alt": "Blue steel roof trusses installed above masonry buildings"
              }
            },
            {
              "id": "construction-project-4",
              "title": "Borehole Drilling",
              "description": "Water infrastructure",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/borehole-drilling.jpg",
                "alt": "Truck-mounted drilling equipment and water pipes at a borehole site"
              }
            },
            {
              "id": "construction-project-5",
              "title": "Completed Building",
              "description": "From construction to handover",
              "media": {
                "type": "image",
                "url": "https://www.richdadinvestments.org/construction/completed-building.jpg",
                "alt": "Completed yellow and red building with a paved entrance"
              }
            }
          ]
        },
        {
          "id": "construction-cta",
          "type": "cta",
          "name": "Construction call to action",
          "visible": true,
          "eyebrow": "",
          "title": "Let's Build Something Amazing Together",
          "description": "Ready to start your construction project? Get in touch for a consultation and quote.",
          "buttonLabel": "Discuss Your Project",
          "buttonHref": "mailto:construction@richdadinvestments.com?subject=Construction%20project%20enquiry",
          "media": {
            "type": "image",
            "url": "https://www.richdadinvestments.org/construction/water-installation.jpg",
            "alt": "Completed pipe fittings and valves installed at a water reservoir"
          }
        },
        {
          "id": "construction-solar-cta",
          "type": "cta",
          "name": "Solar Technology callout",
          "visible": true,
          "eyebrow": "",
          "title": "Planning an energy-ready property?",
          "description": "Explore how our Solar Technology division can complement your construction project.",
          "buttonLabel": "Explore Solar Technology",
          "buttonHref": "/solar"
        }
      ]
    },
    {
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
    },
    {
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
    },
    {
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
  ]
}
