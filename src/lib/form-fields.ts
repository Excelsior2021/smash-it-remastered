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
      value: /\S+@\S+\.\S+/,
      message: "please enter a valid email",
    },
    validate: (value: string) => {
      ;/\S+@\S+\.\S+/.test(value) || "please enter a valid email"
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
  },
  {
    label: "password",
    name: "password",
    type: "password",
    required: "please enter a password",
  },
  {
    label: "confirm password",
    name: "confirmPassword",
    type: "password",
    required: "please confirm your password",
  },
]
