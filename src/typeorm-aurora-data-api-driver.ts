// @ts-ignore
import createDataApiClient from 'data-api-client'

const transformQuery = (query: string, parameters?: any[]): [string, number] => {
  const quoteCharacters = ['\'', '"']

  let newQueryString = ''
  let currentQuote = null
  let numberOfParametersInQueryString = 0
  let extendedParameterCount = 0

  for (let i = 0; i < query.length; i += 1) {
    const currentCharacter = query[i]
    const currentCharacterEscaped = i !== 0 && query[i - 1] === '\\'

    if (currentCharacter === '?' && !currentQuote) {
      // If parameter is an array then expand out and use e_param_X to avoid conflicts with param_X
      const parameter = parameters![numberOfParametersInQueryString]
      if (Array.isArray(parameter)) {
        parameter.forEach((_, index) => {
          const isLastParameter = index === parameter.length - 1
          const paramName = `:e_param_${extendedParameterCount}${isLastParameter ? '' : ', '}`
          extendedParameterCount += 1
          newQueryString += paramName
        })
      } else {
        const paramName = `:param_${numberOfParametersInQueryString}`
        numberOfParametersInQueryString += 1
        newQueryString += paramName
      }

      continue
    }

    if (quoteCharacters.includes(currentCharacter) && !currentCharacterEscaped) {
      if (!currentQuote) {
        currentQuote = currentCharacter
      } else if (currentQuote === currentCharacter) {
        currentQuote = null
      }
    }

    newQueryString += currentCharacter
  }

  return [newQueryString, numberOfParametersInQueryString]
}

const transformParameters = (numberOfParametersInQueryString: number, parameters?: any[]) => {
  if (
    parameters &&
    parameters.length > 0 &&
    parameters.length % numberOfParametersInQueryString !== 0
  ) {
    throw new Error(
      `Number of parameters mismatch, got ${numberOfParametersInQueryString} in query string \
      and ${parameters.length} in input`)
  }

  let extendedParameterCount = 0
  const transformedParameters: any[] = []

  if (parameters && parameters.length > 0) {
    const numberOfObjects = parameters.length / numberOfParametersInQueryString

    for (let i = 0; i < numberOfObjects; i += 1) {
      const parameterObject: any = {}

      for (let y = 0; y < numberOfParametersInQueryString; y += 1) {
        const parameter = parameters[i + y]

        Array.isArray(parameter)
          // tslint:disable-next-line: no-increment-decrement
          ? parameter.forEach(element => parameterObject[`e_param_${extendedParameterCount++}`] = element)
          : parameterObject[`param_${y}`] = parameter
      }

      transformedParameters.push(parameterObject)
    }
  }

  return transformedParameters
}

export default class DataApiDriver {
  public static transformQueryAndParameters(query: string, parameters?: any[]): any {
    const [queryString, numberOfParametersInQueryString] = transformQuery(query, parameters)
    const transformedParameters = transformParameters(numberOfParametersInQueryString, parameters)

    return {
      queryString,
      parameters: transformedParameters,
    }
  }

  private readonly client: any

  private transactionId?: string

  constructor(
    private readonly region: string,
    private readonly secretArn: string,
    private readonly resourceArn: string,
    private readonly database: string,
    private readonly loggerFn: (query: string, parameters?: any[]) => void = () => undefined,
  ) {
    this.region = region
    this.secretArn = secretArn
    this.resourceArn = resourceArn
    this.database = database
    this.loggerFn = loggerFn
    this.client = createDataApiClient({
      secretArn,
      resourceArn,
      database,
      options: {
        region,
      },
    })
  }

  public async query(query: string, parameters?: any[]): Promise<any> {
    const transformedQueryData = DataApiDriver.transformQueryAndParameters(query, parameters)

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
