import userStore from "@/src/store/user"
import LinkButton from "../../components/link-button/link-button"
import { useEffect } from "react"
import navStore from "@/src/store/nav"
import routes from "@/src/lib/client-routes"

const DashboardPage = ({
  session: {
    user: { username, firstName },
  },
}) => {
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
        <span className="capitalize">{firstName ? firstName : username}</span>{" "}
      </h1>
      <ul className="flex flex-col gap-10 max-w-96 m-auto">
        <li className="w-full text-center">
          <LinkButton
            href={routes.joinCreateGroup}
            text="join or create a new group"
          />
        </li>
        {activeGroup && (
          <li className="w-full text-center">
            <LinkButton
              href={`${routes.recordMatch}/${activeGroup.id}`}
              text="record match"
            />
          </li>
        )}
      </ul>
    </div>
  )
}

export default DashboardPage
