//components
import LinkButton from "../../link-button/link-button"

//react
import { useEffect } from "react"

//lib
import clientRoute from "@/src/lib/client-route"

//store
import userStore from "@/src/store/user"
import navStore from "@/src/store/nav"

type props = {
  session: {
    user: { username: string; firstName?: string }
  }
}

const DashboardPage = ({
  session: {
    user: { username, firstName },
  },
}: props) => {
  const activeGroup = userStore(state => state.activeGroup)
  const setActiveNavItem = navStore(state => state.setActiveNavItem)

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
        <li className="w-full text-center">
          <LinkButton
            href={clientRoute.joinCreateGroup}
            text="join or create a new group"
          />
        </li>
        {activeGroup && (
          <li className="w-full text-center">
            <LinkButton
              href={`${clientRoute.recordMatch}/${activeGroup.id}`}
              text="record match"
            />
          </li>
        )}
      </ul>
    </div>
  )
}

export default DashboardPage
