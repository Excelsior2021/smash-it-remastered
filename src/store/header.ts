import { create } from "zustand"

import type { clientRouteType } from "@/types"

const headerStore = create(set => ({
  backRoute: null,
  setBackRoute: (route: clientRouteType) => set({ backRoute: route }),
  clearBackRoute: () => set({ backRoute: null }),
}))

export default headerStore
