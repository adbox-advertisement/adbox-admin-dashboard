import { AxiosError, AxiosHeaders } from "axios"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { superAdminApi } from "@/api/client"
import { renderWithProviders } from "@/test/test-utils"
import { DashboardInstitutionMap } from "./DashboardInstitutionMap"

const institutions = [
  { id: "ug", name: "University of Ghana", shortName: "UG", type: "TRADITIONAL_UNIVERSITY", region: "Greater Accra", town: "Legon", isActive: true },
  { id: "acce", name: "Accra College of Education", shortName: "ACCE", type: "PUBLIC_COLLEGE_OF_EDUCATION", region: "Greater Accra", town: "Accra", isActive: true },
  { id: "knust", name: "KNUST", shortName: "KNUST", type: "TRADITIONAL_UNIVERSITY", region: "Ashanti", town: "Kumasi", isActive: true },
]

describe("DashboardInstitutionMap", () => {
  beforeEach(() => {
    vi.spyOn(superAdminApi, "get").mockResolvedValue({ data: institutions })
  })

  it("draws every institution and opens on the busiest region", async () => {
    renderWithProviders(<DashboardInstitutionMap />)
    expect(await screen.findByText(/3 institutions in 16 regions/)).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /Map of Ghana's 16 regions with 3 institutions/ })).toBeInTheDocument()
    const regions = screen.getByRole("region", { name: "Regions" })
    expect(within(regions).getAllByRole("button")).toHaveLength(16)
    expect(within(regions).getByRole("button", { name: "Greater Accra, 2 institutions" })).toHaveAttribute("aria-pressed", "true")
    const accra = screen.getByRole("region", { name: "Institutions in Greater Accra" })
    expect(within(accra).getByText("University of Ghana")).toBeInTheDocument()
    expect(within(accra).getByText("2 institutions: 1 universities & tertiary, 1 colleges of education.")).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "Kinds of institution" })).toHaveTextContent("Universities & tertiary2")
  })

  it("lists another region's institutions when it is chosen", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardInstitutionMap />)
    const regions = await screen.findByRole("region", { name: "Regions" })
    await user.click(await within(regions).findByRole("button", { name: "Ashanti, 1 institution" }))
    expect(within(regions).getByRole("button", { name: "Ashanti, 1 institution" })).toHaveAttribute("aria-pressed", "true")
    expect(within(screen.getByRole("region", { name: "Institutions in Ashanti" })).getByText("KNUST")).toBeInTheDocument()
  })

  it("says which permission is missing when the catalogue is refused", async () => {
    vi.mocked(superAdminApi.get).mockRejectedValue(new AxiosError("Forbidden", "ERR_BAD_REQUEST", undefined, undefined,
      { status: 403, statusText: "Forbidden", data: {}, headers: {}, config: { headers: new AxiosHeaders() } }))
    renderWithProviders(<DashboardInstitutionMap />)
    expect(await screen.findByRole("alert")).toHaveTextContent("institutions.read")
    expect(screen.getByRole("img", { name: "Map of Ghana's 16 regions" })).toBeInTheDocument()
  })
})
