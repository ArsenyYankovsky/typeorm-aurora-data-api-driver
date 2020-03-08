import { QueryTransformer } from './query-transformer'

export class MysqlQueryTransformer extends QueryTransformer {
  protected transformQuery(query: string, parameters: any[]): string {
    const quoteCharacters = ["'", '"']
    let newQueryString = ''
    let currentQuote = null
    let srcIndex = 0
    let destIndex = 0

    for (let i = 0; i < query.length; i += 1) {
      const currentCharacter = query[i]
      const currentCharacterEscaped = i !== 0 && query[i - 1] === '\\'

      if (currentCharacter === '?' && !currentQuote) {
        const parameter = parameters![srcIndex]

        if (Array.isArray(parameter)) {
          const additionalParameters = parameter.map((_, index) =>
            `:param_${destIndex + index}`)

          newQueryString += additionalParameters.join(', ')
          destIndex += additionalParameters.length
        } else {
          newQueryString += `:param_${destIndex}`
          destIndex += 1
        }
        srcIndex += 1
      } else {
        newQueryString += currentCharacter

        if (quoteCharacters.includes(currentCharacter) && !currentCharacterEscaped) {
          if (!currentQuote) {
            currentQuote = currentCharacter
          } else if (currentQuote === currentCharacter) {
            currentQuote = null
          }
        }
      }
    }

    return newQueryString
  }

  protected expandArrayParameters(parameters: any[]): any[] {
    return parameters.reduce(
      (expandedParameters, parameter) => {
        if (Array.isArray(parameter)) {
          expandedParameters.push(...parameter)
        } else {
          expandedParameters.push(parameter)
        }
        return expandedParameters
      }, [])
  }

  protected transformParameters(parameters?: any[]) {
    if (!parameters) {
      return parameters
    }

    const expandedParameters = this.expandArrayParameters(parameters)

    return [expandedParameters.reduce(
      (params, parameter, index) => {
        params[`param_${index}`] = parameter
        return params
      }, {})]
  }
}
