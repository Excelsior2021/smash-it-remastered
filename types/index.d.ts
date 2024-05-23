import type routes from "@/src/lib/client-routes"

export type userGroup = {
  id: number
  name: string
}

export type member = {
  id: number
  username: string
  firstName?: string
  lastName?: string
}

export type stats = {
  groupId: number
  isAdmin: boolean
  loses: number
  matches: number
  pts_against: number
  pts_for: number
  userId: number
  wins: number
}

export type profile = member & { stats: stats }

export type match = {
  groupId: number
  id: number
  matchDate: string
  opponent: { username: string }
  opponentId: number
  opponentScore: number
  submittedAt: string
  user: { username: string }
  userId: number
  userScore: number
}

export type routes = typeof routes

export type groupRequest = {
  userId: number
  groupId: number
}
