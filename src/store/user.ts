import { create } from "zustand"

const userStore = create(set => ({
  groups: null,
  activeGroup: null,
  setGroups: groups => set({ groups }),
  setActiveGroup: group => set({ activeGroup: group }),
}))

export default userStore
