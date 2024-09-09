import type {
  apiRoute,
  clientRoute,
  method,
  scoresSubmissionStatus,
} from "@/enums"
import type { v4 } from "uuid"

export type navItems = {
  activeRoute: string
  name: string
  route: ({
    username,
    groupId,
  }: {
    username: string
    groupId: number
  }) => string
  icon: JSX.Element
}[]

const apiResponse = Response | undefined

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

export type groupResult = {
  id: number
  name: string
  _count: {
    stats: number
  }
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

export type opponentDataType = { groupId: number; member: member }

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

export type scoresSubmissionStatusType = typeof scoresSubmissionStatus

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

export type updateGroupDataForPageType = (
  activeGroup: userGroup,
  router: NextRouter,
  routerGroupId: string,
  url: string
) => void

export type txPrisma = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export type providers = Record<
  LiteralUnion<BuiltInProviderType, string>,
  ClientSafeProvider
>

export type hashBcrypt = (
  password: string,
  salt: number | string
) => Promise<string>

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

export type signOutNextAuth = <R extends boolean = true>(
  options?: SignOutParams<R>
) => Promise<R extends true ? undefined : SignOutResponse>

export type getServerSession = <
  O extends GetServerSessionOptions,
  R = O["callbacks"] extends {
    session: (...args: any[]) => infer U
  }
    ? U
    : Session
>(
  ...args: GetServerSessionParams<O>
) => Promise<R | null>

export type uuidType = typeof v4

export type showModalType = () => void

//api handlers
export type apiRequestType = (
  makeRequest: makeRequestType,
  field: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => Promise<apiResponse>

export type loginRequestType = (
  signIn: signInNextAuth,
  formData: FieldValues,
  clientRoute: clientRouteType
) => Promise<apiResponse>

export type userGroupApiType = (
  makeRequest: makeRequestType,
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => Promise<apiResponse>

export type recordMatchType = (
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
) => Promise<apiResponse>

export type submitMatchType = (
  makeRequest: makeRequestType,
  userScore: number,
  opponentScore: number,
  matchDate: string,
  groupId: number,
  userId: number,
  opponentId: number,
  apiRoute: apiRouteType,
  method: methodType
) => Promise<apiResponse>

export type removeMatchSubmissionType = (
  makeRequest: makeRequestType,
  matchId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => Promise<apiResponse>

export type getUserGroupsType = (
  makeRequest: makeRequestType,
  apiRoute: apiRouteType
) => Promise<apiResponse>

export type deleteAccountType = (
  makeRequest: makeRequestType,
  apiRoute: apiRouteType,
  method: methodType
) => Promise<apiResponse>

export type verifyEmailType = (
  makeRequest: makeRequestType,
  apiRoute: apiRouteType
) => Promise<apiResponse>

export type resetPasswordType = (
  makeRequest: makeRequestType,
  passwordData: FieldValues,
  token: string,
  apiRoute: apiRouteType,
  method: methodType
) => Promise<apiResponse>

export type makeRequestType = (
  apiRoute: string,
  method?: string,
  body?: any
) => Promise<Response>
