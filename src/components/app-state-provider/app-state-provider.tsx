//react
import { useEffect } from "react"

//lib
import { getUserGroups } from "@/lib/api"
import apiRoute from "@/enums/api-route"
import { handleGetUserGroups, makeRequest } from "@/lib/utils"

//store
import userStore from "@/store/user"

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
      handleGetUserGroups(
        makeRequest,
        getUserGroups,
        setGroups,
        setActiveGroup,
        apiRoute
      )
  }, [data, setGroups, setActiveGroup])

  return <></>
}

export default AppStateProvider
