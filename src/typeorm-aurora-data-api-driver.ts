// @ts-ignore
import createDataApiClient from 'data-api-client'
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata'
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
    private readonly queryTransformer: QueryTransformer,
    private readonly serviceConfigOptions?: any,
    private readonly formatOptions?: any,
    private readonly queryConfigOptions?: { continueAfterTimeout?: boolean },
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
      formatOptions,
    })
    this.queryTransformer = queryTransformer
    this.queryConfigOptions = serviceConfigOptions?.queryConfigOptions
  }

  public async query(query: string, parameters?: any[]): Promise<any> {
    const transformedQueryData = this.queryTransformer.transformQueryAndParameters(query, parameters)

    this.loggerFn(transformedQueryData.queryString, transformedQueryData.parameters)

    let result = await this.client.query({
      sql: transformedQueryData.queryString,
      parameters: transformedQueryData.parameters,
      transactionId: this.transactionId,
      continueAfterTimeout: this.queryConfigOptions?.continueAfterTimeout ?? false,
    })

    // TODO: Remove this hack when all Postgres calls in TypeORM use structured result
    if (result.records) {
      result = result.records
      result.records = result
    }

    return result
  }

  public preparePersistentValue(value: any, columnMetadata: ColumnMetadata): any {
    return this.queryTransformer.preparePersistentValue(value, columnMetadata)
  }

  public prepareHydratedValue(value: any, columnMetadata: ColumnMetadata): any {
    return this.queryTransformer.prepareHydratedValue(value, columnMetadata)
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
  loggerFn: (query: string, parameters?: any[]) => void = () => undefined,
  serviceConfigOptions?: any, formatOptions?: any) => new DataApiDriver(
  region,
  secretArn,
  resourceArn,
  database,
  loggerFn,
  new MysqlQueryTransformer({ enableUuidHack: formatOptions?.enableUuidHack }),
  serviceConfigOptions,
  formatOptions,
)

export default createMysqlDriver

const createPostgresDriver = (region: string, secretArn: string, resourceArn: string, database: string,
  loggerFn: (query: string, parameters?: any[]) => void = () => undefined,
  serviceConfigOptions?: any, formatOptions?: any) => new DataApiDriver(
  region,
  secretArn,
  resourceArn,
  database,
  loggerFn,
  new PostgresQueryTransformer({ enableUuidHack: formatOptions?.enableUuidHack }),
  serviceConfigOptions,
  formatOptions,
)

export const pg = createPostgresDriver

export { MysqlQueryTransformer, PostgresQueryTransformer }
