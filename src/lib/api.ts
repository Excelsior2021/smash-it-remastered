import type {
  clientRouteType,
  apiRouteType,
  methodType,
  signInNextAuth,
  makeRequestType,
} from "@/types"
import type { FieldValues } from "react-hook-form"

export const login = async (
  signIn: signInNextAuth,
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
  makeRequest: makeRequestType,
  createAccountFormData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => await makeRequest(apiRoute.user, method.post, createAccountFormData)

export const createGroup = async (
  makeRequest: makeRequestType,
  formData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => await makeRequest(apiRoute.group, method.post, formData)

export const queryGroups = async (
  makeRequest: makeRequestType,
  { query }: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => {
  if (query.trim() === "") return

  return await makeRequest(`${apiRoute.group}/query`, method.post, {
    query: query.toLowerCase(),
  })
}

export const groupRequest = async (
  makeRequest: makeRequestType,
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) =>
  await makeRequest(`${apiRoute.group}/${groupId}/request`, method.post, {
    userId,
  })

export const getGroupRequests = async (
  makeRequest: makeRequestType,
  apiRoute: apiRouteType
) => await makeRequest(`${apiRoute.user}/group-request`)

export const getUserGroups = async (
  makeRequest: makeRequestType,
  apiRoute: apiRouteType
) => await makeRequest(`${apiRoute.user}/group`)

export const removeUserFromGroup = async (
  makeRequest: makeRequestType,
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) =>
  await makeRequest(`${apiRoute.group}/${groupId}/member`, method.delete, {
    userId,
  })

export const approveUserToGroup = async (
  makeRequest: makeRequestType,
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) =>
  await makeRequest(`${apiRoute.group}/${groupId}/approve`, method.post, {
    userId,
  })

export const declineUserToGroup = async (
  makeRequest: makeRequestType,
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) =>
  await makeRequest(`${apiRoute.group}/${groupId}/decline`, method.post, {
    userId,
  })

export const makeUserAdminOfGroup = async (
  makeRequest: makeRequestType,
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) =>
  await makeRequest(`${apiRoute.group}/${groupId}/admin`, method.patch, {
    userId,
  })

export const recordMatch = async (
  makeRequest: makeRequestType,
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
) =>
  await makeRequest(`${apiRoute.group}/${groupId}/match`, method.post, {
    userScore,
    opponentScore,
    matchDate: new Date(matchDate),
    player1Id: userId,
    player2Id: opponentId,
    approvedBy,
    matchId,
  })

export const submitMatch = async (
  makeRequest: makeRequestType,
  userScore: number,
  opponentScore: number,
  matchDate: string,
  groupId: number,
  userId: number,
  opponentId: number,
  apiRoute: apiRouteType,
  method: methodType
) =>
  await makeRequest(
    `${apiRoute.group}/${groupId}/match-submission`,
    method.post,
    {
      userScore,
      opponentScore,
      matchDate: new Date(matchDate),
      userId,
      opponentId,
    }
  )

export const removeMatchSubmission = async (
  makeRequest: makeRequestType,
  matchId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) =>
  await makeRequest(
    `${apiRoute.group}/${groupId}/match-submission`,
    method.delete,
    { matchId }
  )

export const changeAccountDetail = async (
  makeRequest: makeRequestType,
  field: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => await makeRequest(`${apiRoute.user}`, method.patch, field)

//if password already exists
export const changePassword = async (
  makeRequest: makeRequestType,
  passwordData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => await makeRequest(`${apiRoute.user}`, method.patch, passwordData)

//if password was not set initially. e.g. oauth sign up
export const setPassword = async (
  makeRequest: makeRequestType,
  passwordData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => await makeRequest(`${apiRoute.user}/password`, method.post, passwordData)

//forgotten password
export const forgottenPassword = async (
  makeRequest: makeRequestType,
  email: string,
  apiRoute: apiRouteType,
  method: methodType
) => await makeRequest(`${apiRoute.email}`, method.post, { email })

//reset password if user has forgotten
export const resetPassword = async (
  makeRequest: makeRequestType,
  passwordData: FieldValues,
  token: string,
  apiRoute: apiRouteType,
  method: methodType
) =>
  await makeRequest(`${apiRoute.user}/password`, method.patch, {
    ...passwordData,
    token,
  })

export const deleteAccount = async (
  makeRequest: makeRequestType,
  apiRoute: apiRouteType,
  method: methodType
) => await makeRequest(apiRoute.user, method.delete)

export const verifyEmail = async (
  makeRequest: makeRequestType,
  apiRoute: apiRouteType
) => await makeRequest(apiRoute.email)
