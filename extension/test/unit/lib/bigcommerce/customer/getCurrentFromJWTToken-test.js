const assert = require('assert')
const { expect } = require('chai')
const { getCurrentCustomerFromJWTToken } = require('../../../../../lib/bigcommerce/CustomerRepository')
const BigCommerceCustomerTokenInvalidError = require('../../../../../lib/bigcommerce/customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenUnverifiedError = require('../../../../../lib/bigcommerce/customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenExpiredError = require('../../../../../lib/bigcommerce/customer/jwt/TokenExpiredError')

describe('getCurrentCustomerFromJWTToken', function () {
  it('should decode JWT token', function () {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJjdXN0b21lciI6eyJpZCI6MTU0LCJlbWFpbCI6InRlc3RAc2hvcGdhdGUuY29tIiwiZ3JvdXBfaWQiOiIxIn0sImlzcyI6ImJjL2FwcHMiLCJzdWIiOiJyNXM4NDRhZCIsImlhdCI6ODUyNDEyNzMzNSwiZXhwIjo4NTI0MTI4MjM1LCJ2ZXJzaW9uIjoxLCJhdWQiOiJzbWYyN2lzMHlsOGQyNHdtcTR2NWV4bWNodWxscXF5IiwiYXBwbGljYXRpb25faWQiOiJzbWYyN2lzMHlsOGQyNHdtcTR2NWV4bWNodWxscXF5Iiwic3RvcmVfaGFzaCI6InI1czg0NGFkIiwib3BlcmF0aW9uIjoiY3VycmVudF9jdXN0b21lciJ9.14KWSKxIfWjmclY2Untv-rTO4bO1srK2yUYq2Sy7w61qig9lK_CS9uDajJIwSUg4KmhQT3p15p4c3-SOmYViOw'
    /** @type {BigCommerceCurrentCustomer} currentCustomer */
    const currentCustomer = getCurrentCustomerFromJWTToken(token, 'my_super_secret')

    assert.strictEqual(currentCustomer.id, 154)
    assert.strictEqual(currentCustomer.email, 'test@shopgate.com')
    assert.strictEqual(currentCustomer.groupId, '1')
  })

  it('should verify JWT token', function () {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJjdXN0b21lciI6eyJpZCI6MTU0LCJlbWFpbCI6InRlc3RAc2hvcGdhdGUuY29tIiwiZ3JvdXBfaWQiOiIxIn0sImlzcyI6ImJjL2FwcHMiLCJzdWIiOiJyNXM4NDRhZCIsImlhdCI6ODUyNDEyNzMzNSwiZXhwIjo4NTI0MTI4MjM1LCJ2ZXJzaW9uIjoxLCJhdWQiOiJzbWYyN2lzMHlsOGQyNHdtcTR2NWV4bWNodWxscXF5IiwiYXBwbGljYXRpb25faWQiOiJzbWYyN2lzMHlsOGQyNHdtcTR2NWV4bWNodWxscXF5Iiwic3RvcmVfaGFzaCI6InI1czg0NGFkIiwib3BlcmF0aW9uIjoiY3VycmVudF9jdXN0b21lciJ9.14KWSKxIfWjmclY2Untv-rTO4bO1srK2yUYq2Sy7w61qig9lK_CS9uDajJIwSUg4KmhQT3p15p4c3-SOmYViOw'
    expect(() => getCurrentCustomerFromJWTToken(token, '')).throw(BigCommerceCustomerTokenUnverifiedError)
  })

  it('should know of expired tokens', function () {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJjdXN0b21lciI6eyJpZCI6MTU0LCJlbWFpbCI6InRlc3RAc2hvcGdhdGUuY29tIiwiZ3JvdXBfaWQiOiIxIn0sImlzcyI6ImJjL2FwcHMiLCJzdWIiOiJyNXM4NDRhZCIsImlhdCI6MTUyNDEyNzMzNSwiZXhwIjoxNTI0MTI4MjM1LCJ2ZXJzaW9uIjoxLCJhdWQiOiJzbWYyN2lzMHlsOGQyNHdtcTR2NWV4bWNodWxscXF5IiwiYXBwbGljYXRpb25faWQiOiJzbWYyN2lzMHlsOGQyNHdtcTR2NWV4bWNodWxscXF5Iiwic3RvcmVfaGFzaCI6InI1czg0NGFkIiwib3BlcmF0aW9uIjoiY3VycmVudF9jdXN0b21lciJ9.6t800llbRVp2Y_nTf45L_H7iEG0ZyNaYM1jIsgWgY-adVT1uO6Mhr1Xp-1_BSvTIrebAy2Kp1n34foJgLHwSUQ'
    expect(() => getCurrentCustomerFromJWTToken(token, 'my_super_secret')).throw(BigCommerceCustomerTokenExpiredError)
  })

  it('should fail when decoded data has no customer information', function () {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJub25lIjp7ImlkIjoxNTQsImVtYWlsIjoidGVzdEBzaG9wZ2F0ZS5jb20iLCJncm91cF9pZCI6IjEifSwiaXNzIjoiYmMvYXBwcyIsInN1YiI6InI1czg0NGFkIiwiaWF0Ijo4NTI0MTI3MzM1LCJleHAiOjg1MjQxMjgyMzUsInZlcnNpb24iOjEsImF1ZCI6InNtZjI3aXMweWw4ZDI0d21xNHY1ZXhtY2h1bGxxcXkiLCJhcHBsaWNhdGlvbl9pZCI6InNtZjI3aXMweWw4ZDI0d21xNHY1ZXhtY2h1bGxxcXkiLCJzdG9yZV9oYXNoIjoicjVzODQ0YWQiLCJvcGVyYXRpb24iOiJjdXJyZW50X2N1c3RvbWVyIn0.NMEKNY4JsqEu4CUVKvnD0ziaHo4Rbc6-2EpanHbKuvvXFNyJXzy4yASkqL8Hhg9_r4YKyuUEIel3RC7srrx83A'
    expect(() => getCurrentCustomerFromJWTToken(token, 'my_super_secret')).throw(BigCommerceCustomerTokenInvalidError)
  })
})
