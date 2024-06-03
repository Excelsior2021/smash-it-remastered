import pattern from "./field-validation"

export const loginFormFields = [
  {
    label: "username/email",
    name: "userId",
    type: "text",
    required: "please enter your username or email",
  },
  {
    label: "password",
    name: "password",
    type: "password",
    required: "please enter your password",
  },
]

export const personalFormFields = [
  {
    label: "email",
    name: "email",
    type: "email",
    required: "please enter your email",
    pattern: {
      value: pattern.email,
      message: "please enter a valid email",
    },
    validate: (value: string) => {
      pattern.email.test(value) || "please enter a valid email"
    },
  },
  {
    label: "first name (optional)",
    name: "firstName",
    type: "text",
  },
  {
    label: "last name (optional)",
    name: "lastName",
    type: "text",
  },
]

export const accountFormFields = [
  {
    label: "username",
    name: "username",
    type: "text",
    required: "please enter a username",
    pattern: {
      value: pattern.username,
      message: "please enter a valid username",
    },
    info: "username must be between 6 - 15 characters long. Characters must be alphanumeric ('_', '-' are also allowed). First character must be alphanumeric.",
  },
  {
    label: "password",
    name: "password",
    type: "password",
    required: "please enter a password",
    info: "password must be between 6 - 20 characters long. password must start with an alphanumeric char or '_'.",
  },
  {
    label: "confirm password",
    name: "confirmPassword",
    type: "password",
    required: "please confirm your password",
  },
]

export const changePasswordFormFields = [
  {
    label: "current password",
    name: "currentPassword",
    type: "password",
    required: "please enter your current password",
  },
  {
    label: "new password",
    name: "newPassword",
    type: "password",
    info: "password must be between 6 - 20 characters long. password must start with an alphanumeric char or '_'.",
    required: "please enter a new password",
    pattern: {
      value: pattern.password,
      message: "please enter a valid password",
    },
  },
  {
    label: "confirm new password",
    name: "confirmNewPassword",
    type: "password",
    required: "please confirm your new password",
    validate: (value: string, newPassword: string) =>
      newPassword === value || "passwords do not match",
  },
]
