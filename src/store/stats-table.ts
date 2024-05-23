import { create } from "zustand"

const statsTableReducer = (state, statField, initialTable) => {
  if (state.table[statField] === "up") {
    {
      if (statField === "username")
        state.stats.sort((a, b) =>
          b.user[statField].localeCompare(a.user[statField])
        )
      else {
        state.stats.sort((a, b) => a[statField] - b[statField])
      }
    }
    return {
      ...state,
      table: {
        ...initialTable,
        [statField]: "down",
      },
    }
  }

  if (statField === "username")
    state.stats.sort((a, b) =>
      a.user[statField].localeCompare(b.user[statField])
    )
  else {
    state.stats.sort((a, b) => b[statField] - a[statField])
  }

  return {
    ...state,
    table: {
      ...initialTable,
      [statField]: "up",
    },
  }
}

const table = {
  username: "",
  matches: "",
  wins: "",
  loses: "",
  ptsFor: "",
  ptsAgainst: "",
  winRation: "",
}

const statsTableStore = create(set => ({
  stats: null,
  table,
  setStats: stats => set({ stats, table }),
  sortTable: stat => set(state => statsTableReducer(state, stat, table)),
}))

export default statsTableStore
