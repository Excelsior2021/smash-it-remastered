import { SessionProvider } from "next-auth/react"
import AppStateProvider from "../app-state-provider/app-state-provider"

const Providers = ({ children }) => (
  <SessionProvider>
    <AppStateProvider />
    {children}
  </SessionProvider>
)

export default Providers
