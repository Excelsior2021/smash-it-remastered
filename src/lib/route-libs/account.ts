export const accountPageEffect = (setActiveNavItem: any) => {
  setActiveNavItem("account")
  return () => setActiveNavItem(null)
}
