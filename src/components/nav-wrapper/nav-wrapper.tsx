import Nav from "../nav/nav"
import { useSession } from "next-auth/react"

import type { navItems } from "@/types"

type props = {
  navItems: navItems
}

const NavWrapper = ({ navItems }: props) => {
  const session = useSession()
  return session.status === "authenticated" ? (
    <Nav navItems={navItems} session={session} />
  ) : null
}

export default NavWrapper
