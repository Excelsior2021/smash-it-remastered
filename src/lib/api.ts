import type {
  clientRouteType,
  apiRouteType,
  methodType,
  signInNextAuth,
} from "@/types"
import type { FieldValues } from "react-hook-form"

const headers = {
  "Content-Type": "application/json",
}

const makeRequest = async (apiRoute, method, body) => {
  let options

  if (method !== "GET")
    options = {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }

  const res = await fetch(apiRoute, options)
  return res
}

export const login = async (
  signIn: signInNextAuth,
  { userId, password }: FieldValues,
  clientRoute: clientRouteType
) => {
  const res = await signIn("credentials", {
    userId,
    password,
    redirect: false,
    callbackUrl: clientRoute.root,
  })
  return res
}

export const createAccount = async (
  createAccountFormData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(apiRoute.user, {
      method: method.post,
      headers,
      body: JSON.stringify(createAccountFormData),
    })
    return res
  } catch (error) {
    console.log(error)
  }
}

export const createGroup = async (
  formData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(apiRoute.group, {
      method: method.post,
      headers,
      body: JSON.stringify(formData),
    })

    return res
  } catch (error) {
    console.log(error)
  }
}

export const queryGroups = async (
  { query }: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => {
  if (query.trim() === "") return
  try {
    const res = await fetch(`${apiRoute.group}/query`, {
      method: method.post,
      headers,
      body: JSON.stringify({ query: query.toLowerCase() }),
    })
    return res
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

export const getGroupRequests = async (apiRoute: apiRouteType) => {
  try {
    const res = await fetch(`${apiRoute.user}/group-request`)
    return res
  } catch (error) {
    console.log(error)
  }
}

export const getUserGroups = async (apiRoute: apiRouteType) => {
  try {
    const res = await fetch(`${apiRoute.user}/group`)
    return res
  } catch (error) {
    console.log(error)
  }
}

export const removeUserFromGroup = async (
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/member`, {
      method: method.delete,
      headers,
      body: JSON.stringify({
        userId,
      }),
    })

    return res
  } catch (error) {
    console.log(error)
    return error
  }
}

export const approveUserToGroup = async (
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/approve`, {
      method: method.post,
      headers,
      body: JSON.stringify({ userId }),
    })
    return res
  } catch (error) {
    console.log(error)
  }
}

export const declineUserToGroup = async (
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/decline`, {
      method: method.post,
      headers,
      body: JSON.stringify({ userId }),
    })
    return res
  } catch (error) {
    console.log(error)
  }
}

export const makeUserAdminOfGroup = async (
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.group}/${groupId}/admin`, {
      method: method.patch,
      headers,
      body: JSON.stringify({ userId }),
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
  apiRoute: apiRouteType,
  method: methodType,
  matchId: number | null = null
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
    return res
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
  } catch (error) {
    console.log(error)
  }
}

//if password already exists
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

//if password was not set initially. e.g. oauth sign up
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
  } catch (error) {
    console.log(error)
  }
}

//forgotten password
export const forgottenPassword = async (
  email: string,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.email}`, {
      method: method.post,
      headers,
      body: JSON.stringify({ email }),
    })

    return res
  } catch (error) {
    console.log(error)
  }
}

//reset password if user has forgotten
export const resetPassword = async (
  passwordData: FieldValues,
  token: string,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(`${apiRoute.user}/password`, {
      method: method.patch,
      headers,
      body: JSON.stringify({ ...passwordData, token }),
    })

    return res
  } catch (error) {
    console.log(error)
  }
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

export const verifyEmail = async (
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await fetch(apiRoute.email, {
      method: method.get,
    })
    return res
  } catch (error) {
    console.log(error)
  }
}
