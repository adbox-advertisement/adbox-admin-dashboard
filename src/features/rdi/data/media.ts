export const mediaCategories = [{
  id: "all",
  label: "All Work"
}, {
  id: "video",
  label: "Video Production"
}, {
  id: "branding",
  label: "Branding"
}, {
  id: "animation",
  label: "Animation"
}, {
  id: "commercial",
  label: "Commercials"
}]
export const mediaProjects = [{
  id: 1,
  title: "Tech Innovation Campaign",
  category: "commercial",
  client: "TechCorp",
  image: "/rdi-assets/media/photo-1492724441997-5dc865305da7-800.jpg",
  video: true,
  year: "2024",
  description: "A cutting-edge commercial campaign that increased brand awareness by 200%",
  tags: ["4K Video", "Motion Graphics", "Color Grading"],
  stats: {
    views: "2.5M",
    engagement: "+180%"
  }
}, {
  id: 2,
  title: "Urban Stories Documentary",
  category: "video",
  client: "City Arts",
  image: "/rdi-assets/media/photo-1478720568477-152d9b164e26-800.jpg",
  video: true,
  year: "2024",
  description: "Award-winning documentary series exploring urban culture",
  tags: ["Documentary", "Cinematography", "Sound Design"],
  stats: {
    views: "1.8M",
    engagement: "+150%"
  }
}, {
  id: 3,
  title: "EcoLife Brand Identity",
  category: "branding",
  client: "EcoLife",
  image: "/rdi-assets/media/photo-1561070791-2526d30994b5-800.jpg",
  video: false,
  year: "2024",
  description: "Complete brand redesign for sustainable lifestyle company",
  tags: ["Logo Design", "Brand Strategy", "Visual Identity"],
  stats: {
    impact: "95%",
    satisfaction: "Excellent"
  }
}, {
  id: 4,
  title: "Animated Product Launch",
  category: "animation",
  client: "StartupX",
  image: "/rdi-assets/media/photo-1561070791-2526d30994b5-800.jpg",
  video: true,
  year: "2024",
  description: "3D animation for innovative product reveal",
  tags: ["3D Animation", "VFX", "Motion Design"],
  stats: {
    views: "3.2M",
    conversions: "+220%"
  }
}, {
  id: 5,
  title: "Fashion Week Recap",
  category: "video",
  client: "StyleMag",
  image: "/rdi-assets/media/photo-1445510861639-5651173bc5d5-800.jpg",
  video: true,
  year: "2024",
  description: "High-energy recap of international fashion week",
  tags: ["Event Coverage", "Quick Cuts", "Slow Motion"],
  stats: {
    views: "4.1M",
    shares: "50K+"
  }
}, {
  id: 6,
  title: "Restaurant Rebranding",
  category: "branding",
  client: "Savory Kitchen",
  image: "/rdi-assets/media/photo-1414235077428-338989a2e8c0-800.jpg",
  video: false,
  year: "2024",
  description: "Full visual identity for upscale restaurant chain",
  tags: ["Menu Design", "Photography", "Brand Guidelines"],
  stats: {
    revenue: "+165%",
    customers: "+85%"
  }
}]
export type MediaProject = (typeof mediaProjects)[number]
