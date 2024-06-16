import { PrismaClient } from "@prisma/client"
import { createSeedClient } from "@snaplet/seed"

const prisma = new PrismaClient()

async function main() {
  const seed = await createSeedClient()

  await seed.$resetDatabase()

  await seed.user(x =>
    x(20, {
      password: "$2a$12$.vyDhv90QFEI3mUz89MNEukfR8.1h6l0xQsPolIzKTv5aM.8r9S5a",
      emailVerified: new Date(),
    })
  )

  const { group } = await seed.group(x => x(10))

  for (const user of seed.$store.user) {
    await seed.stat(
      x =>
        x(
          { min: 1, max: 3 },
          {
            userId: user.id,
          }
        ),
      {
        connect: {
          group,
        },
      }
    )
  }

  for (const stat of seed.$store.stat) {
    const allGroupMembersStats = seed.$store.stat.filter(
      memberStat => memberStat.groupId === stat.groupId
    )

    if (allGroupMembersStats[0].userId === stat.userId)
      await prisma.stat.update({
        where: {
          userId_groupId: {
            userId: stat.userId,
            groupId: stat.groupId,
          },
        },
        data: {
          isAdmin: true,
        },
      })

    const groupMembersStats = allGroupMembersStats.filter(
      memberStat => memberStat.userId !== stat.userId
    )

    const generatePlayer2Id = () =>
      groupMembersStats[Math.floor(Math.random() * groupMembersStats.length)]
        .userId

    await seed.match(x =>
      x(
        { min: 1, max: 10 },
        {
          player1Id: stat.userId,
          player2Id: generatePlayer2Id(),
          player1Score: () => {
            if (Math.random() < 0.5) return 11
            else return Math.floor(Math.random() * 11)
          },
          player2Score: ctx => {
            if (ctx.data.player1Score !== 11) return 11
            else return Math.floor(Math.random() * 11)
          },
          groupId: stat.groupId,
        }
      )
    )
  }

  for (const match of seed.$store.match) {
    await prisma.stat.update({
      where: {
        userId_groupId: {
          userId: match.player1Id!,
          groupId: match.groupId!,
        },
      },
      data: {
        wins: { increment: match.player1Score > match.player2Score ? 1 : 0 },
        loses: { increment: match.player1Score < match.player2Score ? 1 : 0 },
        ptsFor: { increment: match.player1Score },
        ptsAgainst: { increment: match.player2Score },
      },
    })

    await prisma.stat.update({
      where: {
        userId_groupId: {
          userId: match.player2Id!,
          groupId: match.groupId!,
        },
      },
      data: {
        wins: { increment: match.player2Score > match.player1Score ? 1 : 0 },
        loses: { increment: match.player2Score < match.player1Score ? 1 : 0 },
        ptsFor: { increment: match.player2Score },
        ptsAgainst: { increment: match.player1Score },
      },
    })
  }

  console.log("Database seeded successfully!")
  process.exit()
}

main()
