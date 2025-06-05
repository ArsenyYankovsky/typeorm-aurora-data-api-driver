/* eslint-disable import/first */
jest.mock('../src/data-api-client', () => {
  const query = jest.fn(async () => ({ result: '' }))
  const beginTransaction = jest.fn(async () => ({ transactionId: '1' }))
  return {
    createDataApiClient: () => ({
      query,
      beginTransaction,
    }),
  }
})

import { createDataApiClient } from '../src/data-api-client'
import mysql, { pg } from '../src/typeorm-aurora-data-api-driver'

describe('DataApiDriver', () => {
  describe.each([['pg', { driver: pg }], ['mysql', { driver: mysql }]])('driver class: %s', (_, { driver }) => {
    const mockRegion = 'region'
    const mockSecretArn = 'secretArn'
    const mockResourceArn = 'resourceArn'
    const mockDatabase = 'database'
    const mockLoggerFn = jest.fn()

    describe('query', () => {
      beforeEach(() => {
        // Clear mock calls
        jest.clearAllMocks()
      })

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

      it('should execute queries in a transaction sequentially', async () => {
        const testDriver = driver(mockRegion, mockSecretArn, mockResourceArn, mockDatabase, mockLoggerFn)

        const delayedQuery = () => {
          let onStarted = () => {}
          const hasStarted = new Promise((resolve) => {
            onStarted = () => resolve(undefined)
          })
          let done = () => {}
          const isDone = new Promise((resolve) => {
            done = () => resolve({ result: '' })
          })
          jest.mocked(createDataApiClient().query).mockImplementationOnce(() => {
            onStarted()
            return isDone
          })
          return [hasStarted, done] as const
        }
        const [query1Started, resolveQuery1] = delayedQuery()

        await testDriver.startTransaction()

        const query1 = testDriver.query('select 1')
        const query2 = testDriver.query('select 2')

        await query1Started
        expect(createDataApiClient().query).toHaveBeenCalledWith(expect.objectContaining({ sql: 'select 1' }))
        expect(createDataApiClient().query).not.toHaveBeenCalledWith(expect.objectContaining({ sql: 'select 2' }))

        resolveQuery1()
        await query1
        await query2

        expect(createDataApiClient().query).toHaveBeenCalledWith(expect.objectContaining({ sql: 'select 2' }))
      })
    })
  })
})
