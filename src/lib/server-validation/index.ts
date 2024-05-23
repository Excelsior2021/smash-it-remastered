import type { PrismaClient } from "@prisma/client"

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
