// @ts-ignore
import createDataApiClient from 'data-api-client'
import { transformQueryAndParameters } from './transform.utils'

export default class DataApiDriver {
  private readonly client: any
  private transactionId?: string

  constructor(
    private readonly region: string,
    private readonly secretArn: string,
    private readonly resourceArn: string,
    private readonly database: string,
    private readonly loggerFn: (query: string, parameters?: any[]) => void = () => undefined,
    private readonly serviceConfigOptions?: any,
  ) {
    this.region = region
    this.secretArn = secretArn
    this.resourceArn = resourceArn
    this.database = database
    this.loggerFn = loggerFn
    this.serviceConfigOptions = serviceConfigOptions || {}
    this.serviceConfigOptions.region = region
    this.client = createDataApiClient({
      secretArn,
      resourceArn,
      database,
      options: this.serviceConfigOptions,
    })
  }

  public async query(query: string, parameters?: any[]): Promise<any> {
    const transformedQueryData = transformQueryAndParameters(query, parameters)

    this.loggerFn(transformedQueryData.queryString, transformedQueryData.parameters)

    const result = await this.client.query({
      sql: transformedQueryData.queryString,
      parameters: transformedQueryData.parameters,
      transactionId: this.transactionId,
    })

    return result.records || result
  }

  public async startTransaction(): Promise<void> {
    const { transactionId } = await this.client.beginTransaction()
    this.transactionId = transactionId
  }

  public async commitTransaction(): Promise<void> {
    await this.client.commitTransaction({ transactionId: this.transactionId })
    this.transactionId = undefined
  }

  public async rollbackTransaction(): Promise<void> {
    await this.client.rollbackTransaction({ transactionId: this.transactionId })
    this.transactionId = undefined
  }
}
