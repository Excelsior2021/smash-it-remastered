import type { member, routes } from "@/types"

export const login = async (
  signIn,
  { userId, password }: { userId: number; password: string },
  routes: routes
) =>
  await signIn("credentials", {
    userId,
    password,
    redirect: false,
    callbackUrl: routes.root,
  })

export const createAccount = async createAccountStore => {
  try {
    const res = await fetch("/api/create-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createAccountStore.formState),
    })
    return res
  } catch (error) {
    console.log(error)
    return error
  }
}

export const createGroup = async ({ groupName }: { groupName: string }) => {
  try {
    const res = await fetch("/api/group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ groupName }),
    })

    return res
  } catch (error) {
    console.log(error)
  }
}

export const queryGroups = async (query: string) => {
  if (query.trim() === "") return
  try {
    const res = await fetch("/api/group/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })
    return await res.json()
  } catch (error) {
    console.log(error)
  }
}

export const groupRequest = async (userId: number, groupId: number) => {
  try {
    const res = await fetch(`/api/group/${groupId}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    })
    return res
  } catch (error) {
    console.log(error)
  }
}

export const getUserGroups = async () => (await fetch(`/api/user/group`)).json()

export const removeUserFromGroup = async (
  memberId: number,
  groupId: number
) => {
  try {
    const res = await fetch(`/api/group/${groupId}/member`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: memberId,
      }),
    })

    if (res.ok) return res.ok
  } catch (error) {
    console.log(error)
  }
}

export const approveUserToGroup = async (memberId: number, groupId: number) => {
  try {
    const res = await fetch(`/api/group/${groupId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: memberId }),
    })
  } catch (error) {
    console.log(error)
  }
}

export const declineUserToGroup = async (memberId: number, groupId: number) => {
  try {
    const res = await fetch(`/api/group/${groupId}/decline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: memberId }),
    })
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
  matchId: number | null = null
) => {
  try {
    const res = await fetch(`/api/group/${groupId}/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
  opponentId: number
) => {
  try {
    const res = await fetch(`/api/group/${groupId}/match-submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
  groupId: number
) => {
  try {
    const res = await fetch(`/api/group/${groupId}/match-submission`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ matchId }),
    })
  } catch (error) {
    console.log(error)
  }
}

export const deleteAccount = async () => {
  try {
    const res = await fetch("/api/user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    return res
  } catch (error) {
    console.log(error)
  }
}
