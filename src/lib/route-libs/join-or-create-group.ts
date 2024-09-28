import type { clientRouteType } from "@/types"

export const joinOrCreateGroupEffect = (
  setBackRoute: any,
  clearBackRoute: any,
  clientRoute: clientRouteType
) => {
  setBackRoute(clientRoute.root)
  return () => clearBackRoute()
}
