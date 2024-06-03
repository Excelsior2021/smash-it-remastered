import type apiRoute from "@/src/lib/api-route"
import type clientRoute from "@/src/lib/client-route"
import type method from "@/src/lib/http-method"

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

export type player = {
  username: string
  score: number
}

export type matchData = {
  players: player[]
  matchDate: string
}

export type clientRouteType = typeof clientRoute

export type apiRouteType = typeof apiRoute

export type methodType = typeof method

export type groupRequest = {
  userId: number
  groupId: number
}

export type fieldPattern = {
  username: RegExp
  email: RegExp
  name: RegExp
  password: RegExp
  groupName: RegExp
}

export type formField = {
  label: string
  name: string
  type: string
  required: string
  info: string
  pattern: {
    value: RegExp
    message: string
  }
}

export type passwordData = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}
