const sinon = require('sinon')
const chai = require('chai')
chai.use(require('chai-as-promised')).should()

const BigCommerceRequestRepository = require('../../../../lib/bigcommerce/RequestRepository')

describe('BigCommerceRequestRepository', () => {
  let bigCommerceMock
  let loggerMock
  /** @type BigCommerceRequestRepository */
  let subjectUnderTest
  const bigCommerce = {
    request: (type, path, data) => {
    }
  }
  const logger = {
    debug: () => {
    }
  }

  beforeEach(() => {
    bigCommerceMock = sinon.mock(bigCommerce)
    loggerMock = sinon.mock(logger)
    subjectUnderTest = new BigCommerceRequestRepository(
      /** @type BigCommerce */
      bigCommerce,
      /** @type Logger */
      logger
    )
  })

  afterEach(() => {
    bigCommerceMock.verify()
    bigCommerceMock.restore()
    loggerMock.verify()
    loggerMock.restore()
  })

  describe('trigger request()', () => {
    const mockedApiResponse = [
      {
        status: 'OK'
      }
    ]

    it('should use request when get is used', async () => {
      bigCommerceMock.expects('request')
        .returns(mockedApiResponse)
      chai.assert.deepEqual(await subjectUnderTest.get('some/path'), mockedApiResponse)
    })

    it('should use request when del is used', async () => {
      bigCommerceMock.expects('request')
        .returns(mockedApiResponse)
      chai.assert.deepEqual(await subjectUnderTest.del('some/path'), mockedApiResponse)
    })

    it('should use request when post is used', async () => {
      bigCommerceMock.expects('request')
        .returns(mockedApiResponse)
      chai.assert.deepEqual(await subjectUnderTest.post('some/path', { 'some': 'data' }), mockedApiResponse)
    })

    it('should use request when put is used', async () => {
      bigCommerceMock.expects('request')
        .returns(mockedApiResponse)
      chai.assert.deepEqual(await subjectUnderTest.put('some/path', { 'some': 'data' }), mockedApiResponse)
    })
  })

  describe('getRequestData', () => {
    it('should log everything usually', async () => {
      const type = 'type'
      const path = 'path'
      const data = { 'some': 'data' }
      const obfuscatedData = null
      const expectedParams = { type, path, data }

      chai.assert.deepEqual(await subjectUnderTest.getRequestData(type, path, data, obfuscatedData), expectedParams)
    })

    it('should not log empty data', async () => {
      const type = 'type'
      const path = 'path'
      const data = null
      const obfuscatedData = null
      const expectedParams = { type, path }

      chai.assert.deepEqual(await subjectUnderTest.getRequestData(type, path, data, obfuscatedData), expectedParams)
    })

    it('should log obfuscatedData instead of data, if given', async () => {
      const type = 'type'
      const path = 'path'
      const data = { 'some': 'data' }
      const obfuscatedData = { 'some': 'other data' }
      const expectedParams = { type, path, data: obfuscatedData }

      chai.assert.deepEqual(await subjectUnderTest.getRequestData(type, path, data, obfuscatedData), expectedParams)
    })
  })
})
