//components
import LinkButton from "../../link-button/link-button"

//react
import { useEffect } from "react"

//lib
import clientRoute from "@/enums/client-route"

//store
import navStore from "@/store/nav"

//types
import type { userGroup } from "@/types"

type props = {
  session: {
    user: { username: string; firstName?: string }
  }
  userGroups: userGroup[]
}

const DashboardPage = ({
  session: {
    user: { username, firstName },
  },
  userGroups,
}: props) => {
  const setActiveNavItem = navStore(state => state.setActiveNavItem)

  const navLinks = [
    {
      id: 1,
      href: clientRoute.joinCreateGroup,
      text: "join or create a new group",
    },
    {
      id: 2,
      href: `${clientRoute.recordMatch}/${
        userGroups.length !== 0 ? userGroups[0].id : "-1"
      }`,
      text: "record match",
    },
  ]

  useEffect(() => {
    setActiveNavItem("home")
    return () => setActiveNavItem(null)
  })

  return (
    <div>
      <h1 className="text-3xl mb-6">
        Hi,{" "}
        <span className={firstName && "capitalize"}>
          {firstName ? firstName : username ? username : null}
        </span>{" "}
      </h1>
      <ul className="flex flex-col gap-10 max-w-96 m-auto">
        {navLinks.map(link => {
          if (link.id === 2 && userGroups.length === 0) return
          return <LinkButton key={link.id} href={link.href} text={link.text} />
        })}
      </ul>
    </div>
  )
}

export default DashboardPage
