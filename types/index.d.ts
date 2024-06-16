import type apiRoute from "@/src/lib/api-route"
import type clientRoute from "@/src/lib/client-route"
import type method from "@/src/lib/http-method"

export type group = {
  id: number
  _count: {
    requests: number
    matches: number
    matchSubmission: number
    stats: number
  }
  stats: stats[]
}

export type userGroup = {
  id: number
  name: string
}

export type member = {
  id: number
  username: string
  firstName?: string
  lastName?: string
  isAdmin?: boolean
}

export type stats = {
  groupId?: number
  userId?: number
  matches: number
  wins: number
  loses: number
  pts_against: number
  pts_for: number
  winRatio: number
  isAdmin: boolean
  user?: {
    id: number
    username: string
    firstName?: string
    lastName?: string
  }
}

export type profile = member & { stats: stats }

export type profileUser = {
  username: string
  id: number
}

export type match = {
  approvedAt: string
  approvedBy: number
  groupId: number
  id: number
  matchDate: string
  player1: profileUser
  player1Id: number
  player1Score: number
  player2: profileUser
  player2Id: number
  player2Score: number
  submittedAt: string
}

export type matchSubmission = {
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
  validate: () => void
}

export type passwordData = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export type providers = Record<
  LiteralUnion<BuiltInProviderType, string>,
  ClientSafeProvider
>

export type compareBcrypt = (
  password: string,
  hashedPassword: string
) => Promise<boolean>

export type signInNextAuth = <
  P extends RedirectableProviderType | undefined = undefined
>(
  provider?: LiteralUnion<
    P extends RedirectableProviderType
      ? P | BuiltInProviderType
      : BuiltInProviderType
  >,
  options?: SignInOptions,
  authorizationParams?: SignInAuthorizationParams
) => Promise<
  P extends RedirectableProviderType ? SignInResponse | undefined : undefined
>
