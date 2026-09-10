import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => cleanup())

// jsdom does not implement these browser APIs. Components under test
// (recharts, blob-URL file previews, Radix popovers) touch them directly.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!window.ResizeObserver) {
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
}

class MockIntersectionObserver {
  root = null
  rootMargin = ""
  thresholds: number[] = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
if (!window.IntersectionObserver) {
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
}

if (!URL.createObjectURL) {
  URL.createObjectURL = () => "blob:mock-url"
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = () => {}
}

if (!window.crypto.randomUUID) {
  let counter = 0
  window.crypto.randomUUID = (() => `00000000-0000-4000-8000-${String(counter++).padStart(12, "0")}`) as typeof window.crypto.randomUUID
}
