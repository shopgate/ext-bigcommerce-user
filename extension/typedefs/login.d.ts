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
    gender: string,
    birthday: string,
    phone: string,
    customerGroups: Array,
    addresses: Array,
  },
}