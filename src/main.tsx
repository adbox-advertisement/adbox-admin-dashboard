import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./styles/index.css"
import App from "./App.tsx"
import { AppProviders } from "./app/AppProviders.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
