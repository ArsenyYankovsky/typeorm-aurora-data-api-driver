import { QueryTransformer } from './query-transformer'

export class PostgresQueryTransformer extends QueryTransformer {
  protected transformQuery(query: string) {
    const quoteCharacters = ["'", '"']
    let newQueryString = ''
    let currentQuote = null

    for (let i = 0; i < query.length; i += 1) {
      const currentCharacter = query[i]
      const currentCharacterEscaped = i !== 0 && query[i - 1] === '\\'

      if (currentCharacter === '$' && !currentQuote) {
        newQueryString += ':param_'
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

  protected transformParameters(parameters?: any[]) {
    if (!parameters) {
      return parameters
    }

    return [parameters.reduce(
      (params, parameter, index) => {
        params[`param_${index + 1}`] = parameter
        return params
      }, {})]
  }
}
