import { create } from "zustand"

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
}

const createAccountFormStore = create(set => ({
  formState: {
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  },
  updateState: (field, value) =>
    set(state => ({ formState: { ...state.formState, [field]: value } })),
  clearState: () => set({ formState: initialFormState }),
}))

export default createAccountFormStore
