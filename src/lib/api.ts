import type { clientRouteType, apiRouteType, methodType } from "@/types"
import type { FieldValues } from "react-hook-form"

const headers = {
  "Content-Type": "application/json",
}

export const login = async (
  signIn,
  { userId, password }: FieldValues,
  clientRoute: clientRouteType
) =>
  await signIn("credentials", {
    userId,
    password,
    redirect: false,
    callbackUrl: clientRoute.root,
  })

export const createAccount = async (
  createAccountStore,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(apiRoute.user, {
      method: method.post,
      headers,
      body: JSON.stringify(createAccountStore.formState),
    })
    return res
  } catch (error) {
    console.log(error)
    return error
  }
}

export const createGroup = async (
  { groupName }: { groupName: string },
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(apiRoute.group, {
      method: method.post,
      headers,
      body: JSON.stringify({ groupName }),
    })

    return res
  } catch (error) {
    console.log(error)
  }
}

export const queryGroups = async (
  query: string,
  apiRoute: apiRouteType,
  method: methodType
) => {
  if (query.trim() === "") return
  try {
    const res = await fetch(`${apiRoute.group}/query`, {
      method: method.post,
      headers,
      body: JSON.stringify({ query }),
    })
    return await res.json()
  } catch (error) {
    console.log(error)
  }
}

export const groupRequest = async (
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/request`, {
      method: method.post,
      headers,
      body: JSON.stringify({
        userId,
      }),
    })
    return res
  } catch (error) {
    console.log(error)
  }
}

export const getUserGroups = async (apiRoute: apiRouteType) =>
  (await fetch(`${apiRoute.user}/group`)).json()

export const removeUserFromGroup = async (
  memberId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/member`, {
      method: method.delete,
      headers,
      body: JSON.stringify({
        userId: memberId,
      }),
    })

    return res
  } catch (error) {
    console.log(error)
    return error
  }
}

export const approveUserToGroup = async (
  memberId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/approve`, {
      method: method.post,
      headers,
      body: JSON.stringify({ userId: memberId }),
    })
    return res
  } catch (error) {
    console.log(error)
  }
}

export const declineUserToGroup = async (
  memberId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/decline`, {
      method: method.post,
      headers,
      body: JSON.stringify({ userId: memberId }),
    })
    return res
  } catch (error) {
    console.log(error)
  }
}

export const recordMatch = async (
  userScore: number,
  opponentScore: number,
  matchDate: string,
  groupId: number,
  userId: number,
  opponentId: number,
  approvedBy: number,
  matchId: number | null = null,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/match`, {
      method: method.post,
      headers,
      body: JSON.stringify({
        userScore,
        opponentScore,
        matchDate: new Date(matchDate),
        player1Id: userId,
        player2Id: opponentId,
        approvedBy,
        matchId,
      }),
    })
    return res
  } catch (error) {
    console.log(error)
  }
}

export const submitMatch = async (
  userScore: number,
  opponentScore: number,
  matchDate: string,
  groupId: number,
  userId: number,
  opponentId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/match-submission`, {
      method: method.post,
      headers,
      body: JSON.stringify({
        userScore,
        opponentScore,
        matchDate: new Date(matchDate),
        userId,
        opponentId,
      }),
    })
    return res
  } catch (error) {
    console.log(error)
  }
}

export const removeMatchSubmission = async (
  matchId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/match-submission`, {
      method: method.delete,
      headers,
      body: JSON.stringify({ matchId }),
    })
  } catch (error) {
    console.log(error)
  }
}

export const changeAccountDetail = async (
  field: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.user}`, {
      method: method.patch,
      headers,
      body: JSON.stringify(field),
    })

    return res
  } catch (error) {}
}

export const changePassword = async (
  passwordData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.user}`, {
      method: method.patch,
      headers,
      body: JSON.stringify(passwordData),
    })

    return res
  } catch (error) {}
}

export const setPassword = async (
  passwordData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.user}/password`, {
      method: method.post,
      headers,
      body: JSON.stringify(passwordData),
    })

    return res
  } catch (error) {}
}

export const deleteAccount = async (
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(apiRoute.user, {
      method: method.delete,
      headers,
    })
    return res
  } catch (error) {
    console.log(error)
  }
}
