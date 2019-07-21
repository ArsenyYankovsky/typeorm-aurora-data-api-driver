// @ts-ignore
import createDataApiClient from 'data-api-client'

export default class DataApiDriver {
  public static transformQueryAndParameters(query: string, parameters?: any[]): any {
    const queryParamRegex = /\?(?=(([^(")\\]*(\\.|"([^"\\]*\\.)*[^"\\]*"))*[^"]*$))(?=(([^(')\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$))/g

    let numberOfParametersInQueryString = 0

    const newQueryString = query.replace(queryParamRegex, () => {
      const paramName = `param_${numberOfParametersInQueryString}`

      numberOfParametersInQueryString += 1

      return `:${paramName}`
    })

    if (
      parameters &&
      parameters.length > 0 &&
      parameters.length % numberOfParametersInQueryString !== 0
    ) {
      throw new Error(`Number of parameters mismatch, got ${numberOfParametersInQueryString} in query string \
            and ${parameters.length} in input`)
    }

    const transformedParameters: any[] = []

    if (parameters && parameters.length > 0) {
      const numberOfObjects = parameters.length / numberOfParametersInQueryString

      for (let i = 0; i < numberOfObjects; i += 1) {
        const parameterObject: any = {}

        for (let y = 0; y < numberOfParametersInQueryString; y += 1) {
          const paramName = `param_${y}`

          parameterObject[paramName] = parameters[i + y]
        }

        transformedParameters.push(parameterObject)
      }
    }

    return {
      queryString: newQueryString,
      parameters: transformedParameters,
    }
  }

  private readonly region: string

  private readonly secretArn: string

  private readonly resourceArn: string

  private readonly database: string

  private readonly client: any

  private readonly loggerFn?: (query: string, parameters?: any) => void

  private transactionId?: string

  constructor(
    region: string,
    secretArn: string,
    resourceArn: string,
    database: string,
    loggerFn?: (query: string, parameters?: any) => void,
  ) {
    this.region = region
    this.secretArn = secretArn
    this.resourceArn = resourceArn
    this.database = database
    this.client = createDataApiClient({
      secretArn,
      resourceArn,
      database,
      options: {
        region,
      },
    })
    this.loggerFn = loggerFn
  }

  public async query(query: string, parameters?: any[]): Promise<any> {
    const transformedQueryData = DataApiDriver.transformQueryAndParameters(query, parameters)

    if (this.loggerFn) {
      this.loggerFn(transformedQueryData.queryString, transformedQueryData.parameters)
    }

    const result = await this.client.query({
      sql: transformedQueryData.queryString,
      parameters: transformedQueryData.parameters,
      transactionId: this.transactionId,
    })

    if (result.records) {
      return result.records
    }

    return result
  }

  public async startTransaction(): Promise<void> {
    console.log('starting transaction')
    const { transactionId } = await this.client.beginTransaction()
    this.transactionId = transactionId
    console.log('started transaction ', transactionId)
  }

  public async commitTransaction(): Promise<void> {
    console.log('comitting transaction ', this.transactionId)
    await this.client.commitTransaction({ transactionId: this.transactionId })
    this.transactionId = undefined
    console.log('comitted transaction')
  }

  public async rollbackTransaction(): Promise<void> {
    console.log('rolling back transaction ', this.transactionId)
    await this.client.rollbackTransaction({ transactionId: this.transactionId })
    this.transactionId = undefined
    console.log('rolled back transaction')
  }
}
