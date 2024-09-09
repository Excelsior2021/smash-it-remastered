export enum apiRoute {
  user = "/api/user",
  group = "/api/group",
  email = "/api/email",
}

export enum clientRoute {
  root = "/",
  login = "/login",
  createAccount = "/create-account",
  profile = "/profile",
  matchHistory = "/match-history",
  group = "/group",
  account = "/account",
  accountDetails = "/account-details",
  changePassword = "/change-password",
  approveMatches = "/approve-matches",
  joinGroup = "/join-group",
  createGroup = "/create-group",
  groupRequests = "/group-requests",
  joinCreateGroup = "/join-or-create-group",
  manageGroup = "/manage-group",
  addAdmin = "/add-admin",
  recordMatch = "/record-match",
  removeMembers = "/remove-members",
  deleteAccount = "/delete-account",
  forgottenPassword = "/forgotten-password",
  emailVerification = "email-verification",
}

export enum method {
  get = "GET",
  post = "POST",
  put = "PUT",
  patch = "PATCH",
  delete = "DELETE",
}

export enum memberListItemType {
  groupRequest,
  removeMember,
  addAdmin,
}

export enum scoresSubmissionStatus {
  pending,
  success,
  failed,
}

export const statKeys = [
  { name: "username", serverName: "username" },
  { name: "matches", serverName: "matches" },
  { name: "wins", serverName: "wins" },
  { name: "loses", serverName: "loses" },
  { name: "pts for", serverName: "ptsFor" },
  { name: "pts against", serverName: "ptsAgainst" },
  { name: "win ratio", serverName: "winRatio" },
]
