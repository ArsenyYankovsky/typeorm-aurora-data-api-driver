// @ts-ignore
import createDataApiClient from 'data-api-client'
import { MysqlQueryTransformer, PostgresQueryTransformer, QueryTransformer } from './query-transformer'

class DataApiDriver {
  private readonly client: any
  private transactionId?: string

  constructor(
    private readonly region: string,
    private readonly secretArn: string,
    private readonly resourceArn: string,
    private readonly database: string,
    private readonly loggerFn: (query: string, parameters?: any[]) => void = () => undefined,
    private readonly serviceConfigOptions?: any,
    private readonly queryTransformer: QueryTransformer,
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
    this.queryTransformer = queryTransformer
  }

  public async query(query: string, parameters?: any[]): Promise<any> {
    const transformedQueryData = this.queryTransformer.transformQueryAndParameters(query, parameters)

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

const createMysqlDriver = (region: string, secretArn: string, resourceArn: string, database: string,
                           loggerFn: (query: string, parameters?: any[]) => void = () => undefined) => {
  return new DataApiDriver(region, secretArn, resourceArn, database, loggerFn, new MysqlQueryTransformer())
}

export default createMysqlDriver

const createPostgresDriver = (region: string, secretArn: string, resourceArn: string, database: string,
                           loggerFn: (query: string, parameters?: any[]) => void = () => undefined) => {
  return new DataApiDriver(region, secretArn, resourceArn, database, loggerFn, new PostgresQueryTransformer())
}

export const pg = createPostgresDriver
