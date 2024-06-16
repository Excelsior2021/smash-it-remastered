//component
import AppStateProvider from "../app-state-provider/app-state-provider"

//next-auth
import { SessionProvider } from "next-auth/react"

//types
import type { ReactNode } from "react"

type props = {
  children: ReactNode
}

const Providers = ({ children }: props) => (
  <SessionProvider>
    <AppStateProvider />
    {children}
  </SessionProvider>
)

export default Providers
