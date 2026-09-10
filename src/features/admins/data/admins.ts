import avatarAdison from "@/assets/dashboard/admin-avatar.jpg"
import avatarKaiya from "@/assets/dashboard/publisher-alfredo.png"
import avatarEmery from "@/assets/dashboard/publisher-marilyn.png"
import avatarJaxson from "@/assets/dashboard/publisher-gustavo.png"
import avatarAspen from "@/assets/dashboard/publisher-paityn.png"
import avatarGiana from "@/assets/dashboard/publisher-kadin.png"
import type { Admin } from "../types"

export const seedAdmins: Admin[] = [
  { id: "admin-adison", firstName: "Adison", lastName: "Cole", email: "adison@adbox.com", telephone: "+233 24 000 0001", role: "Super Admin", avatar: avatarAdison, updatedAt: "2026-10-24T23:46:00.000Z" },
  { id: "admin-kaiya", firstName: "Kaiya", lastName: "Reyes", email: "kaiya@adbox.com", telephone: "+233 24 000 0002", role: "Administrator", avatar: avatarKaiya, updatedAt: "2026-10-24T23:46:00.000Z" },
  { id: "admin-emery", firstName: "Emery", lastName: "Osei", email: "emery@adbox.com", telephone: "+233 24 000 0003", role: "Administrator", avatar: avatarEmery, updatedAt: "2026-10-24T23:46:00.000Z" },
  { id: "admin-jaxson", firstName: "Jaxson", lastName: "Mensah", email: "jaxson@adbox.com", telephone: "+233 24 000 0004", role: "Accountant", avatar: avatarJaxson, updatedAt: "2026-10-24T23:46:00.000Z" },
  { id: "admin-aspen", firstName: "Aspen", lastName: "Boateng", email: "aspen@adbox.com", telephone: "+233 24 000 0005", role: "Auditor", avatar: avatarAspen, updatedAt: "2026-10-24T23:46:00.000Z" },
  { id: "admin-giana", firstName: "Giana", lastName: "Addo", email: "giana@adbox.com", telephone: "+233 24 000 0006", role: "Administrator", avatar: avatarGiana, updatedAt: "2026-10-24T23:46:00.000Z" },
]
