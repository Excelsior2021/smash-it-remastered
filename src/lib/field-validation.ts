const pattern = {
  username: /^[a-zA-Z][\w_\-]{5,14}$/,
  email: /^.+@.+\.[a-z]{1,9}(\.[a-z]{1,9})?$/,
  name: /^[a-zA-Z\-]{1,25}$/,
  password: /^[a-zA-Z_].{5,19}$/,
  groupName: /^.{1,20}$/,
}

export default pattern
