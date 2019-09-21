const transformQuery = (query: string, parameters: any[]): string => {
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

const transformParameters = (parameters: any[]) =>
  parameters.reduce(
    (params, parameter, index) => {
      params[`param_${index}`] = parameter
      return params
    }, {})

const expandArrayParameters = (parameters: any[]) =>
  parameters.reduce(
    (expandedParameters, parameter) => {
      if (Array.isArray(parameter)) {
        expandedParameters.push(...parameter)
      } else {
        expandedParameters.push(parameter)
      }
      return expandedParameters
    }, [])

export const transformQueryAndParameters = (query: string, srcParameters: any[] = []) => {
  if (!srcParameters.length) {
    return { queryString: query, parameters: [] }
  }

  const queryString = transformQuery(query, srcParameters)
  const expandedParameters = expandArrayParameters(srcParameters)
  const parameters = [transformParameters(expandedParameters)]
  return { queryString, parameters }
}
