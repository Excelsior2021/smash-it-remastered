fields: {
  username: {
    obscene: usernameObscene ? "username is inappropiate" : null,
    invalid: !usernameValid ? "username is invalid" : null,
    taken: usernameAlreadyExists
      ? "username is already taken"
      : false,
  },
  email: {
    invalid: !emailValid
      ? "please provide a valid email address"
      : null,
    taken: emailAlreadyExists
      ? "email address already used"
      : false,
  },
  password: {
    invalid: !passwordValid
      ? "please provide a valid password"
      : null,
    match: !passwordMatch ? "passwords don't match" : null,
  },
  firstName: {
    obscene: firstNameObscene ? "name is inappropiate" : null,
    invalid: !firstNameValid
      ? "name can have a max. of 25 characters"
      : null,
  },
  lastName: {
    obscene: lastNameObscene ? "name is inappropiate" : null,
    invalid: !lastNameValid
      ? "name can have a max. of 25 characters"
      : null,
  },
},