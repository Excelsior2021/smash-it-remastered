import type { matchData } from "@/types"

type props = {
  matchData: matchData
}

const ModalMatchData = ({ matchData }: props) => {
  const date = new Date(matchData.matchDate)
  return (
    <div className="flex flex-col gap-4">
      {matchData.players.map(player => (
        <div key={player.username} className="flex justify-between">
          <span>{player.username}</span>
          <span>{player.score}</span>
        </div>
      ))}
      <div className="flex justify-between">
        <span>match date</span>
        <span>{date.toDateString()}</span>
      </div>
    </div>
  )
}

export default ModalMatchData
