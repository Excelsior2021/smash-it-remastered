import type { compareBcrypt, fieldPattern } from "@/types"
import type { PrismaClient } from "@prisma/client"
import type { RegExpMatcher } from "obscenity"

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
  compare: compareBcrypt
) => await compare(password, hashedPassword)

export const validateUsername = async (
  username: string,
  pattern: fieldPattern,
  obscenity: RegExpMatcher,
  prisma: PrismaClient
) => {
  const usernameAlreadyExists = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      username: true,
    },
  })

  //usernamePattern is true to avoid invalid error on client
  if (usernameAlreadyExists)
    return { usernameAlreadyExists, usernamePattern: true }

  const usernameObscene = obscenity.hasMatch(username)
  const usernamePattern = pattern.username.test(username)
  return { usernameObscene, usernamePattern }
}

export const validateEmail = async (
  email: string,
  pattern: fieldPattern,
  prisma: PrismaClient
) => {
  const emailAlreadyExists = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      email: true,
    },
  })

  if (emailAlreadyExists)
    //emailPattern is true to avoid invalid error on client
    return { emailAlreadyExists, emailPattern: true }

  const emailPattern = pattern.email.test(email)
  return { emailPattern }
}

export const validateName = (
  name: string,
  pattern: fieldPattern,
  obscenity: RegExpMatcher
) => {
  const nameObscene = obscenity.hasMatch(name)
  const namePattern = pattern.name.test(name)
  return { nameObscene, namePattern }
}

export const validatePassword = (
  password: string,
  confirmPassword: string,
  pattern: fieldPattern
) => {
  const passwordMatch = password === confirmPassword
  const passwordPattern = pattern.password.test(password)

  return { passwordMatch, passwordPattern }
}

export const validateScores = (player1score: number, player2score: number) => {
  if (player1score === 11 && player2score === 11) return false
  if (
    player1score < 0 ||
    player1score > 11 ||
    player2score < 0 ||
    player2score > 11
  )
    return false
  if (player1score === 11 || player2score === 11) return true
}

export const userInGroup = async (
  userId: number,
  groupId: number,
  prisma: PrismaClient
) => {
  const stat = await prisma.stat.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  })
  return stat
}

export const isAdmin = async (
  prisma: PrismaClient,
  userId: number,
  groupId: number
) => {
  const stat = await prisma.stat.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
    select: {
      isAdmin: true,
    },
  })
  if (stat) return stat.isAdmin
  else return false
}

export const isMaxGroupMembers = async (
  groupId: number,
  prisma: PrismaClient
) => {
  const group = await prisma.group.findUnique({
    where: {
      id: groupId,
    },
    select: {
      _count: {
        select: {
          stats: true,
        },
      },
    },
  })
  if (group) if (group?._count.stats >= 20) return true
  return false
}

export const isMaxUserGroups = async (userId: number, prisma: PrismaClient) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      _count: {
        select: {
          stats: true,
        },
      },
    },
  })

  if (user) if (user._count.stats >= 3) return true
  return false
}

export const validateGroupName = async (
  groupName: string,
  pattern: fieldPattern,
  obscenity: RegExpMatcher,
  prisma: PrismaClient
) => {
  const groupNameAlreadyExists = await prisma.group.findUnique({
    where: {
      name: groupName,
    },
  })

  if (groupNameAlreadyExists)
    return { groupNameAlreadyExists, groupNamePattern: true }

  const groupNameObscene = obscenity.hasMatch(groupName)
  const groupNamePattern = pattern.groupName.test(groupName)

  return { groupNameObscene, groupNamePattern }
}

export const getAdminCount = async (groupId: number, prisma: PrismaClient) => {
  const members = await prisma.stat.findMany({
    where: {
      groupId,
    },
    select: {
      isAdmin: true,
    },
  })

  const admins = members.filter(member => member.isAdmin)

  return admins.length
}
