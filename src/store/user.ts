import { create } from "zustand"

import type { userGroup } from "@/types"

const userStore = create(set => ({
  groups: null,
  activeGroup: null,
  setGroups: (groups: userGroup[]) => set({ groups }),
  setActiveGroup: (group: userGroup) => set({ activeGroup: group }),
}))

export default userStore
