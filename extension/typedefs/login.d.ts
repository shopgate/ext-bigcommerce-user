interface LoginInput {
  strategy: string,
  parameters: {
    login: string,
    password: string,
  },
  shopUrl: string,
}

interface LoginResponse {
  userId: string,
  userData: {
    id: string,
    mail: string,
    firstName: string,
    lastName: string,
    customAttributes: LoginResponseCustomAttributes,
    userGroups: Array,
    addresses: Array,
  },
}

interface LoginResponseCustomAttributes {
  company: string,
  phone: string
}
