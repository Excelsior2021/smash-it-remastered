//react
import { useEffect } from "react"

//lib
import { getUserGroups } from "@/src/lib/api"
import apiRoute from "@/src/lib/api-route"
import { handleGetUserGroups } from "@/src/lib/utils"

//store
import userStore from "@/src/store/user"

//next-auth
import { useSession } from "next-auth/react"

const AppStateProvider = () => {
  const { data } = useSession()
  const { setGroups, setActiveGroup } = userStore(state => ({
    setGroups: state.setGroups,
    setActiveGroup: state.setActiveGroup,
  }))

  useEffect(() => {
    if (data)
      handleGetUserGroups(getUserGroups, setGroups, setActiveGroup, apiRoute)
  }, [data, setGroups, setActiveGroup])

  return <></>
}

export default AppStateProvider
