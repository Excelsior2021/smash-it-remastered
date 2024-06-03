import { getUserGroups } from "@/src/lib/api"
import apiRoute from "@/src/lib/api-route"
import userStore from "@/src/store/user"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

const AppStateProvider = () => {
  const { data } = useSession()
  const { groups, setGroups, setActiveGroup } = userStore(state => ({
    groups: state.groups,
    setGroups: state.setGroups,
    setActiveGroup: state.setActiveGroup,
  }))

  useEffect(() => {
    if (data) {
      const setUserGroups = async () => setGroups(await getUserGroups(apiRoute))
      setUserGroups()
    }
  }, [setGroups, data])

  useEffect(() => {
    if (groups) setActiveGroup(groups[0])
  }, [groups, setActiveGroup])
}

export default AppStateProvider
