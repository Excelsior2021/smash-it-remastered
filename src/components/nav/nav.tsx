//components
import GroupSwitcher from "../group-switcher/group-switcher"
import FingerPrint from "../svg/finger-print"

//react
import { useEffect, useState } from "react"

//next
import Link from "next/link"

//lib
import navItems from "@/src/lib/nav-items"

//store
import userStore from "@/src/store/user"
import navStore from "@/src/store/nav"

//next-auth
import { useSession } from "next-auth/react"

const Nav = () => {
  const session = useSession()
  const [showNavbar, setShowNavbar] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [newScrollY, setNewScrollY] = useState(0)

  const activeGroup = userStore(state => state.activeGroup)
  const activeNavItem = navStore(state => state.activeNavItem)

  useEffect(() =>
    window.addEventListener("scroll", () => setNewScrollY(window.scrollY))
  )

  useEffect(() => {
    if (newScrollY > scrollY) {
      setShowNavbar(false)
      setScrollY(newScrollY - 1)
    } else setScrollY(newScrollY + 1)
  }, [scrollY, newScrollY])

  if (session.status === "unauthenticated") return

  if (session.status === "authenticated") {
    return (
      <div
        className={`nav fixed flex flex-col bg-secondary w-screen bottom-0 opacity-95 z-50 ${
          showNavbar ? null : "nav--hide"
        } lg:sticky lg:top-0 lg:left-0 lg:max-w-[200px] lg:min-w-fit lg:h-screen lg:bg-secondary lg:items-center`}
        onClick={() => setShowNavbar(prevState => !prevState)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 p-2 ml-6 opacity-70 cursor-pointer lg:hidden">
            <FingerPrint />
            <span>tap</span>
          </div>
          <GroupSwitcher />
        </div>

        <nav className="flex justify-center">
          <ul className="flex justify-between w-[90%] p-4 lg:flex-col lg:gap-10 lg:w-full lg:p-6">
            {navItems.map(({ name, route, icon, activeRoute }) => (
              <li key={name}>
                <Link
                  className={`flex flex-col items-center ${
                    activeNavItem === activeRoute ? "text-[#ffa500]" : null
                  } lg:flex-row lg:lg:gap-2 lg:p-4`}
                  href={route({
                    username: session.data.user!.username,
                    groupId: activeGroup ? activeGroup.id : -1,
                  })}
                  data-tip={name}>
                  <span>{icon}</span>
                  <span className="text-xs min-[360px]:text-sm min-[480px]:text-base">
                    {name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    )
  }
}

export default Nav
