//react
import { useEffect } from "react"

//lib
import { getUserGroups } from "@/src/lib/api"
import apiRoute from "@/src/lib/api-route"

//store
import userStore from "@/src/store/user"

//next-auth
import { useSession } from "next-auth/react"

//types
import { handleGetUserGroups } from "@/src/lib/utils"

const AppStateProvider = () => {
  const { data } = useSession()
  const { groups, setGroups, setActiveGroup } = userStore(state => ({
    groups: state.groups,
    setGroups: state.setGroups,
    setActiveGroup: state.setActiveGroup,
  }))

  useEffect(() => {
    if (data) handleGetUserGroups(getUserGroups, setGroups, apiRoute)
  }, [data, setGroups])

  useEffect(() => {
    if (groups) setActiveGroup(groups[0])
  }, [groups, setActiveGroup])

  return <></>
}

export default AppStateProvider
