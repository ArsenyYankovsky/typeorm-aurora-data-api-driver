// @ts-ignore
import createDataApiClient from 'data-api-client'
import mysql, { pg } from '../src/typeorm-aurora-data-api-driver'

jest.mock('data-api-client', () => {
  const query = jest.fn(async () => ({ result: '' }))
  return { __esModule: true,
    default: () => ({
      query,
    }) }
})

describe('DataApiDriver', () => {
  describe.each([['pg', { driver: pg }], ['mysql', { driver: mysql }]])('driver class: %s', (_, { driver }) => {
    const mockRegion = 'region'
    const mockSecretArn = 'secretArn'
    const mockResourceArn = 'resourceArn'
    const mockDatabase = 'database'
    const mockLoggerFn = jest.fn()

    describe('query', () => {
      it('should apply the queryConfigOptions continueAfterTimeout if it exists', async () => {
        const testDriver = driver(mockRegion, mockSecretArn, mockResourceArn, mockDatabase, mockLoggerFn, { queryConfigOptions: { continueAfterTimeout: true } })

        await testDriver.query('select 1')

        expect(createDataApiClient().query).toHaveBeenCalledWith(expect.objectContaining({ continueAfterTimeout: true }))
      })

      it('should give a default continueAfterTimeout option as false', async () => {
        const testDriver = driver(mockRegion, mockSecretArn, mockResourceArn, mockDatabase, mockLoggerFn)

        await testDriver.query('select 1')

        expect(createDataApiClient().query).toHaveBeenCalledWith(expect.objectContaining({ continueAfterTimeout: false }))
      })
    })
  })
})
