// @ts-ignore
import createDataApiClient from 'data-api-client'

const quoteCharacters = ['\'', '"']

export default class DataApiDriver {
  public static transformQueryAndParameters(query: string, parameters?: any[]): any {
    let numberOfParametersInQueryString = 0

    let newQueryString = ''
    let currentQuote = null

    for (let i = 0; i < query.length; i += 1) {
      const currentCharacter = query[i]
      const currentCharacterEscaped = i !== 0 && query[i - 1] === '\\'

      if (currentCharacter === '?' && !currentQuote) {
        const paramName = `:param_${numberOfParametersInQueryString}`

        numberOfParametersInQueryString += 1
        newQueryString += paramName
      } else if (quoteCharacters.includes(currentCharacter) && !currentCharacterEscaped) {
        if (!currentQuote) {
          currentQuote = currentCharacter
        } else if (currentQuote === currentCharacter) {
          currentQuote = null
        }

        newQueryString += currentCharacter
      } else {
        newQueryString += currentCharacter
      }
    }

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
