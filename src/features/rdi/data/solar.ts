export const solarEnquiry = (t = "RDI and ALLOLLA solar consultation") => `mailto:solar@richdadinvestments.com?subject=${encodeURIComponent(t)}`
export const solarPartner = {
  website: "https://www.allolla.com",
  logo: "/rdi-assets/solar/allolla/logo.png",
  phone: {
    label: "+233 (0) 26 267 7977",
    href: "tel:+233262677977"
  }
}
export const solarProducts = [{
  key: "solar-module",
  category: "generation",
  name: "Solar Photovoltaic Modules",
  model: "AL560–580M10NHB-144",
  image: "/rdi-assets/solar/allolla/solar-panel.jpg",
  alt: "ALLOLLA photovoltaic module with an aluminium frame and dark solar cells",
  description: "N-type monocrystalline modules with a half-cell design, designed to generate power for residential and commercial solar systems.",
  specifications: [{
    label: "Rated power at STC",
    value: "560–580 W"
  }, {
    label: "Module efficiency",
    value: "Up to 22.5%"
  }]
}, {
  key: "inverter",
  category: "generation",
  name: "Solar Inverters",
  model: "AL-IV-104 / 106 / 1012",
  image: "/rdi-assets/solar/allolla/inverter.jpg",
  alt: "ALLOLLA wall-mounted solar inverter with a circular digital display",
  description: "Connect solar generation, battery storage and grid supply, with an LCD display and Wi-Fi communication for system monitoring.",
  specifications: [{
    label: "Rated output options",
    value: "4 / 6 / 12 kW"
  }, {
    label: "Protection rating",
    value: "IP54"
  }]
}, {
  key: "all-in-one",
  category: "generation",
  name: "All-in-One Energy System",
  model: "AL-Ai-03",
  image: "/rdi-assets/solar/allolla/all-in-one.jpg",
  alt: "ALLOLLA all-in-one energy system with an integrated battery and inverter",
  description: "An integrated power and storage unit with a lithium iron phosphate battery, intelligent battery management and an LCD touch screen.",
  specifications: [{
    label: "Rated output",
    value: "5 kW"
  }, {
    label: "Battery energy",
    value: "15 kWh"
  }]
}, {
  key: "geco-compact",
  category: "home",
  name: "GECO Compact Battery",
  model: "AL-BP-24100G",
  image: "/rdi-assets/solar/allolla/geco-compact-battery.jpg",
  alt: "Compact ALLOLLA GECO battery with a front LCD display",
  description: "Compact LiFePO4 storage with an integrated battery management system and an LCD display for everyday household energy needs.",
  specifications: [{
    label: "Rated energy",
    value: "2.56 kWh"
  }, {
    label: "Rated voltage",
    value: "25.6 V"
  }]
}, {
  key: "infi",
  category: "home",
  name: "INFI Modular Battery",
  model: "AL-BP-48100S",
  image: "/rdi-assets/solar/allolla/infi-battery.jpg",
  alt: "ALLOLLA INFI rack battery with front power connections and controls",
  description: "Modular LiFePO4 storage with CAN or RS485 communication. The brochure lists scalable energy capacity up to 30.72 kWh.",
  specifications: [{
    label: "Module energy",
    value: "5.12 kWh"
  }, {
    label: "Rated voltage",
    value: "51.2 V"
  }]
}, {
  key: "geco-15",
  category: "home",
  name: "GECO High-Capacity Battery",
  model: "AL-BP-48300W",
  image: "/rdi-assets/solar/allolla/geco-15kwh-battery.jpg",
  alt: "ALLOLLA GECO high-capacity battery on castors with a touch-screen display",
  description: "A larger LiFePO4 battery with an LCD touch screen and intelligent battery management, with scalable energy capacity listed up to 120 kWh.",
  specifications: [{
    label: "Rated energy",
    value: "15 kWh"
  }, {
    label: "Rated voltage",
    value: "51.2 V"
  }]
}, {
  key: "air-cooled",
  category: "business",
  name: "Air-Cooled Energy Storage",
  model: "AL-AC-215KWh",
  image: "/rdi-assets/solar/allolla/air-cooled-storage.jpg",
  alt: "ALLOLLA air-cooled commercial energy storage cabinet",
  description: "A pre-assembled energy storage cabinet with air cooling, modular expansion, battery monitoring and fault recording.",
  specifications: [{
    label: "Storage series",
    value: "215 kWh"
  }, {
    label: "Cabinet protection",
    value: "IP55"
  }]
}, {
  key: "liquid-cooled",
  category: "business",
  name: "Liquid-Cooled Energy Storage",
  model: "AL-LC-215KWh",
  image: "/rdi-assets/solar/allolla/liquid-cooled-storage.jpg",
  alt: "ALLOLLA commercial energy storage cabinet with liquid cooling",
  description: "Integrated LiFePO4 storage with liquid cooling, battery performance monitoring and modular expansion for commercial applications.",
  specifications: [{
    label: "Battery capacity",
    value: "215 kWh"
  }, {
    label: "Power options",
    value: "100 / 200 kW"
  }]
}, {
  key: "container",
  category: "business",
  name: "Container Energy Storage",
  model: "Commercial & industrial ESS",
  image: "/rdi-assets/solar/allolla/container-storage.jpg",
  alt: "ALLOLLA containerised battery energy storage system",
  description: "Large-scale energy storage for peak-demand management, transformer capacity support and emergency backup for critical equipment.",
  specifications: [{
    label: "Catalogue series",
    value: "1,000–2,400 kWh"
  }, {
    label: "Battery chemistry",
    value: "LFP"
  }]
}]
export const solarCategories = [{
  key: "all",
  label: "All solutions"
}, {
  key: "generation",
  label: "Solar & inverters"
}, {
  key: "home",
  label: "Home batteries"
}, {
  key: "business",
  label: "Business storage"
}]
export const solarProcess = [{
  number: "01",
  title: "Consultation",
  description: "We learn about your energy needs, property, and priorities."
}, {
  number: "02",
  title: "Site & System Design",
  description: "Our team assesses the site and develops a tailored solar solution."
}, {
  number: "03",
  title: "Professional Installation",
  description: "The system is installed carefully, tested, and prepared for handover."
}, {
  number: "04",
  title: "Monitoring & Support",
  description: "We help you understand performance and keep the system operating well."
}]
