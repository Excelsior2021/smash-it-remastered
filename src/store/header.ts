import { create } from "zustand"

const headerStore = create(set => ({
  backRoute: null,
  setBackRoute: route => set({ backRoute: route }),
  clearBackRoute: () => set({ backRoute: null }),
}))

export default headerStore
