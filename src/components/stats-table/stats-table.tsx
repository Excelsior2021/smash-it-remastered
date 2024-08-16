//react
import { useEffect } from "react"

//next
import Image from "next/image"

//lib
import statKeys from "@/enums/stat-keys"

//store
import statsTableStore from "@/store/stats-table"

//types
import type { stats } from "@/types"

type props = {
  stats: stats[]
}

const StatsTable = ({ stats }: props) => {
  const { statsState, setStats, table, sortTable } = statsTableStore(state => ({
    statsState: state.stats,
    setStats: state.setStats,
    table: state.table,
    sortTable: state.sortTable,
  }))

  useEffect(() => {
    setStats(stats)
  }, [stats, setStats])

  if (!statsState) return

  return (
    <div className="w-full mb-6 lg:mb-12">
      <h2 className="text-2xl mb-4 capitalize">stats</h2>
      <div className="text-sm w-full max-h-[300px] rounded-lg overflow-x-auto">
        <table className="text-xs min-[480px]:text-sm relative bg-secondary w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              {statKeys.map(statKey => (
                <th
                  className={`text-center bg-secondary p-0 whitespace-nowrap z-10 ${
                    statKey.name === "username" ? "sticky left-0" : ""
                  }`}
                  key={statKey.name}
                  onClick={() => sortTable(statKey.serverName)}>
                  <div
                    className={`flex justify-center items-center gap-1 border-b p-3 cursor-pointer ${
                      statKey.name === "username" ? "border-r" : ""
                    }`}>
                    <div>{statKey.name}</div>
                    <div className="relative w-4 h-4">
                      <Image
                        className={`${
                          table[statKey.serverName] === "up" ? "" : "opacity-30"
                        }`}
                        src="/sort-up.svg"
                        alt="sort up"
                        fill
                      />
                      <Image
                        className={`${
                          table[statKey.serverName] === "down"
                            ? ""
                            : "opacity-30"
                        }`}
                        src="/sort-down.svg"
                        alt="sort up"
                        fill
                      />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statsState.map((userStats: stats, i: number) => (
              <tr
                className={`${i % 2 === 0 ? "bg-accent" : "bg-secondary"}`}
                key={userStats.user!.id}>
                {statKeys.map(statKeys => {
                  let stats = userStats
                  if (statKeys.serverName === "username") stats = userStats.user
                  let value = stats[statKeys.serverName]
                  if (statKeys.serverName === "winRatio")
                    value = `${Math.round(value * 100)}%`
                  return (
                    <td
                      className={`text-center p-0 bg-inherit ${
                        statKeys.serverName === "username"
                          ? "sticky left-0"
                          : ""
                      }`}
                      key={statKeys.serverName}>
                      <div
                        className={`p-3 ${
                          statKeys.serverName === "username" ? "border-r" : ""
                        }`}>
                        {value}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StatsTable
