interface BigCommerceCustomerRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  company?: string
  _authentication?: BigCommerceCustomerRequestAuthentication
}

interface BigCommerceCustomerRequestAuthentication {
  password: string
}
