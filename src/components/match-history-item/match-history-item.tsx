//next
import { useRouter } from "next/router"

//lib
import { clientRoute } from "@/enums"

//types
import type { match, profileUser } from "@/types"

type props = {
  match: match
  profileUser: profileUser
}

const MatchHistoryItem = ({ match, profileUser }: props) => {
  const router = useRouter()
  const matchDate = new Date(match.matchDate)

  const players = [
    {
      id: match.player1Id,
      username: match.player1 ? match.player1.username : "deleted user",
      score: match.player1Score,
      onClick: match.player1Id !== (profileUser.id || null),
    },
    {
      id: match.player2Id,
      username: match.player2 ? match.player2.username : "deleted user",
      score: match.player2Score,
      onClick: match.player2Id !== (profileUser.id || null),
    },
  ]

  return (
    <li className="w-full max-w-[800px]">
      <div className="bg-secondary p-4 rounded-t-md">
        <div className="flex flex-col gap-10 min-[640px]:flex-row min-[640px]:justify-between">
          {players.map(player => (
            <div
              key={player.id}
              className={`flex flex-col w-fit ${
                player.id === profileUser.id
                  ? "text-error"
                  : player.id === null
                  ? ""
                  : "cursor-pointer"
              }`}
              onClick={
                player.onClick
                  ? () =>
                      router.push(
                        `${clientRoute.profile}/${match.groupId}/${player.username}`
                      )
                  : undefined
              }>
              <span>{player.username}</span>
              <span>{player.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-accent p-2 rounded-b-md">
        {matchDate.toDateString()}
      </div>
    </li>
  )
}

export default MatchHistoryItem
