import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { DashboardMetricCards, TrendBadge } from "./DashboardMetricCards"

describe("DashboardMetricCards", () => {
  it("renders all four KPI tiles with their values", () => {
    render(<DashboardMetricCards />)
    expect(screen.getByText("Total Revenue")).toBeInTheDocument()
    expect(screen.getByText("$2421,682")).toBeInTheDocument()
    expect(screen.getByText("Total Users")).toBeInTheDocument()
    expect(screen.getByText("321")).toBeInTheDocument()
    expect(screen.getByText("Ad Payment")).toBeInTheDocument()
    expect(screen.getByText("Reward Payment")).toBeInTheDocument()
  })

  it("gives every tile a trend badge with a percentage", () => {
    render(<DashboardMetricCards />)
    expect(screen.getByText("12.4%")).toBeInTheDocument()
    expect(screen.getByText("8.1%")).toBeInTheDocument()
    expect(screen.getByText("4.6%")).toBeInTheDocument()
    expect(screen.getByText("2.3%")).toBeInTheDocument()
  })
})

describe("TrendBadge", () => {
  it("renders an up-trend badge with the success styling", () => {
    render(<TrendBadge direction="up" value="5%" />)
    const badge = screen.getByText("5%").closest("span")
    expect(badge?.className).toMatch(/bg-success-100/)
  })

  it("renders a down-trend badge with the error styling", () => {
    render(<TrendBadge direction="down" value="5%" />)
    const badge = screen.getByText("5%").closest("span")
    expect(badge?.className).toMatch(/bg-error-100/)
  })

  it("renders an inverse-tone badge for use on colored backgrounds", () => {
    render(<TrendBadge direction="up" value="5%" tone="inverse" />)
    const badge = screen.getByText("5%").closest("span")
    expect(badge?.className).toMatch(/bg-white\/15/)
  })
})
