import { create } from "zustand"

const navStore = create(set => ({
  activeNavItem: null,
  setActiveNavItem: (navItem: string) => set({ activeNavItem: navItem }),
}))

export default navStore
