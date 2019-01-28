const chai = require('chai')
chai.use(require('chai-as-promised')).should()

const UserDataExpiredError = require('../../../../../../lib/shopgate/customer/errors/UserDataExpiredError')

describe('UserDataExpiredError', function () {
  it('should return proper values', function () {
    const subjectUnderTest = new UserDataExpiredError({
      id: '123456',
      mail: 'bigc@shopgate.com',
      firstName: 'Big',
      lastName: 'Commerce',
      phone: 'phone number',
      customerGroups: [],
      addresses: []
    }, 0, 120000)

    subjectUnderTest.getUserData().should.be.deep.equal({
      id: '123456',
      mail: 'bigc@shopgate.com',
      firstName: 'Big',
      lastName: 'Commerce',
      phone: 'phone number',
      customerGroups: [],
      addresses: []
    })

    subjectUnderTest.getLastTouchTime().should.be.eq(0)
    subjectUnderTest.getTtl().should.be.eq(120000)
  })
})
