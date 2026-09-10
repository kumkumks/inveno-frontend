import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HealthProvider } from "./shared/context/healthcontext.tsx"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HealthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </HealthProvider>
  </StrictMode>
)
