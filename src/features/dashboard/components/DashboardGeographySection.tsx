import { DashboardInstitutionMap } from "./DashboardInstitutionMap"

/** Every institution in Ghana on a map of the 16 regions, across the full width. */
export function DashboardGeographySection() {
  return (
    <section className="px-4 sm:px-6">
      <DashboardInstitutionMap />
    </section>
  )
}
